import fastify from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyMongoDB from '@fastify/mongodb';
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
    expiresIn: '3m'
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
    if(!request.headers.user) return {}
    return {userId: request.headers.user}
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