
export const configResolvers = (database) => {
    const db = database.mongo.db

    async function  getAll(collectionName) {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        
        return result
    }

    async function getOne(collectionName, param) {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        const filterResult = result.filter((item) => item._id.toString() === param.id);

        return filterResult[0]
    }

    async function hasMany(collectionName, param) {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        let filterResult = null
        
        switch(collectionName) {
            case "orders": 
                filterResult = result.filter((item) => item.userId.toString() === param._id.toString());
                break;
            case "orders_products":
                if(param.name) filterResult = result.filter((item) => item.productId.toString() === param._id.toString());
                else filterResult = result.filter((item) => item.orderId.toString() === param._id.toString());
                break;
            default:
                filterResult = []
        }

        return filterResult
    }

    async function belongsTo(collectionName, param) {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        let filterResult = null
        
        switch(collectionName) {
            case "users": 
                filterResult = result.filter((item) => item._id.toString() === param.userId.toString());
                break;
            case "orders":
                filterResult = result.filter((item) => item._id.toString() === param.orderId.toString());
                break;
            case "products":
                filterResult = result.filter((item) => item._id.toString() === param.productId.toString());
                break;
            default:
                filterResult = []
        }

        return filterResult[0]
    }

    const resolvers = {
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
            },
            products(parent) {
                return hasMany("orders_products",parent)
            }
        },
        Product: {
            orders(parent) {
                return hasMany("orders_products",parent)
            }
        },
        OrderProduct: {
            order(parent) {
                return belongsTo("orders",parent)
            },
            product(parent) {
                return belongsTo("products",parent)
            }
        },
        Mutation: {
            async validOrder(_, args) {
                try {
                    const session = await database.stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        mode: 'payment',
                        line_items: args.order.map(product => {
                        return {
                            price_data: {
                                currency: 'usd',
                                product_data: {name: product.name},
                                unit_amount: product.unity
                            },
                            quantity: product.quantity
                        }
                    }),
                    success_url: "http://localhost:5176/",
                    cancel_url: "http://localhost:5176/error",
                    });
                
                    return {url: session.url};
                } catch (error) {
                    console.error('Erreur lors de la création de la session Checkout:', error);
                }
            }
        }
    }

    return resolvers;
}