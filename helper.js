import { client } from './index.js';
import { ObjectId } from 'mongodb';

async function getPatientData(id) {
	return await client
		.db('healthcare')
		.collection('patient')
		.findOne({ _id: ObjectId(id) });
}

async function createNewPatient(data) {
	return await client.db('healthcare').collection('patient').insertOne(data);
}

async function createAppointment(id, data) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne({ _id: ObjectId(id) }, { $push: { appointments: data } }, { upsert: true });
}

async function rescheduleAppointment(id, date) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{ _id: ObjectId(id), appointments: { $elemMatch: { date: date.oldDate } } },
			{ $set: { 'appointments.$[outer].date': date.newDate } },
			{ arrayFilters: [{ 'outer.date': date.oldDate }] }
		);

	// $elemMatch is used to match the exact date from the appointments array
	// and array filters is to set the filter for the object inside the array to filter down and change the value
}

async function updateAppointmentStatus(id, status) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{ _id: ObjectId(id), appointments: { $elemMatch: { date: status.date } } },
			{ $set: { 'appointments.$[outer].status': status.status } },
			{ arrayFilters: [{ 'outer.date': status.date }] }
		);
}

async function updateAppointmentSummary(id, data) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{ _id: ObjectId(id), appointments: { $elemMatch: { date: data.date } } },
			{ $set: { 'appointments.$[outer].discharge_summary': data.summary } },
			{ arrayFilters: [{ 'outer.date': data.date }] }
		);
}

async function updateAppointmentPrescription(id, data) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{ _id: ObjectId(id), appointments: { $elemMatch: { date: data.date } } },
			{ $set: { 'appointments.$[outer].prescription': data.prescription } },
			{ arrayFilters: [{ 'outer.date': data.date }] },
			{ upsert: true }
		);
}

export {
	getPatientData,
	createNewPatient,
	createAppointment,
	rescheduleAppointment,
	updateAppointmentStatus,
	updateAppointmentSummary,
	updateAppointmentPrescription,
};
