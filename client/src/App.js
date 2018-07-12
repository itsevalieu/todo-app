import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo'; //higher level component
import Paper from '@material-ui/core/Paper';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Form from './Form';


const TodosQuery = gql`
  {
    todos {
      id
      text
      complete
    }
  }
`; //gql will read this string

//$ defines a variable
const UpdateMutation = gql`
  mutation($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete)
  }
`;

const DeleteMutation = gql`
  mutation($id: ID!) {
    deleteTodo(id: $id)
  }
`;
const CreateTodoMutation = gql`
  mutation($text: String!) {
    createTodo(text: $text) {
      id
      text
      complete
    }
  }
`;

class App extends Component {
  updateTodo = async todo => {
  //update todo //functions written like this automatically bind
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      //store is the apollo cache
      // data: { name of mutation} // this is getting data from props
      // name of mutation should match about line 29
      // we don't need the data though to update cache, so comment out
//      update: (store, { data: { updateTodo } }) => {
      update: store => {
        //read data from our cache for this query
        const data = store.readQuery({ query: TodosQuery });
        //update todo if id of x is equal to todo id from the mutation to the end
        data.todos = data.todos.map(x => x.id === todo.id ? ({
          ...todo, //map through all todos until find the todo id to update 
          //... keep all the same values of the todos, don't change
          complete: !todo.complete,

        }) : x);
        //write our data back to the cache
        store.writeQuery({ query: TodosQuery, data });
      } 
    });
  };
  deleteTodo = async todo => {
    await this.props.deleteTodo({
      variables: {
        id: todo.id
      },
      update: store => {
        const data = store.readQuery({ query: TodosQuery });
        data.todos = data.todos.filter(x => x.id !== todo.id); //filter only if matches id
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };
  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text
      },
      update: (store, { data: { createTodo }}) => {
        const data = store.readQuery({ query: TodosQuery });
        data.todos.unshift(createTodo);
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };
  render() {
    const {
      data: {loading, todos}
    } = this.props;
    if (loading) {
      return null;
    }

    return (
      <div style={{ display: 'flex'}}>
        <div style={{ margin: 'auto', width: 400}}>
          <Paper elevation={1}>
              <Form submit={this.createTodo}/>
              <List>
                {todos.map(todo => (
                  <ListItem
                    key={`${todo.id}-todo-item`}
                    role={undefined}
                    dense
                    button
                    onClick={() => this.updateTodo(todo)}
                  >
                    <Checkbox
                      checked={todo.complete}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={todo.text} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => this.deleteTodo(todo)}>
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
          </Paper>
        </div>
      </div>
    );
  }
};
//can pass prop updateTodo because specified below
export default compose(
  graphql(CreateTodoMutation, {name: 'createTodo'}), 
  graphql(DeleteMutation, {name: 'deleteTodo'}), 
  graphql(UpdateMutation, { name: 'updateTodo'}), 
  graphql(TodosQuery)
)(App);





