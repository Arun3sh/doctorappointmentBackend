import { client } from './index.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

async function getPatientData(id) {
	return await client
		.db('healthcare')
		.collection('patient')
		.findOne({ _id: ObjectId(id) });
}

async function getAppointment(id) {
	return await client
		.db('healthcare')
		.collection('patient')
		.findOne({ _id: ObjectId(id) }, { projection: { _id: 0, appointments: 1 } });
}

async function getPatientInfo(id) {
	return await client
		.db('healthcare')
		.collection('patient')
		.findOne(
			{ _id: ObjectId(id) },
			{
				projection: {
					_id: 0,
					appointments: {
						date: 1,
						dr_name: 1,
						discharge_summary: 1,
						prescription: 1,
					},
				},
			}
		);
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
			{
				_id: ObjectId(id),
				appointments: { $elemMatch: { date: date.oldDate } },
			},
			{
				$set: { 'appointments.$[outer].date': date.newDate },
			},
			{
				arrayFilters: [{ 'outer.date': date.oldDate }],
			}
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
			{
				$set: {
					'appointments.$[outer].discharge_summary': data.summary,
					'appointments.$[outer].prescription': data.prescription,
				},
			},
			{ arrayFilters: [{ 'outer.date': data.date }] }
		);
}

async function updateAppointmentPrescription(id, data) {
	return await client
		.db('healthcare')
		.collection('patient')
		.updateOne(
			{
				_id: ObjectId(id),
				appointments: {
					$elemMatch: { date: data.date },
				},
			},
			{
				$set: { 'appointments.$[outer].prescription': data.prescription },
			},
			{ arrayFilters: [{ 'outer.date': data.date }] },
			{ upsert: true }
		);
}

async function getPatientSummary(id) {
	return await client
		.db('healthcare')
		.collection('patient')
		.find(
			{ _id: ObjectId(id) },
			{
				projection: {
					_id: 0,
					appointments: {
						discharge_summary: 1,
						dr_name: 1,
						date: 1,
					},
				},
			}
		)
		.toArray();
}

async function getPatientPrescription(id, data) {
	return await client
		.db('healthcare')
		.collection('patient')
		.find(
			{ _id: ObjectId(id) },
			{
				projection: {
					_id: 0,
					appointments: {
						prescription: 1,
						dr_name: 1,
						date: 1,
					},
				},
			}
		)
		.toArray();
}

async function genPassword(password) {
	const salt = await bcrypt.genSalt(10);

	const hashedPassword = await bcrypt.hash(password, salt);

	return hashedPassword;
}

export {
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
};
