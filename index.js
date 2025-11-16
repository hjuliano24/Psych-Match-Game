const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = new Map();
let currentCategory = null;
let totalPairs = 0;

function selectCategory(categoryPath) {
  currentCategory = categoryPath;
  document.getElementById("choosePage").classList.remove("active");
  document.getElementById("gamePage").classList.add("active");
  loadGame();
}

function goBack() {
  document.getElementById("gamePage").classList.remove("active");
  document.getElementById("choosePage").classList.add("active");
  resetGame();
}

function loadGame() {
  fetch(currentCategory)
    .then((res) => res.json())
    .then((data) => {
      cards = data;
      totalPairs = cards.length / 2;
      shuffleCards();
      generateCards();
    });
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-id", card.id);
    cardElement.setAttribute("data-type", card.type);
    cardElement.innerHTML = `
      <div class="front">
        <p class="card-text">${card.text}</p>
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.id === secondCard.dataset.id && 
                firstCard.dataset.type !== secondCard.dataset.type;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  const pairId = firstCard.dataset.id;
  matchedPairs.set(pairId, {
    aText: firstCard.dataset.type === 'a' ? firstCard.querySelector('.card-text').textContent : secondCard.querySelector('.card-text').textContent,
    bText: firstCard.dataset.type === 'b' ? firstCard.querySelector('.card-text').textContent : secondCard.querySelector('.card-text').textContent
  });

  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  
  firstCard.addEventListener("click", () => showLearnMore(pairId));
  secondCard.addEventListener("click", () => showLearnMore(pairId));
  
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  if (matchedPairs.size === totalPairs) {
    setTimeout(() => {
      showCongrats();
    }, 500);
  }

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  gridContainer.innerHTML = "";
  matchedPairs.clear();
  const congratsModal = document.getElementById("congratsModal");
  congratsModal.style.display = "none";
  loadGame();
}

function resetGame() {
  resetBoard();
  gridContainer.innerHTML = "";
  matchedPairs.clear();
  const congratsModal = document.getElementById("congratsModal");
  congratsModal.style.display = "none";
}

function showLearnMore(pairId) {
  const pair = matchedPairs.get(pairId);
  if (pair) {
    const modal = document.getElementById("learnMoreModal");
    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = `
      <div class="modal-header">
        <h2>Learn More - Pair ${pairId}</h2>
        <button class="close-btn" onclick="closeLearnMore()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="pair-text">
          <h3>Situation:</h3>
          <p>${pair.aText}</p>
        </div>
        <div class="pair-text">
          <h3>Response:</h3>
          <p>${pair.bText}</p>
        </div>
      </div>
    `;
    modal.style.display = "block";
  }
}

function closeLearnMore() {
  const modal = document.getElementById("learnMoreModal");
  modal.style.display = "none";
}

function showCongrats() {
  const modal = document.getElementById("congratsModal");
  modal.style.display = "block";
}

window.onclick = function(event) {
  const learnMoreModal = document.getElementById("learnMoreModal");
  const congratsModal = document.getElementById("congratsModal");
  if (event.target == learnMoreModal) {
    learnMoreModal.style.display = "none";
  }
  if (event.target == congratsModal) {
    congratsModal.style.display = "none";
  }
}