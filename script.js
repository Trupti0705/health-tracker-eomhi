// Elements (inputs)
const heightInput = document.getElementById('heightInput');
const weightInput = document.getElementById('weightInput');
const targetInput = document.getElementById('targetWeightInput');
const waterInput  = document.getElementById('waterInput');
const sleepInput  = document.getElementById('sleepInput');
const stepsInput  = document.getElementById('stepsInput');

const updateBtn = document.getElementById('updateBtn');
const resetBtn  = document.getElementById('resetBtn');
const calcBtn   = document.getElementById('calcBtn');

const waterBar  = document.getElementById('waterBar');
const sleepBar  = document.getElementById('sleepBar');
const stepsBar  = document.getElementById('stepsBar');

const waterText = document.getElementById('waterText');
const sleepText = document.getElementById('sleepText');
const stepsText = document.getElementById('stepsText');

const caloriesText = document.getElementById('caloriesText');
const healthText = document.getElementById('healthText');
const tipText = document.getElementById('tipText');
const bmiText = document.getElementById('bmiText');
const goalText = document.getElementById('goalText');
const streakCountEl = document.getElementById('streakCount');
const weekCardsContainer = document.getElementById('weekCards');
const reminderEl = document.getElementById('reminder');
const moodText = document.getElementById('moodText');

// initial data (persisted)
let state = JSON.parse(localStorage.getItem('health_state')) || {
  water:0, sleep:0, steps:0, mood:'neutral', streak:0, week: {
    Mon:false,Tue:false,Wed:false,Thu:false,Fri:false,Sat:false,Sun:false
  }, lastUpdateDay:null
};

const tips = [
  "Every step counts — keep walking!",
  "Hydrate your hustle 💧",
  "Sleep recharges your success ⚡",
  "Consistency is stronger than motivation.",
  "Small progress is still progress."
];

function renderWeekCards(){
  weekCardsContainer.innerHTML = '';
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  days.forEach(day=>{
    const card = document.createElement('div');
    card.className = 'day-card' + (state.week[day] ? ' completed' : '');
    card.textContent = day;
    card.dataset.day = day;
    card.addEventListener('click', ()=>{
      state.week[day] = !state.week[day];
      saveState();
      renderWeekCards();
    });
    weekCardsContainer.appendChild(card);
  });
}

function saveState(){ localStorage.setItem('health_state', JSON.stringify(state)); }

function updateUI(){
  const wP = Math.min(100, Math.round(state.water / 2000 * 100));
  const sP = Math.min(100, Math.round(state.sleep / 8 * 100));
  const stP = Math.min(100, Math.round(state.steps / 10000 * 100));

  waterBar.style.width = wP + '%'; waterBar.textContent = wP + '%';
  sleepBar.style.width = sP + '%'; sleepBar.textContent = sP + '%';
  stepsBar.style.width = stP + '%'; stepsBar.textContent = stP + '%';

  waterText.textContent = `${state.water} / 2000 ml`;
  sleepText.textContent = `${state.sleep} / 8 hr`;
  stepsText.textContent = `${state.steps} / 10000`;

  const calories = Math.floor(state.steps * 0.04);
  caloriesText.textContent = `${calories} kcal`;

  if (wP < 50 || sP < 50) healthText.textContent = '⚠️ Improve hydration/rest';
  else if (stP >= 80) healthText.textContent = '💪 Very active';
  else healthText.textContent = '🙂 Keep going';

  tipText.textContent = tips[Math.floor(Math.random()*tips.length)];
  streakCountEl.textContent = state.streak || 0;

  const h = parseFloat(heightInput.value || 0);
  const w = parseFloat(weightInput.value || 0);
  if(h>0 && w>0){
    const bmi = (w / ((h/100)*(h/100)));
    bmiText.textContent = `BMI: ${bmi.toFixed(1)}`;
  }

  renderWeekCards();
}

function hydrationReminder(){
  reminderEl.style.display = 'block';
  setTimeout(()=>reminderEl.style.display='none',4200);
}

function updateStreakOnUpdate(){
  const todayKey = new Date().toDateString();
  if(state.lastUpdateDay !== todayKey){
    state.streak = (state.streak || 0) + 1;
    state.lastUpdateDay = todayKey;
  }
}

function detectMoodAutomatically(){
  const { water, sleep, steps } = state;
  let mood = 'neutral';
  if(sleep < 5) mood = 'tired';
  else if(water < 1000 && steps < 3000) mood = 'sad';
  else if(water >= 1500 && sleep >= 7 && steps >= 7000) mood = 'happy';
  state.mood = mood;
  moodText.textContent = mood;
}

function autoUpdateWeek(){
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = days[new Date().getDay()];
  // mark completed if updated today with all metrics
  if(state.water > 0 && state.sleep > 0 && state.steps > 0){
    state.week[today] = true;
  }
}

updateBtn.addEventListener('click', ()=>{
  const addWater = parseInt(waterInput.value) || 0;
  const addSleep = parseFloat(sleepInput.value) || 0;
  const addSteps = parseInt(stepsInput.value) || 0;

  state.water += addWater;
  state.sleep += addSleep;
  state.steps += addSteps;

  updateStreakOnUpdate();
  detectMoodAutomatically();
  autoUpdateWeek();

  saveState();
  updateUI();
  hydrationReminder();

  waterInput.value=''; sleepInput.value=''; stepsInput.value='';
});

resetBtn.addEventListener('click', ()=>{
  state.water = 0; state.sleep = 0; state.steps = 0;
  state.streak = 0;
  state.week = {Mon:false,Tue:false,Wed:false,Thu:false,Fri:false,Sat:false,Sun:false};
  state.lastUpdateDay = null;
  state.mood = 'neutral';
  saveState();
  updateUI();
});

calcBtn.addEventListener('click', ()=>{
  const h = parseFloat(heightInput.value);
  const w = parseFloat(weightInput.value);
  const target = parseFloat(targetInput.value);

  if(!h || !w){
    alert('Please enter height (cm) and weight (kg) to get suggestions.');
    return;
  }
  const bmi = (w / ((h/100)*(h/100)));
  let suggestion='';
  if(bmi < 18.5) suggestion = 'Underweight — add nutritious calories and strength training.';
  else if(bmi < 25) suggestion = 'Healthy — maintain, focus on balanced diet & consistency.';
  else if(bmi < 30) suggestion = 'Overweight — aim for 300-500 kcal deficit daily.';
  else suggestion = 'High risk — consult a professional & start gradual activity.';

  let goalMsg='';
  if(target && target < w){
    const dailyBurn = (state.steps * 0.04) + 300;
    const kcalNeeded = (w - target) * 7700;
    const days = Math.max(1, Math.ceil(kcalNeeded / dailyBurn));
    goalMsg = `At current activity, estimated ${days} days to reach ${target} kg.`;
  }

  bmiText.textContent = `BMI: ${bmi.toFixed(1)} — ${suggestion}`;
  goalText.textContent = goalMsg || '';
  saveState();
});

document.querySelectorAll('.mood-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const mood = btn.dataset.mood;
    state.mood = mood;
    moodText.textContent = mood;
    saveState();
  });
});

renderWeekCards();
updateUI();
setInterval(hydrationReminder, 2700000);
