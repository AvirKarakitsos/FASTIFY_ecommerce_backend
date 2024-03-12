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
		required: ['DB_CONNECTION','SECRET_KEY','JWT_KEY'],
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

app.post('/webhook', (request, reply) => {
	const event = request.body;
	
	switch (event.type) {
		case 'payment_intent.succeeded':
			console.log("Here")
			console.log(event)
			const paymentIntent = event;
			console.log(paymentIntent.data.object)
			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			break;
		case 'payment_intent.canceled':
			const paymentIntentCanceled = event.data.object;
			// Then define and call a function to handle the event payment_intent.canceled
			break;
		case 'payment_method.attached':
			const paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a response to acknowledge receipt of the event
	reply.send({event: "succed"})
})

app.get("/res", async (req, rep) => {
	try {
		const payments_in_progress = {
			sessionId: "cs_test_b1qMFfYE4lO4SRnYJJ66iOepZHcaSsWyLm6ooNwzne1ZZ1w2AL0iuLYGbZ",
			userId: "65ddc19ab2a2c36b28f5992e"
		}
		
		const session = await app.stripe.checkout.sessions.retrieve(
			payments_in_progress.sessionId,
			{
				expand: ['line_items'],
			}
		);

		const addOrder = {
			userId: new ObjectId(payments_in_progress.userId),
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
	
	} catch(err) {
		console.error(err);
	}
	rep.send({event: "finished"})
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