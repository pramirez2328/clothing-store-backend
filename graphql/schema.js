const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID
} = require('graphql');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

// Define Item Type
const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: () => ({
    productId: { type: GraphQLInt },
    title: { type: GraphQLString },
    price: { type: GraphQLFloat },
    orderQty: { type: GraphQLInt },
    selectedSize: { type: GraphQLString },
    thumbnail: { type: GraphQLString }
  })
});

// Define Purchase Type
const PurchaseType = new GraphQLObjectType({
  name: 'Purchase',
  fields: () => ({
    id: { type: GraphQLID },
    purchaseId: { type: GraphQLString },
    userId: { type: GraphQLID },
    items: { type: new GraphQLList(ItemType) },
    totalAmount: { type: GraphQLFloat },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        if (!parent.createdAt) return 'N/A'; // Handle missing timestamps

        let timestamp = parent.createdAt;

        if (typeof timestamp === 'string') {
          timestamp = parseInt(timestamp); // Convert string to number if needed
        }

        if (typeof timestamp === 'number') {
          return new Date(timestamp).toLocaleString(); // Convert timestamp to readable format
        }

        if (timestamp instanceof Date) {
          return timestamp.toLocaleString(); // If already a Date object
        }

        return 'Invalid Date'; // If conversion fails
      }
    }
  })
});

// Define User Type
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    purchases: {
      type: new GraphQLList(PurchaseType),
      resolve(parent, args) {
        return Purchase.find({ userId: parent.id });
      }
    }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      }
    },
    purchases: {
      type: new GraphQLList(PurchaseType),
      args: { userId: { type: GraphQLID } },
      resolve(parent, args) {
        return Purchase.find({ userId: args.userId });
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
