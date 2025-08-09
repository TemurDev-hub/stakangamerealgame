const cups = [document.getElementById('cup1'), document.getElementById('cup2'), document.getElementById('cup3')];
const message = document.getElementById('message');
const startButton = document.getElementById('startButton');
const coinsDisplay = document.getElementById('coins');
const minBetButton = document.getElementById('minBet');
const maxBetButton = document.getElementById('maxBet');
const doubleBetButton = document.getElementById('doubleBet');
const betInput = document.getElementById('betInput');
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');

let realBallCupIndex = 0;
let positions = [0, 1, 2];
let leftPositions = [20, 160, 300];
let gameStarted = false;
let coins = 1000;
let betAmount = 0;

function updateCoinsDisplay() {
  coinsDisplay.textContent = `Tanga: ${coins}`;
}

function updateCupPositions() {
  const containerWidth = document.querySelector('.game-container').offsetWidth;
  const cupWidth = document.querySelector('.cup').offsetWidth;
  const gap = (containerWidth - 3 * cupWidth) / 4;
  leftPositions = [
    gap,
    gap * 2 + cupWidth,
    gap * 3 + cupWidth * 2
  ];

  positions.forEach((cupIndex, visualIndex) => {
    cups[cupIndex].style.left = `${leftPositions[visualIndex]}px`;
  });
}

function placeBall() {
  document.querySelectorAll('.ball').forEach(b => b.remove());
  const ball = document.createElement('div');
  ball.classList.add('ball');
  cups[realBallCupIndex].appendChild(ball);
}

function revealBall() {
  document.querySelectorAll('.ball').forEach(b => b.style.display = 'block');
}

function coverCups() {
  cups.forEach(cup => cup.classList.add('covered'));
}

function uncoverCups() {
  cups.forEach(cup => cup.classList.remove('covered'));
}

function disableClick() {
  cups.forEach(cup => cup.style.pointerEvents = 'none');
}

function enableClick() {
  cups.forEach(cup => cup.style.pointerEvents = 'auto');
}

function resetCups() {
  cups.forEach(cup => cup.classList.remove('covered', 'lift'));
}

function updateBetControls() {
  const inputValue = parseInt(betInput.value) || 0;
  startButton.disabled = inputValue <= 0 || inputValue > coins || inputValue > 1000;
  minBetButton.disabled = coins < 300 || gameStarted;
  maxBetButton.disabled = coins < 1000 || gameStarted;
  doubleBetButton.disabled = (inputValue * 2 > coins || inputValue * 2 > 1000 || inputValue === 0) || gameStarted;
  betInput.disabled = gameStarted;
}

function setBet(amount) {
  betAmount = Math.min(amount, coins, 1000);
  betInput.value = betAmount;
  updateBetControls();
}

minBetButton.addEventListener('click', () => {
  setBet(300);
});

maxBetButton.addEventListener('click', () => {
  setBet(1000);
});

doubleBetButton.addEventListener('click', () => {
  const currentBet = parseInt(betInput.value) || 0;
  if (currentBet > 0) {
    setBet(currentBet * 2);
  }
});

betInput.addEventListener('input', () => {
  let value = parseInt(betInput.value) || 0;
  if (value < 1) {
    betInput.value = '';
  } else if (value > 1000) {
    betInput.value = 1000;
  }
  updateBetControls();
});

function shuffleCups() {
  message.textContent = "Stakanlar aralashtirilmoqda...";
  disableClick();
  coverCups();

  let count = 24, step = 0;

  function swapStep() {
    if (step >= count) {
      setTimeout(() => {
        message.textContent = "Qaysi stakanda to‘p bor?";
        enableClick();
      }, 170);
      return;
    }

    let i = Math.floor(Math.random() * 3), j;
    do { j = Math.floor(Math.random() * 3); } while (i === j);

    cups[positions[i]].classList.add('lift');
    cups[positions[j]].classList.add('lift');

    setTimeout(() => {
      [positions[i], positions[j]] = [positions[j], positions[i]];
      if (realBallCupIndex === positions[i]) realBallCupIndex = positions[j];
      else if (realBallCupIndex === positions[j]) realBallCupIndex = positions[i];

      updateCupPositions();
      cups.forEach(c => c.classList.remove('lift'));
      step++;
      setTimeout(swapStep, 170);
    }, 170);
  }

  swapStep();
}

function startGame() {
  betAmount = parseInt(betInput.value) || 0;
  if (betAmount <= 0 || betAmount > coins || betAmount > 1000) {
    message.textContent = "Iltimos, to‘g‘ri miqdor kiriting!";
    return;
  }
  gameStarted = true;
  startButton.style.display = 'none';
  resetCups();
  positions = [0, 1, 2];
  updateCupPositions();
  realBallCupIndex = Math.floor(Math.random() * 3);
  placeBall();
  uncoverCups();
  
  disableClick();
  message.textContent = "To‘pni ko‘ring!";
  updateBetControls();
  setTimeout(() => {
    message.textContent = "Stakanlar tushmoqda...";
    coverCups();
    setTimeout(shuffleCups, 1000);
  }, 3000);
}

cups.forEach((cup, visualIndex) => {
  cup.addEventListener('click', () => {
    if (!gameStarted) return;
    uncoverCups();
    revealBall();

    cups[visualIndex].classList.add('lift');
    setTimeout(() => {
      cups.forEach((c, idx) => {
        if (idx !== visualIndex) {
          c.classList.add('lift');
        }
      });
    }, 1000);

    const clickedCupIndex = positions[visualIndex];
    if (clickedCupIndex === realBallCupIndex) {
      const winnings = Math.floor(betAmount * 2.4);
      coins += winnings - betAmount;
      message.textContent = `✅ To‘g‘ri topdingiz! +${winnings - betAmount} tanga`;
      correctSound.play();
      disableClick();
    } else {
      coins -= betAmount;
      message.textContent = `❌ Afsus, noto‘g‘ri. -${betAmount} tanga`;
      incorrectSound.play();
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 500);
      disableClick();
    }

    updateCoinsDisplay();
    setTimeout(() => {
      startButton.style.display = 'block';
      message.textContent = "Yana o‘ynash uchun Start tugmasini bosing!";
      gameStarted = false;
      updateBetControls();
      if (coins === 0) {
        message.textContent = "Tangalar tugadi! O‘yin tugadi.";
        startButton.disabled = true;
        minBetButton.disabled = true;
        maxBetButton.disabled = true;
        doubleBetButton.disabled = true;
        betInput.disabled = true;
      }
    }, 2500);
  });
});

startButton.addEventListener('click', startGame);
window.addEventListener('resize', updateCupPositions);
updateCupPositions();
updateCoinsDisplay();
updateBetControls();