const input = document.getElementById("options");
const button = document.getElementById("pick-button");
const result = document.getElementById("result");
result.addEventListener('animationend', () => {
  result.classList.remove("anim-typewriter");
  button.disabled = false;
});  
// event listener to button
button.addEventListener("click", pickOption);

// pickOption randomly selects an option
function pickOption() {
    // splits the string into an array of
    var options = input.value.split(",");
    var randomIndex = Math.floor(Math.random() * options.length);
    var randomOption = options[randomIndex].trim();
    result.innerText = randomOption;
    // Type write effect :)
    result.classList.add("anim-typewriter");
    button.disabled = true;
};
