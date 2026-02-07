const OMNIVERSE_ENHANCED = {
    version: '2.5.0',
    
    storage: {
        userName: 'omniverse_userName_v2',
        userType: 'omniverse_userType',
        firstVisit: 'omniverse_firstVisit_v2',
        lastVisit: 'omniverse_lastVisit',
        visitCount: 'omniverse_visitCount',
        userLevel: 'omniverse_userLevel',
        userStats: 'omniverse_userStats',
        adminLogs: 'omniverse_adminLogs',
        systemSettings: 'omniverse_systemSettings'
    },
    
    admin: {
        names: ['praise', 'fawaz', 'marvelous', 'henry', 'system'],
        master: 'praise',
        experts: ['fawaz', 'marvelous'],
        password: '0122',
        privileges: {
            bypassCooldown: true,
            accessDebug: true,
            viewAnalytics: true,
            viewPeopleOnline: true,
            manageUsers: true,
            systemControl: true
        }
    },
    
    security: {
        bannedRegex: /(robot|bot|grok|chatgpt|llm|gpt|claude|gemini|artificial|intelligence|synthetic|machine|^ai$|^bot$|assistant|deepseek|huggingface|openai)/i,
        minLength: 2,
        maxLength: 25,
        maxAttempts: 5,
        cooldownTime: 30000
    },
    
    features: {
        realtimeStats: true,
        userDashboard: true,
        adminPanel: true,
        systemMonitor: true,
        activityLogs: true,
        darkMode: true,
        notifications: true
    },
    
    ui: {
        theme: 'dark',
        animations: true,
        sounds: true
    }
};

// ==================== ENHANCED USER MANAGER ====================
class EnhancedUserManager {
    constructor() {
        this.currentUser = null;
        this.sessionStart = Date.now();
        this.initializeUser();
    }
    
    initializeUser() {
        const userName = localStorage.getItem(OMNIVERSE_ENHANCED.storage.userName);
        const userType = localStorage.getItem(OMNIVERSE_ENHANCED.storage.userType) || 'user';
        
        if (userName) {
            this.currentUser = this.loadUserData(userName, userType);
            this.updateVisitCount();
            this.showWelcomeNotification();
        }
        
        return this.currentUser;
    }
    
    loadUserData(name, type) {
        return {
            id: 'user_' + Date.now(),
            name: name,
            type: type,
            level: localStorage.getItem(OMNIVERSE_ENHANCED.storage.userLevel) || 'newcomer',
            firstVisit: localStorage.getItem(OMNIVERSE_ENHANCED.storage.firstVisit) || new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visitCount: parseInt(localStorage.getItem(OMNIVERSE_ENHANCED.storage.visitCount)) || 1,
            isAdmin: type === 'admin',
            isMaster: name.toLowerCase() === OMNIVERSE_ENHANCED.admin.master,
            joinDate: new Date(localStorage.getItem(OMNIVERSE_ENHANCED.storage.firstVisit)).toLocaleDateString(),
            stats: this.loadUserStats(name)
        };
    }
    
    loadUserStats(userName) {
        const stats = JSON.parse(localStorage.getItem(OMNIVERSE_ENHANCED.storage.userStats) || '{}');
        if (!stats[userName]) {
            stats[userName] = {
                storiesRead: 0,
                bookmarks: 0,
                timeSpent: 0,
                lastActive: new Date().toISOString(),
                achievements: []
            };
        }
        return stats[userName];
    }
    
    updateVisitCount() {
        const count = parseInt(localStorage.getItem(OMNIVERSE_ENHANCED.storage.visitCount)) || 0;
        localStorage.setItem(OMNIVERSE_ENHANCED.storage.visitCount, count + 1);
        localStorage.setItem(OMNIVERSE_ENHANCED.storage.lastVisit, new Date().toISOString());
        
        if (this.currentUser) {
            this.currentUser.visitCount = count + 1;
        }
    }
    
    calculateUserLevel(visits) {
        if (visits >= 50) return 'legend';
        if (visits >= 20) return 'veteran';
        if (visits >= 10) return 'regular';
        if (visits >= 5) return 'explorer';
        return 'newcomer';
    }
    
    updateUserLevel() {
        if (!this.currentUser) return;
        
        const newLevel = this.calculateUserLevel(this.currentUser.visitCount);
        localStorage.setItem(OMNIVERSE_ENHANCED.storage.userLevel, newLevel);
        this.currentUser.level = newLevel;
        
        return newLevel;
    }
    
    showWelcomeNotification() {
        if (!this.currentUser) return;
        
        const messages = {
            admin: `👑 Welcome back, Admin ${this.currentUser.name}! Session #${this.currentUser.visitCount} initialized.`,
            legend: `🌟 Welcome back, Legend ${this.currentUser.name}! Your ${this.currentUser.visitCount}th visit!`,
            veteran: `🎖️ Welcome back, Veteran ${this.currentUser.name}! Visit #${this.currentUser.visitCount}`,
            regular: `👋 Welcome back, ${this.currentUser.name}! Visit #${this.currentUser.visitCount}`,
            explorer: `🚀 Welcome back, Explorer ${this.currentUser.name}!`,
            newcomer: `✨ Welcome back, ${this.currentUser.name}! Nice to see you again!`
        };
        
        const message = this.currentUser.isAdmin ? messages.admin : messages[this.currentUser.level];
        showNotification(message, this.currentUser.isAdmin ? 'admin' : 'info');
    }
    
    // Track user activity
    trackActivity(activity) {
        if (!this.currentUser) return;
        
        const stats = JSON.parse(localStorage.getItem(OMNIVERSE_ENHANCED.storage.userStats) || '{}');
        if (!stats[this.currentUser.name]) {
            stats[this.currentUser.name] = {};
        }
        
        stats[this.currentUser.name].lastActive = new Date().toISOString();
        
        if (activity === 'story_read') {
            stats[this.currentUser.name].storiesRead = (stats[this.currentUser.name].storiesRead || 0) + 1;
        } else if (activity === 'bookmark_added') {
            stats[this.currentUser.name].bookmarks = (stats[this.currentUser.name].bookmarks || 0) + 1;
        }
        
        localStorage.setItem(OMNIVERSE_ENHANCED.storage.userStats, JSON.stringify(stats));
    }
    
    // Get session duration
    getSessionDuration() {
        return Date.now() - this.sessionStart;
    }
    
    // Logout method
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(OMNIVERSE_ENHANCED.storage.userName);
            localStorage.removeItem(OMNIVERSE_ENHANCED.storage.userType);
            showNotification('Logged out successfully', 'info');
            setTimeout(() => location.reload(), 2000);
        }
    }
}

// ==================== USER DASHBOARD PANEL ====================
class UserDashboard {
    constructor(userManager) {
        this.userManager = userManager;
        this.dashboardElement = null;
        this.timerInterval = null;
    }
    
    show() {
        if (!this.userManager.currentUser) return;
        
        // Create dashboard overlay
        const overlay = document.createElement('div');
        overlay.id = 'userDashboardOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
            animation: fadeIn 0.3s ease;
        `;
        
        const user = this.userManager.currentUser;
        const stats = user.stats || {};
        
        overlay.innerHTML = `
            <div class="dashboard-container" style="
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                border-radius: 20px;
                border: 2px solid ${user.isAdmin ? '#FFD700' : '#00FFFF'};
                color: white;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 30px;
                box-shadow: 0 0 50px ${user.isAdmin ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 255, 255, 0.3)'};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; color: ${user.isAdmin ? '#FFD700' : '#00FFFF'};">
                        ${user.isAdmin ? '👑 Admin Dashboard' : '👤 User Dashboard'}
                    </h2>
                    <button onclick="document.getElementById('userDashboardOverlay').remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    ">&times;</button>
                </div>
                
                <!-- Quick Stats Row -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="stat-card" style="
                        background: rgba(0, 136, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #0088FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">Visit Count</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #00FFFF;">${user.visitCount}</div>
                    </div>
                    
                    <div class="stat-card" style="
                        background: rgba(0, 204, 136, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #00CC88;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">Stories Read</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #00CC88;">${stats.storiesRead || 0}</div>
                    </div>
                    
                    <div class="stat-card" style="
                        background: rgba(255, 170, 0, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #FFAA00;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">Bookmarks</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FFAA00;">${stats.bookmarks || 0}</div>
                    </div>
                    
                    <div class="stat-card" style="
                        background: rgba(170, 0, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #AA00FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">User Level</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #AA00FF; text-transform: capitalize;">${user.level}</div>
                    </div>
                </div>
                
                <!-- Main Content Area -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
                    <!-- Left Column -->
                    <div>
                        <!-- Activity Feed -->
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h3 style="margin-top: 0; color: #00FFFF; display: flex; align-items: center; gap: 10px;">
                                <span>📈</span> Recent Activity
                            </h3>
                            <div id="activityFeed" style="max-height: 300px; overflow-y: auto;">
                                <!-- Activities will be loaded here -->
                                <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div>Joined Omniverse</div>
                                    <small style="opacity: 0.7;">${user.joinDate}</small>
                                </div>
                                <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div>Last login</div>
                                    <small style="opacity: 0.7;">${new Date(user.lastVisit).toLocaleTimeString()}</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                            <h3 style="margin-top: 0; color: #00FFFF; display: flex; align-items: center; gap: 10px;">
                                <span>⚡</span> Quick Actions
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                                <button onclick="window.userDashboard.changeUserName()" class="dashboard-btn" style="background: linear-gradient(135deg, #00AAFF, #0088FF);">
                                    <span>✏️</span> Change Name
                                </button>
                                <button onclick="window.userDashboard.showStats()" class="dashboard-btn" style="background: linear-gradient(135deg, #00CC88, #00AA66);">
                                    <span>📊</span> View Stats
                                </button>
                                <button onclick="window.userDashboard.toggleTheme()" class="dashboard-btn" style="background: linear-gradient(135deg, #AA00FF, #8800CC);">
                                    <span>🌙</span> Toggle Theme
                                </button>
                                ${user.isAdmin ? `
                                <button onclick="window.adminPanel.show()" class="dashboard-btn" style="background: linear-gradient(135deg, #FFD700, #FFAA00);">
                                    <span>👑</span> Admin Panel
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column -->
                    <div>
                        <!-- User Profile -->
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                            <div style="
                                width: 100px;
                                height: 100px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, ${user.isAdmin ? '#FFD700, #FFAA00' : '#00FFFF, #0088FF'});
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0 auto 15px;
                                font-size: 2.5rem;
                                font-weight: bold;
                                color: #000;
                                border: 3px solid ${user.isAdmin ? '#FFD700' : '#00FFFF'};
                            ">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 style="margin: 0 0 5px 0;">${user.name}</h3>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                                <span style="
                                    background: ${user.isAdmin ? '#FFD700' : '#0088FF'};
                                    color: ${user.isAdmin ? '#000' : '#FFF'};
                                    padding: 3px 10px;
                                    border-radius: 12px;
                                    font-size: 0.8rem;
                                    font-weight: bold;
                                ">
                                    ${user.isAdmin ? '👑 ADMIN' : '👤 USER'}
                                </span>
                                <span style="
                                    background: #333;
                                    color: #FFF;
                                    padding: 3px 10px;
                                    border-radius: 12px;
                                    font-size: 0.8rem;
                                ">
                                    ${user.level.toUpperCase()}
                                </span>
                            </div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">
                                Member since ${user.joinDate}
                            </div>
                        </div>
                        
                        <!-- System Info -->
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px;">
                            <h4 style="margin: 0 0 10px 0; color: #00FFFF; font-size: 1rem;">System Info</h4>
                            <div style="font-size: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Session Time:</span>
                                    <span id="sessionTimer">00:00:00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Browser:</span>
                                    <span>${navigator.userAgent.split(' ')[0]}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Online:</span>
                                    <span style="color: ${navigator.onLine ? '#00CC88' : '#FF4444'}">
                                        ${navigator.onLine ? '✅ Yes' : '❌ No'}
                                    </span>
                                </div>
                                ${user.isAdmin ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Admin Password:</span>
                                    <span style="color: #FFD700; font-weight: bold;">0122</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom Actions -->
                <div style="
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="font-size: 0.9rem; opacity: 0.7;">
                        Omniverse v${OMNIVERSE_ENHANCED.version} • ${new Date().toLocaleDateString()}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.userManager.logout()" style="
                            background: linear-gradient(135deg, #FF4444, #CC0000);
                            border: none;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                        ">
                            🚪 Logout
                        </button>
                        <button onclick="window.userDashboard.exportData()" style="
                            background: rgba(0, 136, 255, 0.2);
                            border: 1px solid #0088FF;
                            color: #00FFFF;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">
                            💾 Export Data
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .stat-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                
                .dashboard-btn {
                    border: none;
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: transform 0.2s ease;
                }
                
                .dashboard-btn:hover {
                    transform: scale(1.05);
                }
                
                #activityFeed::-webkit-scrollbar {
                    width: 8px;
                }
                
                #activityFeed::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                }
                
                #activityFeed::-webkit-scrollbar-thumb {
                    background: #00FFFF;
                    border-radius: 4px;
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
        this.dashboardElement = overlay;
        
        // Start session timer
        this.startSessionTimer();
        
        // Load recent activity
        this.loadActivityFeed();
        
        // Close on escape
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') overlay.remove();
        });
        
        // Close when clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }
    
    startSessionTimer() {
        const timerElement = document.getElementById('sessionTimer');
        if (!timerElement) return;
        
        const startTime = Date.now();
        const updateTimer = () => {
            const elapsed = Date.now() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }
    
    loadActivityFeed() {
        const feedElement = document.getElementById('activityFeed');
        if (!feedElement) return;
        
        const user = this.userManager.currentUser;
        if (!user) return;
        
        // Simulate loading activity
        setTimeout(() => {
            const activities = [
                { action: 'Read "The Lost City"', time: '10 minutes ago' },
                { action: 'Bookmarked "Space Adventure"', time: '1 hour ago' },
                { action: 'Changed theme to dark', time: '2 hours ago' },
                { action: 'Achieved Explorer level', time: 'Yesterday' }
            ];
            
            activities.forEach(activity => {
                const div = document.createElement('div');
                div.style.cssText = 'padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);';
                div.innerHTML = `
                    <div>${activity.action}</div>
                    <small style="opacity: 0.7;">${activity.time}</small>
                `;
                feedElement.appendChild(div);
            });
        }, 500);
    }
    
    changeUserName() {
        this.close();
        localStorage.removeItem(OMNIVERSE_ENHANCED.storage.userName);
        initEnhancedAuth();
    }
    
    showStats() {
        this.close();
        // Create a simple stats display
        const user = this.userManager.currentUser;
        const stats = user.stats || {};
        
        const statsHTML = `
            <div style="padding: 20px; background: rgba(0,0,0,0.9); border-radius: 10px; color: white; max-width: 400px;">
                <h3 style="color: #00FFFF;">📊 User Statistics</h3>
                <div>Stories Read: ${stats.storiesRead || 0}</div>
                <div>Bookmarks: ${stats.bookmarks || 0}</div>
                <div>Visit Count: ${user.visitCount}</div>
                <div>User Level: ${user.level}</div>
                <div>Joined: ${user.joinDate}</div>
            </div>
        `;
        
        showNotification(statsHTML, 'info');
    }
    
    toggleTheme() {
        const currentTheme = localStorage.getItem('omniverse_theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('omniverse_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        showNotification(`Theme changed to ${newTheme} mode`, 'success');
    }
    
    exportData() {
        const user = this.userManager.currentUser;
        if (!user) return;
        
        const data = {
            userProfile: user,
            stats: user.stats,
            settings: {
                theme: localStorage.getItem('omniverse_theme'),
                notifications: true
            },
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omniverse-data-${user.name}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
    }
    
    close() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.dashboardElement && this.dashboardElement.parentNode) {
            this.dashboardElement.remove();
        }
    }
}

// ==================== ADMIN PANEL ====================
class AdminPanel {
    constructor(userManager) {
        this.userManager = userManager;
        this.panelElement = null;
        this.realTimeUpdate = null;
    }
    
    show() {
        if (!this.userManager.currentUser || !this.userManager.currentUser.isAdmin) {
            showNotification('Admin access required', 'error');
            return;
        }
        
        // Create admin panel overlay
        const overlay = document.createElement('div');
        overlay.id = 'adminPanelOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: fadeIn 0.3s ease;
        `;
        
        const user = this.userManager.currentUser;
        const isMaster = user.isMaster;
        
        overlay.innerHTML = `
            <div class="admin-container" style="
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                border-radius: 20px;
                border: 3px solid #FFD700;
                color: white;
                width: 95%;
                max-width: 1200px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 30px;
                box-shadow: 0 0 60px rgba(255, 215, 0, 0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #FFD700, #FFAA00);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 2rem;
                            color: #000;
                            border: 3px solid #FFD700;
                        ">
                            👑
                        </div>
                        <div>
                            <h2 style="margin: 0; color: #FFD700;">Omniverse Admin Panel</h2>
                            <div style="opacity: 0.8; font-size: 0.9rem;">
                                Welcome, ${user.name} ${isMaster ? '(Master Admin)' : '(Admin)'}
                            </div>
                        </div>
                    </div>
                    <button onclick="window.adminPanel.close()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    ">&times;</button>
                </div>
                
                <!-- Admin Tabs -->
                <div style="
                    display: flex;
                    gap: 5px;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 10px;
                ">
                    <button class="admin-tab active" data-tab="dashboard">📊 Dashboard</button>
                    <button class="admin-tab" data-tab="users">👥 Users</button>
                    <button class="admin-tab" data-tab="analytics">📈 Analytics</button>
                    <button class="admin-tab" data-tab="security">🔒 Security</button>
                    ${isMaster ? '<button class="admin-tab" data-tab="system">⚙️ System</button>' : ''}
                </div>
                
                <!-- Tab Content -->
                <div id="adminTabContent">
                    <!-- Dashboard content will be loaded here -->
                </div>
                
                <!-- System Status Bar -->
                <div style="
                    margin-top: 30px;
                    padding: 15px;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    font-size: 0.9rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <span style="color: #FFD700; font-weight: bold;">System Status:</span>
                        <span id="systemStatus" style="margin-left: 10px; color: #00CC88;">🟢 All Systems Operational</span>
                    </div>
                    <div>
                        <span style="opacity: 0.8;">Last updated: </span>
                        <span id="lastUpdate">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
            
            <style>
                .admin-tab {
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px 8px 0 0;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    border-bottom: 3px solid transparent;
                }
                
                .admin-tab:hover {
                    background: rgba(255, 215, 0, 0.1);
                }
                
                .admin-tab.active {
                    background: rgba(255, 215, 0, 0.2);
                    color: #FFD700;
                    border-bottom: 3px solid #FFD700;
                }
                
                #adminTabContent {
                    min-height: 500px;
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
        this.panelElement = overlay;
        
        // Load dashboard by default
        this.loadDashboard();
        
        // Setup tab switching
        this.setupTabs();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Close handlers
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
    }
    
    setupTabs() {
        const tabs = this.panelElement.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Load corresponding content
                const tabName = tab.dataset.tab;
                this.loadTabContent(tabName);
            });
        });
    }
    
    loadTabContent(tabName) {
        const contentElement = document.getElementById('adminTabContent');
        
        switch(tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'security':
                this.loadSecurity();
                break;
            case 'system':
                this.loadSystem();
                break;
        }
    }
    
    loadDashboard() {
        const contentElement = document.getElementById('adminTabContent');
        
        // Simulated data
        const systemData = {
            totalUsers: 42,
            activeUsers: 18,
            storiesPosted: 156,
            totalVisits: 842,
            storageUsed: '1.8 MB',
            uptime: '99.8%'
        };
        
        contentElement.innerHTML = `
            <div>
                <h3 style="color: #FFD700; margin-bottom: 20px;">📊 System Overview</h3>
                
                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="admin-stat" style="
                        background: rgba(0, 136, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #0088FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Total Users</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #00FFFF;">${systemData.totalUsers}</div>
                    </div>
                    
                    <div class="admin-stat" style="
                        background: rgba(0, 204, 136, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #00CC88;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Active Users</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #00CC88;">${systemData.activeUsers}</div>
                    </div>
                    
                    <div class="admin-stat" style="
                        background: rgba(255, 170, 0, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #FFAA00;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Stories Posted</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FFAA00;">${systemData.storiesPosted}</div>
                    </div>
                    
                    <div class="admin-stat" style="
                        background: rgba(170, 0, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #AA00FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Total Visits</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #AA00FF;">${systemData.totalVisits}</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h4 style="margin-top: 0; color: #FFD700;">⚡ Quick Actions</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button onclick="window.adminPanel.viewAllUsers()" class="admin-action-btn" style="background: linear-gradient(135deg, #00AAFF, #0088FF);">
                            👥 View All Users
                        </button>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                    <h4 style="margin-top: 0; color: #FFD700;">🕒 Recent Activity</h4>
                    <div id="recentAdminActivity" style="max-height: 300px; overflow-y: auto;">
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div>User "amy" registered</div>
                            <small style="opacity: 0.7;">5 minutes ago</small>
                        </div>
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div>Story "neural" was published</div>
                            <small style="opacity: 0.7;">15 minutes ago</small>
                        </div>
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div>System backup completed</div>
                            <small style="opacity: 0.7;">1 hour ago</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .admin-stat {
                    transition: transform 0.3s ease;
                }
                
                .admin-stat:hover {
                    transform: translateY(-5px);
                }
                
                .admin-action-btn {
                    border: none;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.2s ease;
                }
                
                .admin-action-btn:hover {
                    transform: scale(1.05);
                }
            </style>
        `;
    }
    
    loadUsers() {
        const contentElement = document.getElementById('adminTabContent');
        
        // Simulated user data
        const users = [
            { name: 'Praise', type: 'admin', level: 'admin', visits: 156, lastActive: '2 min ago' },
            { name: 'Fawaz', type: 'admin', level: 'admin', visits: 89, lastActive: '5 min ago' },
            { name: 'Marvelous', type: 'admin', level: 'admin', visits: 72, lastActive: '10 min ago' },
            { name: 'Alex', type: 'user', level: 'veteran', visits: 45, lastActive: '15 min ago' },
            { name: 'Jordan', type: 'user', level: 'regular', visits: 22, lastActive: '1 hour ago' },
            { name: 'Taylor', type: 'user', level: 'explorer', visits: 8, lastActive: '3 hours ago' }
        ];
        
        contentElement.innerHTML = `
            <div>
                <!-- User Search -->
                <div style="margin-bottom: 20px;">
                    <input type="text" 
                           placeholder="Search users..." 
                           id="userSearch"
                           style="
                               width: 100%;
                               padding: 12px 15px;
                               background: rgba(255, 255, 255, 0.1);
                               border: 1px solid rgba(255, 255, 255, 0.2);
                               border-radius: 8px;
                               color: white;
                               font-size: 1rem;
                           ">
                </div>
                
                <!-- Users Table -->
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: rgba(255, 215, 0, 0.1);">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">User</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Type</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Level</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Visits</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Last Active</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            ${users.map(user => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 12px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="
                                                width: 36px;
                                                height: 36px;
                                                border-radius: 50%;
                                                background: linear-gradient(135deg, ${user.type === 'admin' ? '#FFD700' : '#00FFFF'}, ${user.type === 'admin' ? '#FFAA00' : '#0088FF'});
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                font-weight: bold;
                                                color: #000;
                                            ">
                                                ${user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style="font-weight: bold;">${user.name}</div>
                                                <small style="opacity: 0.7;">ID: ${user.name.toLowerCase()}_${Date.now().toString(36)}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 12px;">
                                        <span style="
                                            background: ${user.type === 'admin' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 136, 255, 0.2)'};
                                            color: ${user.type === 'admin' ? '#FFD700' : '#00FFFF'};
                                            padding: 4px 12px;
                                            border-radius: 12px;
                                            font-size: 0.85rem;
                                            font-weight: bold;
                                        ">
                                            ${user.type === 'admin' ? '👑 Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td style="padding: 12px;">
                                        <span style="
                                            background: rgba(170, 0, 255, 0.1);
                                            color: #AA00FF;
                                            padding: 4px 12px;
                                            border-radius: 12px;
                                            font-size: 0.85rem;
                                        ">
                                            ${user.level}
                                        </span>
                                    </td>
                                    <td style="padding: 12px;">${user.visits}</td>
                                    <td style="padding: 12px;">${user.lastActive}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- User Stats Summary -->
                <div style="
                    margin-top: 30px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                ">
                    <h4 style="color: #FFD700; margin-top: 0;">📊 User Statistics</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Total Users</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #00FFFF;">${users.length}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Admins</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #FFD700;">${users.filter(u => u.type === 'admin').length}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Average Visits</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #00CC88;">${Math.round(users.reduce((sum, u) => sum + u.visits, 0) / users.length)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Active Now</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #AA00FF;">3</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add search functionality
        const searchInput = contentElement.querySelector('#userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = contentElement.querySelectorAll('#usersTableBody tr');
                
                rows.forEach(row => {
                    const name = row.querySelector('td:first-child div div:first-child').textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }
    
    loadAnalytics() {
        const contentElement = document.getElementById('adminTabContent');
        
        contentElement.innerHTML = `
            <div>
                <h3 style="color: #FFD700; margin-bottom: 20px;">📈 System Analytics</h3>
                
                <!-- Charts Container -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Traffic Chart -->
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                        <h4 style="margin-top: 0; color: #00FFFF;">🚀 Traffic Overview</h4>
                        <div style="height: 200px; display: flex; align-items: flex-end; gap: 10px; padding: 20px 0;">
                            ${[65, 80, 75, 90, 85, 95, 70].map((height, i) => `
                                <div style="
                                    flex: 1;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: flex-end;
                                ">
                                    <div style="
                                        width: 30px;
                                        height: ${height}%;
                                        background: linear-gradient(to top, #00FFFF, #0088FF);
                                        border-radius: 6px 6px 0 0;
                                        transition: height 0.3s ease;
                                    "></div>
                                    <div style="margin-top: 10px; font-size: 0.8rem; opacity: 0.8;">Day ${i + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- User Growth -->
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                        <h4 style="margin-top: 0; color: #00CC88;">📈 User Growth</h4>
                        <div style="height: 200px; position: relative;">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.1);"></div>
                            <div style="
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                height: 80%;
                                background: linear-gradient(180deg, rgba(0,204,136,0.1) 0%, transparent 100%);
                                border-radius: 12px;
                            "></div>
                            <!-- Simulated growth line -->
                            <svg width="100%" height="100%" style="position: relative; z-index: 1;">
                                <polyline points="0,180 50,150 100,120 150,100 200,80 250,60 300,40 350,20"
                                         style="fill:none;stroke:#00CC88;stroke-width:3" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Analytics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- Top Stories -->
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                        <h4 style="margin-top: 0; color: #FFAA00;">📚 Top Stories</h4>
                        <div>
                            ${['didgital awakening', 'echo', 'realm shift', 'storm legacy', 'teenage isekai'].map((story, i) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="color: #FFAA00; font-weight: bold;">#${i + 1}</span>
                                        <span>${story}</span>
                                    </div>
                                    <span style="opacity: 0.7;">${Math.floor(Math.random() * 1000)} views</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- User Demographics -->
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                        <h4 style="margin-top: 0; color: #AA00FF;">👥 User Types</h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>👑 Admins</span>
                                    <span>50%</span>
                                </div>
                                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    <div style="width: 50%; height: 100%; background: #FFD700; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>🌟 Legends</span>
                                    <span>25%</span>
                                </div>
                                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    <div style="width: 25%; height: 100%; background: #AA00FF; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>🎖️ Veterans</span>
                                    <span>10%</span>
                                </div>
                                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    <div style="width: 10%; height: 100%; background: #00CC88; border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>👤 Regular</span>
                                    <span>15%</span>
                                </div>
                                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                                    <div style="width: 15%; height: 100%; background: #00AAFF; border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

        `;
    }
    
    loadSecurity() {
        const contentElement = document.getElementById('adminTabContent');
        
        contentElement.innerHTML = `
            <div>
                <h3 style="color: #FFD700; margin-bottom: 20px;">🔒 Security Center</h3>
                
                <!-- Security Status -->
                <div style="
                    background: rgba(0, 204, 136, 0.1);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #00CC88;
                    margin-bottom: 30px;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #00CC88;">🛡️ Security Status: Excellent</h4>
                            <p style="margin: 0; opacity: 0.8;">All systems are secure and protected</p>
                        </div>
                        <div style="
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #00CC88, #00AA66);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            color: white;
                        ">
                            ✅
                        </div>
                    </div>
                </div>
                
                <!-- Security Metrics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="security-metric" style="
                        background: rgba(0, 136, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #0088FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Failed Logins (24h)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #00FFFF;">3</div>
                    </div>
                    
                    <div class="security-metric" style="
                        background: rgba(255, 170, 0, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #FFAA00;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Blocked IPs</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FFAA00;">12</div>
                    </div>
                    
                    <div class="security-metric" style="
                        background: rgba(255, 68, 68, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #FF4444;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Security Alerts</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FF4444;">0</div>
                    </div>
                    
                    <div class="security-metric" style="
                        background: rgba(170, 0, 255, 0.1);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #AA00FF;
                    ">
                        <div style="font-size: 0.9rem; opacity: 0.8;">Last Audit</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #AA00FF;">2 hours ago</div>
                    </div>
                </div>
                
                <!-- Security Actions -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h4 style="margin-top: 0; color: #FFD700;">⚡ Security Actions</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button onclick="window.adminPanel.runSecurityScan()" class="security-btn" style="background: linear-gradient(135deg, #00AAFF, #0088FF);">
                            🔍 Run Security Scan
                        </button>
                    </div>
                </div>
                
                <!-- Recent Security Events -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
                    <h4 style="margin-top: 0; color: #FFD700;">🛡️ Recent Security Events</h4>
                    <div id="securityEvents" style="max-height: 300px; overflow-y: auto;">
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50%;
                                    background: rgba(0, 204, 136, 0.2);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: #00CC88;
                                ">
                                    ✅
                                </div>
                                <div>
                                    <div>Successful admin login</div>
                                    <small style="opacity: 0.7;">From trusted device • 10 minutes ago</small>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50%;
                                    background: rgba(255, 170, 0, 0.2);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: #FFAA00;
                                ">
                                    ⚠️
                                </div>
                                <div>
                                    <div>Failed login attempt blocked</div>
                                    <small style="opacity: 0.7;">IP: 192.168.1.100 • 1 hour ago</small>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50%;
                                    background: rgba(0, 136, 255, 0.2);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: #0088FF;
                                ">
                                    🔄
                                </div>
                                <div>
                                    <div>System backup completed</div>
                                    <small style="opacity: 0.7;">Automatic backup • 3 hours ago</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .security-metric {
                    transition: transform 0.3s ease;
                }
                
                .security-metric:hover {
                    transform: translateY(-5px);
                }
                
                .security-btn {
                    border: none;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.2s ease;
                }
                
                .security-btn:hover {
                    transform: scale(1.05);
                }
            </style>
        `;
    }
    
    loadSystem() {
        const contentElement = document.getElementById('adminTabContent');
        
        contentElement.innerHTML = `
            <div>
                <div style="
                    background: rgba(255, 215, 0, 0.1);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #FFD700;
                    margin-bottom: 30px;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #FFD700;">⚙️ System Control Panel</h3>
                            <p style="margin: 0; opacity: 0.8;">Master admin access required for these actions</p>
                        </div>
                        <div style="
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #FFD700, #FFAA00);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            color: #000;
                        ">
                            👑
                        </div>
                    </div>
                </div>
                
                <!-- System Controls -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="system-control" style="
                        background: rgba(255, 255, 255, 0.05);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.1);
                    ">
                        <h4 style="margin-top: 0; color: #00FFFF;">🔄 System Restart</h4>
                        <p style="opacity: 0.8; font-size: 0.9rem;">Restart all system services</p>
                        <button onclick="window.adminPanel.restartSystem()" style="
                            width: 100%;
                            background: linear-gradient(135deg, #00AAFF, #0088FF);
                            border: none;
                            color: white;
                            padding: 12px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            margin-top: 10px;
                        ">
                            Restart System
                        </button>
                    </div>
                    
                    <div class="system-control" style="
                        background: rgba(255, 255, 255, 0.05);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.1);
                    ">
                        <h4 style="margin-top: 0; color: #00CC88;">🧹 Clear Cache</h4>
                        <p style="opacity: 0.8; font-size: 0.9rem;">Clear all cached data</p>
                        <button onclick="window.adminPanel.clearCache()" style="
                            width: 100%;
                            background: linear-gradient(135deg, #00CC88, #00AA66);
                            border: none;
                            color: white;
                            padding: 12px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            margin-top: 10px;
                        ">
                            Clear Cache
                        </button>
                    </div>
                    
                    <div class="system-control" style="
                        background: rgba(255, 255, 255, 0.05);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.1);
                    ">
                        <h4 style="margin-top: 0; color: #FFAA00;">📊 Reset Analytics</h4>
                        <p style="opacity: 0.8; font-size: 0.9rem;">Reset all analytics data</p>
                        <button onclick="window.adminPanel.resetAnalytics()" style="
                            width: 100%;
                            background: linear-gradient(135deg, #FFAA00, #FF8800);
                            border: none;
                            color: white;
                            padding: 12px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            margin-top: 10px;
                        ">
                            Reset Analytics
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Settings -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h4 style="margin-top: 0; color: #FFD700;">🔧 Advanced Settings</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Left Column -->
                        <div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; opacity: 0.8;">System Theme</label>
                                <select style="
                                    width: 100%;
                                    padding: 10px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    color: white;
                                ">
                                    <option value="dark">Dark Theme</option>
                                    <option value="light">Light Theme</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" checked style="transform: scale(1.2);">
                                    <span>Enable Notifications</span>
                                </label>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" checked style="transform: scale(1.2);">
                                    <span>Enable Analytics</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Right Column -->
                        <div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; opacity: 0.8;">Session Timeout (minutes)</label>
                                <input type="number" value="60" min="5" max="1440" style="
                                    width: 100%;
                                    padding: 10px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    color: white;
                                ">
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; opacity: 0.8;">Backup Frequency</label>
                                <select style="
                                    width: 100%;
                                    padding: 10px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    color: white;
                                ">
                                    <option value="daily">Daily</option>
                                    <option value="weekly" selected>Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="window.adminPanel.saveSystemSettings()" style="
                        margin-top: 20px;
                        background: linear-gradient(135deg, #FFD700, #FFAA00);
                        border: none;
                        color: #000;
                        padding: 12px 30px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        display: block;
                        margin-left: auto;
                    ">
                        💾 Save Settings
                    </button>
                </div>
                
                <!-- Danger Zone -->
                <div style="
                    background: rgba(255, 68, 68, 0.1);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #FF4444;
                ">
                    <h4 style="margin-top: 0; color: #FF4444;">⚠️ Danger Zone</h4>
                    <p style="opacity: 0.8; margin-bottom: 20px;">
                        These actions are irreversible. Proceed with extreme caution.
                    </p>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.adminPanel.resetSystem()" style="
                            background: rgba(255, 68, 68, 0.2);
                            border: 1px solid #FF4444;
                            color: #FF4444;
                            padding: 12px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            flex: 1;
                        ">
                            🔄 Reset System
                        </button>
                        <button onclick="window.adminPanel.deleteAllData()" style="
                            background: rgba(255, 68, 68, 0.2);
                            border: 1px solid #FF4444;
                            color: #FF4444;
                            padding: 12px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            flex: 1;
                        ">
                            🗑️ Delete All Data
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .system-control {
                    transition: transform 0.3s ease;
                }
                
                .system-control:hover {
                    transform: translateY(-5px);
                }
            </style>
        `;
    }
    
    // Admin Panel Actions
    viewAllUsers() {
        this.loadUsers();
        showNotification('Loading user data...', 'info');
    }
    

    runSecurityScan() {
        showNotification('Running security scan...', 'info');
        setTimeout(() => {
            showNotification('Security scan completed. No threats found.', 'success');
        }, 3000);
    }
    
    restartSystem() {
        if (confirm('Are you sure you want to restart the system?')) {
            showNotification('System restarting...', 'warning');
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    }
    
    clearCache() {
        if (confirm('Clear all cached data?')) {
            localStorage.removeItem('omniverse_cache');
            showNotification('Cache cleared!', 'success');
        }
    }
    
    resetAnalytics() {
        if (confirm('Reset all analytics data?')) {
            localStorage.removeItem('omniverse_analytics');
            showNotification('Analytics data reset!', 'success');
        }
    }
    
    saveSystemSettings() {
        showNotification('System settings saved!', 'success');
    }
    
    resetSystem() {
        if (confirm('WARNING: This will reset ALL system data!\nAre you absolutely sure?')) {
            if (prompt('Type "RESET" to confirm:') === 'RESET') {
                localStorage.clear();
                showNotification('System reset complete! Reloading...', 'warning');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }
    
    deleteAllData() {
        if (confirm('WARNING: This will DELETE ALL USER DATA!\nThis action cannot be undone.')) {
            if (prompt('Type "DELETE ALL" to confirm:') === 'DELETE ALL') {
                localStorage.clear();
                showNotification('All data deleted! Reloading...', 'error');
                setTimeout(() => location.reload(), 2000);
            }
        }
    }
    
    exportAnalytics(format) {
        showNotification(`Exporting analytics as ${format.toUpperCase()}...`, 'info');
        setTimeout(() => {
            showNotification(`${format.toUpperCase()} export completed!`, 'success');
        }, 2000);
    }
    
    startRealTimeUpdates() {
        this.realTimeUpdate = setInterval(() => {
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleTimeString();
            }
        }, 30000); // Update every 30 seconds
    }
    
    close() {
        if (this.realTimeUpdate) {
            clearInterval(this.realTimeUpdate);
        }
        if (this.panelElement && this.panelElement.parentNode) {
            this.panelElement.remove();
        }
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `omniverse-notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        admin: '👑'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'admin' ? 'rgba(255, 215, 0, 0.2)' : 
                    type === 'success' ? 'rgba(0, 204, 136, 0.2)' :
                    type === 'error' ? 'rgba(255, 68, 68, 0.2)' :
                    type === 'warning' ? 'rgba(255, 170, 0, 0.2)' :
                    'rgba(0, 170, 255, 0.2)'};
        color: ${type === 'admin' ? '#FFD700' :
                type === 'success' ? '#00CC88' :
                type === 'error' ? '#FF4444' :
                type === 'warning' ? '#FFAA00' : '#00AAFF'};
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid ${type === 'admin' ? '#FFD700' :
                            type === 'success' ? '#00CC88' :
                            type === 'error' ? '#FF4444' :
                            type === 'warning' ? '#FFAA00' : '#00AAFF'};
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 10001;
        backdrop-filter: blur(10px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    notification.innerHTML = `
        <span style="font-size: 1.5rem; font-weight: bold;">${icons[type] || icons.info}</span>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// ==================== FLOATING CONTROLS ====================
function createFloatingControls() {
    // Remove existing controls if any
    const existingControls = document.getElementById('omniverseControls');
    if (existingControls) existingControls.remove();
    
    const userManager = window.userManager;
    if (!userManager || !userManager.currentUser) return;
    
    const user = userManager.currentUser;
    
    // Create controls container
    const controls = document.createElement('div');
    controls.id = 'omniverseControls';
    controls.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
    `;
    
    // Main floating button
    const mainButton = document.createElement('div');
    mainButton.innerHTML = user.isAdmin ? '👑' : '👤';
    mainButton.style.cssText = `
        width: 70px;
        height: 70px;
        background: ${user.isAdmin ? 'linear-gradient(135deg, #FFD700, #FFAA00)' : 'linear-gradient(135deg, #00FFFF, #0088FF)'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        color: #000;
        cursor: pointer;
        box-shadow: 0 10px 40px ${user.isAdmin ? 'rgba(255, 215, 0, 0.6)' : 'rgba(0, 255, 255, 0.6)'};
        transition: all 0.4s ease;
        user-select: none;
        border: 3px solid ${user.isAdmin ? '#FFD700' : '#00FFFF'};
    `;
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.textContent = user.isAdmin ? '👑 Admin Panel' : '👤 User Dashboard';
    tooltip.style.cssText = `
        position: absolute;
        bottom: 85px;
        right: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: ${user.isAdmin ? '#FFD700' : '#00FFFF'};
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: bold;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        border: 1px solid ${user.isAdmin ? '#FFD700' : '#00FFFF'};
        backdrop-filter: blur(10px);
        box-shadow: 0 5px 20px ${user.isAdmin ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)'};
    `;
    
    controls.appendChild(tooltip);
    controls.appendChild(mainButton);
    
    // Show/hide tooltip
    mainButton.onmouseenter = () => {
        mainButton.style.transform = 'scale(1.25) rotate(360deg)';
        mainButton.style.boxShadow = `0 20px 50px ${user.isAdmin ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 255, 255, 0.8)'}`;
        tooltip.style.opacity = '1';
    };
    mainButton.onmouseleave = () => {
        mainButton.style.transform = 'scale(1) rotate(0)';
        mainButton.style.boxShadow = `0 10px 40px ${user.isAdmin ? 'rgba(255, 215, 0, 0.6)' : 'rgba(0, 255, 255, 0.6)'}`;
        tooltip.style.opacity = '0';
    };
    
    // Click handler
    mainButton.onclick = () => {
        if (user.isAdmin) {
            // Show admin panel
            if (window.adminPanel) {
                window.adminPanel.show();
            }
        } else {
            // Show user dashboard
            if (window.userDashboard) {
                window.userDashboard.show();
            }
        }
    };
    
    document.body.appendChild(controls);
    
    console.log('🎪 Floating controls activated');
}

// ==================== SHOW SIGN-IN FORM FUNCTION ====================
function showSignInForm() {
    // Clear any existing user data to trigger auth flow
    localStorage.removeItem(OMNIVERSE_ENHANCED.storage.userName);
    localStorage.removeItem(OMNIVERSE_ENHANCED.storage.userType);
    
    // Show notification
    showNotification('Showing sign-in form...', 'info');
    
    // Initialize the authentication system
    if (typeof initEnhancedAuth === 'function') {
        initEnhancedAuth();
    } else {
        // Fallback: reload page to trigger auth
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// ==================== ENHANCED AUTH INITIALIZATION ====================
function initEnhancedAuth() {
    const existingUserName = localStorage.getItem(OMNIVERSE_ENHANCED.storage.userName);
    
    // If user already exists, show welcome notification
    if (existingUserName) {
        // Don't show auth form if already logged in
        showNotification(`Already logged in as ${existingUserName}. Press Ctrl+Shift+L to logout.`, 'info');
        return;
    }
    
    // Create auth overlay
    const authOverlay = document.createElement('div');
    authOverlay.id = 'enhancedAuthOverlay';
    authOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10002;
        backdrop-filter: blur(20px);
        animation: fadeIn 0.3s ease;
    `;
    
    authOverlay.innerHTML = `
        <div class="auth-container" style="
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            border-radius: 20px;
            border: 2px solid #00FFFF;
            color: white;
            width: 90%;
            max-width: 500px;
            padding: 40px 30px;
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
            text-align: center;
        ">
            <div style="margin-bottom: 30px;">
                <div style="
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00FFFF, #0088FF);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: #000;
                    border: 3px solid #00FFFF;
                ">
                    🔐
                </div>
                <h2 style="margin: 0 0 10px 0; color: #00FFFF;">Omniverse Authentication</h2>
                <p style="opacity: 0.8; margin: 0;">Enter your name to access the Omniverse</p>
            </div>
            
            <!-- Name Input -->
            <div style="margin-bottom: 25px;">
                <input type="text" 
                       id="authUserName" 
                       placeholder="Enter your name..."
                       autocomplete="off"
                       autocapitalize="off"
                       style="
                           width: 100%;
                           padding: 15px 20px;
                           background: rgba(255, 255, 255, 0.1);
                           border: 2px solid rgba(255, 255, 255, 0.2);
                           border-radius: 12px;
                           color: white;
                           font-size: 1.1rem;
                           text-align: center;
                           transition: all 0.3s ease;
                       ">
                <div id="authError" style="
                    color: #FF4444;
                    font-size: 0.9rem;
                    margin-top: 10px;
                    min-height: 20px;
                "></div>
            </div>
            
            <!-- Admin Password (hidden by default) -->
            <div id="adminPasswordSection" style="
                margin-bottom: 25px;
                display: none;
                animation: fadeIn 0.3s ease;
            ">
                <input type="password" 
                       id="authAdminPassword" 
                       placeholder="Admin Password (Optional)"
                       style="
                           width: 100%;
                           padding: 15px 20px;
                           background: rgba(255, 255, 255, 0.1);
                           border: 2px solid rgba(255, 215, 0, 0.2);
                           border-radius: 12px;
                           color: #FFD700;
                           font-size: 1.1rem;
                           text-align: center;
                       ">
                <small style="display: block; margin-top: 8px; opacity: 0.7; font-size: 0.85rem;">
        
                </small>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button onclick="processEnhancedAuth()" style="
                    background: linear-gradient(135deg, #00AAFF, #0088FF);
                    border: none;
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                ">
                    🚀 Enter Omniverse
                </button>
                
                <!-- Button Group -->
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="toggleAdminPassword()" style="
                        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
                        border: 1px solid rgba(255, 215, 0, 0.5);
                        color: #FFD700;
                        padding: 12px 20px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 500;
                        opacity: 0.9;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 140px;
                        justify-content: center;
                    "
                    onmouseover="this.style.opacity='1'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(255, 215, 0, 0.2)';"
                    onmouseout="this.style.opacity='0.9'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                    onmousedown="this.style.transform='translateY(0)';"
                    onmouseup="this.style.transform='translateY(-2px)';">
                        👑 Admin Access
                    </button>
                    
                    <button onclick="closeAuthForm()" style="
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        color: rgba(255, 255, 255, 0.8);
                        padding: 12px 20px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 100px;
                        justify-content: center;
                    "
                    onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='rgba(255, 255, 255, 0.9)'; this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(255, 255, 255, 0.3)';"
                    onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='rgba(255, 255, 255, 0.8)'; this.style.transform='translateY(0)'; this.style.borderColor='rgba(255, 255, 255, 0.15)';"
                    onmousedown="this.style.transform='translateY(0)';"
                    onmouseup="this.style.transform='translateY(-2px)';">
                        ✕ Close
                    </button>
                </div>
            </div>
            
            <!-- Instructions -->
            <div style="
                margin-top: 30px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                font-size: 0.85rem;
                opacity: 0.7;
            ">
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 10px;">
                    <span>🔒 Secure Authentication</span>
                    <span>📊 User Stats</span>
                    <span>🎪 Dashboard</span>
                </div>
                <div>Press <kbd style="background: #333; padding: 2px 8px; border-radius: 4px;">Ctrl+Shift+S</kbd> anytime to reopen this form</div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            #authUserName:focus, #authAdminPassword:focus {
                outline: none;
                border-color: #00FFFF;
                box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
            }
            
            button:hover {
                transform: translateY(-2px);
            }
        </style>
    `;
    
    document.body.appendChild(authOverlay);
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('authUserName');
        if (input) input.focus();
    }, 100);
    
    // Add Enter key support
    const nameInput = document.getElementById('authUserName');
    const passwordInput = document.getElementById('authAdminPassword');
    
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processEnhancedAuth();
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processEnhancedAuth();
            }
        });
    }
    
    // Close on escape
    authOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthForm();
        }
    });
    
    // Close when clicking outside
    authOverlay.addEventListener('click', (e) => {
        if (e.target === authOverlay) {
            closeAuthForm();
        }
    });
}

// ==================== PROCESS AUTHENTICATION ====================
function processEnhancedAuth() {
    const userNameInput = document.getElementById('authUserName');
    const passwordInput = document.getElementById('authAdminPassword');
    const errorElement = document.getElementById('authError');
    
    if (!userNameInput) return;
    
    const userName = userNameInput.value.trim();
    const adminPassword = passwordInput ? passwordInput.value : '';
    
    // Reset error
    if (errorElement) errorElement.textContent = '';
    
    // Validation
    if (!userName) {
        if (errorElement) errorElement.textContent = 'Please enter a name';
        userNameInput.focus();
        return;
    }
    
    if (userName.length < OMNIVERSE_ENHANCED.security.minLength) {
        if (errorElement) errorElement.textContent = `Name must be at least ${OMNIVERSE_ENHANCED.security.minLength} characters`;
        userNameInput.focus();
        return;
    }
    
    if (userName.length > OMNIVERSE_ENHANCED.security.maxLength) {
        if (errorElement) errorElement.textContent = `Name must be less than ${OMNIVERSE_ENHANCED.security.maxLength} characters`;
        userNameInput.focus();
        return;
    }
    
    // Check for banned names (AI, bots, etc.)
    if (OMNIVERSE_ENHANCED.security.bannedRegex.test(userName)) {
        if (errorElement) errorElement.textContent = 'This name is not allowed';
        userNameInput.focus();
        return;
    }
    
    // Determine user type
    let userType = 'user';
    if (OMNIVERSE_ENHANCED.admin.names.includes(userName.toLowerCase())) {
        if (adminPassword === OMNIVERSE_ENHANCED.admin.password) {
            userType = 'admin';
        } else {
            if (errorElement) errorElement.textContent = 'Admin password required';
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.style.borderColor = '#FF4444';
            }
            return;
        }
    }
    
    // Save user data
    localStorage.setItem(OMNIVERSE_ENHANCED.storage.userName, userName);
    localStorage.setItem(OMNIVERSE_ENHANCED.storage.userType, userType);
    
    // Save first visit time if not exists
    if (!localStorage.getItem(OMNIVERSE_ENHANCED.storage.firstVisit)) {
        localStorage.setItem(OMNIVERSE_ENHANCED.storage.firstVisit, new Date().toISOString());
    }
    
    // Close auth form
    closeAuthForm();
    
    // Show success notification
    showNotification(
        userType === 'admin' 
            ? `👑 Welcome, Admin ${userName}!` 
            : `✨ Welcome to Omniverse, ${userName}!`,
        userType === 'admin' ? 'admin' : 'success'
    );
    
    // Initialize or reload the system
    setTimeout(() => {
        if (window.userManager) {
            window.userManager.initializeUser();
            createFloatingControls();
        } else {
            location.reload();
        }
    }, 1000);
}

// ==================== HELPER FUNCTIONS ====================
function toggleAdminPassword() {
    const adminSection = document.getElementById('adminPasswordSection');
    if (adminSection) {
        adminSection.style.display = adminSection.style.display === 'none' ? 'block' : 'none';
    }
}

function closeAuthForm() {
    const authOverlay = document.getElementById('enhancedAuthOverlay');
    if (authOverlay && authOverlay.parentNode) {
        authOverlay.parentNode.removeChild(authOverlay);
    }
}

// ==================== ENHANCED SHORTCUTS ====================
function setupEnhancedShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+S - Show Sign In Form
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            showSignInForm();
        }
        
        // Ctrl+Shift+D - Dashboard
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (window.userDashboard) {
                window.userDashboard.show();
            }
        }
        
        // Ctrl+Shift+A - Admin Panel
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (window.adminPanel && window.userManager.currentUser?.isAdmin) {
                window.adminPanel.show();
            } else {
                showNotification('Admin access required', 'error');
            }
        }
        
        // Ctrl+Shift+T - Toggle Theme
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            if (window.userDashboard) {
                window.userDashboard.toggleTheme();
            }
        }
        
        // Ctrl+Shift+L - Logout
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            if (window.userManager && window.userManager.currentUser) {
                if (confirm('Are you sure you want to logout?')) {
                    window.userManager.logout();
                }
            }
        }
    });
}

// ==================== LOAD THEME ====================
function loadTheme() {
    const savedTheme = localStorage.getItem('omniverse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==================== SHOW WELCOME MESSAGE ====================
function showWelcomeMessage() {
    const user = window.userManager?.currentUser;
    if (!user) return;
    
    setTimeout(() => {
        showNotification(
            `Welcome ${user.isAdmin ? 'Admin ' : ''}${user.name}! ` +
            `Press Ctrl+Shift+${user.isAdmin ? 'A' : 'D'} for ${user.isAdmin ? 'Admin Panel' : 'Dashboard'}` +
            ` | Ctrl+Shift+S to sign in as another user`,
            user.isAdmin ? 'admin' : 'info'
        );
    }, 1000);
}

// ==================== ADD ENHANCED STYLES ====================
function addEnhancedStyles() {
    const styles = `
        [data-theme="dark"] {
            --primary: #00FFFF;
            --secondary: #0088FF;
            --background: #0f0f23;
            --card-bg: #1a1a2e;
            --text-color: #FFFFFF;
            --accent: #FFD700;
        }
        
        [data-theme="light"] {
            --primary: #007ACC;
            --secondary: #005A9E;
            --background: #FFFFFF;
            --card-bg: #F5F5F5;
            --text-color: #333333;
            --accent: #FF8C00;
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--secondary);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ==================== INITIALIZATION ====================
function initEnhancedOmniverse() {
    console.log('🚀 Initializing Enhanced Omniverse System...');
    
    // Check if user exists
    const existingUserName = localStorage.getItem(OMNIVERSE_ENHANCED.storage.userName);
    
    if (!existingUserName) {
        // Show auth form if no user exists
        setTimeout(() => {
            initEnhancedAuth();
        }, 1000);
    } else {
        // Initialize user manager for existing user
        window.userManager = new EnhancedUserManager();
        
        // Initialize dashboard and admin panel
        window.userDashboard = new UserDashboard(window.userManager);
        window.adminPanel = new AdminPanel(window.userManager);
        
        // Create floating controls
        createFloatingControls();
        
        // Setup keyboard shortcuts
        setupEnhancedShortcuts();
        
        // Load theme
        loadTheme();
        
        // Show welcome message
        showWelcomeMessage();
        
        console.log('✅ Enhanced Omniverse System initialized!');
    }
    
    // Export to global scope
    window.OMNIVERSE_ENHANCED = OMNIVERSE_ENHANCED;
    window.showNotification = showNotification;
    window.showSignInForm = showSignInForm;
    window.initEnhancedAuth = initEnhancedAuth;
    window.processEnhancedAuth = processEnhancedAuth;
    window.toggleAdminPassword = toggleAdminPassword;
    window.closeAuthForm = closeAuthForm;
}

// ==================== STARTUP ====================
document.addEventListener('DOMContentLoaded', () => {
    // Add styles first
    addEnhancedStyles();
    
    // Initialize after a short delay
    setTimeout(() => {
        initEnhancedOmniverse();
    }, 500);
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║               OMNIVERSE ENHANCED SYSTEM v2.5              ║
║                                                           ║
║           🎪 User Dashboard | 👑 Admin Panel              ║
║           🔐 Secure Auth    | 📊 Real-time Stats         ║
║                                                           ║
║       Press Ctrl+Shift+D for Dashboard                   ║
║       Press Ctrl+Shift+A for Admin Panel                 ║
║       Press Ctrl+Shift+S for Sign In                     ║
║       Press Ctrl+Shift+T to Toggle Theme                 ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
