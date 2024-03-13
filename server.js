import fastify from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyMongoDB, { ObjectId } from '@fastify/mongodb';
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyStripe from "fastify-stripe"
import mercurius from 'mercurius';
import { schema } from './config/schema.js';
import { configResolvers } from './config/resolvers.js';

const app = fastify({
	logger: true
});

app.register(fastifyCors, {
	origin: true,
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	credentials: true,
});

app.register(fastifyEnv, {
	dotenv: true,
	schema: {
		type: 'object',
		required: ['DB_CONNECTION','SECRET_KEY','JWT_KEY','CLIENT_URL'],
		properties: {
				DB_CONNECTION: {
				type: 'string',
			},
			SECRET_KEY: {
				type: 'string',
			},
			JWT_KEY: {
				type: 'string',
			},
			CLIENT_URL: {
				type: 'string',
			},
		}
	}
})

await app

app.register(fastifyMongoDB, {
	url: app.config.DB_CONNECTION,
	database: "shop"
});

await app

app.register(fastifyJwt, {
	secret: app.config.JWT_KEY,
	sign: {
		expiresIn: '1h'
	}
})

await app

app.register(fastifyStripe, {
	apiKey: app.config.SECRET_KEY
})
 
await app

app.register(mercurius,{
	schema,
	resolvers: configResolvers(app),
	context: (request, reply) => {
		const token = request.headers.authorization?.split(" ")[1]
		if(!token) return {userId: null, reply}
		else {
			const decodeToken = app.jwt.verify(token)

			return { userId: decodeToken.userId, reply }
		}
	}
})

await app

app.post('/webhook', async (request, reply) => {
	try {
		const event = request.body;
		if (event.type === 'checkout.session.completed') {
			
			const checkout_session = event.data.object;

			const session = await app.stripe.checkout.sessions.retrieve(
				checkout_session.id,
				{
					expand: ['line_items'],
				}
			);

			const paymentsCollection = app.mongo.db.collection("payments")
			const user = await paymentsCollection.findOne({sessionId: checkout_session.id})

			const addOrder = {
				userId: new ObjectId(user.userId),
				totalPrice: session.amount_total,
				createdAt: new Date(),
				updatedAt: new Date()
			}
	
			const ordersCollection = app.mongo.db.collection("orders")
			
			const newOrder = await ordersCollection.insertOne(addOrder)
			
			
			const order_productCollection = app.mongo.db.collection("orders_products")
			const allProducts = await app.mongo.db.collection("products").find().toArray()
			
			const newProducts = session.line_items.data.map((newProduct) => {
				const filterProduct = allProducts.filter(product => product.name === newProduct.description)
				
				return {
					orderId: newOrder.insertedId,
					productId: filterProduct[0]._id,
					quantity: newProduct.quantity
				}
			})
			
			await order_productCollection.insertMany(newProducts)
		}
		
		reply.send({event: "fin"})
	} catch(err) {
		console.error(err);
	}
})
	
// Démarre le serveur Fastify
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