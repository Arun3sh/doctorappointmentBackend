import { client } from './index.js';
import { ObjectId } from 'mongodb';

async function getPatientData(id) {
	await client
		.db('healthcare')
		.collection('patient')
		.findOne({ _id: ObjectId(id) });
}

async function createNewPatient(data) {
	await client.db('healthcare').collection('patient').insertOne(data);
}

async function createAppointment(id, data) {
	await client
		.db('healthcare')
		.collection('patient')
		.updateOne({ _id: ObjectId(id) }, { $push: { appointments: data } }, { upsert: true });
}

async function updateAppointment(id, date) {
	await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{ _id: ObjectId(id), 'appointments.date': date },
			{ $push: { 'appointments.date': date } },
			{ upsert: true }
		);
}
export { getPatientData, createNewPatient, createAppointment, updateAppointment };
