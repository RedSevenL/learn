type Zone = "A" | "B" | "C" | "D";

type GameState = {
    playing: boolean;
    round: number;
    score: number;
    numbers: Record<Zone, number>;
    timeLeft: number;
};

const state: GameState = {
    playing: false,
    round: 0,
    score: 0,
    timeLeft: 10,
    numbers: {
      A: 0,
      B: 0,
      C: 0,
      D: 0
    }
};

let timerId: number | undefined;

const startButton = document.querySelector("#startButton") as HTMLButtonElement;
const endButton = document.querySelector("#endButton") as HTMLButtonElement;
const zoneA = document.querySelector("#zoneA") as HTMLDivElement;
const zoneB = document.querySelector("#zoneB") as HTMLDivElement;
const zoneC = document.querySelector("#zoneC") as HTMLDivElement;
const zoneD = document.querySelector("#zoneD") as HTMLDivElement;
const statusPanel = document.querySelector("#statusPanel") as HTMLDivElement;

function generateNumbers(): Record<Zone, number> {
    return {
        A: Math.floor(Math.random() * 100) + 1,
        B: Math.floor(Math.random() * 100) + 1,
        C: Math.floor(Math.random() * 100) + 1,
        D: Math.floor(Math.random() * 100) + 1
      };
}

function getMaxZone(numbers: Record<Zone, number>): Zone {
    let maxZone: Zone = "A";
  
    if (numbers.B > numbers[maxZone]) {
      maxZone = "B";
    }
  
    if (numbers.C > numbers[maxZone]) {
      maxZone = "C";
    }
  
    if (numbers.D > numbers[maxZone]) {
      maxZone = "D";
    }
  
    return maxZone;
}

function getAccuracy(): number {
  return state.round === 0 ? 0 : Math.round((state.score / state.round) * 100);
}

function render(): void {
    zoneA.textContent = state.numbers.A.toString();
    zoneB.textContent = state.numbers.B.toString();
    zoneC.textContent = state.numbers.C.toString();
    zoneD.textContent = state.numbers.D.toString();

    const accuracy = state.round === 0 ? 0 : Math.round((state.score / state.round) * 100);
    statusPanel.textContent = `题数：${state.round}，得分：${state.score}，正确率：${accuracy}%，剩余时间：${state.timeLeft}s`;
}

function stopTimer(): void {
  if (timerId !== undefined) {
    clearInterval(timerId);
    timerId = undefined;
  }
}

function startTimer(): void {
  stopTimer();

  state.timeLeft = 10;
  render();

  timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    render();

    if (state.timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function startGame(): void {
  state.playing = true;
  state.round = 0;
  state.score = 0;
  state.numbers = generateNumbers();
  startTimer();
}

function chooseZone(selectedZone: Zone): void {
  if (!state.playing) {
    return;
  }

  const correctZone = getMaxZone(state.numbers);

  state.round += 1;

  if (selectedZone === correctZone) {
    state.score += 1;
  } else {
    state.score -= 1;
  }

  state.numbers = generateNumbers();
  startTimer();
}

function handleTimeout(): void {
  if (!state.playing) {
    return;
  }

  state.round += 1;
  state.score -= 1;
  state.numbers = generateNumbers();
  startTimer();
}

function endGame(): void {
  state.playing = false;
  stopTimer();
  render();

  const accuracy = getAccuracy();

  if (accuracy > 90) {
    alert("恭喜，正确率超过 90%！");
  } else {
    alert("很遗憾，正确率低于 90%！");
  }
}

startButton.addEventListener("click", startGame);
endButton.addEventListener("click", endGame);
zoneA.addEventListener("click", () => chooseZone("A"));
zoneB.addEventListener("click", () => chooseZone("B"));
zoneC.addEventListener("click", () => chooseZone("C"));
zoneD.addEventListener("click", () => chooseZone("D"));
