import { client } from './index.js';
import { ObjectId } from 'mongodb';

async function getDoctor(id) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.find({ _id: ObjectId(id) })
		.toArray();
}

async function getAllDoctor() {
	return await client
		.db('healthcare')
		.collection('doctor')
		.find({}, { projection: { email: 0, password: 0, appointments: 0 } })
		.toArray();
}

async function getAppointments(id) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.findOne(
			{ _id: ObjectId(id) },
			{
				projection: { _id: 0, appointments: 1 },
			}
		);
}

async function createDoctor(data) {
	return await client.db('healthcare').collection('doctor').insertOne(data);
}

async function createNewAppointment(id, data) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.updateOne({ _id: ObjectId(id) }, { $push: { appointments: data } }, { upsert: true });
}

async function updateAppointmentsStatus(id, status) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.updateOne(
			{
				_id: ObjectId(id),
				appointments: { $elemMatch: { date: status.date } },
			},
			{ $set: { 'appointments.$[outer].status': status.status } },
			{ arrayFilters: [{ 'outer.date': status.date }] }
		);
}

async function updateAppointmentsSummary(id, data) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.updateOne(
			{
				_id: ObjectId(id),
				appointments: { $elemMatch: { date: data.date } },
			},
			{ $set: { 'appointments.$[outer].discharge_summary': data.summary } },
			{ arrayFilters: [{ 'outer.date': data.date }] }
		);
}

async function updateAppointmentsPrescription(id, data) {
	return await client
		.db('healthcare')
		.collection('doctor')
		.updateOne(
			{
				_id: ObjectId(id),
				appointments: { $elemMatch: { date: data.date } },
			},
			{ $set: { 'appointments.$[outer].prescription': data.prescription } },
			{ arrayFilters: [{ 'outer.date': data.date }] }
		);
}

export {
	getDoctor,
	getAllDoctor,
	getAppointments,
	createDoctor,
	createNewAppointment,
	updateAppointmentsStatus,
	updateAppointmentsSummary,
	updateAppointmentsPrescription,
};
