document.addEventListener("DOMContentLoaded", async () => {
  const engineList = document.getElementById("engineList");
  const addEngineForm = document.getElementById("addEngineForm");
  const theme = document.getElementById("theme");

  // Load and display engines
  await loadEngines();
  await loadTheme();
  // Handle new engine addition
  addEngineForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEngine = {
      id: Date.now().toString(),
      name: document.getElementById("engineName").value,
      url: document.getElementById("engineUrl").value,
      icon: document.getElementById("engineIcon").value,
    };

    const { engines } = await chrome.storage.sync.get("engines");
    const updatedEngines = [...engines, newEngine];
    await chrome.storage.sync.set({ engines: updatedEngines });

    addEngineForm.reset();
    await loadEngines();
  });
  theme.addEventListener("change", async () => {
    const selectedTheme = theme.value;
    await chrome.storage.sync.set({ theme: selectedTheme });
  });
});

async function loadEngines() {
  const engineList = document.getElementById("engineList");
  const { engines } = await chrome.storage.sync.get("engines");

  engineList.innerHTML = "";
  engines.forEach((engine) => {
    const engineElement = createEngineElement(engine);
    engineList.appendChild(engineElement);
  });
}
async function loadTheme() {
  const loadTheme = await chrome.storage.sync.get("theme");
  theme.value = loadTheme.theme;
}
function createEngineElement(engine) {
  const div = document.createElement("div");
  div.className = "engine-item";
  div.innerHTML = `
        <div class="engine-info">
            <h3>${engine.name}</h3>
            <p>${engine.url}</p>
        </div>
        <button class="delete-btn" data-id="${engine.url}">删除</button>
    `;

  div.querySelector(".delete-btn").addEventListener("click", async () => {
    const { engines } = await chrome.storage.sync.get("engines");
    const updatedEngines = engines.filter((e) => e.url !== engine.url);
    await chrome.storage.sync.set({ engines: updatedEngines });
    await loadEngines();
  });

  return div;
}
