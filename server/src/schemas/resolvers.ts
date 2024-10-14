import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
    Query: {
      // Resolver to get a single user
      getSingleUser: async (_parent, args, context) => {
        const userId = context.user ? context.user._id : args.id;
        const foundUser = await User.findOne({
          $or: [{ _id: userId }, { username: args.username }],
        });
  
        if (!foundUser) {
          throw new Error('Cannot find a user with this id!');
        }
  
        return foundUser;
      },
    },
  
    Mutation: {
      // Resolver to create a new user
      createUser: async (_parent, args) => {
        const user = await User.create(args);
  
        if (!user) {
          throw new Error('Something went wrong while creating the user!');
        }
  
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
  
      // Resolver for user login
      login: async (_parent, { username, email, password }) => {
        const user = await User.findOne({
          $or: [{ username }, { email }],
        });
  
        if (!user) {
          throw new Error("Can't find this user");
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new Error('Wrong password!');
        }
  
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
  
      // Resolver to save a book
      saveBook: async (_parent, args, context) => {
        if (!context.user) {
          throw new Error('You need to be logged in!');
        }
  
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );
  
        return updatedUser;
      },
  
      // Resolver to delete a book
      deleteBook: async (_parent, { bookId }, context) => {
        if (!context.user) {
          throw new Error('You need to be logged in!');
        }
  
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
  
        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
  
        return updatedUser;
      },
    },
  };
  
  export default resolvers;