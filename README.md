## Description

API graphQL pour un site de commerce, codé avec Node JS et le framework Fastify. Les données sont stockées sur MongoDB Atlas.

**Tags**: *GraphQL, Fastify, MongoDB*

<p align="center">
  <img src="./assets/shop_bdd.png" alt="CMD et MLD de la base de donnée">
</p>

## Installation

### `npm install`

Afin d'installer toutes les librairies


### `Créer un dossier images`

Créer un dossier *images* à la racine de votre répertoire où seront stockées les images en local.

### `Créer un fichier .env`

Créer un fichier .env afin de stocker vos propres variables d'environnement.  
Vous aurez besoin de 4 variables nommées ainsi:

DB_CONNECTION=*votre connection à mongoDB commençant par : "mongodb+srv://\[username]:\[password]@cluster0...*
SECRET_KEY=*votre clé secrète Stripe, commançant par: sk_test_...*
JWT_KEY=*générer une clé secrète pour le token. Vous pouvez utiliser la commande sur node : require('crypto').randomBytes(64).toString("hex")*  
CLIENT_URL=*URL du client. Exemple: http://localhost:5173*

### `nodemon serve`

Commande globale afin de lancer le serveur.  
Penser à installer nodemon en dependance de développement avec la commande *npm install --save-dev nodemon*
