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
    const filterResult = result.filter((item) => item._id.toString() === param.id);

    return filterResult[0]
}

async function hasMany(collectionName, param) {
    console.log(param._id.toString)
    const db = app.mongo.db;
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    const filterResult = result.filter((item) => item.userId.toString() === param._id.toString());

    return filterResult
}

async function belongsTo(collectionName, param) {
    console.log(param)
    const db = app.mongo.db;
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    const filterResult = result.filter((item) => item._id.toString() === param.userId.toString());

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
        products() {
            return getAll("products")
        },
        orders() {
            return getAll("orders")
        },
        ordersProducts() {
            return getAll("orders_products")
        },
        //Get One
        user(_, args) {
            return getOne("users", args)
        },
        product(_, args) {
            return getOne("products", args)
        },
        order(_, args) {
            return getOne("orders", args)
        },
        orderProduct(_, args) {
            return getOne("orders_products", args)
        },
    },
    User: {
        orders(parent) {
            return hasMany("orders",parent)
        }
    },
    Order: {
        user(parent) {
            return belongsTo("users",parent)
        }
    }
  }