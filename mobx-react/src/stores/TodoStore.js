class TodoStore {
  todos = [];
  get completedTodosCount() {
    return this.todos.filter((todo) => todo.completed === true).length;
  }
  get totalTodosCount() {
    return this.todos.length;
  }
  report() {
    if (this.totalTodosCount === 0) {
      return "<none>";
    }
    const nextTodo = this.todos.find((todo) => todo.completed === false);
    return `
      Next Todo : ${nextTodo ? nextTodo.task : "<none>"}
      Progress : ${this.completedTodosCount} / ${this.totalTodosCount};
    `;
  }
  addTodo(task) {
    this.todos.push({
      task,
      completed: false,
      assignee: null,
    });
  }
}

const todoStore = new TodoStore();

todoStore.addTodo("task 1");
console.log(todoStore.report());

todoStore.addTodo("task 2");
console.log(todoStore.report());

todoStore.todos[0].completed = true;
console.log(todoStore.report());

todoStore.todos[1].task = "task2 - modified";
console.log(todoStore.report());

todoStore.todos[0].task = "task1 - finished";
console.log(todoStore.report());

/*
      Next Todo : task 1
      Progress : 0 / 1;
    

      Next Todo : task 1
      Progress : 0 / 2;
    

      Next Todo : task 2
      Progress : 1 / 2;
    

      Next Todo : task2 - modified
      Progress : 1 / 2;
    

      Next Todo : task2 - modified
      Progress : 1 / 2;
*/
