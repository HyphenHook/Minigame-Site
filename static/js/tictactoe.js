const tiles = Array.from(document.querySelectorAll('.tile'));
const playerDisplay = document.querySelector ('.display-player');
const boards = document.querySelector('.board');
const overlay = document.querySelector('.game-overlay');
const difficulty = document.querySelector('.difficultyMo');
const status_end = document.querySelector('.status-end');
const streak = document.querySelector('#streak');
const earning = document.querySelector('.earning');
const btn = document.querySelector('.claim-btn');
const start_btn = document.querySelector("#start-game");
const block = document.querySelector(".game-block");
const start_screen = document.querySelector(".start-game-stuff");
const end_screen = document.querySelector(".end-game-stuff");
const place = document.querySelector('.placePlacement');

//Event listener for game start
start_btn.addEventListener("click", startGame);

//initialize variables needed for game functionality
let board = ['', '', '', '', '', '', '', '', ''];
let player = '';
let bot = '';
let active = true;
//randomizing if bot goes first or player
randomize();
//indexes in the board
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// add event listener for each tile clicked
tiles.forEach((tile, index) => {
  tile.addEventListener('click', () => {
    tile.disabled = true;
    if(tile.innerText==="") {
      tile.innerText = player;
      board[index] = player;
      overlay.classList.remove("hide");
      userAction();
    }
});
})

//randomizes who goes first
function randomize(){
  let result = Math.floor(Math.random() * 2);
  if(result === 1){
    bot = 'O';
    player = 'X';
    place.innerText = "Second (X)"
  }
  else{
    bot = 'X';
    player = 'O';
    place.innerText = "First (O)";
  }
}

//actually starts teh game
function startGame(){
  start_screen.classList.add("hide");
  block.classList.toggle("start");
  if(player === 'X') aiMovement();
}

// result goes through winningConditions and compares it with values on the board
function result() {
  let roundWon = false;
  let winner;
  for(let i = 0; i <= 7; i++) {
    const winCondition = winningConditions[i];
    const a = board[winCondition[0]];
    const b = board[winCondition[1]];
    const c = board[winCondition[2]];
    // if any of the tiles on the board are empty, continue
    if(a === '' || b === '' || c === '') continue;
    // if the values are equal to the winning conditions, break
    if(a === b && b === c) {
      roundWon = true;
      winner = a;
      break;
    }
  }
  // if the roundWon is equal to true, announces the player won and the game is set to not active
  if(roundWon) {
    active = false;
    if(winner === player){
      status_end.innerText = "Won";
      streak.innerText = parseInt(streak.innerText) + 1;
      btn.addEventListener("click", ()=>{location.href="/game/tictactoe/win"});
    }
    else{
      status_end.innerText = "Lost";
      earning.innerText = " 0 ";
      streak.innerText = " 0 ";
      btn.addEventListener("click", ()=>{location.href="/game/tictactoe/lose"});
    }
    block.classList.add("ani");
    block.classList.add("end");
    end_screen.classList.toggle("hide");
    return;
  }
  // if the board doesn't contain any empty spaces, announce tie
  if(!board.includes('')){
    active = false;
    status_end.innerText = "Tied";
    block.classList.add("ani");
    block.classList.add("end");
    end_screen.classList.toggle("hide");
    earning.innerText = Math.floor(parseInt(earning.innerText)/2);
    btn.addEventListener("click", ()=>{location.href="/game/tictactoe/tie"});
  }
  overlay.classList.add("hide");
}

//a wrapper function for after an user performed an action
function userAction(){
  result();
  if(active) aiMovement();
}

//the actual bot movement/turn
function aiMovement() {
  playerDisplay.innerText = "Bot";
  overlay.classList.remove("hide");

  switch(difficulty.innerText){
  case "Easy":
    aiRandom();
    break;
  case "Medium": //if difficulty is medium than flip a coin to decide to use which algorithm for turn
    Math.random() < 0.5 ? aiRandom() : aiBestMove();
    break;
  case "Hard":
    aiBestMove();
    break;
  }

  result();
  overlay.classList.add("hide");
  playerDisplay.innerText = "Player";
}

// helper function for easy difficulty
function aiRandom() {
  // pick a random empty tile
  const emptyTiles = tiles.filter(tile => tile.innerText === "");
  const tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  tile.innerText = bot;
  board[tiles.indexOf(tile)] = bot;
}

// helper function for medium and hard difficulty
function aiBestMove(){
  let bestScore = -Infinity;
  let move;
  for(let i = 0; i < board.length; i++){
    // check if the tile is empty
    if(board[i] === "") {
      board[i] = bot;
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  tiles[move].innerText = bot;
  board[move] = bot;
}

//minimax recursive algorithm for finding the best move
function minimax(board, depth, isMaximizing){
  let result = checkWinner();
  //score calculation
  if(result !== null) return result === bot ? 10 - depth : depth - 10;
  //actual finding sequence
  if(isMaximizing){
    let bestScore = -Infinity;
    for(let i = 0; i < board.length; i++){
      if(board[i] === ""){
        board[i] = bot;
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  }
  else {
    let bestScore = Infinity;
    for(let i = 0; i < board.length; i++){
      if(board[i] === ""){
        board[i] = player;
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

//helper function for minimax algorithm to check for a winner
function checkWinner() {
  for(let i = 0; i < winningConditions.length; i++){
    const [a, b, c] = winningConditions[i];
    if(board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if(!board.includes("")) return "tie";
  return null;
}


