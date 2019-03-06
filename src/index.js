// ----------------------- containers -------------------------

const counterContainer = document.querySelector('.counter');
const voiceRecCont = document.querySelector('.voice-rec');
const errorCont = document.querySelector('.error-message');
const voiceRec = document.querySelector('img');

// ---------------- manual start/stop counter ---------------

let intervalId;

function myTimer() {
   let time = parseInt(counterContainer.innerText);
   time += 1;
   counterContainer.innerText = time;
}

const startCounter = () => setInterval(myTimer, 1000);

const stopCounter = () => { clearInterval(intervalId); intervalId = null; }

// ----------------- for chrome support ---------------------

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
window.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

window.onload = function() {
   if (!(window.SpeechRecognition) && !(window.webkitSpeechRecognition)){
      alert('Please upgrade to Google Chrome for best possible experience.')
   }
}

// --------------- speech recognition ---------------

const recognition = new SpeechRecognition();

// setting speech recognition properties
recognition.continuous = true;
recognition.lang = 'en-GB';
// puts results down as you speak we don't won't this so set to false
recognition.interimResults = true;
recognition.maxAlternatives = 1;

//cinstruction message
const addTimerInstructions = () => {
   const instructionEL = document.createElement('div');
   instructionEL.innerHTML = `
   <h4>Say 'Start' to start the timer and 'Stop' to stop it</h4>
   `
   voiceRecCont.append(instructionEL);
}

// start speech recognition on image click
voiceRec.addEventListener('click', () => {
   voiceRecCont.querySelector('h4') ? null : addTimerInstructions();
   errorCont.innerHTML = '';
   recognition.start();
})

// ------------- receiving and handling speech -------------------
const state = {
   timerStarted: false,
   timerResultSpoken: false
}

// on a result match
recognition.onresult = function(event) {
   console.log(event.results)
   let last = event.results.length - 1;
   const result = event.results[last][0].transcript;
   console.log(result)
   switch(result) {
      case 'start':
         if(!state.timerStarted) {
            intervalId = startCounter()
            state.timerStarted = true;
         }
         break;
      case ' stop':
         stopCounter()
         state.timerResultSpoken ? null : outputTimerResult();
         recognition.stop();
         state.timerStarted = false;
         break;
   }
}

// recognition.onspeechend = function() {
//    console.log('Speech recognition has stopped')
//    recognition.stop();
// }

recognition.onnomatch = function() {
   diagnostic.textContent = 'I didnt recognise that command.';
}

// no speech detected
recognition.onerror = function(event) {
   errorCont.innerHTML = ''
   console.log(event)
   if(event.error == 'no-speech') {
      const errorEl = document.createElement('h5');
      errorEl.innerText = 'No speech was detected. Click icon and try again.';
      errorCont.append(errorEl);
   };
}

// speech synthesis
const outputTimerResult = () => {
   const timerValue = counterContainer.innerText;
   const textSpeech = 'Your final time was ' + timerValue + ' seconds'
   const utterThis = new SpeechSynthesisUtterance(textSpeech);
   window.speechSynthesis.speak(utterThis);
   state.timerResultSpoken = true;
}
