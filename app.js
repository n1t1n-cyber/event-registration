/*
 * app.js
 * This script runs SECOND.
 * It contains all logic for all pages.
 */

// --- 0. Helper Functions & Constants ---
const ADMIN_KEY = 'eventhub_admins';
const EVENT_KEY = 'eventhub_events';
const PARTICIPANT_KEY = 'eventhub_participants';

function readStore(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error(`Error reading ${key}:`, e);
        return []; // Return array for admin/event, object for participant
    }
}

function readParticipantsStore() {
    try {
        return JSON.parse(localStorage.getItem(PARTICIPANT_KEY)) || {};
    } catch (e) {
        console.error(`Error reading ${PARTICIPANT_KEY}:`, e);
        return {};
    }
}

function writeStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function escapeHtml(str = '') {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(iso) {
    try { return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return iso; }
}

// --- 1. Global UI Handlers (Run on all pages) ---

function handleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            toggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });

        // Apply saved theme on load
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'enabled') {
            document.body.classList.add('dark-mode');
            toggle.textContent = '☀️ Light Mode';
        }
    }
}

function handleNavbarToggle() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarNav = document.getElementById('navbarNav');
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', () => {
            const isOpen = navbarNav.classList.toggle('show');
            navbarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }
}

function handleLogout() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_name');
            localStorage.removeItem('admin_email');
            alert("Logging out...");
            window.location.href = 'admin-login.html';
        });
    }
}

// --- 2. Page-Specific Initializers ---

function initAdminLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        errorMessage.style.display = 'none';
        
        const admins = readStore(ADMIN_KEY);
        const foundAdmin = admins.find(admin => admin.email === email && admin.password === password);

        if (foundAdmin) {
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('admin_name', foundAdmin.fullName);
            localStorage.setItem('admin_email', foundAdmin.email);
            window.location.href = "dashboard.html";
        } else {
            errorMessage.textContent = 'Invalid email or password.';
            errorMessage.style.display = 'block';
        }
    });
}

function initAdminSignup() {
    const signupForm = document.getElementById('signupForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!signupForm) return;

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formMessage.style.display = 'none';
        formMessage.classList.remove('success', 'error');

        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;

        if (pass !== confirmPass) {
            formMessage.textContent = 'Passwords do not match.';
            formMessage.classList.add('error');
            formMessage.style.display = 'block';
            return;
        }

        const admins = readStore(ADMIN_KEY);
        const existingAdmin = admins.find(admin => admin.email === email);
        
        if (existingAdmin) {
            formMessage.textContent = 'An account with this email already exists.';
            formMessage.classList.add('error');
            formMessage.style.display = 'block';
            return;
        }

        const newAdmin = { fullName, email, password: pass };
        admins.push(newAdmin);
        writeStore(ADMIN_KEY, admins);

        formMessage.textContent = `Success! Account created for ${fullName}. You can now log in.`;
        formMessage.classList.add('success');
        formMessage.style.display = 'block';
        signupForm.reset();
    });
}

function initDashboard() {
    // Page Guard
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        alert('You must be logged in to view this page.');
        window.location.href = 'admin-login.html';
        return; // Stop execution
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    const adminName = localStorage.getItem('admin_name') || 'Admin';
    welcomeMessage.textContent = `Welcome, ${adminName}!`;

    renderDashboardEvents();
    
    // Listen for storage changes (e.g., from participant registration)
    window.addEventListener('storage', (e) => {
        if (e.key === PARTICIPANT_KEY || e.key === EVENT_KEY) {
            renderDashboardEvents();
        }
    });
}

function renderDashboardEvents() {
    const allParticipants = readParticipantsStore();
    const allEvents = readStore(EVENT_KEY);
    const container = document.getElementById('eventsContainer');
    const CURRENT_ADMIN_EMAIL = localStorage.getItem('admin_email');
    
    if (!container) return;
    container.innerHTML = '';

    const myEvents = allEvents.filter(ev => ev.adminEmail === CURRENT_ADMIN_EMAIL);

    if (myEvents.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">You have not created any events yet. Click "Create New Event" to get started.</p>';
        return;
    }

    myEvents.forEach(ev => {
        const participants = allParticipants[ev.id] || [];
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-4';
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="fw-semibold mb-0">${escapeHtml(ev.title)}</h3>
            </div>
            <div class="card-body">
                <p class="card-text">${escapeHtml(ev.description)}</p> 
                <p><strong>When:</strong> ${escapeHtml(ev.date)} at ${escapeHtml(ev.time)}</p>
                <p><strong>Where:</strong> ${escapeHtml(ev.location)}</p>
                <h5 class="mt-4 fw-semibold">Participants (${participants.length})</h5>
                ${participants.length === 0 ? '<p class="text-muted">No participants have registered yet.</p>' : `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered On</th></tr></thead>
                        <tbody>
                            ${participants.map(p => `
                                <tr>
                                    <td>${escapeHtml(p.name)}</td>
                                    <td>${escapeHtml(p.email)}</td>
                                    <td>${escapeHtml(p.phone || '')}</td>
                                    <td>${formatDate(p.registeredOn)}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`}
            </div>
        `;
        container.appendChild(card);
    });
}

function initCreateEvent() {
    // Page Guard
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        alert('You must be logged in to view this page.');
        window.location.href = 'admin-login.html';
        return; // Stop execution
    }

    const eventForm = document.getElementById('createEventForm');
    const CURRENT_ADMIN_EMAIL = localStorage.getItem('admin_email');
    
    if (!eventForm) return;

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newEvent = {
            id: 'evt_' + Date.now(),
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            adminEmail: CURRENT_ADMIN_EMAIL,
            image: `https://picsum.photos/400/200?random=${Date.now()}` // Default image
        };

        const allEvents = readStore(EVENT_KEY);
        allEvents.push(newEvent);
        writeStore(EVENT_KEY, allEvents);

        alert(`Event "${newEvent.title}" has been created!`);
        window.location.href = 'dashboard.html';
    });
}

function initIndex() {
    // Dynamically load events into the homepage
    const allEvents = readStore(EVENT_KEY);
    const container = document.getElementById('events-container-index');
    if (!container) return;

    // Get the first 3 events to feature
   const featuredEvents = allEvents.slice(0, 3); // Get the first 3 events
    
    if (featuredEvents.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No events available right now. Check back soon!</p>';
        return;
    }

    container.innerHTML = featuredEvents.map(event => `
        <div class="col-md-4">
            <div class="card shadow-sm">
                <img src="${escapeHtml(event.image || 'https://picsum.photos/400/200')}" class="card-img-top" alt="${escapeHtml(event.title)}">
                <div class="card-body">
                    <h5 class="card-title fw-bold">${escapeHtml(event.title)}</h5>
                    <p class="card-text text-muted">${escapeHtml(event.description)}</p>
                    <a href="register.html" class="text-primary text-decoration-none fw-semibold">Register Now →</a>
                </div>
            </div>
        </div>
    `).join('');
}

function initRegister() {
    // --- 1. Populate Event Dropdown ---
    const eventSelect = document.getElementById('eventSelect');
    if (!eventSelect) return;
    
    const allEvents = readStore(EVENT_KEY);
    eventSelect.innerHTML = ''; // Clear loading/static options
    
    if (allEvents.length === 0) {
        eventSelect.innerHTML = '<option value="" disabled selected>No events are currently available.</option>';
    } else {
        eventSelect.innerHTML = '<option value="" disabled selected>Select an event...</option>';
        allEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} (${event.date})`;
            eventSelect.appendChild(option);
        });
    }

    // --- 2. Handle Form Submission ---
    const form = document.getElementById('registrationForm');
    const successBox = document.getElementById('regSuccess');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const eventId = document.getElementById('eventSelect').value;
        const comments = document.getElementById('comments').value.trim();

        if (!fullName || !email || !eventId) {
            alert('Please fill required fields: name, email and event.');
            return;
        }

        const participant = {
            name: fullName,
            email: email,
            phone: phone,
            comments: comments,
            registeredOn: new Date().toISOString()
        };

        // Add participant to the correct eventId "bucket"
        const store = readParticipantsStore();
        if (!store[eventId]) store[eventId] = [];
        store[eventId].push(participant);
        writeStore(PARTICIPANT_KEY, store);

        successBox.textContent = `Registered ${fullName} for the selected event.`;
        successBox.style.display = 'block';
        setTimeout(() => successBox.style.display = 'none', 3500);
        form.reset();
        
        // Reset dropdown to default
        eventSelect.selectedIndex = 0;
    });
}

function initExplore() {
    const eventsContainer = document.getElementById('events-container');
    const searchInput = document.getElementById('eventSearch');
    if (!eventsContainer) return;
    
    let allEvents = readStore(EVENT_KEY);

    function renderExploreEvents(filteredEvents = allEvents) {
        eventsContainer.innerHTML = '';
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-triangle"></i> No events found.</div>';
            return;
        }

        filteredEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.setAttribute('data-event-id', event.id);

            card.innerHTML = `
                <img src="${escapeHtml(event.image || 'https://picsum.photos/400/200?random=100')}" alt="${escapeHtml(event.title)}" class="event-image">
                <div class="card-content">
                    <h2>${escapeHtml(event.title)}</h2>
                    <p class="short-detail">${escapeHtml(event.description)}</p>
                    <div class="card-buttons">
                        <button class="btn btn-register" data-event-id="${escapeHtml(event.id)}">
                            <i class="fas fa-arrow-alt-circle-right"></i> Register
                        </button>
                        <button class="btn btn-details" data-toggle="details-${escapeHtml(event.id)}">
                            <i class="fas fa-info-circle"></i> More Details
                        </button>
                    </div>
                </div>
                <div class="more-details" id="details-${escapeHtml(event.id)}">
                    <p><strong>Date:</strong> ${escapeHtml(event.date)} at ${escapeHtml(event.time)}</p>
                    <p><strong>Location:</strong> ${escapeHtml(event.location)}</p>
                </div>
            `;
            eventsContainer.appendChild(card);
        });
    }

    function filterEvents() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderExploreEvents(allEvents);
            return;
        }
        const filtered = allEvents.filter(event => {
            return event.title.toLowerCase().includes(query) ||
                   (event.description && event.description.toLowerCase().includes(query)) ||
                   event.location.toLowerCase().includes(query);
        });
        renderExploreEvents(filtered);
    }

    // Event Delegation for card buttons
    eventsContainer.addEventListener('click', (e) => {
        const detailsButton = e.target.closest('.btn-details');
        const registerButton = e.target.closest('.btn-register');

        if (detailsButton) {
            const targetId = detailsButton.getAttribute('data-toggle');
            const detailsDiv = document.getElementById(targetId);
            detailsDiv.classList.toggle('active');
            detailsButton.innerHTML = detailsDiv.classList.contains('active') ?
                '<i class="fas fa-chevron-up"></i> Hide Details' :
                '<i class="fas fa-info-circle"></i> More Details';
        }
        
        if (registerButton) {
            // Send user to register page, pre-selecting the event
            const eventId = registerButton.getAttribute('data-event-id');
            // We can't pre-select, but we can just send them to the page
            window.location.href = 'register.html';
        }
    });

    searchInput.addEventListener('keyup', filterEvents);
    renderExploreEvents();
}


// --- 3. Main "Router" ---
// This runs when the page is loaded and calls the correct
// initializer based on the <body> ID.
document.addEventListener('DOMContentLoaded', () => {
    
    // Run global handlers on every page
    handleDarkMode();
    handleNavbarToggle();
    handleLogout(); // Will only attach if #logoutButton exists

    // Run page-specific logic
    const bodyId = document.body.id;

    if (bodyId === 'index-page') {
        initIndex();
    } else if (bodyId === 'register-page') {
        initRegister();
    } else if (bodyId === 'explore-page') {
        initExplore();
    } else if (bodyId === 'admin-login-page') {
        initAdminLogin();
    } else if (bodyId === 'admin-signup-page') {
        initAdminSignup();
    } else if (bodyId === 'dashboard-page') {
        initDashboard();
    } else if (bodyId === 'create-event-page') {
        initCreateEvent();
    }
});