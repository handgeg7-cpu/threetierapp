const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:3001"
  : "http://backend:3001";

const form = document.getElementById("item-form");
const itemList = document.getElementById("item-list");
const status = document.getElementById("status");

async function loadItems() {
  status.textContent = "Loading items...";
  try {
    const response = await fetch(`${API_URL}/api/items`);
    const data = await response.json();
    renderItems(data.items || []);
    status.textContent = `Loaded ${data.items?.length || 0} items.`;
  } catch (error) {
    status.textContent = `Unable to load items: ${error.message}`;
  }
}

function renderItems(items) {
  itemList.innerHTML = "";
  if (!items.length) {
    itemList.innerHTML = "<li>No items yet.</li>";
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.name}</strong><br />${item.description}`;
    itemList.appendChild(li);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
  };

  try {
    const response = await fetch(`${API_URL}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to add item");
    }
    form.reset();
    await loadItems();
  } catch (error) {
    status.textContent = `Unable to add item: ${error.message}`;
  }
});

loadItems();
