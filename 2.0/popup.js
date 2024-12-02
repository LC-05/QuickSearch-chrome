// import { getSearchSuggest } from "./suggestions.js";
let currentSearchEngine = null;
let selectedEngineIndex = 0;
let selectedSuggestionIndex = -1;
let selectedSuggestionText = "";
// Load search engines and initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  const selectedEngineName = document.getElementById("selected-engine-name");
  const openOptionsLink = document.getElementById("openOptions");
  const suggestionsList = document.getElementById("suggestions-list");
  // Load setting from storage
  const { engines, lastUsed, theme } = await chrome.storage.sync.get([
    "engines",
    "lastUsed",
    "theme",
  ]);
  // Automatically focus the search input
  searchInput.focus();
  let searchEngines = engines || getDefaultEngines();

  let suggestions = [];

  // Save default engines if none exist
  if (!engines) {
    await chrome.storage.sync.set({ engines: searchEngines });
  }

  // Set theme
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  if (theme === "light") {
    linkElement.href = "/style_light.css";
  } else if (theme === "dark") {
    linkElement.href = "/style_dark.css";
  } else {
    window.matchMedia("(prefers-color-scheme: light)").matches
      ? (linkElement.href = "/style_light.css")
      : (linkElement.href = "/style_dark.css");
  }

  document.head.appendChild(linkElement);

  // Set current engine
  currentSearchEngine =
    searchEngines.find((engine) => engine.url === lastUsed) || searchEngines[0];
  selectedEngineName.innerText = currentSearchEngine.name;
  selectedEngineIndex = searchEngines.findIndex(
    (engine) => engine.url === currentSearchEngine.url
  );

  // Populate dropdown menu
  const engineList = document.getElementById("engineList");
  updateEngineList(engineList, searchEngines);

  // Event Listeners
  dropdownToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", () => {
    hideDropmenu();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      toggleDropdown();
    } else if (!dropdownMenu.classList.contains("hidden")) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentSearchEngine) {
          hideDropmenu();
          searchInput.focus();
          getSuggestions();
        }
      } else if (e.key >= "1" && e.key <= "9") {
        searchInput.blur();
        const index = parseInt(e.key) - 1;
        const items = document.querySelectorAll(".dropdown-item");
        if (index >= 0 && index < items.length) {
          items[index].click();
          setTimeout(() => {
            searchInput.focus();
            getSuggestions();
          }, 200);
        }
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (dropdownMenu.classList.contains("hidden")) {
        navigateSuggestions(-1, suggestions);
      } else {
        navigateEngines(-1, searchEngines);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (dropdownMenu.classList.contains("hidden")) {
        navigateSuggestions(1, suggestions);
      } else {
        navigateEngines(1, searchEngines);
      }
    }
    if (!suggestionsList.classList.contains("hidden")) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(selectedSuggestionText);
      }
    }
  });
  // openOptionsLink.addEventListener("click", () => {
  //   chrome.runtime.openOptionsPage();
  // });

  const performSearch = (keyword) => {
    const searchTerm = keyword ? keyword : searchInput.value.trim();
    if (searchTerm && currentSearchEngine) {
      const searchUrl = currentSearchEngine.url.replace(
        "%s",
        encodeURIComponent(searchTerm)
      );
      chrome.tabs.create({ url: searchUrl });
    }
  };

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });
  function hideDropmenu() {
    dropdownMenu.classList.add("hidden");
  }
  function toggleDropdown() {
    const dropdownMenu = document.querySelector(".dropdown-menu");
    dropdownMenu.classList.toggle("hidden");
  }
  function hideSuggestions() {
    suggestionsList.classList.add("hidden");
  }
  let timer; //debounce
  function getSuggestions() {
    selectedSuggestionIndex = -1;
    hideDropmenu();
    const searchTerm = searchInput.value.trim();
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (searchTerm) {
        suggestions = await getSearchSuggest(
          searchTerm,
          currentSearchEngine.url
        );
        suggestionsList.innerHTML = "";
        suggestions.forEach((suggestion) => {
          const suggestionItem = document.createElement("div");
          suggestionItem.className = "dropdown-item";
          suggestionItem.textContent = suggestion;
          suggestionItem.addEventListener("click", () => {
            searchInput.value = suggestion;
            performSearch();
          });
          suggestionsList.appendChild(suggestionItem);
        });
        suggestionsList.classList.remove("hidden");
      } else {
        hideSuggestions();
      }
    }, 200);
  }
  //Request suggestions on inputting
  searchInput.addEventListener("input", async () => {
    getSuggestions();
  });
  // Initialize drag and drop
  initializeDragAndDrop(engineList, searchEngines);

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.engines) {
      searchEngines = changes.engines.newValue;
      updateEngineList(engineList, searchEngines);
    }
  });
});

function updateEngineList(container, engines) {
  container.innerHTML = "";
  engines.forEach((engine, index) => {
    const item = createEngineItem(engine, index + 1);
    container.appendChild(item);
  });
}
// Choice engines by Up and Down
function navigateEngines(direction, engines) {
  const items = document.querySelectorAll(".dropdown-item");
  items[selectedEngineIndex]?.classList.remove("selected");

  selectedEngineIndex =
    (selectedEngineIndex + direction + engines.length) % engines.length;
  items[selectedEngineIndex]?.classList.add("selected");

  currentSearchEngine = engines[selectedEngineIndex];
  document.getElementById("selected-engine-name").innerText =
    currentSearchEngine.name;
  chrome.storage.sync.set({ lastUsed: currentSearchEngine.url });
}
// Choice suggestions by Up and Down
function navigateSuggestions(direction, suggestions) {
  let newIndex = selectedSuggestionIndex + direction;
  if (newIndex >= suggestions.length) {
    newIndex = 0;
  } else if (newIndex < 0) {
    newIndex = suggestions.length - 1;
  }
  const parentNode = document.getElementById("suggestions-list");
  const items = parentNode.querySelectorAll(".dropdown-item");
  items[selectedSuggestionIndex]?.classList.remove("selected");
  selectedSuggestionIndex = newIndex;
  items[selectedSuggestionIndex]?.classList.add("selected");
  selectedSuggestionText = suggestions[selectedSuggestionIndex];
}

function createEngineItem(engine, index) {
  const item = document.createElement("div");
  item.className = "dropdown-item";
  item.draggable = true;
  item.dataset.engineId = engine.url;
  item.innerHTML = `
        <span class="item-engine-index" >${index}</span> 
        <span class="item-engine-name">${engine.name}</span>
    `;

  item.addEventListener("click", async () => {
    currentSearchEngine = engine;
    document.getElementById("selected-engine-name").innerText =
      currentSearchEngine.name;
    document.querySelector(".dropdown-menu").classList.add("hidden");
    await chrome.storage.sync.set({ lastUsed: engine.url });
  });

  return item;
}

function initializeDragAndDrop(container, engines) {
  let draggedItem = null;

  container.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    e.target.classList.add("dragging");
  });

  container.addEventListener("dragend", async (e) => {
    e.target.classList.remove("dragging");
    await saveEngineOrder();

    // Update current engine after reordering
    const engineId = e.target.dataset.engineId;
    const { engines } = await chrome.storage.sync.get("engines");
    currentSearchEngine = engines.find((engine) => engine.url === engineId);
    document.getElementById("selected-engine-name").innerText =
      currentSearchEngine.name;
    await chrome.storage.sync.set({ lastUsed: engineId });
  });

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement) {
      container.insertBefore(draggable, afterElement);
    } else {
      container.appendChild(draggable);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".dropdown-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  async function saveEngineOrder() {
    const newOrder = [...container.querySelectorAll(".dropdown-item")].map(
      (item) => item.dataset.engineId
    );
    const { engines } = await chrome.storage.sync.get("engines");
    const reorderedEngines = newOrder.map((url) =>
      engines.find((engine) => engine.url === url)
    );
    await chrome.storage.sync.set({ engines: reorderedEngines });
  }
}

function getDefaultEngines() {
  return [
    {
      name: "百度",
      url: "https://www.baidu.com/s?wd=%s",
    },
    {
      name: "谷歌",
      url: "https://www.google.com/search?q=%s",
    },
    {
      name: "B站",
      url: "https://search.bilibili.com/all?keyword=%s",
    },
    {
      name: "GitHub",
      url: "https://github.com/search?q=%s",
    },
    {
      name: "百度地图",
      url: "https://map.baidu.com/su?wd=%s&cid=131&type=0",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/results?search_query=%s",
    },
    {
      name: "淘宝",
      url: "https://s.taobao.com/search?q=%s",
    },
    {
      name: "京东",
      url: "https://search.jd.com/Search?keyword=%s",
    },
    {
      name: "微信",
      url: "https://weixin.sogou.com/weixin?type=2&query==%s",
    },
    {
      name: "MDN",
      url: "https://developer.mozilla.org/zh-CN/search?q=%s",
    },
    {
      name: "StackOverflow",
      url: "https://stackoverflow.com/search?q=%s",
    },
  ];
}
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
