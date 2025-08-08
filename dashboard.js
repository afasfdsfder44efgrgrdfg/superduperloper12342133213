class AdvancedDashboard {
    constructor() {
        this.currentTab = 'home';
        this.charts = {};
        this.realTimeInterval = null;
        this.websocket = null;
        this.users = [];
        this.alerts = [];
        this.threats = [];
        this.currentPage = 1;
        this.usersPerPage = 10;
        this.announcements = [];

        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.setupWebSocket();
    }

    checkAuthentication() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Profile menu toggle
        document.querySelector('.admin-profile').addEventListener('click', () => {
            this.toggleProfileMenu();
        });

        // Close profile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.admin-profile') && !e.target.closest('.profile-menu')) {
                this.closeProfileMenu();
            }
        });

        // User table filters
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.filterUsers();
        });

        document.getElementById('roleFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        // Select all checkbox
        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Time range selector
        const timeRangeSelector = document.querySelector('.time-range-selector');
        if (timeRangeSelector) {
            timeRangeSelector.addEventListener('change', (e) => {
                this.updateAnalytics(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize handler for charts
        window.addEventListener('resize', () => {
            this.resizeCharts();
        });

        // Announcement submission
        const announcementForm = document.getElementById('announcementForm');
        if (announcementForm) {
            announcementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAnnouncement();
            });
        }

        // Key generation
        const generateKeyButton = document.getElementById('generateKey');
        if (generateKeyButton) {
            generateKeyButton.addEventListener('click', () => {
                this.generateAdminKey();
            });
        }
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadTabData(tabName);
        this.logActivity(`Switched to ${tabName} tab`);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'home':
                this.updateMetrics();
                this.loadSystemStatus();
                this.loadRecentAlerts();
                break;
            case 'announcements':
                this.loadAnnouncements();
                break;
            case 'updates':
                this.loadUpdates();
                break;
            case 'download':
                this.loadDownloads();
                break;
            case 'forums':
                this.loadForums();
                break;
            case 'admins':
                this.loadAdmins();
                break;
            case 'audit':
                this.loadAuditLog();
                break;
        }
    }

    // Profile Menu Management
    toggleProfileMenu() {
        const menu = document.getElementById('profileMenu');
        menu.classList.toggle('show');
    }

    closeProfileMenu() {
        const menu = document.getElementById('profileMenu');
        menu.classList.remove('show');
    }

    // Real-time Updates
    startRealTimeUpdates() {
        this.realTimeInterval = setInterval(() => {
            this.updateMetrics();
            this.updateSystemStatus();
            this.checkForNewAlerts();
            this.updateNetworkChart();
        }, 5000);
    }

    updateMetrics() {
        const metrics = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100,
            network: (Math.random() * 5).toFixed(1)
        };

        this.animateMetricUpdate('cpuUsage', `${metrics.cpu.toFixed(1)}%`);
        this.animateMetricUpdate('memoryUsage', `${metrics.memory.toFixed(1)}%`);
        this.animateMetricUpdate('diskUsage', `${metrics.disk.toFixed(1)}%`);
        this.animateMetricUpdate('networkTraffic', `${metrics.network} GB/s`);

        this.updateProgressBar('cpuUsage', metrics.cpu);
        this.updateProgressBar('memoryUsage', metrics.memory);
        this.updateProgressBar('diskUsage', metrics.disk);

        this.updatePerformanceChart(metrics);
    }

    animateMetricUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.transform = 'scale(1.1)';
            element.textContent = newValue;

            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateProgressBar(metricId, value) {
        const progressBar = document.querySelector(`#${metricId}`).closest('.metric-card').querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${value}%`;

            progressBar.classList.remove('warning', 'success');
            if (value > 80) {
                progressBar.classList.add('warning');
            } else if (value < 30) {
                progressBar.classList.add('success');
            }
        }
    }

    // Chart Management
    initializeCharts() {
        this.initializePerformanceChart();
        this.initializeNetworkChart();
        this.initializeAnalyticsCharts();
    }

    initializePerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.performance = {
            ctx: ctx,
            data: {
                cpu: Array(20).fill(0).map(() => Math.random() * 100),
                memory: Array(20).fill(0).map(() => Math.random() * 100),
                disk: Array(20).fill(0).map(() => Math.random() * 100)
            }
        };

        this.drawPerformanceChart();
    }

    drawPerformanceChart() {
        const chart = this.charts.performance;
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        this.drawChartLine(ctx, chart.data.cpu, '#64ffda', width, height);
        this.drawChartLine(ctx, chart.data.memory, '#f59e0b', width, height);
        this.drawChartLine(ctx, chart.data.disk, '#3b82f6', width, height);
    }

    drawChartLine(ctx, data, color, width, height) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (data.length - 1);

        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 100) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    updatePerformanceChart(newMetrics) {
        const chart = this.charts.performance;
        if (!chart) return;

        chart.data.cpu.shift();
        chart.data.cpu.push(newMetrics.cpu);

        chart.data.memory.shift();
        chart.data.memory.push(newMetrics.memory);

        chart.data.disk.shift();
        chart.data.disk.push(newMetrics.disk);

        this.drawPerformanceChart();
    }

    initializeNetworkChart() {
        const canvas = document.getElementById('networkChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.network = {
            ctx: ctx,
            data: Array(50).fill(0).map(() => Math.random() * 100)
        };

        this.drawNetworkChart();
    }

    drawNetworkChart() {
        const chart = this.charts.network;
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(100, 255, 218, 0.3)';
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 1;

        ctx.beginPath();
        const stepX = width / (chart.data.length - 1);

        chart.data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 100) * height;

            if (index === 0) {
                ctx.moveTo(x, height);
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    updateNetworkChart() {
        const chart = this.charts.network;
        if (!chart) return;

        chart.data.shift();
        chart.data.push(Math.random() * 100);
        this.drawNetworkChart();
    }

    initializeAnalyticsCharts() {
        this.initializeTrafficChart();
        this.initializeUserActivityChart();
        this.initializeErrorRateChart();
        this.initializeTrendCharts();
    }

    initializeTrafficChart() {
        const canvas = document.getElementById('trafficChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.traffic = {
            ctx: ctx,
            data: Array(24).fill(0).map(() => Math.random() * 1000)
        };

        this.drawTrafficChart();
    }

    drawTrafficChart() {
        const chart = this.charts.traffic;
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const barWidth = width / chart.data.length;

        chart.data.forEach((value, index) => {
            const x = index * barWidth;
            const barHeight = (value / 1000) * height;
            const y = height - barHeight;

            const gradient = ctx.createLinearGradient(0, y, 0, height);
            gradient.addColorStop(0, '#64ffda');
            gradient.addColorStop(1, 'rgba(100, 255, 218, 0.3)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    }

    initializeUserActivityChart() {
        const canvas = document.getElementById('userActivityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.userActivity = {
            ctx: ctx,
            data: [
                { label: 'Active', value: 65, color: '#10b981' },
                { label: 'Idle', value: 25, color: '#f59e0b' },
                { label: 'Offline', value: 10, color: '#ef4444' }
            ]
        };

        this.drawUserActivityChart();
    }

    drawUserActivityChart() {
        const chart = this.charts.userActivity;
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentAngle = -Math.PI / 2;
        const total = chart.data.reduce((sum, item) => sum + item.value, 0);

        chart.data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.fillStyle = item.color;
            ctx.fill();

            currentAngle += sliceAngle;
        });
    }

    initializeErrorRateChart() {
        const canvas = document.getElementById('errorRateChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.errorRate = {
            ctx: ctx,
            data: Array(20).fill(0).map(() => Math.random() * 10)
        };

        this.drawErrorRateChart();
    }

    drawErrorRateChart() {
        const chart = this.charts.errorRate;
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (chart.data.length - 1);

        chart.data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 10) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        chart.data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 10) * height;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    initializeTrendCharts() {
        ['cpu', 'memory', 'disk'].forEach(type => {
            const canvas = document.getElementById(`${type}TrendChart`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            this.charts[`${type}Trend`] = {
                ctx: ctx,
                data: Array(20).fill(0).map(() => Math.random() * 100)
            };

            this.drawTrendChart(type);
        });
    }

    drawTrendChart(type) {
        const chart = this.charts[`${type}Trend`];
        if (!chart) return;

        const ctx = chart.ctx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const colors = {
            cpu: '#64ffda',
            memory: '#f59e0b',
            disk: '#3b82f6'
        };

        ctx.fillStyle = `${colors[type]}30`;
        ctx.strokeStyle = colors[type];
        ctx.lineWidth = 1;

        ctx.beginPath();
        const stepX = width / (chart.data.length - 1);

        chart.data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 100) * height;

            if (index === 0) {
                ctx.moveTo(x, height);
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    resizeCharts() {
        Object.keys(this.charts).forEach(chartName => {
            if (chartName.includes('Trend')) {
                this.drawTrendChart(chartName.replace('Trend', ''));
            } else {
                switch (chartName) {
                    case 'performance':
                        this.drawPerformanceChart();
                        break;
                    case 'network':
                        this.drawNetworkChart();
                        break;
                    case 'traffic':
                        this.drawTrafficChart();
                        break;
                    case 'userActivity':
                        this.drawUserActivityChart();
                        break;
                    case 'errorRate':
                        this.drawErrorRateChart();
                        break;
                }
            }
        });
    }

    // User Management
    loadUsers() {
        if (this.users.length === 0) {
            this.generateSampleUsers();
        }
        this.renderUserTable();
    }

    generateSampleUsers() {
        const roles = ['admin', 'moderator', 'user'];
        const statuses = ['active', 'inactive', 'suspended'];
        const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma', 'Chris', 'Anna'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

        for (let i = 0; i < 25; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

            this.users.push({
                id: i + 1,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                role: roles[Math.floor(Math.random() * roles.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`
            });
        }
    }

    renderUserTable() {
        const filteredUsers = this.getFilteredUsers();
        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        const tableBody = document.querySelector('#userTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td><input type="checkbox" class="user-select" data-id="${user.id}"></td>
                <td>
                    <div class="user-info">
                        <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                        ${user.name}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-info" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn-warning" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        const pagination = document.querySelector('.table-pagination');
        if (pagination) {
            const totalPages = Math.ceil(filteredUsers.length / this.usersPerPage);
            pagination.querySelector('.pagination-info').textContent = `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length} users`;

            const pagesContainer = pagination.querySelector('.pagination-pages');
            pagesContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => `
                <button class="pagination-page ${this.currentPage === i + 1 ? 'active' : ''}" onclick="dashboard.currentPage = ${i + 1}; dashboard.renderUserTable();">${i + 1}</button>
            `).join('');
        }
    }

    getFilteredUsers() {
        let filteredUsers = [...this.users];

        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('roleFilter')?.value || 'all';
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';

        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
        }

        return filteredUsers;
    }

    toggleSelectAll(checked) {
        document.querySelectorAll('.user-select').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    // New Tab Functions
    loadAnnouncements() {
        this.renderAnnouncements();
    }

    addAnnouncement() {
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        if (title && content) {
            this.announcements.push({
                id: Date.now(),
                title,
                content,
                date: new Date().toLocaleString(),
                author: 'Super Admin'
            });
            this.renderAnnouncements();
            document.getElementById('announcementForm').reset();
            this.showNotification('Announcement posted successfully', 'success');
            this.logActivity(`New announcement posted: ${title}`);
        }
    }

    renderAnnouncements() {
        const container = document.querySelector('.announcement-list');
        if (!container) return;

        container.innerHTML = this.announcements.length ? this.announcements.map(announcement => `
            <div class="announcement-item">
                <div class="announcement-header">
                    <h3>${announcement.title}</h3>
                    <span class="announcement-date">${announcement.date}</span>
                </div>
                <div class="announcement-content">${announcement.content}</div>
                <div class="announcement-author">Posted by: ${announcement.author}</div>
            </div>
        `).join('') : '<p>No announcements yet.</p>';
    }

    loadUpdates() {
        const container = document.querySelector('.update-list');
        if (!container) return;

        // Sample updates
        const updates = [
            { version: '2.1.0', date: '2025-08-01', notes: 'Added new security features and improved performance.' },
            { version: '2.0.5', date: '2025-07-15', notes: 'Fixed bugs in user management system.' },
        ];

        container.innerHTML = updates.map(update => `
            <div class="update-item">
                <div class="update-header">
                    <h3>Version ${update.version}</h3>
                    <span class="update-date">${update.date}</span>
                </div>
                <div class="update-content">${update.notes}</div>
            </div>
        `).join('');
    }

    loadDownloads() {
        const container = document.querySelector('.download-list');
        if (!container) return;

        // Sample downloads
        const downloads = [
            { name: 'Client App v2.1.0', file: 'client-app-v2.1.0.zip', size: '45 MB' },
            { name: 'Documentation', file: 'docs.pdf', size: '2.3 MB' },
        ];

        container.innerHTML = downloads.map(download => `
            <div class="download-item">
                <div class="download-info">
                    <h3>${download.name}</h3>
                    <span class="download-size">${download.size}</span>
                </div>
                <a href="${download.file}" class="btn-primary">Download</a>
            </div>
        `).join('');
    }

    loadForums() {
        const container = document.querySelector('.forum-list');
        if (!container) return;

        // Sample forum topics
        const topics = [
            { title: 'Installation Issues', author: 'User123', replies: 12, lastActivity: '2025-08-05' },
            { title: 'Feature Requests', author: 'User456', replies: 8, lastActivity: '2025-08-04' },
        ];

        container.innerHTML = topics.map(topic => `
            <div class="forum-item">
                <div class="forum-info">
                    <h3>${topic.title}</h3>
                    <span class="forum-author">Posted by: ${topic.author}</span>
                </div>
                <div class="forum-stats">
                    <span>${topic.replies} replies</span>
                    <span>Last activity: ${topic.lastActivity}</span>
                </div>
            </div>
        `).join('');
    }

    loadAdmins() {
        this.loadUsers();
    }

    generateAdminKey() {
        const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const keyContainer = document.getElementById('generatedKey');
        if (keyContainer) {
            keyContainer.textContent = key;
            this.showNotification('Admin key generated successfully', 'success');
            this.logActivity('New admin key generated');
        }
    }

    loadAuditLog() {
        const container = document.querySelector('.audit-list');
        if (!container) return;

        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        container.innerHTML = logs.length ? logs.map(log => `
            <div class="audit-item">
                <div class="audit-info">
                    <span class="audit-activity">${log.activity}</span>
                    <span class="audit-user">By: ${log.user}</span>
                </div>
                <span class="audit-timestamp">${log.timestamp}</span>
            </div>
        `).join('') : '<p>No audit logs yet.</p>';
    }

    // WebSocket Management
    setupWebSocket() {
        this.simulateWebSocketEvents();
    }

    simulateWebSocketEvents() {
        setInterval(() => {
            const events = [
                { type: 'alert', data: { message: 'High CPU usage detected', severity: 'warning' }},
                { type: 'user_activity', data: { action: 'login', user: 'user123' }},
                { type: 'security_event', data: { type: 'blocked_ip', ip: '192.168.1.100' }}
            ];

            const randomEvent = events[Math.floor(Math.random() * events.length)];
            this.handleWebSocketEvent(randomEvent);
        }, Math.random() * 30000 + 15000);
    }

    handleWebSocketEvent(event) {
        switch (event.type) {
            case 'alert':
                this.addNewAlert(event.data);
                break;
            case 'user_activity':
                this.handleUserActivity(event.data);
                break;
            case 'security_event':
                this.handleSecurityEvent(event.data);
                break;
        }
    }

    addNewAlert(alertData) {
        const alertsContainer = document.querySelector('.alert-list');
        if (!alertsContainer) return;

        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alertData.severity}`;
        alertElement.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alertData.message}</div>
                <div class="alert-description">System alert generated automatically</div>
                <div class="alert-time">Just now</div>
            </div>
            <button class="alert-dismiss" onclick="dismissAlert(this)">
                <i class="fas fa-times"></i>
            </button>
        `;

        alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);

        if (alertsContainer.children.length > 5) {
            alertsContainer.removeChild(alertsContainer.children[alertsContainer.children.length - 1]);
        }

        this.showNotification(alertData.message, alertData.severity);
    }

    // Utility Functions
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
            e.preventDefault();
            const tabs = ['home', 'announcements', 'updates', 'download', 'forums', 'admins', 'audit'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
        }

        if (e.key === 'Escape') {
            this.closeAllModals();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.refreshData();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('show');
        });
        this.closeProfileMenu();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(15, 15, 35, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            min-width: 300px;
            border-left: 4px solid ${this.getNotificationColor(type)};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        this.addNotificationStyles();
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'error': return '#ef4444';
            default: return '#64ffda';
        }
    }

    addNotificationStyles() {
        if (document.getElementById('notificationStyles')) return;

        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }

            .notification-close {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 1.25rem;
                cursor: pointer;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');

        if (overlay && text) {
            text.textContent = message;
            overlay.classList.add('show');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const titleElement = document.getElementById('confirmTitle');
        const messageElement = document.getElementById('confirmMessage');
        const confirmButton = document.getElementById('confirmAction');

        if (modal && titleElement && messageElement && confirmButton) {
            titleElement.textContent = title;
            messageElement.textContent = message;

            confirmButton.onclick = () => {
                onConfirm();
                this.closeModal('confirmModal');
            };

            modal.classList.add('show');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    logActivity(activity) {
        const logEntry = {
            activity: activity,
            timestamp: new Date().toISOString(),
            user: 'Super Admin'
        };

        const activityLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        activityLogs.unshift(logEntry);

        if (activityLogs.length > 100) {
            activityLogs.splice(100);
        }

        localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
    }

    loadInitialData() {
        this.loadSystemStatus();
        this.loadRecentAlerts();
    }

    loadSystemStatus() {
        this.updateSystemStatus();
    }

    updateSystemStatus() {
        const statusElements = document.querySelectorAll('.status-badge');
        statusElements.forEach(element => {
            const statuses = ['online', 'online', 'online', 'warning'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            element.className = `status-badge ${randomStatus}`;
        });
    }

    loadRecentAlerts() {
        this.checkForNewAlerts();
    }

    checkForNewAlerts() {
        if (Math.random() > 0.8) {
            const alertTypes = ['critical', 'warning', 'info'];
            const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

            this.addNewAlert({
                message: 'System health check completed',
                severity: randomType
            });
        }
    }

    handleThreat(threatTitle) {
        this.showNotification(`Investigating threat: ${threatTitle}`, 'info');
        this.logActivity(`Threat investigation started: ${threatTitle}`);
    }
}

function refreshData() {
    dashboard.showLoading('Refreshing data...');
    setTimeout(() => {
        dashboard.updateMetrics();
        dashboard.loadTabData(dashboard.currentTab);
        dashboard.hideLoading();
        dashboard.showNotification('Data refreshed successfully', 'success');
    }, 2000);
}

function exportReport() {
    dashboard.showLoading('Generating report...');
    setTimeout(() => {
        const reportData = {
            timestamp: new Date().toISOString(),
            metrics: {
                cpu: document.getElementById('cpuUsage').textContent,
                memory: document.getElementById('memoryUsage').textContent,
                disk: document.getElementById('diskUsage').textContent,
                network: document.getElementById('networkTraffic').textContent
            },
            users: dashboard.users.length,
            alerts: dashboard.alerts.length
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dashboard.hideLoading();
        dashboard.showNotification('Report exported successfully', 'success');
        dashboard.logActivity('Dashboard report exported');
    }, 1500);
}

function toggleService(serviceName) {
    dashboard.showConfirmModal(
        'Toggle Service',
        `Are you sure you want to toggle the ${serviceName} service?`,
        () => {
            dashboard.showLoading(`Toggling ${serviceName} service...`);
            setTimeout(() => {
                dashboard.hideLoading();
                dashboard.showNotification(`${serviceName} service toggled successfully`, 'success');
                dashboard.logActivity(`Service toggled: ${serviceName}`);
                dashboard.updateSystemStatus();
            }, 2000);
        }
    );
}

function dismissAlert(element) {
    element.closest('.alert-item').style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        if (element.closest('.alert-item').parentNode) {
            element.closest('.alert-item').parentNode.removeChild(element.closest('.alert-item'));
        }
    }, 300);
}

function addUser() {
    dashboard.showNotification('Add user functionality would open a modal here', 'info');
}

function editUser(userId) {
    dashboard.showNotification(`Edit user ${userId} functionality would open a modal here`, 'info');
}

function deleteUser(userId) {
    dashboard.showConfirmModal(
        'Delete User',
        `Are you sure you want to delete user ${userId}?`,
        () => {
            dashboard.users = dashboard.users.filter(user => user.id !== userId);
            dashboard.renderUserTable();
            dashboard.showNotification('User deleted successfully', 'warning');
            dashboard.logActivity(`User deleted: ${userId}`);
        }
    );
}

function viewUser(userId) {
    dashboard.showNotification(`View user ${userId} functionality would open a modal here`, 'info');
}

function previousPage() {
    if (dashboard.currentPage > 1) {
        dashboard.currentPage--;
        dashboard.renderUserTable();
    }
}

function nextPage() {
    const totalUsers = dashboard.getFilteredUsers().length;
    const totalPages = Math.ceil(totalUsers / dashboard.usersPerPage);

    if (dashboard.currentPage < totalPages) {
        dashboard.currentPage++;
        dashboard.renderUserTable();
    }
}

function toggleProfileMenu() {
    dashboard.toggleProfileMenu();
}

function viewProfile() {
    dashboard.closeProfileMenu();
    dashboard.showNotification('Profile view functionality would open here', 'info');
}

function editSettings() {
    dashboard.closeProfileMenu();
    dashboard.showNotification('Settings panel would open here', 'info');
}

function viewActivityLog() {
    dashboard.closeProfileMenu();
    dashboard.switchTab('audit');
}

function logout() {
    dashboard.closeProfileMenu();
    dashboard.showConfirmModal(
        'Logout',
        'Are you sure you want to logout?',
        () => {
            dashboard.logActivity('User logged out');
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        }
    );
}

function closeModal(modalId) {
    dashboard.closeModal(modalId);
}

const dashboard = new AdvancedDashboard();

const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-20px); }
    }
`;
document.head.appendChild(fadeOutStyle);
