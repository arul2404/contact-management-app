const API_BASE = "http://localhost:5001";
const tokenKey = "mycontacts-token";

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const contactForm = document.getElementById("contactForm");
const contactList = document.getElementById("contactList");
const userInfo = document.getElementById("userInfo");
const contactCount = document.getElementById("contactCount");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("searchInput");
const contactIdInput = document.getElementById("contactId");
const contactNameInput = document.getElementById("contactName");
const contactEmailInput = document.getElementById("contactEmail");
const contactPhoneInput = document.getElementById("contactPhone");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");

let allContacts = [];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.getElementById("loginForm").classList.toggle("active", tabName === "login");
  document.getElementById("registerForm").classList.toggle("active", tabName === "register");
}

function setAuthUI() {
  const token = getToken();
  if (token) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loadCurrentUser();
    loadContacts();
  } else {
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    userInfo.textContent = "Not logged in";
    contactCount.textContent = "0";
    contactList.innerHTML = "<p>Login to view your contacts.</p>";
  }
}

function renderContacts(contacts) {
  const filtered = contacts.filter((contact) => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return true;
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query)
    );
  });

  contactCount.textContent = String(filtered.length);

  if (!filtered.length) {
    contactList.innerHTML = "<p>No matching contacts found.</p>";
    return;
  }

  contactList.innerHTML = filtered
    .map(
      (contact) => `
        <div class="contact-item" data-id="${contact._id}">
          <div class="contact-meta">
            <h4>${contact.name}</h4>
            <p>${contact.email}</p>
            <p>${contact.phone}</p>
          </div>
          <div class="contact-actions">
            <button class="edit-btn" data-id="${contact._id}">Edit</button>
            <button class="delete-btn" data-id="${contact._id}">Delete</button>
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => startEdit(button.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => deleteContact(button.dataset.id));
  });
}

function resetContactForm() {
  contactForm.reset();
  contactIdInput.value = "";
  formTitle.textContent = "Add Contact";
  cancelEditBtn.classList.add("hidden");
}

async function registerUser(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
  };

  try {
    const response = await fetch(`${API_BASE}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");

    showToast("Registration successful. Please log in.");
    registerForm.reset();
    switchTab("login");
  } catch (error) {
    showToast(error.message);
  }
}

async function loginUser(event) {
  event.preventDefault();
  const payload = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    setToken(data.accessToken);
    showToast("Login successful");
    loginForm.reset();
    setAuthUI();
  } catch (error) {
    showToast(error.message);
  }
}

async function loadCurrentUser() {
  try {
    const response = await fetch(`${API_BASE}/api/users/current`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Session expired");

    userInfo.textContent = `${data.name} (${data.email})`;
  } catch (error) {
    showToast(error.message);
    setToken(null);
    setAuthUI();
  }
}

async function loadContacts() {
  try {
    const response = await fetch(`${API_BASE}/api/contacts`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load contacts");

    allContacts = data;
    renderContacts(allContacts);
  } catch (error) {
    showToast(error.message);
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const payload = {
    name: contactNameInput.value,
    email: contactEmailInput.value,
    phone: contactPhoneInput.value,
  };

  try {
    const contactId = contactIdInput.value;
    const url = contactId ? `${API_BASE}/api/contacts/${contactId}` : `${API_BASE}/api/contacts`;
    const method = contactId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Contact save failed");

    showToast(contactId ? "Contact updated" : "Contact added");
    resetContactForm();
    loadContacts();
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteContact(contactId) {
  try {
    const response = await fetch(`${API_BASE}/api/contacts/${contactId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Delete failed");

    showToast("Contact deleted");
    loadContacts();
  } catch (error) {
    showToast(error.message);
  }
}

async function startEdit(contactId) {
  try {
    const response = await fetch(`${API_BASE}/api/contacts/${contactId}`, {
      headers: getAuthHeaders(),
    });

    const contact = await response.json();
    if (!response.ok) throw new Error(contact.message || "Failed to fetch contact");

    contactIdInput.value = contact._id;
    contactNameInput.value = contact.name;
    contactEmailInput.value = contact.email;
    contactPhoneInput.value = contact.phone;
    formTitle.textContent = "Edit Contact";
    cancelEditBtn.classList.remove("hidden");
  } catch (error) {
    showToast(error.message);
  }
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

loginForm.addEventListener("submit", loginUser);
registerForm.addEventListener("submit", registerUser);
contactForm.addEventListener("submit", handleContactSubmit);
logoutBtn.addEventListener("click", () => {
  setToken(null);
  resetContactForm();
  setAuthUI();
  showToast("Logged out");
});
cancelEditBtn.addEventListener("click", resetContactForm);
searchInput.addEventListener("input", () => renderContacts(allContacts));

setAuthUI();
