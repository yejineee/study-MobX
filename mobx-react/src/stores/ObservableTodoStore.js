const {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
} = require("mobx");

class ObservableTodoStore {
  todos = [];
  pendingRequests = 0;

  constructor() {
    makeObservable(this, {
      todos: observable,
      pendingRequests: observable,
      completedTodosCount: computed,
      report: computed,
      addTodo: action,
    });
    autorun(() => console.log(this.report)); // reaction
  }
  get completedTodosCount() {
    return this.todos.filter((todo) => todo.completed === true).length;
  }
  get report() {
    if (this.todos.length === 0) {
      return "none";
    }
    const nextTodo = this.todos.find((todo) => todo.completed === false);
    return `
    Next TODO: ${nextTodo ? nextTodo.task : "none"}
    Progress : ${this.completedTodosCount} / ${this.todos.length}
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
const observableTodoStore = new ObservableTodoStore();

observableTodoStore.addTodo("read MobX tutorial");
observableTodoStore.addTodo("try MobX");
observableTodoStore.todos[0].completed = true;
observableTodoStore.todos[1].task = "try MobX in own project";
observableTodoStore.todos[0].task = "grok MobX tutorial";

const peopleStore = observable([{ name: "Michel" }, { name: "Me" }]);
observableTodoStore.todos[0].assignee = peopleStore[0];
observableTodoStore.todos[1].assignee = peopleStore[1];
peopleStore[0].name = "Michel Weststrate";

export default observableTodoStore;
/*
    none

    Next TODO: read MobX tutorial
    Progress : 0 / 1
    

    Next TODO: read MobX tutorial
    Progress : 0 / 2
    

    Next TODO: try MobX
    Progress : 1 / 2
    

    Next TODO: try MobX in own project
    Progress : 1 / 2
*/
