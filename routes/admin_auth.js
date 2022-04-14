import jwt from 'jsonwebtoken';

export const admin_auth = (request, response, next) => {
	try {
		const token = request.header('x-auth-token');

		jwt.verify(token, process.env.ADMIN_SECRET_KEY);

		next();
	} catch (err) {
		response.status(401).send({ error: err.message });
	}
};
