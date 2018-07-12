const { GraphQLServer } = require('graphql-yoga');
const mongoose = require('mongoose');

//Mongoose Connection
mongoose.connect('mongodb://localhost/todo1');


//Mongoose Model
const Todo = mongoose.model('Todo', {
	text: String, 
	complete: Boolean
});

//function(argument: value type): return type
// todos: [type]; returns array of Todo
const typeDefs = `
  type Query {
    hello(name: String): String!
    todos: [Todo]
  }
  type Todo {
  	id: ID!
	text: String!
	complete: Boolean!
  }
  type Mutation {
  	createTodo(text: String!): Todo
  	updateTodo(id: ID!, complete: Boolean!): Boolean
  	deleteTodo(id: ID!): Boolean
  }
`;

//resolver functions
// function: (parent, argument) => returns this
//implement get function to return all todos with out parameters
const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    todos: () => Todo.find()
  },
  Mutation: {
  	createTodo: async (_, { text }) => {
  		const todo = new Todo ({text, complete: false});
  		await todo.save(); //save to database, returns a promise so wait until it does to move on to next line
  		return todo;
  	},
  	updateTodo: async (_, {id, complete}) => {
  		await Todo.findByIdAndUpdate(id, {complete});
  		return true;
  	},
  	deleteTodo: async (_, {id}) => {
  		await Todo.findByIdAndRemove(id);
  		return true;
  	}
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });

//Start Connection
mongoose.connection.once('open', function() {
	server.start(() => console.log('Server is running on localhost:4000'));
});
