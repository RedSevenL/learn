type Zone = "A" | "B" | "C" | "D";

type GameState = {
    playing: boolean;
    round: number;
    score: number;
    numbers: Record<Zone, number>;
};

const state: GameState = {
    playing: false,
    round: 0,
    score: 0,
    numbers: {
      A: 0,
      B: 0,
      C: 0,
      D: 0
    }
};

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

const zoneA = document.querySelector("#zoneA") as HTMLDivElement;
const zoneB = document.querySelector("#zoneB") as HTMLDivElement;
const zoneC = document.querySelector("#zoneC") as HTMLDivElement;
const zoneD = document.querySelector("#zoneD") as HTMLDivElement;
const statusPanel = document.querySelector("#statusPanel") as HTMLDivElement;

function render(): void {
    zoneA.textContent = state.numbers.A.toString();
    zoneB.textContent = state.numbers.B.toString();
    zoneC.textContent = state.numbers.C.toString();
    zoneD.textContent = state.numbers.D.toString();

    const accuracy = state.round === 0 ? 0 : Math.round((state.score / state.round) * 100);
    statusPanel.textContent = `Round: ${state.round} | Score: ${state.score} | Accuracy: ${accuracy}%`;
}
  
const startButton = document.querySelector("#startButton") as HTMLButtonElement;
const endButton = document.querySelector("#endButton") as HTMLButtonElement;

startButton.addEventListener("click", () => {
  state.playing = true;
  state.round = 0;
  state.score = 0;
  state.numbers = generateNumbers();
  render();
});

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
  render();
}

zoneA.addEventListener("click", () => chooseZone("A"));
zoneB.addEventListener("click", () => chooseZone("B"));
zoneC.addEventListener("click", () => chooseZone("C"));
zoneD.addEventListener("click", () => chooseZone("D"));

endButton.addEventListener("click", () => {
  state.playing = false;
  render();
});