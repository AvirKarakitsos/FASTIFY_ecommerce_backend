import { ObjectId } from "@fastify/mongodb";
let app =null;

export function setDatabase(database) {
    app = database;
}


export const resolvers = {
    Query: {
        //Get All
        async users() {
        const db = app.mongo.db;
        const collection = db.collection('users');
        const result = await collection.find().toArray();
        
        return result
        },
        async products() {
        const db = app.mongo.db;
        const collection = db.collection('products');
        const result = await collection.find().toArray();
        
        return result
        },
        async orders() {
        const db = app.mongo.db;
        const collection = db.collection('orders');
        const result = await collection.find().toArray();
        
        return result
        },
        async ordersProducts() {
        const db = app.mongo.db;
        const collection = db.collection('orders_products');
        const result = await collection.find().toArray();
        
        return result
        },
        //Get One
        async user(_, args) {
            const db = app.mongo.db;
            const collection = db.collection('users');
            const result = await collection.find().toArray();
            const filterResult = result.filter((user) => user._id.toString() === args.id)

            return filterResult[0]
        }
    }
  }