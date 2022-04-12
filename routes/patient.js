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
} from './../helper.js';
import { createNewAppointment } from './../doctor_helper.js';

const router = express.Router();

router.get('/', (request, response) => {
	response.send('Patient get');
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
	const data = request.body;
	const createPatient = await createNewPatient(data);
	response.send(createPatient);
});

// To create a new appointment
router.put('/create-new-appointment/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;
	const docData = {
		pt_id: id,
		pt_name: 'User',
		pt_reason: 'Fever',
		date: '2022-04-13',
		timeslot: '10',
		status: 'pending',
		discharge_summary: '',
		prescription: '',
	};
	const createDocApp = await createNewAppointment(data.doc_id, docData);

	if (createDocApp.modifiedCount !== 1) {
		response.send('Error Occured');
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
router.put('/update-appointment-status/:id', async (request, response) => {
	const status = request.body;
	const { id } = request.params;

	const updateStatus = await updateAppointmentStatus(id, status[0]);

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
