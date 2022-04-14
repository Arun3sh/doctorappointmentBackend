import express, { request, response } from 'express';
import {
	getPatientData,
	getAppointment,
	getPatientInfo,
	createNewPatient,
	createAppointment,
	rescheduleAppointment,
	updateAppointmentStatus,
	updateAppointmentSummary,
	updateAppointmentPrescription,
	getPatientSummary,
	getPatientPrescription,
	genPassword,
} from './../helper.js';
import { createNewAppointment } from './../doctor_helper.js';
import { client } from '../index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from './auth.js';

const router = express.Router();

router.get('/', (request, response) => {
	response.send('Patient get');
});

// For user login
router.post('/login-patient', async (request, response) => {
	const { email, password } = request.body;

	// To check if user exists
	const check = await client
		.db('healthcare')
		.collection('patient')
		.findOne({ email: email }, { projection: { _id: 1, pt_name: 1, email: 1, password: 1 } });

	if (check === null) {
		response.status(401).send('Email / Password incorrect');
		return;
	}

	// To check the hashed password
	const checkPassword = await bcrypt.compare(password, check.password);

	// If password is correct create a token
	if (checkPassword) {
		const token = jwt.sign({ id: check._id }, process.env.SECRET_KEY);

		response
			.header('x-auth-token', token)
			.send({ token: token, id: check._id, pt_name: check.pt_name });
	} else {
		response.status(401).send('Email/Password incorrect');
		return;
	}
});

// To get patient based on id
router.get('/:id', async (request, response) => {
	const { id } = request.params;

	const getPatient = await getPatientData(id);
	response.send(getPatient);
});

// To get patient appointments
router.get('/appointment/:id', async (request, response) => {
	const { id } = request.params;
	const result = await getAppointment(id);
	response.send(result);
});

// To get details for doctor's to know patient's medical history
router.get('/getdetails/:id', async (request, response) => {
	const { id } = request.params;
	const result = await getPatientInfo(id);
	response.send(result);
});

// To create new patient
router.post('/new-patient', async (request, response) => {
	const { pt_name, email, contact, password } = request.body;

	// To check if user already exists
	const check = await client
		.db('healthcare')
		.collection('patient')
		.findOne({ email: email }, { projection: { _id: 1, email: 1 } });

	if (check) {
		response.status(401).send('User email already registered');
		return;
	}

	// If new user hashing the password here
	const hashedPassword = await genPassword(password);
	const createPatient = await createNewPatient({
		pt_name: pt_name,
		password: hashedPassword,
		email: email,
		contact: contact,
	});
	response.send(createPatient);
});

// To create a new appointment
router.put('/create-new-appointment/:id', auth, async (request, response) => {
	const data = request.body;
	const { id } = request.params;
	const docData = {
		pt_id: id,
		pt_name: data.pt_name,
		pt_reason: data.pt_reason,
		date: data.date,
		timeslot: data.timeslot,
		status: data.status,
		discharge_summary: data.discharge_summary,
		prescription: data.prescription,
	};
	const createDocApp = await createNewAppointment(data.doc_id, docData);

	if (createDocApp.modifiedCount !== 1) {
		response.send('Error Occured');
		return;
	}
	const updatePt = await createAppointment(id, data);

	response.send(updatePt);
});

// To reschedule appointment
router.put('/reschedule-appointment/:id', async (request, response) => {
	const date = request.body;
	const { id } = request.params;

	const updateAt = await rescheduleAppointment(id, date[0]);

	response.send(updateAt);
});

// To update status of Appointment
router.put('/update-appointment-status/:id', auth, async (request, response) => {
	const status = request.body;
	const { id } = request.params;

	const updateStatus = await updateAppointmentStatus(id, status);

	response.send(updateStatus);
});

// To update discharge summary of Appointment
router.put('/update-appointment-summary/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const updateSummary = await updateAppointmentSummary(id, data[0]);

	response.send(updateSummary);
});

// To update Prescription of Appointment
router.put('/update-appointment-prescription/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const updatePrescription = await updateAppointmentPrescription(id, data[0]);

	response.send(updatePrescription);
});

// To get patient summary based on id
router.get('/discharge-summary/:id', async (request, response) => {
	const { id } = request.params;

	const getPatient = await getPatientSummary(id);
	response.send(getPatient);
});

// To get patient prescription based on id
router.get('/prescription/:id', async (request, response) => {
	const { id } = request.params;
	const data = request.body;
	const getPatient = await getPatientPrescription(id, data[0]);
	response.send(getPatient);
});

export const patientRouter = router;
