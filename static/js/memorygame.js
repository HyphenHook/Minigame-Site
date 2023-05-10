const level = document.querySelectorAll(".level");
const squares = document.querySelectorAll(".square");
const overlay = document.querySelector(".game-overlay");
const block = document.querySelector(".game-block");
const start_screen = document.querySelector(".start-game-stuff");
const end_screen = document.querySelector(".end-game-stuff");
const earning = document.querySelectorAll(".earning");
const high_level = document.querySelector("#high-level");
const start_btn = document.querySelector("#start-game");
const errMsg = document.querySelector(".errMessage");
const errCon = document.querySelector(".errCon");
const endBtn = document.querySelector(".claim-btn");

//structures to store sequences
let sequence = [];
let user_sequence = [];
let levels = 1;
let speed = 500;

//event listener for start button
if(start_btn){
  start_btn.addEventListener("click", ()=>{
    startGame();
  })
}
//set an event listener for every single square
for(let i = 0; i < squares.length; i++){
  squares[i].addEventListener("click", ()=>{
    user_sequence.push(i);
    checkValid();
  })
}

//a start game function that invokes a ajax request to server to tell the server we have started a game
function startGame(){
  let proceed = true;
  $.ajax({
    url: "/game/memorygame/start",
    async: false,
    success: function(data) {
      proceed = data.proceed;
  }
  });
  if(proceed){
    start_screen.classList.add("hide");
    block.classList.toggle("start");
    changeCoin(-1);
    playGame();
  }
  else{
    errCon.classList.remove("hide");
    errMsg.innerText = "You do not have enough coins! :(";
  }
}

//function to check the validity of the move/the tile that was just pressed
function checkValid(){
  if(user_sequence[user_sequence.length - 1] != sequence[user_sequence.length - 1]) {
    squares[user_sequence[user_sequence.length - 1]].classList.toggle("bad");
    overlay.classList.toggle("hide");
    block.classList.add("ani");
    block.classList.add("end");
    end_screen.classList.toggle("hide");
    endGame();
    return;
  }
  //if we manage to match all sequence then we move on to new level while increase the speed of repeating
  //the sequence
  if(user_sequence.length === sequence.length){
    levels++;
    for(const level_item of level) level_item.innerText = levels;
    user_sequence = [];
    if(levels % 5 == 0 && speed < 1500) speed += 100;
    playGame();
  }
}

//Adds a random sequence into the sequence list
function addNewSequence(){
  const pos = Math.floor(Math.random() * squares.length);
  sequence.push(pos);
}

//Plays the sequence using a recursive call on async timeouts
function playSequence(i){
  if(i >= sequence.length) {
    overlay.classList.toggle("hide");
    return;
  }
  setTimeout(function () {
    squares[sequence[i]].classList.toggle("chosen");
    playSequence(++i);
  }, 2000 - speed);
  setTimeout(function () {
    squares[sequence[i]].classList.toggle("chosen");
  }, 1000 - Math.floor((speed/2)));
}

//simple intermediate process of adding a new sequence and playing the sequence again
function playGame(){
  addNewSequence();
  overlay.classList.remove("hide");
  playSequence(0);
}

//end game function for when game ends. Sends an ajax request to server to obtain info and also tell
//server the user has earned some coins
function endGame(){
  let earns = Math.floor(levels / 3);
  $.ajax({
    url: "/game/memorygame/finished",
    type: 'POST',
    contentType: "application/json",
    data: JSON.stringify({
      "earnings": earns,
      "levels": levels
    }),
    success: function(datab) {
      high_level.innerText = datab.high;
    }
  });
  for(const item of earning) item.innerText = earns;
}