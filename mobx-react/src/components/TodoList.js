import { observer } from "mobx-react-lite";
import { action } from "mobx";
const TodoList = observer(({ store }) => {
  const onNewTodo = () => {
    store.addTodo(prompt("Enter a new Todo:", "chocolate"));
  };
  const loadTodo = () => {
    store.pendingRequests++;
    setTimeout(
      action(() => {
        store.addTodo("Random Todo " + Math.random());
        store.pendingRequests--;
      }),
      2000
    );
  };
  return (
    <>
      {store.report}
      <ul>
        {store.todos.map((todo, idx) => (
          <TodoView todo={todo} key={idx} />
        ))}
      </ul>
      {store.pendingRequests > 0 ? <> Loading </> : null}
      <button onClick={onNewTodo}> New Todo </button>
      <button onClick={loadTodo}> Load Todo </button>
      <small>(double-click a todo to edit)</small>
    </>
  );
});

const TodoView = observer(({ todo }) => {
  const onToggleCompleted = () => {
    todo.completed = !todo.completed;
  };

  const onRename = () => {
    todo.task = prompt("Task name", todo.task) || todo.task;
  };

  return (
    <li onDoubleClick={onRename}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggleCompleted}
      />
      {todo.task}
      &nbsp;
      {todo.assignee && <small>{todo.assignee.name}</small>}
    </li>
  );
});

export default TodoList;
