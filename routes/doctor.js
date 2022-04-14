import express, { request, response } from 'express';
import {
	genPassword,
	updateAppointmentPrescription,
	updateAppointmentStatus,
	updateAppointmentSummary,
} from '../helper.js';
import {
	getDoctor,
	getAllDoctor,
	getAppointments,
	createDoctor,
	createAdmin,
	updateAppointmentsStatus,
	updateAppointmentsSummary,
	updateAppointmentsPrescription,
} from './../doctor_helper.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client } from '../index.js';
import { admin_auth } from './admin_auth.js';
import { auth } from './auth.js';

const router = express.Router();

// To get specific doctor data
router.get('/:id', async (request, response) => {
	const { id } = request.params;
	const doctor = await getDoctor(id);
	response.send(doctor);
});

// To get all doctor data for search
router.get('/', async (request, response) => {
	const result = await getAllDoctor();
	response.send(result);
});

// For doctor login
router.post('/login-doctor', async (request, response) => {
	const { email, password } = request.body;

	// To check if user exists
	const check = await client
		.db('healthcare')
		.collection('doctor')
		.findOne({ email: email }, { projection: { _id: 1, name: 1, email: 1, password: 1 } });

	if (check === null) {
		response.status(401).send('Email / Password incorrect');
		return;
	}

	// To check the hashed password
	const checkPassword = await bcrypt.compare(password, check.password);

	// If password is correct create a token
	if (checkPassword) {
		const token = jwt.sign({ id: check._id }, process.env.SECRET_KEY);

		response.header('x-auth-token', token).send({ token: token, id: check._id });
	} else {
		response.status(401).send('Email/Password incorrect');
		return;
	}
});

// For Admin login
router.post('/login-admin', async (request, response) => {
	const { email, password } = request.body;

	// To check if user exists
	const check = await client
		.db('healthcare')
		.collection('admin')
		.findOne({ email: email }, { projection: { _id: 1, email: 1, password: 1 } });

	if (check === null) {
		response.status(401).send('Email / Password incorrect');
		return;
	}

	// To check the hashed password
	const checkPassword = await bcrypt.compare(password, check.password);

	// If password is correct create a token
	if (checkPassword) {
		const token = jwt.sign({ id: check._id }, process.env.SECRET_KEY);

		response.header('x-auth-token', token).send({ token: token, id: check._id });
	} else {
		response.status(401).send('Email/Password incorrect');
		return;
	}
});

// To create new doctor by admin
router.post('/create-doctor', admin_auth, async (request, response) => {
	const { name, dept, about, contact, email, password, timeslot } = request.body;

	const check = await client
		.db('healthcare')
		.collection('doctor')
		.findOne({ email: email }, { projection: { _id: 1, email: 1 } });

	if (check) {
		response.status(401).send('Doctor email already registered');
		return;
	}

	// If new user hashing the password here
	const hashedPassword = await genPassword(password);

	const result = await createDoctor({
		name: name,
		dept: dept,
		about: about,
		contact: contact,
		email: email,
		password: hashedPassword,
		timeslot: timeslot,
	});

	response.send(result);
});

// To create admin
router.post('/create-admin', async (request, response) => {
	const { email, password } = request.body;

	const check = await client
		.db('healthcare')
		.collection('admin')
		.findOne({ email: email }, { projection: { _id: 1, email: 1 } });

	if (check) {
		response.status(401).send('Admin email already registered');
		return;
	}

	// If new user hashing the password here
	const hashedPassword = await genPassword(password);

	const result = await createAdmin({
		email: email,
		password: hashedPassword,
	});

	response.send(result);
});

// To get all appointments for doctor
router.get('/appointments/:id', async (request, response) => {
	const { id } = request.params;

	const result = await getAppointments(id);

	response.send(result);
});

// To update appointment status on both user and doctor from doctor's end
router.put('/update-appointment-status/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const setPatientStatus = await updateAppointmentStatus(data.id, data);
	if (setPatientStatus.modifiedCount !== 1) {
		response.send('Error Occured');
	}
	const result = await updateAppointmentsStatus(id, data);
	response.send(result);
});

// To update patient summary on both user and doctor from doctor's end
router.put('/update-appointment-summary/:id', auth, async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const setPatientSummary = await updateAppointmentSummary(data.id, data);

	if (setPatientSummary.modifiedCount !== 1) {
		response.send('Error Occured');
		return;
	}
	const result = await updateAppointmentsSummary(id, data);
	response.send(result);
});

// To update patient summary on both user and doctor from doctor's end
router.put('/update-appointment-prescription/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const setPatientPrescription = await updateAppointmentPrescription(data.id, data);

	if (setPatientPrescription.modifiedCount !== 1) {
		response.send('Error Occured');
		return;
	}
	const result = await updateAppointmentsPrescription(id, data);
	response.send(result);
});

export const doctorRouter = router;
