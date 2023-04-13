// Variables
const BACK_COLOR = 'white';
const cardBack = 'playing-card.png';

const arrStatus = []; //0:face down, 1: face up(active) 2: inactive
const arrActiveUP = []; // hold indices of cards with active face up
const arrInactive = []; // hold indices of inactive matched cards
const unmatchStayTime = 1000;
let numClick = 0;
let numUniqueCards = 5;
let bestScores = JSON.parse(localStorage.getItem("bestScores"));
if (bestScores === null)
  bestScores = {};

//DOM
const gameContainer = document.getElementById("game");
const start = document.querySelector("#start");
const scoreContainer = document.querySelector("#score");
const score = document.querySelector("#score span");
const bscore = document.querySelector("#best-score span");
const replay = document.querySelector("#replay");
const numCards = document.querySelector('#num-cards');
const label = document.querySelector('#label');
// const describe = document.querySelector("#describe");

// Helper functions

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

//helper function returns arry of num strings of color
function randomColorGenerator(num){
  const arr =[];
  let r, g,b, str;
  for(let i=0; i<num;i++){
      do{ // ensure all colors are unique in arr
          r = Math.floor(Math.random()*256);
          g = Math.floor(Math.random()*256);
          b = Math.floor(Math.random()*256); 
          str = `rgb(${r},${g}, ${b})`;
      } while(arr.includes(str));
      arr.push(str);
  }
  return arr;
}

//helper function generates color arr ready
// returning double and shuffled content of input arr
function doubleShuffleArr(arr){
  let dbArr= arr.concat(arr);
  return shuffle(dbArr);
}

// helper function generates color arr for game
function generateGameColors(num){// num: number of unique colors
  return doubleShuffleArr(randomColorGenerator(num));
}

// helper functions: flip cards
function flipUp(htmlElement){
  htmlElement.style.backgroundImage = "none";
  htmlElement.style.backgroundColor = htmlElement.dataset.name;
}

function flipDown(htmlElement){
  htmlElement.style.backgroundColor = BACK_COLOR;
  htmlElement.style.backgroundImage = "url(" + cardBack+ ")";
  htmlElement.style.backgroundSize = "contain";
  htmlElement.style.backgroundRepeat = "no-repeat";
  htmlElement.style.backgroundPosition ="center";

}

numUniqueCards = Number(numCards.value)/2;
let shuffledColors = generateGameColors(numUniqueCards);

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  let count = 0;
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.dataset.name = color;
    newDiv.dataset.index = count;
    arrStatus.push(0);
    flipDown(newDiv);
  
    // append the div to the element with an id of game
    gameContainer.append(newDiv);
    count++;
  }
}

/********************    DOM Events  ******************/
// when the DOM loads
createDivsForColors(shuffledColors);

// cards
function handleCardClick(event) {
  // you can use event.target to see which element was clicked
  let target = event.target;
  let name = target.dataset.name;
  let index = parseInt(target.dataset.index);

  if (arrActiveUP.includes(index) || arrInactive.includes(index))
    return;
  else{
    if (arrActiveUP.length === 2)
      return;
    else if(arrActiveUP.length === 1){
      let upone = arrActiveUP[0];
      const alsoUpElement = document.querySelector(`#game div:nth-child(${upone+1})`);
      if(alsoUpElement.dataset.name === target.dataset.name){//match found
          flipUp(target);
          score.innerText = ++numClick;
          arrInactive.push(index, upone);
          arrActiveUP.splice(0,1);
          arrStatus.splice(upone, 1, 2);
          arrStatus.splice(index, 1, 2);
          target.style.outline = 'none';
          target.removeEventListener("click", handleCardClick);
          target.removeEventListener('mouseover', mouseOver);
          target.removeEventListener('mouseout', mouseLeave);
          target.removeEventListener('mousedown', outlineOn);
          target.removeEventListener('mouseup', outlineOff);

          alsoUpElement.removeEventListener("click", handleCardClick);
          alsoUpElement.removeEventListener('mouseover', mouseOver);
          alsoUpElement.removeEventListener('mouseout', mouseLeave);
          alsoUpElement.removeEventListener('mousedown', outlineOn);
          alsoUpElement.removeEventListener('mouseup', outlineOff);
          // check if game is over
          if(arrInactive.length === arrStatus.length){
            flipUp(target);
            //save score
            bestScores = JSON.parse(localStorage.getItem('bestScores'));
            if(bestScores === null){
              bestScores ={};
              bestScores[numUniqueCards*2] = numClick;
              localStorage.setItem('bestScores', JSON.stringify(bestScores));
              bscore.innerText = numClick;
            }
            else if( bestScores[numUniqueCards*2] === undefined){
              bestScores[numUniqueCards*2] = numClick;
              localStorage.setItem('bestScores', JSON.stringify(bestScores));
              bscore.innerText = numClick;
            }
            else if(bestScores[numUniqueCards*2]>numClick){
              bestScores[numUniqueCards*2] = numClick;
              localStorage.setItem('bestScores', JSON.stringify(bestScores));
              bscore.innerText = numClick;
            }
            else{
              bscore.innerText = bestScores[numUniqueCards*2];
            }
            
            setTimeout(function(){
              bscore.parentElement.classList.remove('hide');
              const cards = document.querySelectorAll("#game div")
              for(let card of cards){
                card.remove();
              }
              numClick = 0;
              numCards.classList.remove('hide');
              label.classList.remove('hide');
              replay.classList.remove('hide');
              arrInactive.splice(0, arrInactive.length);
              arrStatus.splice(0, arrStatus.length);
              shuffledColors = generateGameColors(numUniqueCards);
              createDivsForColors(shuffledColors);
            },1000);
          }
      }
      else{ // not match, stay up for 1 sec
        flipUp(target);
        score.innerText = ++numClick;
        arrActiveUP.push(index);
        arrStatus.splice(upone, 1, 1);
        setTimeout(function(){
          flipDown(target);
          flipDown(alsoUpElement);
          arrStatus.splice(upone, 1, 0);
          arrStatus.splice(index, 1, 0);
          arrActiveUP.splice(0,2);
        }, unmatchStayTime);
      }
    }
    else{
      flipUp(target);
      score.innerText = ++numClick;
      arrActiveUP.push(index);
      arrStatus.splice(index, 1, 1);
    }
  }
}



// click on START
function handleStartClick(){
  const cards = document.querySelectorAll("#game div");
  for(let card of cards){
    card.addEventListener('click', handleCardClick);
    card.addEventListener('mouseover', mouseOver);
    card.addEventListener('mouseout', mouseLeave);
    card.addEventListener('mousedown', outlineOn);
    card.addEventListener('mouseup', outlineOff);
  }
  start.removeEventListener('click',handleStartClick);
  start.classList.add('hide');
  scoreContainer.classList.toggle('hide');
  score.innerText = numClick;
  numCards.classList.add("hide");
  label.classList.add("hide");
}
start.addEventListener('click', handleStartClick);

// START/REPLAY button down
function outlineOn(event){
  let btn = event.target;
  btn.classList.add("outline");
}
start.addEventListener('mousedown', outlineOn);
replay.addEventListener('mousedown', outlineOn);

// START/REPLAY button up or drag
function outlineOff(event){
  let btn = event.target;
  btn.classList.remove("outline");
}
start.addEventListener("mouseup", outlineOff);
replay.addEventListener("mouseup", outlineOff);

function mouseDrag(e){
  if(e.buttons == 1) {
    e.preventDefault();
    e.target.classList.remove("outline");
   }
}

function mouseOver(e){
  let target = e.target;
  // target.style.boxShadow="0 0 5px 5px #8bd719";
  // target.style.outline="3px outlet  #8bd719";
  target.style.outline="3px inset white";
  console.log("triggered mouseover");
}

function mouseLeave(e){
  let target = e.target;
  // target.style.boxShadow="none";
  target.style.outline = 'none';
  console.log("triggered mouseout");
}

start.addEventListener("mousemove", mouseDrag);
replay.addEventListener("mousemove", mouseDrag);

// click on PLAY AGAIN
function handleReplayClick(){
  const cards = document.querySelectorAll("#game div");
  for(let card of cards){
    card.addEventListener('click', handleCardClick);
    card.addEventListener('mouseover', mouseOver);
    card.addEventListener('mouseout', mouseLeave);
    card.addEventListener('mousedown', outlineOn);
    card.addEventListener('mouseup', outlineOff);
  }
  replay.classList.add('hide');
  numCards.classList.add('hide');
  label.classList.add('hide');
  score.innerText= "0";
}
replay.addEventListener('click', handleReplayClick);


// change on SELECT- numCards
function handleChangeNumcards(event){
  const cards = document.querySelectorAll("#game div")
  for(let card of cards){
    card.remove();
  } 
  arrStatus.splice(0)
  numUniqueCards = Number(numCards.value)/2;
  if(bestScores[numCards.value]=== undefined){
    bscore.innerText = "No Record";
  }
  else{
    bscore.innerText = bestScores[numCards.value];
  }
  shuffledColors = generateGameColors(numUniqueCards);
  createDivsForColors(shuffledColors);
}
numCards.addEventListener("change", handleChangeNumcards)

