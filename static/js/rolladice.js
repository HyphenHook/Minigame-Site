const dices = document.querySelectorAll('.dice');
const rollButton = document.querySelector('.roll');
const rngNumber = document.querySelector('.rngNum');
const diceSelector = document.querySelector('.dice-selector');
const colDice = document.querySelectorAll('.col');

let maxdice = 1;
let cumulate = 0;
diceSelector.value = "1";

// event listener to look for the dice selector amount change
diceSelector.addEventListener("change", ()=>{
  if(diceSelector.value === "1"){
    maxdice = 1;
    colDice[1].classList.add("hide");
    colDice[2].classList.add("hide");
  }
  else if(diceSelector.value === "2"){
    maxdice = 2;
    colDice[1].classList.remove("hide");
    colDice[2].classList.add("hide");
  }
  else{
    maxdice = 3;
    colDice[1].classList.remove("hide");
    colDice[2].classList.remove("hide");
  }
});
// randomDice generates a random number
function randomDice() {
    cumulate = 0;
    for(let i = 0; i < maxdice; i++){
      const random = Math.floor(Math.random() * 6);
      cumulate += random + 1;
      // if number is between 0 to 5, rollDice is called
      if (random >= 0 && random <= 5) rollDice(dices[i], random);
  }
}

function rollDice(dice, random){
    // sets the rolling animation

    dice.style.animation = 'rolling 2.5s';
    setTimeout(() => {
        switch (random) {
            case 0:
                dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
                break;
            case 1:
                dice.style.transform = 'rotateX(-90deg) rotateY(0deg)';
                break;
            case 2:
                dice.style.transform = 'rotateX(0deg) rotateY(90deg)';
                break;
            case 3:
                dice.style.transform = 'rotateX(0deg) rotateY(-90deg)';
                break;
            case 4:
                dice.style.transform = 'rotateX(90deg) rotateY(0deg)';
                break;
            case 5:
                dice.style.transform = 'rotateX(180deg) rotateY(0deg)';
                break;
            default:
                break;
        }
        // removes the rolling animation effect
        dice.style.animation = 'none';
        // the number of the rolled dice is displayed
        rngNumber.innerText = cumulate;
    }, 3000);
}

rollButton.addEventListener('click', randomDice);