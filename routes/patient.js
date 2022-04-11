import express, { request, response } from 'express';
import {
	getPatientData,
	createNewPatient,
	createAppointment,
	rescheduleAppointment,
	updateAppointmentStatus,
	updateAppointmentSummary,
	updateAppointmentPrescription,
} from './../helper.js';

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

export const patientRouter = router;
