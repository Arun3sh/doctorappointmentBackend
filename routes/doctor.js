import express, { request, response } from 'express';
import {
	updateAppointmentPrescription,
	updateAppointmentStatus,
	updateAppointmentSummary,
} from '../helper.js';
import {
	getDoctor,
	getAllDoctor,
	getAppointments,
	createDoctor,
	updateAppointmentsStatus,
	updateAppointmentsSummary,
	updateAppointmentsPrescription,
} from './../doctor_helper.js';

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

// To create new doctor by admin
router.post('/create-doctor', async (request, response) => {
	const data = request.body;

	const result = await createDoctor(data);

	response.send(result);
});

// To get all appointments for doctor
router.get('/appointments/:id', async (request, response) => {
	const { id } = request.params;

	const result = await getAppointments(id);

	response.send(result);
});

// To update appointment status on both user and doctor's end
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

// To update patient summary on both user and doctor's end
router.put('/update-appointment-summary/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const setPatientSummary = await updateAppointmentSummary(data.id, data);

	if (setPatientSummary.modifiedCount !== 1) {
		response.send('Error Occured');
	}
	const result = await updateAppointmentsSummary(id, data);
	response.send(result);
});

// To update patient summary on both user and doctor's end
router.put('/update-appointment-prescription/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const setPatientPrescription = await updateAppointmentPrescription(data.id, data);

	if (setPatientPrescription.modifiedCount !== 1) {
		response.send('Error Occured');
	}
	const result = await updateAppointmentsPrescription(id, data);
	response.send(result);
});

export const doctorRouter = router;
