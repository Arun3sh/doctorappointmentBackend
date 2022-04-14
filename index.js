import express, { request, response } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import { patientRouter } from './routes/patient.js';
import { doctorRouter } from './routes/doctor.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
	const client = new MongoClient(MONGO_URL);
	await client.connect();
	console.log('mongo');
	return client;
}

export const client = await createConnection();

app.get('/', (request, response) => {
	response.send('Healthcare');
});

app.use('/patient', patientRouter);

app.use('/doctor', doctorRouter);

app.listen(PORT, () => console.log('Server started', PORT));
