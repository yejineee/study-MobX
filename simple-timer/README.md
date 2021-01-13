## 타이머 예제로 알아보는 MobX

```javascript
import React from "react";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";

class Timer {
  secondsPassed = 0;

  constructor() {
    makeAutoObservable(this);
  }
  increase() {
    this.secondsPassed += 1;
  }
  reset() {
    this.secondsPassed = 0;
  }
}

const myTimer = new Timer();

const TimerView = observer(({ timer }) => (
  <button onClick={() => timer.reset()}>
    Seconds passed : {timer.secondsPassed}
  </button>
));

setInterval(() => {
  myTimer.increase();
}, 1000);

function App() {
  return <TimerView timer={myTimer} />;
}

export default App;
```

- TimerView 컴포넌트를 감싼 `observer`는 observable인 `timer.secondsPassed`에 의존하는 렌더링들을 자동으로 감지하고 있다.

- onClick과 setInterval과 같은 이벤트는 increase와 reset과 같은 `action`을 일으키고, 그 액션은 observable state인 secondsPassed를 변화시킨다. observable state에 생긴 변화는 모든 computation과 side effects(TimerView)에 전파된다.
