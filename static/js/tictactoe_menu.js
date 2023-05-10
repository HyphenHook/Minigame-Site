const difficulty = document.querySelector(".difficulty-selector");
const diffSymbol = document.querySelectorAll(".fa-circle");
const awards = document.querySelector(".difficulty-awards");
const replacer = document.querySelector(".difficulty-replacer");

difficulty.value = "easy";
let oldDiff = difficulty.value;
//sets event listener for the selecting difficulty
difficulty.addEventListener("change", () =>{
  for (const i of diffSymbol){
    i.classList.remove(oldDiff);
    i.classList.add(difficulty.value);
  }
  replacer.classList.remove(oldDiff);
  if(difficulty.value == "easy"){
    awards.innerText = "2";
    replacer.innerText = "Easy";
  }
  else if(difficulty.value == "medium"){
    awards.innerText = "4";
    replacer.innerText = "Medium";
  }
  else{
    awards.innerText = "6";
    replacer.innerText = "Hard";
  }
  replacer.classList.add(difficulty.value);
  oldDiff = difficulty.value;
});