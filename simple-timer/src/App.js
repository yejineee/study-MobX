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
