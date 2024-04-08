import { app } from "./app.js";

const start = async () => {
	try {
		await app.listen({port: 3000});
		console.log('Serveur Fastify en cours d\'exécution sur le port 3000');
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();