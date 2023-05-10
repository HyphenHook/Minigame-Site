// navigation
const coin = document.querySelector('.alter_coin');

//change the coin amount on client side --> doesnt influence server
function changeCoin(i){
  if(!coin) return;
  let coin_amt = parseInt(coin.innerText);
  coin.innerText = coin_amt + i;
}