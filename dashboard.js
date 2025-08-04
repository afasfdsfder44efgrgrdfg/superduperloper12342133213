let username = localStorage.getItem("username") || "User";
let isOwner = localStorage.getItem("isOwner") === "true";
let isAuthenticatedForScript = localStorage.getItem("isAuthenticatedForScript") === "true";
let whitelistKey = localStorage.getItem("whitelistKey") || "";
let isScriptSaved = localStorage.getItem("isScriptSaved") === "true";
const isAdmin = whitelistKey === "628338db-a878-4d0d-a724-35a038981446";
const ADMIN_WHITELIST_KEY = "628338db-a878-4d0d-a724-35a038981446";
const OWNER_WHITELIST_KEY = "E2D3FB9B-E401-4AB5-82D3-2F4EE178AC4";
const navUsername = document.getElementById("navUsername");
const settingsUsername = document.getElementById("settingsUsername");
const navProfileCircle = document.getElementById("navProfileCircle");
const profileCircle = document.getElementById("profileCircle");
const scriptTab = document.getElementById("scriptTab");
const scriptSection = document.getElementById("scriptSection");
const scriptEditor = document.getElementById("scriptEditor");
const adminsSection = document.getElementById("adminsSection");
const auditLogSection = document.getElementById("auditLogSection");
const adminsList = document.getElementById("adminsList");
const auditLogList = document.getElementById("auditLogList");
const openForumModalBtn = document.getElementById("openForumModal");
const forumCard = document.getElementById("forumCard");
const scriptContent = document.getElementById("scriptContent");
const scriptActions = document.getElementById("scriptActions");
const saveScriptBtn = document.getElementById("saveScriptBtn");
const copyScriptBtn = document.getElementById("copyScriptBtn");
const rawScriptBtn = document.getElementById("rawScriptBtn");
const downloadScriptBtn = document.getElementById("downloadScriptBtn");
const rawScriptModal = document.getElementById("rawScriptModal");
const rawScriptContent = document.getElementById("rawScriptContent");

navUsername.textContent = username;
settingsUsername.textContent = username;

// Initialize all data structures with backup recovery
let updatesData = initializeData("updatesData", [
  { id: 'update-1', version: 'v2.1.3', summary: 'Added anti-ban feature, optimized performance for [Game X].' },
  { id: 'update-2', version: 'v2.1.2', summary: 'Fixed crash bug, updated bypass for [Game Y].' },
]);
let oldUpdatesData = initializeData("oldUpdatesData", [
  { id: 'old-update-1', version: 'v2.0.0', summary: 'Initial release for [Game Z] with core features.' },
  { id: 'old-update-2', version: 'v1.9.0', summary: 'Added support for [Game W] with basic cheat functionality.' },
]);
let auditLogData = initializeData("auditLogData", []);
let forumsData = initializeData("forumsData", {});
let announcementsData = initializeData("announcementsData", {});
let userData = initializeData("userData", []);
let forumIdCounter = parseInt(localStorage.getItem("forumIdCounter")) || 1;
let announcementIdCounter = parseInt(localStorage.getItem("announcementIdCounter")) || 1;

// Function to initialize data with validation and backup recovery
function initializeData(key, defaultValue) {
  let data = defaultValue;
  try {
    const storedData = localStorage.getItem(key);
    const backupData = localStorage.getItem(`${key}_backup`);
    if (storedData) {
      data = JSON.parse(storedData);
      if (!isValidData(data, key)) {
        console.warn(`Invalid ${key} detected, attempting to restore from backup`);
        data = backupData ? JSON.parse(backupData) : defaultValue;
      }
    } else if (backupData) {
      console.warn(`No ${key} found, restoring from backup`);
      data = JSON.parse(backupData);
    } else {
      console.warn(`No ${key} or backup found, using default value`);
    }
    // Save a backup
    saveData(key, data);
  } catch (e) {
    console.error(`Error initializing ${key}:`, e);
    data = defaultValue;
    saveData(key, data);
  }
  return data;
}

// Validate data structure
function isValidData(data, key) {
  if (key === "forumsData") {
    return data && typeof data === "object" && Object.values(data).every(item =>
      item.title && item.headline && item.description && item.username && item.timestamp && Array.isArray(item.replies)
    );
  } else if (key === "announcementsData") {
    return data && typeof data === "object" && Object.values(data).every(item =>
      item.headline && item.description && item.username && item.timestamp
    );
  } else if (key === "userData") {
    return data && Array.isArray(data) && data.every(item =>
      item.username && item.key && item.created && item.category && item.status
    );
  } else if (key === "auditLogData") {
    return data && Array.isArray(data) && data.every(item =>
      item.action && item.user && item.details && item.timestamp
    );
  } else if (key === "updatesData" || key === "oldUpdatesData") {
    return data && Array.isArray(data) && data.every(item =>
      item.id && item.version && item.summary
    );
  }
  return true;
}

// Save data with backup
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_backup`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// Log audit actions
function logAudit(action, details) {
  const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  auditLogData.push({ action, user: username, details, timestamp });
  saveData("auditLogData", auditLogData);
  if (auditLogSection.style.display === "block") {
    renderAuditLog();
  }
}

// Update script buttons visibility
function updateScriptButtonsVisibility() {
  copyScriptBtn.style.display = isScriptSaved ? 'inline-block' : 'none';
  rawScriptBtn.style.display = isScriptSaved ? 'inline-block' : 'none';
  downloadScriptBtn.style.display = isScriptSaved ? 'inline-block' : 'none';
}

// Add event listeners for script buttons
saveScriptBtn.addEventListener('click', () => {
  if (isAuthenticatedForScript) {
    const content = scriptContent.value;
    localStorage.setItem('savedScript', content);
    localStorage.setItem('isScriptSaved', 'true');
    isScriptSaved = true;
    updateScriptButtonsVisibility();
    const preview = document.getElementById('scriptPreview');
    preview.innerHTML = content;
    logAudit("Script Saved", `User ${username} saved script content`);
    alert('Script saved successfully.');
  } else {
    alert('You need to be authenticated to save the script.');
  }
});

copyScriptBtn.addEventListener('click', () => {
  if (isAuthenticatedForScript && isScriptSaved) {
    const content = scriptContent.value;
    navigator.clipboard.writeText(content).then(() => {
      logAudit("Script Copied", `User ${username} copied script content to clipboard`);
      alert('Script copied to clipboard.');
    }).catch(err => {
      console.error('Failed to copy script:', err);
      alert('Failed to copy script.');
    });
  } else {
    alert('You need to save the script first.');
  }
});

rawScriptBtn.addEventListener('click', () => {
  if (isAuthenticatedForScript && isScriptSaved) {
    const content = scriptContent.value;
    rawScriptContent.textContent = content;
    rawScriptModal.style.display = 'block';
    logAudit("Script Raw View", `User ${username} viewed raw script content`);
  } else {
    alert('You need to save the script first.');
  }
});

downloadScriptBtn.addEventListener('click', () => {
  if (isAuthenticatedForScript && isScriptSaved) {
    const content = scriptContent.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pivot-script.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAudit("Script Downloaded", `User ${username} downloaded script content`);
  } else {
    alert('You need to save the script first.');
  }
});

// Close raw modal on click outside
rawScriptModal.addEventListener('click', () => {
  rawScriptModal.style.display = 'none';
});

function renderAuditLog() {
  auditLogList.innerHTML = "";
  auditLogData.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.action}</td>
      <td>${log.user}</td>
      <td>${log.details}</td>
      <td>${log.timestamp}</td>
    `;
    auditLogList.appendChild(row);
  });
}

function initializeCategoryToggles() {
  document.querySelectorAll('.category h3').forEach(header => {
    header.removeEventListener('click', toggleCategory);
    header.addEventListener('click', toggleCategory);
  });
}

function toggleCategory(e) {
  const header = e.currentTarget;
  const content = header.nextElementSibling;
  const isVisible = content.style.display === 'block';
  content.style.display = isVisible ? 'none' : 'block';
  header.classList.toggle('active', !isVisible);
  header.querySelector('i').style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
}

function renderUpdates(sectionId, data, contentElementId) {
  const content = document.getElementById(contentElementId);
  content.innerHTML = '';
  data.forEach(update => {
    const updateDiv = document.createElement('div');
    updateDiv.className = 'update-item';
    updateDiv.dataset.id = update.id;
    updateDiv.innerHTML = `
      <div class="icon"><i class="fa-solid fa-download"></i></div>
      <div class="update-content">
        <div class="version">${update.version}</div>
        <div class="summary">${update.summary}</div>
      </div>
      <div class="actions">
        <button class="download-btn">Head to Download</button>
        <button class="ticket-btn">Head to Forums</button>
        <button class="edit-btn admin-only" style="display:${isAdmin || isOwner ? 'inline-block' : 'none'};">Edit</button>
      </div>
    `;
    content.appendChild(updateDiv);
  });

  document.querySelectorAll(`#${contentElementId} .download-btn`).forEach(btn => {
    btn.addEventListener('click', () => switchTab('Download'));
  });
  document.querySelectorAll(`#${contentElementId} .ticket-btn`).forEach(btn => {
    btn.addEventListener('click', () => switchTab('Forums'));
  });
  if (isAdmin || isOwner) {
    document.querySelectorAll(`#${contentElementId} .edit-btn`).forEach(btn => {
      btn.addEventListener('click', () => openEditUpdateModal(btn.closest('.update-item').dataset.id, contentElementId));
    });
  }
}

function openEditUpdateModal(updateId, contentElementId) {
  const modal = document.getElementById('editUpdateModal');
  const form = document.getElementById('editUpdateForm');
  const versionInput = document.getElementById('updateVersion');
  const summaryInput = document.getElementById('updateSummary');
  const updateIdInput = document.getElementById('updateId');

  const data = contentElementId === 'latestUpdatesContent' ? updatesData : oldUpdatesData;
  const update = data.find(u => u.id === updateId);
  if (update) {
    versionInput.value = update.version;
    summaryInput.value = update.summary;
    updateIdInput.value = updateId;
    updateIdInput.dataset.section = contentElementId;
    modal.style.display = 'flex';
  }
}

function closeEditUpdateModal() {
  document.getElementById('editUpdateModal').style.display = 'none';
}

document.getElementById('closeEditUpdateModal').onclick = closeEditUpdateModal;

document.getElementById('editUpdateForm').onsubmit = e => {
  e.preventDefault();
  const updateId = document.getElementById('updateId').value;
  const sectionId = document.getElementById('updateId').dataset.section;
  const version = document.getElementById('updateVersion').value.trim();
  const summary = document.getElementById('updateSummary').value.trim();
  if (version && summary && updateId) {
    const data = sectionId === 'latestUpdatesContent' ? updatesData : oldUpdatesData;
    const updateIndex = data.findIndex(u => u.id === updateId);
    if (updateIndex !== -1) {
      data[updateIndex] = { ...data[updateIndex], version, summary };
      saveData(sectionId === 'latestUpdatesContent' ? 'updatesData' : 'oldUpdatesData', data);
      logAudit("Update Edited", `Update ${updateId} edited to version ${version} by ${username}`);
      closeEditUpdateModal();
      renderUpdates('updatesSection', data, sectionId);
      initializeCategoryToggles();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initializeCategoryToggles();
  renderUpdates('updatesSection', updatesData, 'latestUpdatesContent');
  renderUpdates('updatesSection', oldUpdatesData, 'oldUpdatesContent');
  initializeCategoryToggles();
  updateScriptButtonsVisibility();
});

function updateAdminVisibility() {
  if (isAdmin || isOwner) {
    document.querySelector(".admin-badge").style.display = "inline-block";
    document.querySelectorAll(".admin-only-tab").forEach(el => el.style.display = "flex");
    document.getElementById("announcementCard").style.display = "block";
    document.getElementById("forumCard").style.display = isOwner ? "block" : "none";
  } else {
    document.querySelectorAll(".admin-only-tab").forEach(el => el.classList.add("hidden"));
    document.getElementById("announcementCard").style.display = "none";
    document.getElementById("forumCard").style.display = "none";
  }
  document.querySelectorAll(".owner-only").forEach(el => {
    el.style.display = isOwner ? "block" : "none";
  });
  document.querySelectorAll(".owner-only-tab").forEach(el => {
    el.style.display = isOwner ? "flex" : "none";
  });
}

if (!userData.find(user => user.username === username && user.key === whitelistKey)) {
  userData.push({
    username: username,
    key: whitelistKey || "",
    created: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    category: "Name",
    status: whitelistKey === ADMIN_WHITELIST_KEY ? "Admin" : whitelistKey === OWNER_WHITELIST_KEY ? "Owner" : "Buyer"
  });
  saveData("userData", userData);
  logAudit("User Added", `User ${username} added with key ${whitelistKey}`);
}
updateAdminList();

function checkKeyValidity() {
  if (whitelistKey && whitelistKey !== ADMIN_WHITELIST_KEY && whitelistKey !== OWNER_WHITELIST_KEY && !userData.find(user => user.key === whitelistKey)) {
    logAudit("Invalid Key Detected", `User ${username} logged out due to invalid key ${whitelistKey}`);
    logout();
  }
}

setInterval(checkKeyValidity, 5000);

function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openSettings() {
  document.getElementById("settingsModal").style.display = "flex";
  switchSettingsTab("Profile");
  updateProfilePreview();
}

function switchSettingsTab(tabName) {
  document.querySelectorAll('.settings-sidebar .tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.trim() === tabName);
  });
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.style.display = tab.id === tabName ? 'block' : 'none';
  });
  if (tabName === "Log Out") logout();
}

function updateProfilePreview() {
  settingsUsername.textContent = username;
  const storedImage = localStorage.getItem("profileImage");
  if (storedImage) {
    profileCircle.style.backgroundImage = `url(${storedImage})`;
    navProfileCircle.style.backgroundImage = `url(${storedImage})`;
  } else {
    profileCircle.style.backgroundImage = "";
    navProfileCircle.style.backgroundImage = "";
    profileCircle.textContent = username.charAt(0).toUpperCase();
    navProfileCircle.textContent = username.charAt(0).toUpperCase();
  }
  document.querySelectorAll('.master-fact .profile-circle').forEach(circle => {
    circle.style.backgroundImage = storedImage ? `url(${storedImage})` : "";
    circle.textContent = storedImage ? "" : username.charAt(0).toUpperCase();
  });
  document.querySelectorAll('.detailed-modal .header .profile-circle').forEach(circle => {
    circle.style.backgroundImage = storedImage ? `url(${storedImage})` : "";
    circle.textContent = storedImage ? "" : username.charAt(0).toUpperCase();
  });
}

function submitUsername() {
  const newUsername = document.getElementById("newUsername").value;
  if (newUsername) {
    const lastChange = localStorage.getItem("lastUsernameChange");
    const now = new Date();
    if (!lastChange || (now - new Date(lastChange)) > 30 * 24 * 60 * 60 * 1000) {
      const oldUsername = username;
      localStorage.setItem("username", newUsername);
      localStorage.setItem("lastUsernameChange", now.toISOString());
      username = newUsername;
      navUsername.textContent = username;
      settingsUsername.textContent = username;
      userData = userData.map(user => user.username === oldUsername ? { ...user, username: newUsername } : user);
      saveData("userData", userData);
      logAudit("Username Changed", `User changed username from ${oldUsername} to ${newUsername}`);
      document.getElementById("newUsername").value = "";
      updateProfilePreview();
      updateAdminList();
    }
  }
}

function submitPassword() {
  const newPassword = document.getElementById("newPassword").value;
  if (newPassword) {
    const lastChange = localStorage.getItem("lastPasswordChange");
    const now = new Date();
    if (!lastChange || (now - new Date(lastChange)) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.setItem("password", newPassword);
      localStorage.setItem("lastPasswordChange", now.toISOString());
      logAudit("Password Changed", `User ${username} changed password`);
      document.getElementById("newPassword").value = "";
    }
  }
}

function logout() {
  // Preserve all shared data
  const preservedForumsData = JSON.stringify(forumsData);
  const preservedAnnouncementsData = JSON.stringify(announcementsData);
  const preservedUserData = JSON.stringify(userData);
  const preservedAuditLogData = JSON.stringify(auditLogData);
  const preservedUpdatesData = JSON.stringify(updatesData);
  const preservedOldUpdatesData = JSON.stringify(oldUpdatesData);
  const preservedForumIdCounter = localStorage.getItem("forumIdCounter");
  const preservedAnnouncementIdCounter = localStorage.getItem("announcementIdCounter");

  localStorage.clear();

  // Restore preserved data
  localStorage.setItem("forumsData", preservedForumsData);
  localStorage.setItem("announcementsData", preservedAnnouncementsData);
  localStorage.setItem("userData", preservedUserData);
  localStorage.setItem("auditLogData", preservedAuditLogData);
  localStorage.setItem("updatesData", preservedUpdatesData);
  localStorage.setItem("oldUpdatesData", preservedOldUpdatesData);
  localStorage.setItem("forumsData_backup", preservedForumsData);
  localStorage.setItem("announcementsData_backup", preservedAnnouncementsData);
  localStorage.setItem("userData_backup", preservedUserData);
  localStorage.setItem("auditLogData_backup", preservedAuditLogData);
  localStorage.setItem("updatesData_backup", preservedUpdatesData);
  localStorage.setItem("oldUpdatesData_backup", preservedOldUpdatesData);
  if (preservedForumIdCounter) localStorage.setItem("forumIdCounter", preservedForumIdCounter);
  if (preservedAnnouncementIdCounter) localStorage.setItem("announcementIdCounter", preservedAnnouncementIdCounter);

  logAudit("Logout", `User ${username} logged out`);
  username = "User";
  isOwner = false;
  isAuthenticatedForScript = false;
  isScriptSaved = false;
  whitelistKey = "";
  navUsername.textContent = username;
  settingsUsername.textContent = username;
  navProfileCircle.style.backgroundImage = "";
  profileCircle.style.backgroundImage = "";
  navProfileCircle.textContent = username.charAt(0).toUpperCase();
  profileCircle.textContent = username.charAt(0).toUpperCase();
  updateScriptTabVisibility();
  updateAdminVisibility();
  updateAdminList();
  updateProfilePreview();
  updateScriptButtonsVisibility();
  window.location.href = "index.html?login";
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.trim().includes(tabName));
  });
  const welcome = document.getElementById("welcomeMessage");
  const home = document.getElementById("homeSection");
  const announcements = document.getElementById("announcementsSection");
  const updates = document.getElementById("updatesSection");
  const forums = document.getElementById("forumsSection");
  const download = document.getElementById("downloadSection");
  const script = document.getElementById("scriptSection");
  const admins = document.getElementById("adminsSection");
  const auditLog = document.getElementById("auditLogSection");
  if (tabName === "Home") {
    welcome.style.display = "block";
    home.style.display = "block";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1><i class="fa-solid fa-sparkles"></i> Welcome to Pivot Cheat Hub</h1>
      <p>Access the latest cheats, updates, and community discussions.</p>
      <button class="join-discord" onclick="window.open('https://discord.gg/getPivot','_blank')">Join Discord</button>
    `;
  } else if (tabName === "Announcements") {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "block";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1><i class="fa-solid fa-bullhorn"></i> Announcements</h1>
      <p>Stay updated with the latest news and updates.</p>
    `;
    renderAnnouncements();
  } else if (tabName === "Updates") {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "block";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1>Welcome to Updates</h1>
      <p>Get the latest cheat versions and historical updates.</p>
    `;
    renderUpdates('updatesSection', updatesData, 'latestUpdatesContent');
    renderUpdates('updatesSection', oldUpdatesData, 'oldUpdatesContent');
    initializeCategoryToggles();
  } else if (tabName === "Forums") {
    welcome.style.display = "none";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "block";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
  } else if (tabName === "Download") {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "block";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1>Welcome to Downloads</h1>
      <p>Securely download the latest cheat files.</p>
    `;
  } else if (tabName === "Script") {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = isAuthenticatedForScript ? "block" : "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1>Welcome to Script Code</h1>
      <p>Edit and save your scripts securely.</p>
    `;
    if (isAuthenticatedForScript) {
      const savedScript = localStorage.getItem('savedScript');
      scriptContent.value = savedScript || '';
      const preview = document.getElementById('scriptPreview');
      preview.innerHTML = savedScript || '';
      updateScriptButtonsVisibility();
    }
  } else if (tabName === "Admins" && (isAdmin || isOwner)) {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "block";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1>Welcome to Admin Panel</h1>
      <p>Manage user accounts and keys.</p>
    `;
    updateAdminList();
  } else if (tabName === "Audit Log" && isOwner) {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "block";
    welcome.innerHTML = `
      <h1>Audit Log</h1>
      <p>View all actions performed by users.</p>
    `;
    renderAuditLog();
  } else {
    welcome.style.display = "block";
    home.style.display = "none";
    announcements.style.display = "none";
    updates.style.display = "none";
    forums.style.display = "none";
    download.style.display = "none";
    script.style.display = "none";
    admins.style.display = "none";
    auditLog.style.display = "none";
    welcome.innerHTML = `
      <h1>Welcome to ${tabName}</h1>
      <p>This section is currently under construction or for specific users only.</p>
    `;
  }
}

function searchSuggestions() {
  const input = document.querySelector('.search-input').value.toLowerCase();
  const suggestions = document.getElementById('suggestionsBox');
  suggestions.innerHTML = '';
  if (input) {
    const terms = ['update v2.1.3', 'hack tips', 'old update v2.0.0', 'old update v1.9.0', username, 'script', 'executor', 'internal'];
    const filtered = terms.filter(term => term.includes(input));
    filtered.forEach(term => {
      const div = document.createElement('div');
      div.textContent = term;
      div.onclick = () => {
        document.querySelector('.search-input').value = term;
        suggestions.style.display = 'none';
      };
      suggestions.appendChild(div);
    });
    suggestions.style.display = filtered.length ? 'block' : 'none';
  } else {
    suggestions.style.display = 'none';
  }
}

const announcementModal = document.getElementById("announcementModal");
const openAnnouncementBtn = document.getElementById("openAnnouncementModal");
const closeAnnouncementBtn = document.getElementById("closeAnnouncementModal");
const newAnnouncementForm = document.getElementById("newAnnouncementForm");
const announcements = document.getElementById("announcements");

openAnnouncementBtn.onclick = () => {
  announcementModal.style.display = "flex";
  document.getElementById("announcementHeadline").focus();
};
closeAnnouncementBtn.onclick = () => {
  announcementModal.style.display = "none";
};

function renderAnnouncements() {
  announcements.innerHTML = "";
  Object.keys(announcementsData).forEach(id => {
    const data = announcementsData[id];
    const announcementDiv = document.createElement("div");
    announcementDiv.className = "announcement-item";
    announcementDiv.dataset.id = id;
    announcementDiv.innerHTML = `
      <div class="announcement-header">
        <img src="https://cdn.discordapp.com/attachments/1393996313682776300/1399661649308160062/3dgifmaker24043.gif?ex=6889cffd&is=68887e7d&hm=bacd09bd7cd99f1175cb5cbdf8ac857d25fe26073aa1b3829c461a0d399552ce&" class="announcement-logo" alt="Logo" />
        <div class="headline">${data.headline}</div>
      </div>
      <div class="announcement-content">${data.description}</div>
      <div class="announcement-footer">
        <div class="profile-circle" style="background-image: ${localStorage.getItem("profileImage") ? `url(${localStorage.getItem("profileImage")})` : ""}">${localStorage.getItem("profileImage") ? "" : data.username.charAt(0).toUpperCase()}</div>
        <span class="username">Sent by ${data.username}</span>
      </div>
      <div class="announcement-date">${data.timestamp}</div>
      <div class="announcement-actions owner-only" style="display:${isOwner ? 'block' : 'none'};">
        <button class="delete-btn" onclick="deleteAnnouncement('${id}')">Delete</button>
      </div>
    `;
    announcements.appendChild(announcementDiv);
  });
}

function deleteAnnouncement(id) {
  if (isOwner && confirm("Are you sure you want to delete this announcement?")) {
    const headline = announcementsData[id].headline;
    delete announcementsData[id];
    saveData("announcementsData", announcementsData);
    logAudit("Announcement Deleted", `Announcement '${headline}' deleted by ${username}`);
    renderAnnouncements();
  }
}

newAnnouncementForm.onsubmit = e => {
  e.preventDefault();
  if (!isAdmin && !isOwner) return;
  const headline = document.getElementById("announcementHeadline").value.trim();
  const description = document.getElementById("announcementDescription").value.trim();
  if (headline && description) {
    const currentDate = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const announcementId = `announcement-${announcementIdCounter++}`;
    announcementsData[announcementId] = {
      headline,
      description,
      username,
      timestamp: currentDate
    };
    saveData("announcementsData", announcementsData);
    localStorage.setItem("announcementIdCounter", announcementIdCounter);
    logAudit("Announcement Created", `Announcement '${headline}' created by ${username}`);
    renderAnnouncements();
    newAnnouncementForm.reset();
    announcementModal.style.display = "none";
  }
};

renderAnnouncements();

const forumModal = document.getElementById("forumModal");
const openForumBtn = document.getElementById("openForumModal");
const closeForumBtn = document.getElementById("closeForumModal");
const newForumForm = document.getElementById("newForumForm");
const masterFacts = document.getElementById("masterFacts");
const detailedModal = document.getElementById("detailedModal");
const detailedContent = document.getElementById("detailedContent");
const closeDetailedBtn = document.getElementById("closeDetailedModal");
const replyBtn = document.getElementById("replyBtn");
const messageModal = document.getElementById("messageModal");
const messageForm = document.getElementById("messageForm");
const closeMessageBtn = document.getElementById("closeMessageModal");
const ownerKeyModal = document.getElementById("ownerKeyModal");
const ownerKeyForm = document.getElementById("ownerKeyForm");
const closeOwnerKeyModal = document.getElementById("closeOwnerKeyModal");
const closeSettingsModal = document.getElementById("closeSettingsModal");
const scriptLoginModal = document.getElementById("scriptLoginModal");
const closeScriptLoginModal = document.getElementById("closeScriptLoginModal");
const scriptLoginForm = document.getElementById("scriptLoginForm");
const addKeyBtn = document.getElementById("addKeyBtn");
const addKeyModal = document.getElementById("addKeyModal");
const closeAddKeyModal = document.getElementById("closeAddKeyModal");
const addKeyForm = document.getElementById("addKeyForm");

openForumBtn.onclick = () => {
  forumModal.style.display = "flex";
};
closeForumBtn.onclick = () => {
  forumModal.style.display = "none";
};
closeDetailedBtn.onclick = () => {
  detailedModal.style.display = "none";
};
closeMessageBtn.onclick = () => {
  messageModal.style.display = "none";
};
closeOwnerKeyModal.onclick = () => {
  ownerKeyModal.style.display = "none";
};
closeSettingsModal.onclick = () => {
  document.getElementById("settingsModal").style.display = "none";
};
closeScriptLoginModal.onclick = () => {
  scriptLoginModal.style.display = "none";
  if (!isAuthenticatedForScript) {
    switchTab('Home');
  }
};
closeAddKeyModal.onclick = () => {
  addKeyModal.style.display = "none";
};

function openScriptLoginModal() {
  scriptLoginModal.style.display = "flex";
}

scriptLoginForm.onsubmit = e => {
  e.preventDefault();
  const key = document.getElementById('scriptLoginKey').value;
  if (key === OWNER_WHITELIST_KEY) {
    isAuthenticatedForScript = true;
    localStorage.setItem("isAuthenticatedForScript", "true");
    scriptLoginModal.style.display = "none";
    scriptEditor.classList.add('authenticated');
    logAudit("Script Access Granted", `User ${username} accessed script editor`);
    switchTab('Script');
  } else {
    alert("Incorrect Owner Key. Please try again.");
  }
  document.getElementById('scriptLoginKey').value = '';
};

function handleScriptTabClick() {
  if (!isAuthenticatedForScript) {
    openScriptLoginModal();
  } else {
    switchTab('Script');
  }
}

function updateScriptTabVisibility() {
  scriptTab.style.display = isOwner ? "flex" : "none";
  scriptEditor.classList.toggle('authenticated', isAuthenticatedForScript);
}

window.onclick = e => {
  if (e.target === forumModal) {
    forumModal.style.display = "none";
  }
  if (e.target === messageModal) {
    messageModal.style.display = "none";
  }
  if (e.target === detailedModal) {
    detailedModal.style.display = "none";
  }
  if (e.target === ownerKeyModal) {
    ownerKeyModal.style.display = "none";
  }
  if (e.target === document.getElementById("settingsModal")) {
    document.getElementById("settingsModal").style.display = "none";
  }
  if (e.target === scriptLoginModal) {
    scriptLoginModal.style.display = "none";
    if (!isAuthenticatedForScript) {
      switchTab('Home');
    }
  }
  if (e.target === document.getElementById('editUpdateModal')) {
    closeEditUpdateModal();
  }
  if (e.target === announcementModal) {
    announcementModal.style.display = "none";
  }
  if (e.target === addKeyModal) {
    addKeyModal.style.display = "none";
  }
  if (e.target === rawScriptModal) {
    rawScriptModal.style.display = "none";
  }
};

newForumForm.onsubmit = e => {
  e.preventDefault();
  if (!isAdmin && !isOwner) return;
  const title = document.getElementById("forumTitle").value.trim();
  const headline = document.getElementById("forumHeadline").value.trim();
  const description = document.getElementById("forumDescription").value.trim();
  if (title && headline && description) {
    const currentDate = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const forumId = `fact-${forumIdCounter++}`;
    forumsData[forumId] = { title, headline, description, username, timestamp: currentDate, replies: [], replyCount: 0, messageCount: 0 };
    saveData("forumsData", forumsData);
    localStorage.setItem("forumIdCounter", forumIdCounter);
    logAudit("Forum Thread Created", `Thread '${headline}' created in category '${title}' by ${username}`);
    renderForums();
    newForumForm.reset();
    forumModal.style.display = "none";
  }
};

function renderForums() {
  masterFacts.innerHTML = "";
  Object.keys(forumsData).forEach(id => {
    const factData = forumsData[id];
    const factDiv = document.createElement('div');
    factDiv.className = 'category-section';
    factDiv.innerHTML = `
      <div class="category" data-category="${factData.title}">
        <h3>${factData.title} <i class="fa-solid fa-chevron-down"></i></h3>
        <div class="category-content" style="display:none;">
          <div class="master-fact" data-id="${id}">
            <div class="profile-circle" style="background-image: ${localStorage.getItem("profileImage") ? `url(${localStorage.getItem("profileImage")})` : ""}">${localStorage.getItem("profileImage") ? "" : factData.username.charAt(0).toUpperCase()}</div>
            <div class="fact-content">
              <div class="headline">${factData.headline}</div>
            </div>
            <div class="replies">Threads: <span class="reply-count">${factData.replyCount}</span> | Messages: <span class="message-count">${factData.messageCount}</span></div>
          </div>
        </div>
      </div>
    `;
    masterFacts.appendChild(factDiv);

    const categoryHeader = factDiv.querySelector('.category h3');
    categoryHeader.addEventListener('click', toggleCategory);

    const masterFact = factDiv.querySelector('.master-fact');
    masterFact.addEventListener('click', () => {
      detailedContent.innerHTML = `
        <div class="header">
          <div class="profile-circle" style="background-image: ${localStorage.getItem("profileImage") ? `url(${localStorage.getItem("profileImage")})` : ""}">${localStorage.getItem("profileImage") ? "" : factData.username.charAt(0).toUpperCase()}</div>
          <span class="username">${factData.username}</span>
        </div>
        <div class="timestamp">${factData.timestamp}</div>
        <div class="content">
          <p>${factData.description}</p>
        </div>
        <div class="replies">
          ${factData.replies.map(reply => `
            <div class="reply">
              <div class="profile-circle">${reply.username.charAt(0).toUpperCase()}</div>
              <span class="username">${reply.username}</span>
              <span class="text">${reply.text}</span>
            </div>
          `).join('')}
        </div>
      `;
      detailedContent.dataset.id = id;
      detailedModal.style.display = "flex";
    });
  });
}

replyBtn.onclick = () => {
  document.getElementById('actionType').value = 'reply';
  document.getElementById('targetId').value = detailedContent.dataset.id || '';
  detailedModal.style.display = "none";
  messageModal.style.display = "flex";
};

messageForm.onsubmit = e => {
  e.preventDefault();
  const actionType = document.getElementById('actionType').value;
  const targetId = document.getElementById('targetId').value;
  const messageText = document.getElementById('messageText').value.trim();
  if (actionType === 'reply' && targetId && messageText) {
    const factData = forumsData[targetId];
    if (factData) {
      const currentDate = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      factData.replies.push({ username, text: messageText, timestamp: currentDate });
      factData.replyCount = factData.replies.length;
      factData.messageCount = factData.replies.length;
      saveData("forumsData", forumsData);
      logAudit("Forum Reply", `Replied to thread '${factData.headline}' by ${username}`);
      renderForums();
      messageForm.reset();
      messageModal.style.display = "none";
    }
  }
};

ownerKeyForm.onsubmit = e => {
  e.preventDefault();
  const key = document.getElementById('ownerKey').value;
  if (key === OWNER_WHITELIST_KEY) {
    isOwner = true;
    localStorage.setItem("isOwner", "true");
    localStorage.setItem("whitelistKey", key);
    whitelistKey = key;
    ownerKeyModal.style.display = "none";
    updateAdminVisibility();
    updateScriptTabVisibility();
    updateAdminList();
    userData = userData.map(user => user.username === username ? { ...user, key, status: "Owner" } : user);
    saveData("userData", userData);
    logAudit("Owner Key Used", `User ${username} used owner key`);
  } else {
    alert("Incorrect Owner Key. Please try again.");
  }
  document.getElementById('ownerKey').value = '';
};

function updateAdminList() {
  adminsList.innerHTML = "";
  userData.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.category}</td>
      <td>${user.username}</td>
      <td class="${isOwner ? 'visible' : 'blurred'}">${user.key}</td>
      <td>${user.created}</td>
      <td>${user.status}</td>
      <td><button class="delete-btn owner-only" style="display:${isOwner ? 'inline-block' : 'none'}" onclick="deleteUser('${user.username}')">Delete</button></td>
    `;
    adminsList.appendChild(row);
  });
}

function deleteUser(targetUsername) {
  if (isOwner && confirm(`Are you sure you want to delete user ${targetUsername}?`)) {
    userData = userData.filter(user => user.username !== targetUsername);
    saveData("userData", userData);
    logAudit("User Deleted", `User ${targetUsername} deleted by ${username}`);
    updateAdminList();
  }
}

addKeyBtn.onclick = () => {
  const newKeyInput = document.getElementById('newKey');
  newKeyInput.value = generateKey();
  addKeyModal.style.display = "flex";
};

addKeyForm.onsubmit = e => {
  e.preventDefault();
  const key = document.getElementById('newKey').value;
  const category = document.getElementById('keyCategory').value.trim();
  const name = document.getElementById('keyName').value.trim();
  if (key && category && name) {
    userData.push({
      username: name,
      key,
      created: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      category,
      status: category === "Admin" ? "Admin" : "Buyer"
    });
    saveData("userData", userData);
    logAudit("Key Added", `Key ${key} added for ${name} in category ${category} by ${username}`);
    updateAdminList();
    addKeyForm.reset();
    addKeyModal.style.display = "none";
  }
};

function generateKey() {
  return 'Pivot-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function downloadCheat(type) {
  const url = type === 'script' ? 'https://example.com/Pivot-script.zip' : 'https://example.com/Pivot-executor.zip';
  window.open(url, '_blank');
  logAudit("Download Initiated", `User ${username} downloaded ${type}`);
}

document.getElementById('profilePic').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && ['image/jpeg', 'image/png', 'image/tga', 'image/bmp'].includes(file.type)) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("profileImage", reader.result);
      updateProfilePreview();
      logAudit("Profile Image Updated", `User ${username} updated profile image`);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please select a valid image file (JPG, PNG, TGA, BMP).");
  }
});

renderForums();
updateScriptTabVisibility();
updateAdminVisibility();