import './App.scss';

import { ChangeEvent, FormEvent, useState } from 'react';
import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList';
import { Todo } from './types/Todo';

const getTodoId = (todos: Omit<Todo, 'user'>[]) => {
  return todos.reduce((maxId, todo) => Math.max(maxId, todo.id), 0);
};

const preparedTodo = (todos: Omit<Todo, 'user'>[]) => {
  return todos.map((todo) => {
    const findUser = usersFromServer.find((user) => user.id === todo.userId);

    return { ...todo, user: findUser || null };
  });
};

export const App = () => {
  const [todos, setTodos] = useState(todosFromServer);
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState(0);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isValidUser, setIsValidUser] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const isFormValid = title.length && userId;

    if (isFormValid) {
      setTodos((prevTodos) => {
        const newTodo = {
          id: getTodoId(prevTodos) + 1,
          title,
          completed: false,
          userId,
        };

        return [...prevTodos, newTodo];
      });
      setTitle('');
      setUserId(0);
    } else {
      setIsValidTitle(Boolean(title.length));
      setIsValidUser(Boolean(userId));
    }
  };

  const handleChangeTitle = (
    { target: { value } }: ChangeEvent<HTMLInputElement>,
  ) => {
    setTitle(value);
    setIsValidTitle(Boolean(value) || !userId);
  };

  const handleChangeUserId = (
    { target: { value } }: ChangeEvent<HTMLSelectElement>,
  ) => {
    setUserId(+value);
    setIsValidUser(Boolean(value) || !title);
  };

  return (
    <div className="App">
      <h1>
        Add todo form
      </h1>

      <form
        action="/api/users"
        method="POST"
        onSubmit={handleSubmit}
      >
        <div className="field">
          <label>
            {'Title: '}
            <input
              type="text"
              data-cy="titleInput"
              placeholder="Enter a title"
              value={title}
              onChange={handleChangeTitle}
            />
          </label>

          {!isValidTitle && (
            <span className="error">
              Please enter a title
            </span>
          )}
        </div>

        <div className="field">
          <label>
            {'User: '}
            <select
              data-cy="userSelect"
              value={userId}
              onChange={handleChangeUserId}
            >
              <option value="0" disabled>
                Choose a user
              </option>

              {usersFromServer.map(({ id, name }) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          {!isValidUser && (
            <span className="error">
              Please choose a user
            </span>
          )}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={preparedTodo(todos)} />
    </div>
  );
};
