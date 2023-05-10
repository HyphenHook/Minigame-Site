const difficulty = document.querySelector(".difficulty-selector");
const diffSymbol = document.querySelectorAll(".fa-circle");
const catSymbol = document.querySelectorAll(".cate");
const category = document.querySelector(".category-selector");
const awards = document.querySelector(".difficulty-awards");
const replacer = document.querySelector(".difficulty-replacer");

// default values
category.value = "fruit";
difficulty.value = "easy";
let oldCate = category.value;
let oldDiff = difficulty.value;

// change the symbol colors based of the select value of difficulty
difficulty.addEventListener("change", () =>{
  for (const i of diffSymbol){
    i.classList.remove(oldDiff);
    i.classList.add(difficulty.value);
  }
  for (const i of catSymbol){
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

// change the category symbol based of the select value of category
category.addEventListener("change", () =>{
  for (const i of catSymbol){
    if(oldCate === "fruit") i.classList.remove("fa-apple-whole");
    else if(oldCate === "animal") i.classList.remove("fa-hippo");
    else if(oldCate === "country") i.classList.remove("fa-globe");
    else if(oldCate === "vegetable") i.classList.remove("fa-carrot");
    else i.classList.remove("fa-palette");

    if(category.value === "fruit") i.classList.add("fa-apple-whole");
    else if(category.value === "animal") i.classList.add("fa-hippo");
    else if(category.value === "country") i.classList.add("fa-globe");
    else if(category.value === "vegetable") i.classList.add("fa-carrot");
    else i.classList.add("fa-palette");
  }
  oldCate = category.value;
});