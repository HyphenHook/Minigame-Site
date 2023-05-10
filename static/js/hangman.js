const letterContainer = document.getElementById("letter-container");
const optionsContainer = document.getElementById("options-container");
const userInputSection = document.getElementById("user-input-section");
const newGameContainer = document.getElementById("new-game-container");
const winBut = document.getElementById("win-button");
const loseBut = document.getElementById("lose-button");
const canvas = document.getElementById("canvas");
const resultText = document.getElementById("result-text");

//count
let winCount = 0;
let count = 0;

let chosenWord = "";

//Block all the Buttons
function blocker(){
  let letterButtons = document.querySelectorAll(".letters");
  //disable all letters
  letterButtons.forEach((button) => {
    button.disabled.true;
  });
  newGameContainer.classList.remove("hide");
}

//Word Getter
function getWord(){
  //a ajax request to the route to get the hangman word
  $.ajax({
    url: '/game/hangman/answer',
    dataType: 'json',
    async: false,
    success: function(data) {
        chosenWord = data.answer;
    }
  });
  //initially hide letters, clear previous word
  letterContainer.classList.remove("hide");
  userInputSection.innerText = "";

  chosenWord = chosenWord.toUpperCase();

  //replace every letter with span containing dash
  let displayItem = chosenWord.replace(/./g, '<span class="dashes"> _ </span>');

  //Display each element as span
  userInputSection.innerHTML = displayItem;
};

//Initial Function (Called when page loads/user presses new game)
const initializer = () => {
  winCount = 0;
  count = 0;

  newGameContainer.classList.add("hide");
  letterContainer.innerHTML = "";
  getWord();
  //Call to canvasCreator (for clearing previous canvas and creating initial canvas)
  let { initialDrawing } = canvasCreator();
  //initialDrawing would draw the frame
  initialDrawing();

  //For creating letter buttons
  for (let i = 65; i < 91; i++) {
    let button = document.createElement("button");
    button.classList.add("letters");
    //Number to ASCII[A-Z]
    button.innerText = String.fromCharCode(i);
    //character button click
    button.addEventListener("click", () => {
      let charArray = chosenWord.split("");
      let dashes = document.getElementsByClassName("dashes");
      if (charArray.includes(button.innerText)) {
        charArray.forEach((char, index) => {
          //if character in array is same as clicked button
          if (char === button.innerText) {
            //replace dash with letter
            dashes[index].innerText = char;
            winCount += 1;
            //if winCount equals word length
            if (winCount == charArray.length) {
              resultText.innerHTML = `<h2 class='win-msg'>You Win!</h2><p>The word was <span>${chosenWord}</span></p>`;
              winBut.classList.remove('hide');
              blocker();
            }
          }
        });
      } else {
        //lose count
        count += 1;
        //for drawing man
        drawMan(count);
        //Count==6 because head,body,left arm, right arm,left leg,right leg
        if (count == 6) {
          resultText.innerHTML = `<h2 class='lose-msg'>You Lose!</h2><p>The word was <span>${chosenWord}</span></p>`;
          loseBut.classList.remove('hide');
          blocker();
        }
      }
      //disable clicked button
      button.disabled = true;
      button.classList.add("grayed-out");
    });
    letterContainer.append(button);
  }
};

//Canvas
const canvasCreator = () => {
  let context = canvas.getContext("2d");
  context.beginPath();
  context.strokeStyle = "#000";
  context.lineWidth = 2;

  //For drawing lines
  const drawLine = (fromX, fromY, toX, toY) => {
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  };

  const head = () => {
    context.beginPath();
    context.arc(170, 30, 10, 0, Math.PI * 2, true);
    context.stroke();
  };

  const body = () => {
    drawLine(170, 40, 170, 80);
  };

  const leftArm = () => {
    drawLine(170, 50, 150, 70);
  };

  const rightArm = () => {
    drawLine(170, 50, 190, 70);
  };

  const leftLeg = () => {
    drawLine(170, 80, 150, 110);
  };

  const rightLeg = () => {
    drawLine(170, 80, 190, 110);
  };

  //initial frame
  const initialDrawing = () => {
    //clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    //bottom line
    drawLine(110, 130, 180, 130);
    //left line
    drawLine(110, 10, 110, 131);
    //top line
    drawLine(110, 10, 170, 10);
    //small top line
    drawLine(170, 10, 170, 20);
  };

  return { initialDrawing, head, body, leftArm, rightArm, leftLeg, rightLeg };
};

//draw the man
const drawMan = (count) => {
  let { head, body, leftArm, rightArm, leftLeg, rightLeg } = canvasCreator();
  switch (count) {
    case 1:
      head();
      break;
    case 2:
      body();
      break;
    case 3:
      leftArm();
      break;
    case 4:
      rightArm();
      break;
    case 5:
      leftLeg();
      break;
    case 6:
      rightLeg();
      break;
    default:
      break;
  }
};

initializer();