import fastify from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyMongoDB from '@fastify/mongodb';
import mercurius from 'mercurius';
import { schema } from './config/schema.js';
import { resolvers, setDatabase } from './config/resolvers.js';

const app = fastify();

// Utilise le plugin fastifyEnv pour charger les variables d'environnement
app.register(fastifyEnv, {
  dotenv: true,
  schema: {
    type: 'object',
    required: ['DB_CONNECTION'],
    properties: {
        DB_CONNECTION: {
        type: 'string',
      }
    }
  }
})

await app

// Ajoute le plugin @fastify/mongodb
app.register(fastifyMongoDB, {
  url: app.config.DB_CONNECTION,
  database: "shop"
});

setDatabase(app)

app.register(mercurius,{
  schema,
  resolvers
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