
export const configResolvers = (database) => {
	const db = database.mongo.db

	async function getAll (collectionName) {
		try {
				const collection = db.collection(collectionName);
				const result = await collection.find().toArray();
				
				return result
		} catch(err) {
				console.error("Error message: "+err)
		}
	}

	async function getOne(collectionName, param) {
		try {
			const collection = db.collection(collectionName);
			const result = await collection.find().toArray();

			let filterResult = null
			
			if(param?.id) filterResult = result.filter((item) => item._id.toString() === param.id);
			else if(param?.email) filterResult = result.filter((item) => item.email === param.email);

			if(!filterResult) return null
			else return filterResult[0]
		} catch(err) {
			console.error("Error message: "+err)
		}
	}

	async function hasMany(collectionName, param) {
		try {
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
		} catch(err) {
			console.error("Error message: "+err)
		}
	}

	async function belongsTo(collectionName, param) {
		try {
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
		} catch(err) {
				console.error("Error message: "+err)
		}
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
			async user(_, args, context) {
				try {
					const collection = db.collection("users");
					const result = await collection.find().toArray();
					let filterResult = null
					console.log(context.userId)
					if(context.userId) filterResult = result.filter((item) => item._id.toString() === context.userId);
					
					if(!filterResult) return null
					else return filterResult[0]
				} catch(err) {
						console.error("Error message: "+err)
				}
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
			async validOrder(_, args, context) {
				try {
					const {reply, userId} = context

					if(!userId) return reply.code(401).send({ message: 'Unauthorized' });
					
					const session = await database.stripe.checkout.sessions.create({
						payment_method_types: ['card'],
						mode: 'payment',
						line_items: args.order.map(product => {
							return {
								price_data: {
									currency: 'usd',
									product_data: {
											name: product.name,
									},
									unit_amount: product.unity
								},
								quantity: product.quantity,
							}
						}),
						success_url: "http://localhost:5173/",
						cancel_url: "http://localhost:5173/"
						});

					const paymentsCollection = db.collection("payments")
					await paymentsCollection.insertOne({
						sessionId: session.id,
						userId: userId 
					})
						
					return {url: session.url};

				} catch (error) {
						console.error('Erreur lors de la création de la session Checkout:', error);
				}
			},
			async loginUser(_,args) {
				try {
					const user = await getOne("users", args.user)
					if(!user) {
						throw new Error("error 400: unauthorized")
					} 
					
					const token = database.jwt.sign({ userId: user._id })
					return { token }
				} catch(err) {
					console.error("Error message: "+err)
				}
					
			}
		}
	}

	return resolvers;
}