\
// Minimal, dependency-free logic. Assumes your device's time is set to Ireland
// OR we compute time-of-day using Europe/Dublin via Intl.DateTimeFormat.
const TZ = "Europe/Dublin";

async function loadTimetable() {
  const res = await fetch("timetable.json");
  return res.json();
}

// Get "HH:mm" for now in Europe/Dublin, robust across DST
function getNowHhMmDublin() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  // e.g. "17:05"
  return fmt.format(new Date());
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHhmm(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// Given a list of HH:mm strings, return next three based on Europe/Dublin now.
function nextThreeTimes(times) {
  const now = getNowHhMmDublin();
  const nowM = hhmmToMinutes(now);
  const mins = times.map(hhmmToMinutes).sort((a,b)=>a-b);

  // Take those >= now, otherwise wrap to next day
  const remaining = mins.filter(m => m >= nowM);
  const picked = remaining.length >= 3
      ? remaining.slice(0,3)
      : remaining.concat(mins.slice(0, 3 - remaining.length));

  return picked.map(minutesToHhmm);
}

// For the Dublin → M3 journeys, we compare by the 'depart' field.
function nextThreeJourneys(journeys) {
  const now = getNowHhMmDublin();
  const nowM = hhmmToMinutes(now);
  const sorted = journeys
    .slice()
    .sort((a,b) => hhmmToMinutes(a.depart) - hhmmToMinutes(b.depart));

  const remaining = sorted.filter(j => hhmmToMinutes(j.depart) >= nowM);
  const picked = remaining.length >= 3
      ? remaining.slice(0,3)
      : remaining.concat(sorted.slice(0, 3 - remaining.length));

  return picked;
}

function updateNowStamp() {
  const dateFmt = new Intl.DateTimeFormat("en-IE", {
    timeZone: TZ, weekday:"short", day:"2-digit", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit", hourCycle:"h23"
  });
  document.getElementById("now").textContent = "Current time: " + dateFmt.format(new Date()) + " (" + TZ + ")";
}

function renderFromM3(t) {
  const title = document.getElementById("title");
  const list = document.getElementById("list");
  title.textContent = "From M3 Parkway — next three departures";
  list.innerHTML = "";

  const next = nextThreeTimes(t.weekday.from_m3_departures);
  next.forEach(hhmm => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<div class="lead">M3 Parkway ${hhmm} → Dublin (via Clonsilla)</div>
                    <div class="meta">Based on timetable • Weekdays</div>`;
    list.appendChild(li);
  });
}

function renderToM3(t) {
  const title = document.getElementById("title");
  const list = document.getElementById("list");
  title.textContent = "Connolly/Docklands → M3 Parkway — next three";
  list.innerHTML = "";

  const next = nextThreeJourneys(t.weekday.to_m3_from_dublin);
  next.forEach(j => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<div class="lead">${j.origin} ${j.depart} → M3 Parkway ${j.arrive_m3}</div>
                    <div class="meta">Change at ${j.via} • Weekdays</div>`;
    list.appendChild(li);
  });
}

(async function init(){
  const t = await loadTimetable();
  const results = document.getElementById("results");
  const back = document.getElementById("back");
  const btnFrom = document.getElementById("btn-from-m3");
  const btnTo = document.getElementById("btn-to-m3");

  function showResults(renderFn) {
    renderFn(t);
    updateNowStamp();
    results.classList.remove("hidden");
    window.scrollTo({ top: results.offsetTop - 8, behavior: "smooth" });
  }

  btnFrom.addEventListener("click", ()=> showResults(renderFromM3));
  btnTo.addEventListener("click", ()=> showResults(renderToM3));
  back.addEventListener("click", ()=> results.classList.add("hidden"));

  // Optional: auto-refresh timestamp every 30s
  setInterval(updateNowStamp, 30000);
})();
