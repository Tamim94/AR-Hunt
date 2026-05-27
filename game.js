const STORAGE_SCORE_KEY = "arhunt:score";
const STORAGE_COMPLETED_KEY = "arhunt:completed";
const HOLD_TO_COMPLETE_MS = 2000;

// Each mission is intentionally simple so it can be swapped for real campus markers later.
const missions = [
  {
    id: "library-mascot",
    name: "Library Mascot",
    building: "Main Library",
    points: 10,
    markerType: "hiro"
  },
  {
    id: "student-union-beacon",
    name: "Student Union Beacon",
    building: "Student Union",
    points: 10,
    markerType: "hiro"
  },
  {
    id: "engineering-gear",
    name: "Engineering Gear",
    building: "Engineering Hall",
    points: 10,
    markerType: "hiro"
  },
  {
    id: "garden-crest",
    name: "Garden Crest",
    building: "Campus Garden",
    points: 10,
    markerType: "hiro"
  },
  {
    id: "athletics-shield",
    name: "Athletics Shield",
    building: "Athletics Center",
    points: 10,
    markerType: "hiro"
  }
];

const leaderboard = [
  { name: "Maya", score: 50 },
  { name: "Noah", score: 40 },
  { name: "Aisha", score: 30 },
  { name: "Leo", score: 20 },
  { name: "You", score: 0 }
];

const scoreCounter = document.querySelector("#scoreCounter");
const currentMission = document.querySelector("#currentMission");
const scanStatus = document.querySelector("#scanStatus");
const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const toast = document.querySelector("#toast");
const marker = document.querySelector("#hiroMarker");
const resetGameButton = document.querySelector("#resetGame");
const leaderboardButton = document.querySelector("#leaderboardButton");
const leaderboardModal = document.querySelector("#leaderboardModal");
const closeLeaderboard = document.querySelector("#closeLeaderboard");
const leaderboardList = document.querySelector("#leaderboardList");
const campusModelEntity = document.querySelector("#campusModelEntity");
const fallbackBox = document.querySelector("#fallbackBox");

let score = readNumber(STORAGE_SCORE_KEY);
let completedMissionIds = new Set(
  readJson(STORAGE_COMPLETED_KEY, []).filter((id) =>
    missions.some((mission) => mission.id === id)
  )
);
let markerVisible = false;
let holdTimer = null;
let toastTimer = null;
let modelLoaded = false;

function readNumber(key) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function persistGame() {
  localStorage.setItem(STORAGE_SCORE_KEY, String(score));
  localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify([...completedMissionIds]));
}

function getCurrentMission() {
  return missions.find((mission) => !completedMissionIds.has(mission.id)) ?? null;
}

function updateHud() {
  const completedCount = completedMissionIds.size;
  const totalMissions = missions.length;
  const mission = getCurrentMission();
  const percent = Math.round((completedCount / totalMissions) * 100);

  scoreCounter.textContent = `Score: ${score} pts`;
  progressText.textContent = `${completedCount}/${totalMissions} missions completed`;
  progressFill.style.width = `${percent}%`;

  if (mission) {
    currentMission.textContent = `🎯 Find the ${mission.name}`;
    scanStatus.textContent = markerVisible
      ? `Hold steady at ${mission.building}...`
      : "Point your camera at the Hiro marker";
  } else {
    currentMission.textContent = "🏁 Campus route complete";
    scanStatus.textContent = "All AR missions are complete. Check the leaderboard!";
  }
}

function startHoldTimer() {
  const mission = getCurrentMission();

  if (!markerVisible || holdTimer || !mission) {
    return;
  }

  // This prototype uses the Hiro marker for every stop; custom markers can use this field later.
  if (mission.markerType !== "hiro") {
    scanStatus.textContent = `Wrong marker for ${mission.building}`;
    return;
  }

  scanStatus.textContent = `Scanning ${mission.name}... hold for 2 seconds`;

  holdTimer = window.setTimeout(() => {
    holdTimer = null;

    if (markerVisible) {
      completeCurrentMission();
    }
  }, HOLD_TO_COMPLETE_MS);
}

function clearHoldTimer(message = "Marker lost. Try again.") {
  if (holdTimer) {
    window.clearTimeout(holdTimer);
    holdTimer = null;
  }

  if (getCurrentMission()) {
    scanStatus.textContent = message;
  }
}

function completeCurrentMission() {
  const mission = getCurrentMission();

  if (!mission || completedMissionIds.has(mission.id)) {
    return;
  }

  completedMissionIds.add(mission.id);
  score += mission.points;
  persistGame();
  updateHud();
  showToast(`+${mission.points} points! ${mission.name} found!`);

  // If the marker is still in view, keep the demo flowing into the next mission.
  if (markerVisible && getCurrentMission()) {
    window.setTimeout(startHoldTimer, 500);
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function resetGame() {
  score = 0;
  completedMissionIds = new Set();
  persistGame();
  clearHoldTimer("Game reset. Point at the Hiro marker to begin.");
  updateHud();
  showToast("Game reset. Ready for a new hunt!");

  if (markerVisible) {
    startHoldTimer();
  }
}

function renderLeaderboard() {
  const mergedLeaderboard = leaderboard
    .map((player) => (player.name === "You" ? { ...player, score } : player))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  leaderboardList.innerHTML = mergedLeaderboard
    .map(
      (player, index) => `
        <li>
          <span class="rank">#${index + 1}</span>
          <span>${player.name}</span>
          <strong>${player.score} pts</strong>
        </li>
      `
    )
    .join("");
}

function openLeaderboard() {
  renderLeaderboard();
  leaderboardModal.classList.add("is-open");
  leaderboardModal.setAttribute("aria-hidden", "false");
}

function closeLeaderboardModal() {
  leaderboardModal.classList.remove("is-open");
  leaderboardModal.setAttribute("aria-hidden", "true");
}

function showModelFallback() {
  campusModelEntity.setAttribute("visible", "false");
  fallbackBox.setAttribute("visible", "true");
}

marker.addEventListener("markerFound", () => {
  markerVisible = true;
  updateHud();
  startHoldTimer();
});

marker.addEventListener("markerLost", () => {
  markerVisible = false;
  clearHoldTimer();
  updateHud();
});

campusModelEntity.addEventListener("model-loaded", () => {
  modelLoaded = true;
});

campusModelEntity.addEventListener("model-error", showModelFallback);

// If the model CDN is slow or unavailable, the pitch still shows a visible AR object.
window.setTimeout(() => {
  if (!modelLoaded) {
    showModelFallback();
  }
}, 9000);

resetGameButton.addEventListener("click", resetGame);
leaderboardButton.addEventListener("click", openLeaderboard);
closeLeaderboard.addEventListener("click", closeLeaderboardModal);
leaderboardModal.addEventListener("click", (event) => {
  if (event.target === leaderboardModal) {
    closeLeaderboardModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLeaderboardModal();
  }
});

updateHud();
renderLeaderboard();

// Handy for live demos in DevTools: ARHunt.missions and ARHunt.resetGame().
window.ARHunt = {
  missions,
  resetGame
};
