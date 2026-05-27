const STORAGE_SCORE_KEY = "arhunt:score";
const STORAGE_COMPLETED_KEY = "arhunt:completed";
const HOLD_TO_COMPLETE_MS = 2000;

const missions = [
  { id: "library-mascot", name: "Library Mascot", building: "Main Library", points: 10, markerType: "hiro" },
  { id: "student-union-beacon", name: "Student Union Beacon", building: "Student Union", points: 10, markerType: "hiro" },
  { id: "engineering-gear", name: "Engineering Gear", building: "Engineering Hall", points: 10, markerType: "hiro" },
  { id: "garden-crest", name: "Garden Crest", building: "Campus Garden", points: 10, markerType: "hiro" },
  { id: "athletics-shield", name: "Athletics Shield", building: "Athletics Center", points: 10, markerType: "hiro" }
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
  progressText.innerHTML = `<strong>${completedCount}</strong>/${totalMissions} missions completed`;
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
  if (!markerVisible || holdTimer || !mission) return;

  holdTimer = setTimeout(() => {
    completeMission(mission);
    holdTimer = null;
  }, HOLD_TO_COMPLETE_MS);
}

function clearHoldTimer() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}

function completeMission(mission) {
  if (completedMissionIds.has(mission.id)) return;
  completedMissionIds.add(mission.id);
  score += mission.points;
  persistGame();
  showToast(`+${mission.points} points! ${mission.name} found!`);
  updateHud();
  renderLeaderboard();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function renderLeaderboard() {
  const board = leaderboard
      .map((entry) => (entry.name === "You" ? { ...entry, score } : entry))
      .sort((a, b) => b.score - a.score);

  leaderboardList.innerHTML = board
      .map(
          (entry, i) => `
      <li>
        <span class="rank">#${i + 1}</span>
        <span>${entry.name}</span>
        <strong>${entry.score} pts</strong>
      </li>`
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

function resetGame() {
  if (!confirm("Reset all progress?")) return;
  score = 0;
  completedMissionIds.clear();
  persistGame();
  updateHud();
  renderLeaderboard();
  showToast("Progress reset");
}

// Marker events
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

// Model load fallback
campusModelEntity.addEventListener("model-loaded", () => { modelLoaded = true; });
campusModelEntity.addEventListener("model-error", () => {
  if (modelLoaded) return;
  campusModelEntity.setAttribute("visible", "false");
  fallbackBox.setAttribute("visible", "true");
});

// UI bindings
resetGameButton.addEventListener("click", resetGame);
leaderboardButton.addEventListener("click", openLeaderboard);
closeLeaderboard.addEventListener("click", closeLeaderboardModal);
leaderboardModal.addEventListener("click", (e) => {
  if (e.target === leaderboardModal) closeLeaderboardModal();
});

// === AR.js video fix — keep camera feed properly sized ===
function fixArjsVideo() {
  const video = document.querySelector("video");
  if (!video) return;
  Object.assign(video.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: "0",
    display: "block"
  });
}

window.addEventListener("resize", fixArjsVideo);
window.addEventListener("orientationchange", () => setTimeout(fixArjsVideo, 300));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) setTimeout(fixArjsVideo, 300);
});
[500, 1500, 3000, 6000].forEach((d) => setTimeout(fixArjsVideo, d));

// Init
updateHud();
renderLeaderboard();
