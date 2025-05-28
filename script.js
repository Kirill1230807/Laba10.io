const USERS_PER_PAGE = 30;
let users = [];
let filteredUsers = [];
let currentPage = 1;
let debounceTimeout;

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("user");

    if (isLoggedIn) {
        showApp();
    }

    setupAuth();
    setupSearchAndSort();
});

function setupAuth() {
    const tabs = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab =>
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            tabContents.forEach(tc => tc.classList.remove("active"));
            document.getElementById(tab.dataset.tab).classList.add("active");
        })
    );

    document.getElementById("registerForm").addEventListener("submit", e => {
        e.preventDefault();
        localStorage.setItem("user", document.getElementById("registerUsername").value);
        showApp();
    });

    document.getElementById("loginForm").addEventListener("submit", e => {
        e.preventDefault();
        localStorage.setItem("user", document.getElementById("loginUsername").value);
        showApp();
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("user");
        location.reload();
    });
}

function showApp() {
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    fetchUsers();
}

function fetchUsers() {
    fetch("https://randomuser.me/api/?results=150")
        .then(res => res.json())
        .then(data => {
            users = data.results.map(user => ({
                name: `${user.name.first} ${user.name.last}`,
                age: user.dob.age,
                email: user.email,
                phone: user.phone,
                picture: user.picture.large,
                registered: new Date(user.registered.date).getTime()
            }));
            applyFilters();
        })
        .catch(() => alert("Помилка при завантаженні даних користувачів"));
}

function applyFilters() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const ageMin = parseInt(document.getElementById("ageMin").value) || 0;
    const ageMax = parseInt(document.getElementById("ageMax").value) || 150;

    filteredUsers = users
        .filter(u => u.name.toLowerCase().includes(search))
        .filter(u => u.age >= ageMin && u.age <= ageMax);

    applySort();
}

function applySort() {
    const sort = document.getElementById("sortSelect").value;
    if (sort === "name-asc") filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name-desc") filteredUsers.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "age-asc") filteredUsers.sort((a, b) => a.age - b.age);
    if (sort === "age-desc") filteredUsers.sort((a, b) => b.age - a.age);

    renderUsers();
    renderPagination();
}

function renderUsers() {
    const container = document.getElementById("usersContainer");
    container.innerHTML = "";

    const start = (currentPage - 1) * USERS_PER_PAGE;
    const pageUsers = filteredUsers.slice(start, start + USERS_PER_PAGE);

    pageUsers.forEach(user => {
        const card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
      <img src="${user.picture}" alt="${user.name}" />
      <h4>${user.name}</h4>
      <p>Вік: ${user.age}</p>
      <p>Телефон: ${user.phone}</p>
    `;
        container.appendChild(card);
    });
}

function renderPagination() {
    const pages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-button" + (i === currentPage ? " active" : "");
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderUsers();
            renderPagination();
        };
        container.appendChild(btn);
    }
}

function setupSearchAndSort() {
    document.getElementById("searchInput").addEventListener("input", e => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            currentPage = 1;
            applyFilters();
        }, 300);
    });

    document.getElementById("sortSelect").addEventListener("change", () => {
        currentPage = 1;
        applySort();
    });

    document.getElementById("applyFilters").addEventListener("click", () => {
        currentPage = 1;
        applyFilters();
    });
}