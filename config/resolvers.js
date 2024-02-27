let app =null;

async function  getAll(collectionName) {
    const db = app.mongo.db;
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    
    return result
}

async function getOne(collectionName, param) {
    const db = app.mongo.db;
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    const filterResult = result.filter((item) => item._id.toString() === param.id)

    return filterResult[0]
}

export function setDatabase(database) {
    app = database;
}

export const resolvers = {
    Query: {
        //Get All
        users() {
            return getAll("users")
        },
        async products() {
            return getAll("products")
        },
        async orders() {
            return getAll("orders")
        },
        async ordersProducts() {
            return getAll("orders_products")
        },
        //Get One
        async user(_, args) {
            return getOne("users", args)
        },
        async product(_, args) {
            return getOne("products", args)
        },
        async order(_, args) {
            return getOne("orders", args)
        },
        async orderProduct(_, args) {
            return getOne("orders_products", args)
        },
    }
  }