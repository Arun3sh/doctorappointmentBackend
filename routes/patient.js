import express, { request, response } from 'express';
import {
	getPatientData,
	createNewPatient,
	createAppointment,
	updateAppointment,
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

router.put('/create-new-appointment/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const updatePt = await createAppointment(id, data);

	response.send(updatePt);
});

router.put('/create-new-appointment/:id', async (request, response) => {
	const date = request.body;
	const { id } = request.params;

	const updateAt = await updateAppointment(id, date);

	response.send(updateAt);
});

export const patientRouter = router;
