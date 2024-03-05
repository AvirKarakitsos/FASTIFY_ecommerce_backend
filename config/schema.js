export const schema = `
    type User {
        _id: ID!
        name: String!
        address: String!
        orders: [Order]
    }
    
    type Product {
        _id: ID!
        name: String!
        unity: Int!
        quantity: Int!
        orders: [OrderProduct!]!
    }
    
    type Order {
        _id: ID!
        user: User!
        totalPrice: Int!
        createdAt: String!
        updatedAt: String!
        products: [OrderProduct!]!
    }
    
    type OrderProduct {
        _id: ID!
        order: Order!
        product: Product!
        quantity: Int!
    }
    type Stripe {
        url: String!
    }

    type Query {
        users: [User],
        products: [Product],
        orders: [Order],
        ordersProducts: [OrderProduct],
        user(id: ID!): User,
        product(id: ID!): Product,
        order(id: ID!): Order,
        orderProduct(id: ID!): OrderProduct,
    }

    type Mutation {
        validOrder(order: [AddOrderInput!]!): Stripe
    }

    input AddOrderInput {
        productId: String
        name: String
        unity: Int
        quantity: Int
    }
`