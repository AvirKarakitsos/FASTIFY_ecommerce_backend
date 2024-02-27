export const schema = `
    type User {
        _id: ID!
        name: String!
        address: String!
    }
    
    type Product {
        _id: ID!
        name: String!
        unity: Int!
        quantity: Int!
    }
    
    type Order {
        _id: ID!
        userId: User!
        createdAt: String!
        updatedAt: String!
        products: [OrderProduct!]!
    }
    
    type OrderProduct {
        _id: ID!
        orderId: Order!
        productId: Product!
        quantity: Int!
    }

    type Query {
        users: [User],
        products: [Product],
        orders: [Order],
        ordersProducts: [OrderProduct],
        user(id: ID!): User
    }
`