## Ten minute introduction to MobX and React

```javascript
constructor() {
	makeObservable(this, {
	  todos: observable,
	  pendingRequests: observable,
	  completedTodosCount: computed,
	  report: computed,
	  addTodo: action,
	});
	autorun(() => console.log(this.report));
}
```

- **observable**
  - observable로 표기된 값들은 계속해서 변할 수 있는 값이다.
  - observable은 MobX가 계속해서 변화를 감지하게 된다.
- **computed**
  - computation은 상태가 변하면 값을 새롭게 계산하고, 그 값을 캐싱한다.
- **autorun**
  - autorun은 _reaction_ 을 만든다.
  - 처음 한 번 실행되고, 그 후로는 autorun에서 쓰이는 observable값이 변할 때 자동으로 실행된다.
  - 아래 예제에서 마지막 줄은 0번째 todo의 이름을 'grok~'로 변경하였지만, autorun이 실행되지 않았다. 이는 0번째 todo의 이름이 변하더라도, autorun의 결과값은 변경되지 않았으므로, autorun이 실행되지 않은 것이다.
  - 이를 통해, autorun은 observable인 array 뿐만 아니라, 그 array의 개별 요소들까지 observe하고 있다는 것을 알 수 있다.

```javascript=
observableTodoStore.addTodo("read MobX tutorial");
observableTodoStore.addTodo("try MobX");
observableTodoStore.todos[0].completed = true;
observableTodoStore.todos[1].task = "try MobX in own project";
observableTodoStore.todos[0].task = "grok MobX tutorial";
```

```bash
    none

    Next TODO: read MobX tutorial
    Progress : 0 / 1


    Next TODO: read MobX tutorial
    Progress : 0 / 2


    Next TODO: try MobX
    Progress : 1 / 2


    Next TODO: try MobX in own project
    Progress : 1 / 2

```

- **observer**
  - observer로 감싼 리액트 컴포넌트는, 연관된 데이터가 변경되었을 때, 자동으로 다시 렌더링된다.
  - 'mobx-react-lite' 패키지지에 observer가 있다.

```javascript
const TodoList = observer(({store}) => {
 ...
})
```

- **action**
  - observable의 값을 바꿀 때에는 action을 통해서 바꿔야 한다.
  - MobX의 트랜잭션이라는 특성이 최대한 영향을 미치려면, action은 최대한 멀리 전달되어야 한다.
  - 클래스 메서드에 action을 표기해도 좋고, 이벤트 핸들러에 action을 표기하는 것은 더더욱 좋다.
  - action으로 감싸는 것은 반드시 필요하지는 않다. 그러나, action으로 감쌌으므로, observable을 바꾸는 두 행동은 하나의 트랜잭션안에서 수행된다는 것이 보장된다. observer는 이 두 행동이 모두 끝나야, observable이 변했음을 알게된다.

```javascript
setTimeout(
  action(() => {
    observableTodoStore.addTodo("Random Todo " + Math.random());
    observableTodoStore.pendingRequests--;
  }),
  2000
);
```

## 출처

- [Ten minute introduction to MobX and React](https://mobx.js.org/getting-started)
