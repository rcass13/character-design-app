const { AuthenticationError } = require("apollo-server-express");
const { User, Character } = require("../models");


const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate("characters");
    },

    user: async (parent, { id }) => {
      return User.findById(id).populate("characters");
    },

    //retrieve the logged in user without specifically searching for them
    // me: async (parent, args, context) => {
    //   if (context.user) {
    //     return User.findById(context.user._id);
    //   }
    //   throw new AuthenticationError('You need to be logged in!');
    // },

    characters: async () => {
      return Character.find().populate("user");
    },

    character: async (parent, { id }) => {
      return Character.findById(id);
    },
  },

  Mutation: {
    addUser: async (parent, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with this email found!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    // user can only remove their profile and no one else's
    removeUser: async (parent, args, context) => {
      if (context.user) {
        return User.findByIdAndDelete(context.user._id);
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    //
    addCharacter: async (
      parent,
      {
        name,
        backgroundDescription,
        age,
        gender,
        pronoun,
        physical,
        personality,
      }
    ) => {
      const character = await Character.create({
        name,
        backgroundDescription,
        age,
        gender,
        pronoun,
        physical,
        personality,
      });
      return character;
    },

    removeCharacter: async (parent, { id }) => {
      return Character.findByIdAndDelete(id);
    },

    updateCharacter: async (
      parent,
      {
        id,
        name,
        backgroundDescription,
        age,
        gender,
        pronoun,
        physical,
        personality,
      }
    ) => {
      const updatedCharacter = await Character.findByIdAndUpdate(
        id,
        {
          name,
          backgroundDescription,
          age,
          gender,
          pronoun,
          physical,
          personality,
        },
        { new: true }
      );
      return updatedCharacter;
    },
  },
};

module.exports = resolvers;
