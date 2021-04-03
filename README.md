
# MobX 코어 개념

MobX에 대해 공부하며, 공식문서의 [README](https://mobx.js.org/README.html)와,  [The gist of MobX](https://mobx.js.org/the-gist-of-mobx.html)를 읽으며 내가 이해한대로 정리한 글이다. 

## 🍎 MobX 흐름

![](https://i.imgur.com/RQCdYSy.png)

MobX는 action으로 state가 바뀌었을 때, *단방향* 으로 데이터가 흐르게 된다. 그 결과 영향을 받는 뷰들이 update된다.

Event가 발생하면 action으로 observable을 변경한다.

observable이 변경된 것은 그 값에 의존하고 있는 computed와 side effect에게 전달된다.


## 🍎 MobX에서의 핵심 3가지

### 1. State : MobX가 추적하게되는 데이터

- state란?
    **state는 application에서 가장 핵심이되는 데이터**를 말하며, 주로 도메인과 관련한 state이다. 여행자보험 비교 사이트 플젝의 경우, State로는 보험상품내역 정도가 될 수 있겠다. 
    
    어떠한 데이터 구조여도 MobX에서는 상관없다. 중요한 것은 state가 계속 변하는 것을 MobX가 추적할 수 있도록 `observable`이라고 표기하는 것이다.

```javascript
import { makeObservable, observable, action } from "mobx"

class Todo {
    id = Math.random()
    title = ""
    finished = false

    constructor(title) {
        makeObservable(this, {
            title: observable,
            finished: observable,
            toggle: action
        })
        this.title = title
    }

    toggle() {
        this.finished = !this.finished
    }
}
```
`makeObservable`안에서 하나씩 해당 state는 `observable`이라고 명시적으로 알려줄 수 있다. 더 간단한 방법은 `makeAutoObservable`을 사용하는 것이다.
[observable state 만들기 - MobX](https://mobx.js.org/observable-state.html)

### 2. Actions : action으로 state를 변경

- action이란?

    **`action`은 `state` 를 변경하는 모든 코드**를 말한다. 
    
💡 **observable을 변경하는 모든 코드에 `action`이라고 표기하는 것을 추천한다. 그렇게 해야 MobX가 자동으로 최적화를 위하여 transactions을 적용하기 때문이다.**

-> 왜 action을 표기해야하는지에 대해 고민이었는데, 이 문장을 보고 그 의도를 알게되었다. 

action을 사용하면 코드를 잘 구조화하는데 도움이 되며, 의도하지 않게 state를 변경하는것을 막아준다.


### 3. Derivations : 상태가 변경되었을 때 자동으로 호출

- derivations란?

    `state`로 부터 자동으로 도출될 수 있는 모든 것은 `derivation`이라고 한다.
    그 예시로는 User Interface, observable을 사용하여 얻어낼 수 있는 데이터, 서버와 통신하는 것과 같은 백엔드 작업 등이 있다.
    
    derivation은 2가지로 구분할 수 있다.
    - Computed Value : *순수함수* 를 통해 현재 observable state로 부터 도출될 수 있는 값
    
    - Reactions : state가 변경되었을 때, 자동으로 일어나게 되는 사이드 이펙트
        
- derivation에서 알아야 할 것

    - 모든 derivation(computed, reaction)은 state가 변경되었을 때, **자동으로** 그리고 **atomic**하게 업데이트된다. => update를 진행중인 값을 observe할 수는 없다.
    - 모든 derivation은 **동기적**으로 업데이트 되는 것이 디폴트다. 이는, action이 state를 변경한 직후에, computed 값을 사용하여도, 그 computed 값은 action이 변경한 observable로 재계산된 값이다. 
    
        위의 글은 내가 해석하고 이해한대로 써보았는데, 틀린 얘기일 수 있으니 원문을 추가한다.
        > All derivations are updated synchronously by default. This means that, for example, actions can safely inspect a computed value directly after altering the state
    

        
- **computed를 사용하여 값 만들기**

    computed 값을 만드려면, (1) JS getter 함수인 `get`을 써야 하며, (2) `makeObservable` 안에서 `computed`라고 표기해주어야 한다.
    
    **coumputed 값은 lazily update**된다. 즉, 사용되지 않는 computed 값은 side effect(I/O)에 필요해질 때까지는, 업데이트 되지 않는다는 것이다. 만약, 뷰가 더이상 사용되지 않는다면, 자동으로 garbage collected될 것이다.
    
    computed는 자동으로 값을 update한 다음, 그 값을 캐싱하고 있다.
    
    computed는 순수해야 한다. 즉, computed에서 state를 변경시키면 안된다.
    
    현재 state를 기반으로 값을 만들어낼 때 `computed`라고 표기해주는 것이 golden rule이라고 한다.
    
```javascript
import { makeObservable, observable, computed } from "mobx"

class TodoList {
    todos = []
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length
    }
    constructor(todos) {
        makeObservable(this, {
            todos: observable,
            unfinishedTodoCount: computed
        })
        this.todos = todos
    }
}
```

위 예제에서 `get`이 있는 `unfinishedTodoCount`함수는 computed 값을 만들어낸다. 이 함수는 observable이 변경되면 자동으로 update가 된다. 여기서는 todos에 새로운 값이 들어온다던가, todos안에 있는 finished의 상태가 변경될 경우, 자동으로 새로운 값을 계산해낼 것이다.
    
    
- **reactions로 사이드 이펙트 만들기**

    reaction 또한 observable이 변경되면 자동으로 실행된다. computed와의 차이점은, computed는 어떠한 결과를 반환한다면, reaction은 'side effect를 만들어내는 것만' 한다. 예를 들면, console.log를 찍기, 네트워크 요청, 등등...이 있을 것이다. 
    
    명시적으로 호출되어야 하는 사이드이펙트와 같은 경우, 관련된 이벤트 핸들러에서 명시적으로 호출될 수 있다. 예를 들면, 폼을 제출했을 때 네트워크 요청을 해야하는 경우가 그렇다
    
- **Reactive한 리액트 컴포넌트**
    `observer`로 리액트 컴포넌트를 감싸면, 컴포넌트를 reactive하게 만들 수 있다.
    observer를 통해 오늘 배운 점은 observer를 사용하면, 컴포넌트의 불필요한 리렌더링을 막을 수 있다는 점이다. 
    
    > observer converts React components into derivations of the data they render

    observer를 사용하면, 리액트 컴포넌트는 mobx가 렌더링해야하는 derivation으로 만들어버린다. 
    
    > MobX will simply make sure the components are always re-rendered whenever needed, and never more than that.

    MobX가 알아서, component가 사용하는 observable이 변하였을 때에만 컴포넌트를 리렌더링한다. 이는 해당 component의 부모가 리렌더링 되었을 때, 자식 component는 리렌더링하지 않아도 되는 경우에도 MobX가 알아서 리렌더링을 막아준다.
    
    따라서 observable을 사용하는 component를 `observer`로 감싸주어서 최적화를 시켜주어야 한다. 좀 더 최적화를 하자면, 최대한 component가 받는 observable은 해당 컴포넌트가 사용하는 props만 받아야 한다. 그렇지 않을 경우, 다른 Props가 변함으로써, 변하지 않은 props를 사용하는 컴포넌트도 같이 리렌더링되기 때문이다. 또한, dereference를 최대한 나중에 해야 한다. 
    
- **커스텀 reactions 만들기**

    `autorun`이나 `reaction`, `when` 함수를 사용하여 reaction을 만들 수 있다. 
    reaction이 그 안에서 주시하고 있는 observable이나 computed의 값이 변할 때, reaction인 함수가 자동으로 실행된다.
    
    아래 코드는 todos.unfinishedTodoCount 값이 바뀔 때마다 실행된다
```javascript
// A function that automatically observes the state.
autorun(() => {
console.log("Tasks left: " + todos.unfinishedTodoCount)
})
```
    
이게 가능한 이유는 mobx의 특징 때문인데, 그 특징은 다음과 같다.

**MobX가 추적하고 있는 함수가 실행되는 동안, 사용되는 observable property에 반응한다.**
> MobX reacts to any existing observable property that is read during the execution of a tracked function.




# MobX - observable, action

MobX는 구조를 만드는 방법이 하나만 존재하는 것이 아니라, 여러 방법을 제시하고 있다. 

여기서는 observable, action을 만드는 여러 방법에 대해 알아볼 것이다.

## 🍎 Observable State

Observable은 `makeObservable` 을 사용하여 `observable`이라고 표기해야 한다. observable을 만드는 방법은 세 가지가 있다.
1. makeObservable
2. makeAutoObservable
3. observable

- **makeObservable**

    makeObservable을 사용하여 하나씩 notation하는 방법
    
```javascript
import { makeObservable, observable, computed, action } from "mobx"

class Doubler {
    value // observable

    constructor(value) {
        makeObservable(this, {
            value: observable,
            double: computed,
            increment: action,
            fetch: flow
        })
        this.value = value
    }

    get double() { // copmuted
        return this.value * 2
    }

    increment() { // action
        this.value++
    }

    *fetch() { // flow
        const response = yield fetch("/api/value")
        this.value = response.json()
    }
}
```
    
- **makeAutoObservable**

    makeAutoObservable은 모든 프로퍼티들을 추론하여 action, computed, observable 등을 정한다.
    
    makeAutoObservable을 사용하면, 코드가 더 짧아질 수 있다. 또한, 새로운 멤버가 추가되어도, makeObservable에 추가하지 않아도 되기 때문에, 관리하기도 쉽다. 
    
    아래 예제는 함수형으로 makeAutoObservable을 사용했지만, 클래스에서도 사용할 수 있다. 
    단, makeAutoObservable은 super를 갖고 있거나(상속받은 경우), subclass를 갖고 있는 경우(상속하는 경우)에는 사용할 수 없다. 
    


```javascript
import { makeAutoObservable } from "mobx"

function createDoubler(value) {
    return makeAutoObservable({
        value,
        get double() {
            return this.value * 2
        },
        increment() {
            this.value++
        }
    })
}
```

- **observable**

    `observable` 메서드를 사용하면, 전체 object를 한 번에 observable로 만들어준다. **observable이 되는 대상은 복제된 다음, 그 멤버들이 전부 observable이 된다.**
    
    observable이 리턴하게 되는 object는 Proxy가 된다. **Proxy가 된다는 말은, 나중에 그 object에 추가되는 프로퍼티들 또한 observable이 된다는 뜻**이다.
    
    `observable` 메서드는 배열, Maps, Sets와 같은 collection type과 함께 호출될 수 있다. 
    
    makeObservable과는 다르게, o**bservable 메서드는 객체에 새로운 필드를 추가하거나 삭제하는것을 지원**한다. 
    

```javascript

import { observable } from "mobx"

const todosById = observable({
    "TODO-123": {
        title: "find a decent task management system",
        done: false
    }
})

todosById["TODO-456"] = {
    title: "close all tickets older than two weeks",
    done: true
}

const tags = observable(["high prio", "medium prio", "low prio"])
tags.push("prio: for fun")
```



## 🍎 Actions

**action은 state를 변경하는 코드**이다. 원칙적으로 action은 항상 어떠한 이벤트에 의해 일어나게 된다. 예를 들면, 버튼 클릭, 인풋 변경, 웹소켓 메시지 도착 등등의 이벤트에 대한 응답으로 action이 일어나게 된다.

makeAutoObservable을 사용하는 경우는 예외지만, 그 외에는 **action임을 MobX에게 알려주어야 한다.** 그렇게 했을 때의 성능상 이점은 다음과 같다. action을 사용하는 것이 코드를 더 잘 구조화하게 해주고, 성능상 이점을 가져다준다.

1. action은 **transaction** 안에서 동작하게 된다.

    action이 끝나기 전까지는 observer들이 update되지 않는다. action이 실행되는 중에 생기는 불완전한 값들은 어플리케이션의 다른 것들에 의해 보이지 않는다는 것이다.

2. action 밖에서 state를 바꾸는 것이 허용되지 않는다. 

    이는 코드의 어떤 부분에서 state가 바뀌는지를 명확하게 알 수 있게 해준다.
        
action은 state를 변경하는 함수에서만 써야 한다. 단순히 정보를 만들어내는 함수(state에서 무언가를 찾는다던가, 데이터를 필터링한다던가)에서는 action이라고 표기하면 안된다. 

### Action 표기의 5가지 방법

다음으로는 action을 표기하는 방법에 대해 알아보겠다. action을 만드는 방법에는 5가지가 있다. 
1. makeObservable
2. makeAutoObservable
3. action.bound
4. action(fn)
5. runInAction(fn)

- **makeObservable**
    makeObservable안에서 action으로 쓰이는 함수에 observable이라고 표기한다. 
    
```javascript
import { makeObservable, observable, action } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeObservable(this, {
            value: observable,
            increment: action
        })
    }

    increment() {
        // Intermediate states will not become visible to observers.
        this.value++
        this.value++
    }
}
```
    
- **makeAutoObservable**

    알아서 notiation을 추론해주는 makeAutoObservable.
```javascript
import { makeAutoObservable } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeAutoObservable(this)
    }

    increment() {
        this.value++
        this.value++
    }
}
```

- **action.bound**

    `action.bound`는 메서드를 알맞은 instance에 bind 시켜준다. 따라서 this가 항상 함수 내부에서 알맞게 bind된다.
    
```javascript
import { makeObservable, observable, action } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeObservable(this, {
            value: observable,
            increment: action.bound
        })
    }

    increment() {
        this.value++
        this.value++
    }
}

const doubler = new Doubler()

// Calling increment this way is safe as it is already bound.
setInterval(doubler.increment, 1000)
```

이게 무슨말인지 모르겠어서, action.bound를 넣었을 때와 넣지 않았을 때를 비교해보았다.


- action.bound 를 표기했을 경우

```javascript
import { makeObservable, observable, action } from "mobx";

class Doubler {
  value = "value";
  constructor(value) {
    makeObservable(this, {
      value: observable,
      say: action.bound
    });
  }
  say() {
    console.log(this.value);
  }
}

const doubler = new Doubler();
setInterval(doubler.say, 1000); 
```
실행시켰을 때, setInterval 내부에서도 this가 doubler에 바인드되어 'value' 제대로 나오는걸 확인할 수 있었다.


<img width='50%' src='https://i.imgur.com/mN49eQd.png' />



- action.bound가 아닌 action으로 표기했을 경우

위와 같은 코드에서 say에 action으로 표기하면, undefined가 출력된다.

```javascript
import { makeObservable, observable, action } from "mobx";

class Doubler {
  value = "value";
  constructor(value) {
    makeObservable(this, {
      value: observable,
      say: action
    });
  }
  say() {
    console.log(this.value);
  }
}

const doubler = new Doubler();
setInterval(doubler.say, 1000);
```

<img width='50%' src='https://i.imgur.com/RupVMfC.png' />


왜 이런식으로 되는지에 대해서는 다른 곳에 더 자세히 글을 남기겠다!


- **action(fn)**

    state를 변경시키는 코드를 부르는 쪽에서는 acton으로 감싸서 최대한 transaction을 지원하는 MobX의 기능의 효과를 높여야 한다. action으로 감싸는 부분은 가능한한 멀리-!!
    
   >  To leverage the transactional nature of MobX as much as possible, actions should be passed as far outward as possible. 
```javascript
import { observable, action } from "mobx"

const state = observable({ value: 0 })

const increment = action(state => {
    state.value++
    state.value++
})

increment(state)
```

- **runInAction(fn)**

    즉시 불려져야 하는 일시적인 액션을 만들 때, runInAction을 사용한다. 비동기처리에서 유용하다.
    
    runInAction을 사용하므로써 굳이 action을 따로 선언하여 사용할 필요없이, 바로 state를 변경하는 코드를 action으로 만들어준다.

```javascript
import { observable, runInAction } from "mobx"

const state = observable({ value: 0 })

runInAction(() => {
    state.value++
    state.value++
})
```

### 비동기 Action

**비동기 처리 과정에서 observable을 업데이트하는 모든 step은 `action`임을 표기해주어야 한다.**
이를 처리하기 위해, 위에서 action을 표기하는 방법을 활용할 것이다. 

예를 들어, 프라미스를 처리하는 부분에서, state를 변경시키는 핸들러는 action이 되어야 한다. 

- **Wrap handlers in 'action'**

    프라미스가 resolve되는 곳에서 action으로 감싸주어야 한다.
    > Promise resolution handlers are handled in-line, but run after the original action finished, so they need to be wrapped by action
    
```javascript

import { action, makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        fetchGithubProjectsSomehow().then(
            action("fetchSuccess", projects => {
                const filteredProjects = somePreprocessing(projects)
                this.githubProjects = filteredProjects
                this.state = "done"
            }),
            action("fetchError", error => {
                this.state = "error"
            })
        )
    }
}
```

- **Handle updates in separate actions**

    프라미스 핸들러가 클래스의 메서드일 경우, `makeAutoObservable`에 의해 자동으로 `action`으로 감싸져서 처리된다. 
    -> 클래스 안에서 프라미스 처리와 에러 처리가 따로 메서드로 나온다면, 어떤 비동기 처리의 프라미스 핸들러인지 알기가 어려울 것 같다.

```javascript
If the promise handlers are class fields, they will automatically be wrapped in action by makeAutoObservable:

import { makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        fetchGithubProjectsSomehow().then(this.projectsFetchSuccess, this.projectsFetchFailure)
    }

    projectsFetchSuccess = projects => {
        const filteredProjects = somePreprocessing(projects)
        this.githubProjects = filteredProjects
        this.state = "done"
    }

    projectsFetchFailure = error => {
        this.state = "error"
    }
}
```

- **async/await + runInAction**

    await 이후의 과정은 같은 tick에 있지 않기 때문에, action으로 감싸주어야 한다.

    > Any steps after await aren't in the same tick, so they require action wrapping. Here, we can leverage runInAction


```javascript

import { runInAction, makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    async fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        try {
            const projects = await fetchGithubProjectsSomehow()
            const filteredProjects = somePreprocessing(projects)
            runInAction(() => {
                this.githubProjects = filteredProjects
                this.state = "done"
            })
        } catch (e) {
            runInAction(() => {
                this.state = "error"
            })
        }
    }
}

```

- **`flow` + generator function**
    
    flow를 사용하는 것은 async/await과는 다르게 action으로 더 감싸줄 필요가 없다. -> 코드가 깔끔해진다.
    
    1. 비동기 함수를 `flow`로 감싼다.
    2. async 대신 `function*`를 사용한다.
    3. await 대신 `yield`를 사용한다.

```javascript
import { flow, makeAutoObservable, flowResult } from "mobx"

class Store {
    githubProjects = []
    state = "pending"

    constructor() {
        makeAutoObservable(this, {
            fetchProjects: flow
        })
    }

    // Note the star, this a generator function!
    *fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        try {
            // Yield instead of await.
            const projects = yield fetchGithubProjectsSomehow()
            const filteredProjects = somePreprocessing(projects)
            this.state = "done"
            this.githubProjects = filteredProjects
        } catch (error) {
            this.state = "error"
        }
    }
}

const store = new Store()
const projects = await flowResult(store.fetchProjects())

```


















## 출처

- [README - mobx](https://mobx.js.org/README.html)
- [The gist of MobX - mobx](https://mobx.js.org/the-gist-of-mobx.html)
- [Creating observable state - MobX](https://mobx.js.org/observable-state.html)
- [Updating state using actions - MobX](https://mobx.js.org/actions.html)
