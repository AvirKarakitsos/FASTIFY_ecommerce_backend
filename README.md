## Description

API graphQL pour un site de e-commerce, codé avec Node JS et le framework Fastify. Les données sont stockées sur MongoDB Atlas.  
Cette API est utilisée côté client ici: https://github.com/AvirKarakitsos/REACT_ecommerce_frontend

**Tags**: *GraphQL, Fastify, MongoDB*

<p align="center">
  <img src="./assets/shop_bdd.png" alt="CMD et MLD de la base de donnée">
</p>

## Installation

### `npm install`

Afin d'installer toutes les librairies

### `Créer un fichier .env`

Créer un fichier .env afin de stocker vos propres variables d'environnement.  
Vous aurez besoin de 4 variables nommées ainsi:

DB_CONNECTION=*votre connection à mongoDB commençant par : "mongodb+srv://\[username]:\[password]@cluster0...*
SECRET_KEY=*votre clé secrète Stripe, commançant par: sk_test_...*
JWT_KEY=*générer une clé secrète pour le token. Vous pouvez utiliser la commande sur node : require('crypto').randomBytes(64).toString("hex")*  
CLIENT_URL=*URL du client. Exemple: http://localhost:5173*

### `npm run dev`

Une version de Node 18.11 minimmum est requise (utilisation du flag --watch)
