import React from "react";
import TodoList from "./components/TodoList";
import observableTodoStore from "./stores/ObservableTodoStore";
function App() {
  return <TodoList store={observableTodoStore} />;
}

export default App;
