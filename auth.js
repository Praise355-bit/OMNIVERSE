/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          OMNIVERSE ENHANCED SYSTEM — VERSION 3.2.0           ║
 * ║  New: Notifications · Themes · Online Users · Avatar         ║
 * ║       Achievements & Badges · Hide/Show Icons Button         ║
 * ║  Fix: FABs now hide on scroll up, show on scroll down        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ==================== CORE CONFIG ====================
const OMNIVERSE = {
    version: '3.2.0',
    buildDate: new Date().toISOString().split('T')[0],

    storage: {
        userName:       'omniverse_userName_v3',
        userType:       'omniverse_userType_v3',
        firstVisit:     'omniverse_firstVisit_v3',
        lastVisit:      'omniverse_lastVisit_v3',
        visitCount:     'omniverse_visitCount_v3',
        userLevel:      'omniverse_userLevel_v3',
        userStats:      'omniverse_userStats_v3',
        theme:          'omniverse_theme_v3',
        preferences:    'omniverse_prefs_v3',
        activityLog:    'omniverse_activity_v3',
        notifications:  'omniverse_notifs_v3',
        achievements:   'omniverse_achievements_v3',
        avatarConfig:   'omniverse_avatar_v3',
    },

    admin: {
        names:    ['praise', 'fawaz', 'kesther'],
        master:   'praise',
        password: '0122',
        privileges: {
            bypassCooldown:   true,
            accessDebug:      true,
            viewAnalytics:    true,
            viewPeopleOnline: true,
            manageUsers:      true,
            systemControl:    true,
        },
    },

    security: {
        bannedRegex: /^(robot|bot|grok|chatgpt|llm|gpt|claude|gemini|artificial|intelligence|synthetic|machine|ai|assistant|deepseek|huggingface|openai)$/i,
        minLength:   2,
        maxLength:   20,
        maxAttempts: 5,
        cooldownMs:  30_000,
        _attempts:   0,
        _lockedUntil:0,
    },

    levels: {
        newcomer: { min: 0,  icon: '✦',  color: '#8888AA' },
        explorer: { min: 5,  icon: '🚀', color: '#00BBFF' },
        regular:  { min: 10, icon: '⭐', color: '#00CC88' },
        veteran:  { min: 20, icon: '🎖️', color: '#FF8C00' },
        legend:   { min: 50, icon: '🌟', color: '#FFD700' },
    },

    achievements: {
        first_login:  { icon: '🎉', title: 'First Step',    desc: 'Logged in for the first time',     xp: 10  },
        explorer_5:   { icon: '🚀', title: 'Explorer',      desc: 'Visited 5 times',                  xp: 25  },
        veteran_20:   { icon: '🎖️', title: 'Veteran',       desc: 'Visited 20 times',                 xp: 100 },
        legend_50:    { icon: '🌟', title: 'Legend',        desc: 'Visited 50 times',                 xp: 300 },
        reader_10:    { icon: '📖', title: 'Avid Reader',   desc: 'Read 10 stories',                  xp: 50  },
        reader_50:    { icon: '📚', title: 'Bookworm',      desc: 'Read 50 stories',                  xp: 150 },
        night_owl:    { icon: '🦉', title: 'Night Owl',     desc: 'Active between midnight and 5 AM', xp: 40  },
        customizer:   { icon: '🎨', title: 'Customizer',    desc: 'Changed your avatar',              xp: 15  },
        theme_switch: { icon: '🌙', title: 'Night Shift',   desc: 'Switched to dark or light mode',   xp: 5   },
    },

    avatarColors: [
        { id: 'cyan',   gradient: 'linear-gradient(135deg,#00BBFF,#0055AA)', label: 'Cyan'   },
        { id: 'green',  gradient: 'linear-gradient(135deg,#00CC88,#007744)', label: 'Green'  },
        { id: 'purple', gradient: 'linear-gradient(135deg,#AA44FF,#6600CC)', label: 'Purple' },
        { id: 'orange', gradient: 'linear-gradient(135deg,#FF8800,#CC4400)', label: 'Orange' },
        { id: 'pink',   gradient: 'linear-gradient(135deg,#FF44AA,#CC0066)', label: 'Pink'   },
        { id: 'gold',   gradient: 'linear-gradient(135deg,#FFD700,#FF8800)', label: 'Gold'   },
        { id: 'red',    gradient: 'linear-gradient(135deg,#FF4455,#CC0022)', label: 'Red'    },
        { id: 'teal',   gradient: 'linear-gradient(135deg,#00DDCC,#008877)', label: 'Teal'   },
    ],
    avatarIcons: ['◈', '★', '♦', '▲', '⬡', '⚡', '✦', '◉', '❋', '⊕'],

    fonts: {
        display: "'Montserrat', sans-serif",
        body:    "'Montserrat', sans-serif",
        mono:    "'JetBrains Mono', monospace",
    },

    _onlineBase: Math.floor(Math.random() * 18) + 6,
};

// ==================== UTILITIES ====================
const Utils = {
    sanitize(str) {
        const el = document.createElement('div');
        el.textContent = String(str);
        return el.innerHTML;
    },
    formatDuration(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
    },
    formatDate(iso) {
        try { return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }); }
        catch { return '—'; }
    },
    timeAgo(iso) {
        try {
            const diff = Date.now() - new Date(iso).getTime();
            if (diff < 60_000)      return 'just now';
            if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m ago`;
            if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`;
            return `${Math.floor(diff / 86_400_000)}d ago`;
        } catch { return '—'; }
    },
    deepMerge(target, source) {
        const out = { ...target };
        for (const key in source) {
            out[key] = (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]))
                ? Utils.deepMerge(target[key] ?? {}, source[key])
                : source[key];
        }
        return out;
    },
    uid(len = 8) { return Math.random().toString(36).slice(2, 2 + len); },
    storage: {
        get(key, fallback = null) {
            try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
            catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); return true; }
            catch (e) { console.warn('[Omniverse] Storage error:', e); return false; }
        },
        remove(key) { try { localStorage.removeItem(key); } catch {} },
        clear(prefix) {
            Object.values(OMNIVERSE.storage)
                .filter(k => !prefix || k.startsWith(prefix))
                .forEach(k => localStorage.removeItem(k));
        },
    },
};

// ==================== ACTIVITY LOG ====================
const ActivityLog = {
    MAX: 50,
    add(userName, action, meta = {}) {
        const log = Utils.storage.get(OMNIVERSE.storage.activityLog, []);
        log.unshift({ id: Utils.uid(), ts: new Date().toISOString(), user: userName, action, meta });
        if (log.length > this.MAX) log.length = this.MAX;
        Utils.storage.set(OMNIVERSE.storage.activityLog, log);
    },
    getAll()          { return Utils.storage.get(OMNIVERSE.storage.activityLog, []); },
    getForUser(name)  { return this.getAll().filter(e => e.user.toLowerCase() === name.toLowerCase()); },
};

// ==================== NOTIFICATION SYSTEM ====================
const Notifications = {
    MAX: 40,

    _palette: {
        info:        '#00BBFF',
        success:     '#00CC88',
        warning:     '#FFAA00',
        achievement: '#FFD700',
        admin:       '#FFD700',
    },

    add(title, message, type = 'info', icon = null) {
        const notifs = Utils.storage.get(OMNIVERSE.storage.notifications, []);
        const defaultIcons = { info:'ℹ', success:'✓', warning:'⚠', achievement:'🏆', admin:'👑' };
        notifs.unshift({
            id: Utils.uid(), ts: new Date().toISOString(),
            title, message, type,
            icon: icon ?? defaultIcons[type] ?? 'ℹ',
            read: false,
        });
        if (notifs.length > this.MAX) notifs.length = this.MAX;
        Utils.storage.set(OMNIVERSE.storage.notifications, notifs);
        this._updateBadge();
    },

    getAll()     { return Utils.storage.get(OMNIVERSE.storage.notifications, []); },
    getUnread()  { return this.getAll().filter(n => !n.read); },

    markRead(id) {
        const notifs = this.getAll().map(n => (id === 'all' || n.id === id) ? { ...n, read: true } : n);
        Utils.storage.set(OMNIVERSE.storage.notifications, notifs);
        this._updateBadge();
    },

    clear() { Utils.storage.set(OMNIVERSE.storage.notifications, []); this._updateBadge(); },

    _updateBadge() {
        const badge = document.getElementById('_ovNotifBadge');
        const count = this.getUnread().length;
        if (badge) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },
};

// ==================== ACHIEVEMENT SYSTEM ====================
const AchievementManager = {
    getUnlocked() { return Utils.storage.get(OMNIVERSE.storage.achievements, []); },
    isUnlocked(id) { return this.getUnlocked().includes(id); },

    unlock(id) {
        if (this.isUnlocked(id)) return false;
        const def = OMNIVERSE.achievements[id];
        if (!def) return false;
        const list = this.getUnlocked();
        list.push(id);
        Utils.storage.set(OMNIVERSE.storage.achievements, list);
        Notifications.add(`Achievement: ${def.title}`, `${def.desc} · +${def.xp} XP`, 'achievement', def.icon);
        Toast.show(`${def.icon} ${def.title} unlocked! (+${def.xp} XP)`, 'success', 5000);
        ActivityLog.add(window.userManager?.currentUser?.name ?? '?', 'achievement_unlocked', { id });
        return true;
    },

    checkAll(user) {
        const s = user.stats ?? {};
        const v = user.visitCount ?? 0;
        const h = new Date().getHours();
        if (v >= 1)  this.unlock('first_login');
        if (v >= 5)  this.unlock('explorer_5');
        if (v >= 20) this.unlock('veteran_20');
        if (v >= 50) this.unlock('legend_50');
        if ((s.storiesRead ?? 0) >= 10) this.unlock('reader_10');
        if ((s.storiesRead ?? 0) >= 50) this.unlock('reader_50');
        if (h >= 0 && h < 5) this.unlock('night_owl');
    },

    getTotalXP() {
        return this.getUnlocked().reduce((s, id) => s + (OMNIVERSE.achievements[id]?.xp ?? 0), 0);
    },
};

// ==================== AVATAR MANAGER ====================
const AvatarManager = {
    getConfig() {
        return Utils.storage.get(OMNIVERSE.storage.avatarConfig, { colorId: 'cyan', icon: '◈' });
    },
    setConfig(colorId, icon) {
        Utils.storage.set(OMNIVERSE.storage.avatarConfig, { colorId, icon });
        AchievementManager.unlock('customizer');
        Toast.show('🎨 Avatar updated!', 'success');
    },
    getGradient(colorId) {
        return OMNIVERSE.avatarColors.find(c => c.id === colorId)?.gradient ?? OMNIVERSE.avatarColors[0].gradient;
    },
    render(size = 60, extraStyle = '') {
        const cfg  = this.getConfig();
        const grad = this.getGradient(cfg.colorId);
        const r    = Math.round(size * 0.28);
        return `<div style="
            width:${size}px;height:${size}px;border-radius:${r}px;
            background:${grad};
            display:flex;align-items:center;justify-content:center;
            font-size:${Math.round(size * 0.38)}px;color:white;
            box-shadow:0 4px 20px rgba(0,0,0,0.4);
            flex-shrink:0;user-select:none;${extraStyle}
        ">${cfg.icon}</div>`;
    },
};

// ==================== TOAST SYSTEM ====================
const Toast = (() => {
    let container = null;
    function getContainer() {
        if (!container) {
            container = document.createElement('div');
            container.id = 'ov-toasts';
            container.style.cssText = `
                position:fixed;top:20px;right:20px;z-index:99999;
                display:flex;flex-direction:column;gap:10px;pointer-events:none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }
    const palette = {
        success:     { bg:'#0d2e22', border:'#00CC88', icon:'✓',  text:'#00CC88' },
        error:       { bg:'#2e0d0d', border:'#FF4455', icon:'✕',  text:'#FF4455' },
        warning:     { bg:'#2e1f00', border:'#FFAA00', icon:'⚠',  text:'#FFAA00' },
        info:        { bg:'#0d1f2e', border:'#00BBFF', icon:'ℹ',  text:'#00BBFF' },
        admin:       { bg:'#1f1700', border:'#FFD700', icon:'👑', text:'#FFD700' },
    };
    return {
        show(message, type = 'info', duration = 5000) {
            const c  = getContainer();
            const p  = palette[type] ?? palette.info;
            const el = document.createElement('div');
            el.style.cssText = `
                background:${p.bg};border:1px solid ${p.border};
                border-left:4px solid ${p.border};color:${p.text};
                padding:14px 18px;border-radius:10px;
                display:flex;align-items:center;gap:12px;
                max-width:360px;min-width:220px;pointer-events:all;cursor:pointer;
                backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.5);
                font-family:${OMNIVERSE.fonts.body};font-size:0.9rem;line-height:1.4;
                transform:translateX(120%);opacity:0;
                transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;
            `;
            el.innerHTML = `<span style="font-size:1.2rem;flex-shrink:0;">${p.icon}</span><span>${Utils.sanitize(message)}</span>`;
            c.appendChild(el);
            requestAnimationFrame(() => { el.style.transform='translateX(0)'; el.style.opacity='1'; });
            const dismiss = () => {
                el.style.transform='translateX(120%)'; el.style.opacity='0';
                setTimeout(() => el.remove(), 300);
            };
            el.addEventListener('click', dismiss);
            setTimeout(dismiss, duration);
        },
    };
})();

// ==================== MODAL SYSTEM ====================
const Modal = {
    confirm(title, message) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.7);
                display:flex;align-items:center;justify-content:center;
                backdrop-filter:blur(8px);animation:ovFadeIn 0.2s ease;
            `;
            overlay.innerHTML = `
                <div style="
                    background:#111122;border:1px solid #2a2a4a;border-radius:16px;
                    padding:32px;max-width:400px;width:90%;color:white;
                    font-family:${OMNIVERSE.fonts.body};box-shadow:0 20px 60px rgba(0,0,0,0.8);
                ">
                    <h3 style="margin:0 0 12px;font-family:${OMNIVERSE.fonts.display};color:#00BBFF;font-size:1.3rem;">${Utils.sanitize(title)}</h3>
                    <p style="margin:0 0 28px;opacity:0.8;line-height:1.5;">${Utils.sanitize(message)}</p>
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button id="_ovCancel" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.7);padding:10px 22px;border-radius:8px;cursor:pointer;">Cancel</button>
                        <button id="_ovOk" style="background:linear-gradient(135deg,#0088FF,#0055CC);border:none;color:white;padding:10px 22px;border-radius:8px;cursor:pointer;font-weight:600;">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('#_ovOk').onclick     = () => { overlay.remove(); resolve(true);  };
            overlay.querySelector('#_ovCancel').onclick = () => { overlay.remove(); resolve(false); };
            overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
        });
    },
};

// ==================== BASE PANEL CLASS ====================
class BasePanel {
    constructor() { this._el = null; this._intervals = []; }
    _createOverlay(zIndex = 9000) {
        const el = document.createElement('div');
        el.style.cssText = `
            position:fixed;inset:0;z-index:${zIndex};background:rgba(0,0,0,0.88);
            display:flex;align-items:center;justify-content:center;
            backdrop-filter:blur(14px);animation:ovFadeIn 0.25s ease;
        `;
        el.addEventListener('click', e => { if (e.target === el) this.close(); });
        document.addEventListener('keydown', this._escHandler = e => { if (e.key === 'Escape') this.close(); });
        return el;
    }
    close() {
        this._intervals.forEach(clearInterval);
        this._intervals = [];
        document.removeEventListener('keydown', this._escHandler);
        if (this._el?.parentNode) this._el.remove();
        this._el = null;
    }
    _tick(fn, ms) { const id = setInterval(fn, ms); this._intervals.push(id); return id; }
}

// ==================== NOTIFICATION CENTER PANEL ====================
class NotificationCenter extends BasePanel {
    show() {
        if (this._el) this.close();
        Notifications.markRead('all');

        const notifs  = Notifications.getAll();
        const palette = Notifications._palette;

        const rows = notifs.length
            ? notifs.map(n => `
                <div style="
                    padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);
                    display:flex;gap:14px;align-items:flex-start;
                    transition:background 0.2s;border-radius:10px;
                " onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                   onmouseout="this.style.background='transparent'">
                    <div style="
                        width:36px;height:36px;border-radius:10px;flex-shrink:0;
                        background:${(palette[n.type] ?? '#00BBFF')}22;
                        border:1px solid ${(palette[n.type] ?? '#00BBFF')}44;
                        display:flex;align-items:center;justify-content:center;font-size:1.1rem;
                    ">${n.icon}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;font-size:0.9rem;margin-bottom:3px;">${Utils.sanitize(n.title)}</div>
                        <div style="opacity:0.65;font-size:0.82rem;line-height:1.4;">${Utils.sanitize(n.message)}</div>
                        <div style="opacity:0.35;font-size:0.75rem;margin-top:5px;font-family:${OMNIVERSE.fonts.mono};">${Utils.timeAgo(n.ts)}</div>
                    </div>
                </div>`).join('')
            : `<div style="text-align:center;opacity:0.35;padding:60px 0;font-size:0.9rem;">
                <div style="font-size:2.5rem;margin-bottom:12px;">🔔</div>
                No notifications yet
               </div>`;

        const overlay = this._createOverlay(9200);
        overlay.innerHTML = `
            <div style="
                background:linear-gradient(160deg,#0a0a1a,#111130);
                border:1px solid rgba(0,187,255,0.2);border-radius:20px;
                width:92%;max-width:500px;max-height:85vh;
                display:flex;flex-direction:column;color:white;
                font-family:${OMNIVERSE.fonts.body};
                box-shadow:0 0 60px rgba(0,187,255,0.1);
            ">
                <div style="padding:22px 24px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#00BBFF;letter-spacing:1px;">🔔 NOTIFICATIONS</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button onclick="window._ovNotifCenter._clearAll()" style="background:transparent;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);padding:6px 12px;border-radius:7px;cursor:pointer;font-size:0.78rem;">Clear all</button>
                        <button onclick="window._ovNotifCenter.close()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">✕</button>
                    </div>
                </div>
                <div style="overflow-y:auto;flex:1;padding:10px 16px;">${rows}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._el = overlay;
        window._ovNotifCenter = this;
    }

    _clearAll() {
        Notifications.clear();
        Toast.show('Notifications cleared', 'info');
        this.close();
        this.show();
    }
}

// ==================== AVATAR CUSTOMIZER PANEL ====================
class AvatarCustomizer extends BasePanel {
    show() {
        if (this._el) this.close();
        const cfg = AvatarManager.getConfig();

        const colorBtns = OMNIVERSE.avatarColors.map(c => `
            <div onclick="window._ovAvatarCustomizer._selectColor('${c.id}')" id="_ovAC_${c.id}" style="
                width:44px;height:44px;border-radius:12px;cursor:pointer;
                background:${c.gradient};
                border:3px solid ${c.id === cfg.colorId ? '#fff' : 'transparent'};
                transition:transform 0.2s,border-color 0.2s;
                box-shadow:0 4px 12px rgba(0,0,0,0.3);
            " onmouseover="this.style.transform='scale(1.15)'"
               onmouseout="this.style.transform='scale(1)'"
               title="${c.label}"></div>`).join('');

        const iconBtns = OMNIVERSE.avatarIcons.map(ic => `
            <div onclick="window._ovAvatarCustomizer._selectIcon('${ic}')" id="_ovACI_${ic}" style="
                width:44px;height:44px;border-radius:12px;cursor:pointer;
                background:rgba(255,255,255,0.06);
                border:2px solid ${ic === cfg.icon ? '#00BBFF' : 'rgba(255,255,255,0.12)'};
                display:flex;align-items:center;justify-content:center;
                font-size:1.3rem;transition:all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.12)'"
               onmouseout="this.style.background='rgba(255,255,255,0.06)'">${ic}</div>`).join('');

        const overlay = this._createOverlay(9300);
        overlay.innerHTML = `
            <div style="
                background:linear-gradient(160deg,#0a0a1a,#111130);
                border:1px solid rgba(0,187,255,0.2);border-radius:20px;
                width:92%;max-width:420px;color:white;
                font-family:${OMNIVERSE.fonts.body};
                box-shadow:0 0 60px rgba(0,187,255,0.1);overflow:hidden;
            ">
                <div style="padding:22px 24px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#00BBFF;letter-spacing:1px;">🎨 CUSTOMIZE AVATAR</div>
                    <button onclick="window._ovAvatarCustomizer.close()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">✕</button>
                </div>
                <div style="padding:24px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <div id="_ovACPreview" style="display:inline-block;">${AvatarManager.render(80)}</div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <div style="font-size:0.8rem;opacity:0.5;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;font-family:${OMNIVERSE.fonts.display};">Color</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">${colorBtns}</div>
                    </div>
                    <div style="margin-bottom:24px;">
                        <div style="font-size:0.8rem;opacity:0.5;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;font-family:${OMNIVERSE.fonts.display};">Icon</div>
                        <div style="display:grid;grid-template-columns:repeat(5,44px);gap:8px;">${iconBtns}</div>
                    </div>
                    <button onclick="window._ovAvatarCustomizer._save()" style="
                        width:100%;padding:13px;background:linear-gradient(135deg,#0088FF,#005ACC);
                        border:none;border-radius:12px;color:white;font-weight:700;
                        font-size:0.95rem;cursor:pointer;font-family:${OMNIVERSE.fonts.display};letter-spacing:0.5px;
                    ">SAVE AVATAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._el = overlay;
        window._ovAvatarCustomizer = this;
        this._selectedColor = cfg.colorId;
        this._selectedIcon  = cfg.icon;
    }

    _selectColor(id) {
        this._selectedColor = id;
        OMNIVERSE.avatarColors.forEach(c => {
            const el = document.getElementById(`_ovAC_${c.id}`);
            if (el) el.style.borderColor = c.id === id ? '#fff' : 'transparent';
        });
        this._refreshPreview();
    }

    _selectIcon(ic) {
        this._selectedIcon = ic;
        OMNIVERSE.avatarIcons.forEach(i => {
            const el = document.getElementById(`_ovACI_${i}`);
            if (el) el.style.borderColor = i === ic ? '#00BBFF' : 'rgba(255,255,255,0.12)';
        });
        this._refreshPreview();
    }

    _refreshPreview() {
        const el = document.getElementById('_ovACPreview');
        if (!el) return;
        const grad = AvatarManager.getGradient(this._selectedColor);
        el.innerHTML = `<div style="
            width:80px;height:80px;border-radius:22px;background:${grad};
            display:flex;align-items:center;justify-content:center;
            font-size:2rem;color:white;box-shadow:0 4px 20px rgba(0,0,0,0.4);
        ">${this._selectedIcon}</div>`;
    }

    _save() {
        AvatarManager.setConfig(this._selectedColor, this._selectedIcon);
        this.close();
    }
}

// ==================== USER MANAGER ====================
class UserManager {
    constructor() {
        this.currentUser  = null;
        this.sessionStart = Date.now();
        this.init();
    }

    init() {
        const name = Utils.storage.get(OMNIVERSE.storage.userName);
        const type = Utils.storage.get(OMNIVERSE.storage.userType) ?? 'user';
        if (name) {
            this.currentUser = this._buildUser(name, type);
            this._tick();
            setTimeout(() => AchievementManager.checkAll(this.currentUser), 1200);
        }
        return this.currentUser;
    }

    _buildUser(name, type) {
        const isAdmin  = type === 'admin';
        const isMaster = name.toLowerCase() === OMNIVERSE.admin.master;
        const visits   = (Utils.storage.get(OMNIVERSE.storage.visitCount) ?? 0) + 1;
        const level    = this._computeLevel(visits);
        return {
            id: 'u_' + Utils.uid(),
            name: Utils.sanitize(name),
            type, isAdmin, isMaster, level,
            firstVisit: Utils.storage.get(OMNIVERSE.storage.firstVisit) ?? new Date().toISOString(),
            lastVisit:  new Date().toISOString(),
            visitCount: visits,
            stats: this._loadStats(name),
        };
    }

    _tick() {
        if (!this.currentUser) return;
        const { visitCount, name, level } = this.currentUser;
        Utils.storage.set(OMNIVERSE.storage.visitCount, visitCount);
        Utils.storage.set(OMNIVERSE.storage.lastVisit, new Date().toISOString());
        Utils.storage.set(OMNIVERSE.storage.userLevel, level);
        if (!Utils.storage.get(OMNIVERSE.storage.firstVisit))
            Utils.storage.set(OMNIVERSE.storage.firstVisit, new Date().toISOString());
        ActivityLog.add(name, 'session_start');
        Notifications.add('Session Started', `Welcome back, ${name}!`, 'info', '✨');
    }

    _computeLevel(visits) {
        const lvls = Object.entries(OMNIVERSE.levels).reverse();
        for (const [name, cfg] of lvls) { if (visits >= cfg.min) return name; }
        return 'newcomer';
    }

    _loadStats(name) {
        const all = Utils.storage.get(OMNIVERSE.storage.userStats) ?? {};
        if (!all[name]) all[name] = { storiesRead: 0, bookmarks: 0, timeSpent: 0, achievements: [] };
        return all[name];
    }

    saveStats() {
        if (!this.currentUser) return;
        const all = Utils.storage.get(OMNIVERSE.storage.userStats) ?? {};
        all[this.currentUser.name] = this.currentUser.stats;
        Utils.storage.set(OMNIVERSE.storage.userStats, all);
    }

    track(activity) {
        if (!this.currentUser) return;
        const s = this.currentUser.stats;
        if (activity === 'story_read')     { s.storiesRead++; AchievementManager.checkAll(this.currentUser); }
        if (activity === 'bookmark_added') s.bookmarks++;
        s.lastActive = new Date().toISOString();
        this.saveStats();
        ActivityLog.add(this.currentUser.name, activity);
    }

    sessionDuration() { return Date.now() - this.sessionStart; }

    logout(force = false) {
        const doLogout = () => {
            ActivityLog.add(this.currentUser?.name ?? '?', 'logout');
            Utils.storage.remove(OMNIVERSE.storage.userName);
            Utils.storage.remove(OMNIVERSE.storage.userType);
            Toast.show('Logged out. See you soon! 👋', 'info');
            setTimeout(() => location.reload(), 1800);
        };
        if (force) return doLogout();
        Modal.confirm('Logout?', 'Are you sure you want to end your session?').then(ok => { if (ok) doLogout(); });
    }
}

// ==================== USER DASHBOARD ====================
class UserDashboard extends BasePanel {
    constructor(userManager) { super(); this.um = userManager; }

    show() {
        if (!this.um.currentUser) return;
        if (this._el) this.close();
        const u  = this.um.currentUser;
        const s  = u.stats ?? {};
        const lv = OMNIVERSE.levels[u.level] ?? OMNIVERSE.levels.newcomer;
        const xp = AchievementManager.getTotalXP();
        const unlockedCount = AchievementManager.getUnlocked().length;
        const totalCount    = Object.keys(OMNIVERSE.achievements).length;

        const overlay = this._createOverlay(9000);
        overlay.innerHTML = `
            <div id="ovDash" style="
                background:linear-gradient(160deg,#0a0a1a 0%,#111130 100%);
                border:1px solid ${u.isAdmin ? '#FFD70055' : '#00BBFF33'};
                border-radius:20px;width:92%;max-width:1000px;
                max-height:90vh;overflow-y:auto;padding:32px;color:white;
                font-family:${OMNIVERSE.fonts.body};
                box-shadow:0 0 80px ${u.isAdmin ? 'rgba(255,215,0,0.12)' : 'rgba(0,187,255,0.12)'};
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
                    <div>
                        <div style="font-family:${OMNIVERSE.fonts.display};font-size:1.7rem;font-weight:700;
                            color:${u.isAdmin ? '#FFD700' : '#00BBFF'};letter-spacing:1px;">
                            ${u.isAdmin ? '👑 ADMIN DASHBOARD' : '◈ USER DASHBOARD'}
                        </div>
                        <div style="opacity:0.5;font-size:0.82rem;margin-top:4px;font-family:${OMNIVERSE.fonts.mono};">
                            SESSION ${u.id.toUpperCase()}
                        </div>
                    </div>
                    <button onclick="window._ovDash.close()" style="
                        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                        color:white;width:40px;height:40px;border-radius:50%;font-size:1.2rem;
                        cursor:pointer;display:flex;align-items:center;justify-content:center;
                    ">✕</button>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:28px;">
                    ${this._statCard('Visits',       u.visitCount,                        '#00BBFF')}
                    ${this._statCard('Stories Read',  s.storiesRead ?? 0,                '#00CC88')}
                    ${this._statCard('Total XP',      xp,                                '#FFD700')}
                    ${this._statCard('Achievements',  `${unlockedCount}/${totalCount}`,   '#AA66FF', true)}
                    ${this._statCard('Level',         lv.icon + ' ' + u.level,            lv.color,  true)}
                </div>

                <div style="display:grid;grid-template-columns:1fr 300px;gap:22px;">
                    <div style="display:flex;flex-direction:column;gap:22px;">
                        ${this._activitySection(u)}
                        ${this._achievementsSection()}
                        ${this._actionsSection(u)}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:22px;">
                        ${this._profileCard(u, lv)}
                        ${this._systemCard(u)}
                    </div>
                </div>

                <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">
                    <span style="opacity:0.4;font-family:${OMNIVERSE.fonts.mono};font-size:0.8rem;">
                        OMNIVERSE v${OMNIVERSE.version} · ${new Date().toLocaleDateString()}
                    </span>
                    <div style="display:flex;gap:10px;">
                        <button onclick="window.userManager.logout()" style="background:linear-gradient(135deg,#FF4455,#CC0022);border:none;color:white;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.88rem;">🚪 Logout</button>
                        <button onclick="window._ovDash._exportData()" style="background:rgba(0,187,255,0.1);border:1px solid rgba(0,187,255,0.3);color:#00BBFF;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:0.88rem;">💾 Export</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._el = overlay;
        window._ovDash = this;

        const timerEl = overlay.querySelector('#_ovSessionTimer');
        if (timerEl) {
            timerEl.textContent = Utils.formatDuration(this.um.sessionDuration());
            this._tick(() => {
                const el = document.getElementById('_ovSessionTimer');
                if (el) el.textContent = Utils.formatDuration(this.um.sessionDuration());
            }, 1000);
        }
    }

    _statCard(label, value, color, small = false) {
        return `
            <div style="background:${color}14;border:1px solid ${color}44;border-radius:12px;padding:18px 16px;
                transition:transform 0.25s,box-shadow 0.25s;cursor:default;"
                onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px ${color}22'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                <div style="font-size:0.8rem;opacity:0.65;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
                <div style="font-size:${small ? '1rem' : '1.7rem'};font-weight:700;color:${color};
                    ${small ? 'text-transform:capitalize;' : ''}
                    font-family:${OMNIVERSE.fonts.display};">${value}</div>
            </div>`;
    }

    _activitySection(u) {
        const entries = ActivityLog.getForUser(u.name).slice(0, 8);
        const rows = entries.length
            ? entries.map(e => `
                <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.88rem;">${Utils.sanitize(e.action.replace(/_/g,' '))}</span>
                    <span style="font-size:0.78rem;opacity:0.45;font-family:${OMNIVERSE.fonts.mono};">${Utils.timeAgo(e.ts)}</span>
                </div>`).join('')
            : `<div style="opacity:0.4;padding:14px 0;font-size:0.88rem;">No activity yet.</div>`;
        return `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
                <h3 style="margin:0 0 14px;font-family:${OMNIVERSE.fonts.display};font-size:1rem;color:#00BBFF;letter-spacing:1px;">▸ RECENT ACTIVITY</h3>
                <div style="max-height:200px;overflow-y:auto;">${rows}</div>
            </div>`;
    }

    _achievementsSection() {
        const unlocked = AchievementManager.getUnlocked();
        const all      = Object.entries(OMNIVERSE.achievements);
        const cards    = all.map(([id, def]) => {
            const done = unlocked.includes(id);
            return `
                <div style="
                    padding:12px;border-radius:10px;
                    background:${done ? def.icon === '🌟' ? 'rgba(255,215,0,0.08)' : 'rgba(0,204,136,0.07)' : 'rgba(255,255,255,0.03)'};
                    border:1px solid ${done ? 'rgba(0,204,136,0.25)' : 'rgba(255,255,255,0.07)'};
                    opacity:${done ? '1' : '0.45'};
                    transition:opacity 0.2s;display:flex;gap:10px;align-items:center;
                " title="${def.desc}">
                    <span style="font-size:1.4rem;">${def.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${def.title}</div>
                        <div style="font-size:0.72rem;opacity:0.55;">+${def.xp} XP</div>
                    </div>
                    ${done ? '<span style="font-size:0.7rem;color:#00CC88;">✓</span>' : ''}
                </div>`;
        }).join('');

        return `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
                <h3 style="margin:0 0 14px;font-family:${OMNIVERSE.fonts.display};font-size:1rem;color:#FFD700;letter-spacing:1px;">▸ ACHIEVEMENTS (${unlocked.length}/${all.length})</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;max-height:240px;overflow-y:auto;">${cards}</div>
            </div>`;
    }

    _actionsSection(u) {
        const adminBtn = u.isAdmin
            ? `<button onclick="window._ovAdminPanel.show();window._ovDash.close();" class="_ovBtn" style="background:linear-gradient(135deg,#FFD700,#FFAA00);color:#000;">👑 Admin Panel</button>`
            : '';

        const fabVisible = document.getElementById('_ovFAB') && document.getElementById('_ovFAB').style.opacity !== '0';
        const toggleIconText = fabVisible ? '🙈 Hide Icons' : '👁️ Show Icons';

        return `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
                <h3 style="margin:0 0 14px;font-family:${OMNIVERSE.fonts.display};font-size:1rem;color:#00BBFF;letter-spacing:1px;">▸ QUICK ACTIONS</h3>
                <div style="display:flex;flex-wrap:wrap;gap:10px;">
                    <button onclick="window._ovDash._changeName()" class="_ovBtn" style="background:linear-gradient(135deg,#0088FF,#005ACC);">✏️ Change Name</button>
                    <button onclick="window._ovDash._toggleTheme()" class="_ovBtn" style="background:linear-gradient(135deg,#6633CC,#4400AA);">🌙 Theme</button>
                    <button onclick="window._ovAvatarCustomizer.show()" class="_ovBtn" style="background:linear-gradient(135deg,#FF44AA,#CC0066);">🎨 Avatar</button>
                    <button onclick="window._ovNotifCenter.show();window._ovDash.close();" class="_ovBtn" style="background:linear-gradient(135deg,#00BBFF,#0055AA);">🔔 Notifications</button>
                    <button onclick="window.toggleFABs()" id="_ovToggleIconsBtn" class="_ovBtn" style="background:linear-gradient(135deg,#AA66FF,#7722CC);">${toggleIconText}</button>
                    ${adminBtn}
                </div>
            </div>
            <style>
                ._ovBtn{border:none;color:white;padding:11px 18px;border-radius:9px;cursor:pointer;
                    font-weight:600;font-size:0.88rem;transition:transform 0.15s,opacity 0.15s;font-family:${OMNIVERSE.fonts.body};}
                ._ovBtn:hover{transform:scale(1.04);opacity:0.92;}
            </style>`;
    }

    _profileCard(u, lv) {
        const gradient = u.isAdmin
            ? 'linear-gradient(135deg,#FFD700,#FFAA00)'
            : `linear-gradient(135deg,${lv.color},#0055AA)`;
        const cfg = AvatarManager.getConfig();
        const avatarGrad = u.isAdmin ? gradient : AvatarManager.getGradient(cfg.colorId);
        const avatarIcon = u.isAdmin ? '👑' : cfg.icon;

        return `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;text-align:center;">
                <div style="
                    width:80px;height:80px;border-radius:22px;
                    background:${avatarGrad};
                    display:flex;align-items:center;justify-content:center;
                    margin:0 auto 14px;font-size:2rem;
                    color:${u.isAdmin ? '#000' : '#fff'};
                    border:3px solid ${u.isAdmin ? '#FFD700' : lv.color};
                    box-shadow:0 0 20px ${u.isAdmin ? 'rgba(255,215,0,0.3)' : lv.color + '44'};
                    cursor:pointer;transition:transform 0.2s;
                " onclick="window._ovAvatarCustomizer.show()"
                   onmouseover="this.style.transform='scale(1.07)'" onmouseout="this.style.transform='scale(1)'"
                   title="Click to customize">${avatarIcon}</div>
                <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${Utils.sanitize(u.name)}</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
                    <span style="background:${u.isAdmin ? 'rgba(255,215,0,0.15)' : 'rgba(0,187,255,0.15)'};
                        color:${u.isAdmin ? '#FFD700' : '#00BBFF'};
                        padding:3px 12px;border-radius:20px;font-size:0.78rem;font-weight:700;">
                        ${u.isAdmin ? '👑 ADMIN' : '◈ USER'}
                    </span>
                    <span style="background:${lv.color}22;color:${lv.color};padding:3px 12px;border-radius:20px;font-size:0.78rem;text-transform:uppercase;">
                        ${lv.icon} ${u.level}
                    </span>
                </div>
                <div style="opacity:0.45;font-size:0.8rem;font-family:${OMNIVERSE.fonts.mono};">
                    Since ${Utils.formatDate(u.firstVisit)}
                </div>
            </div>`;
    }

    _systemCard(u) {
        const onlineNow = OMNIVERSE._onlineBase + Math.floor(Math.random() * 4) - 1;
        return `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
                <h3 style="margin:0 0 14px;font-family:${OMNIVERSE.fonts.display};font-size:1rem;color:#00BBFF;letter-spacing:1px;">▸ SYSTEM</h3>
                <div style="font-family:${OMNIVERSE.fonts.mono};font-size:0.8rem;">
                    ${this._sysRow('Session',  `<span id="_ovSessionTimer">00:00:00</span>`)}
                    ${this._sysRow('Online',   `<span style="color:#00CC88">● ${onlineNow} users</span>`)}
                    ${this._sysRow('Network',  navigator.onLine ? '<span style="color:#00CC88">Online ●</span>' : '<span style="color:#FF4455">Offline ●</span>')}
                    ${this._sysRow('Version',  OMNIVERSE.version)}
                    ${this._sysRow('Visits',   u.visitCount)}
                </div>
            </div>`;
    }

    _sysRow(label, value) {
        return `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="opacity:0.5;">${label}</span><span>${value}</span>
        </div>`;
    }

    _toggleTheme() {
        const t = (Utils.storage.get(OMNIVERSE.storage.theme) ?? 'dark') === 'dark' ? 'light' : 'dark';
        Utils.storage.set(OMNIVERSE.storage.theme, t);
        document.documentElement.setAttribute('data-ov-theme', t);
        applyThemeStyles(t);
        AchievementManager.unlock('theme_switch');
        Toast.show(`Switched to ${t} mode`, 'info');
    }

    _changeName() {
        this.close();
        Utils.storage.remove(OMNIVERSE.storage.userName);
        Utils.storage.remove(OMNIVERSE.storage.userType);
        initAuth();
    }

    _exportData() {
        const u    = this.um.currentUser;
        const data = {
            profile:      u,
            achievements: AchievementManager.getUnlocked(),
            activityLog:  ActivityLog.getForUser(u.name),
            notifications:Notifications.getAll(),
            exportedAt:   new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a    = Object.assign(document.createElement('a'), {
            href:     URL.createObjectURL(blob),
            download: `omniverse-${u.name}-${Date.now()}.json`,
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        Toast.show('Data exported!', 'success');
    }
}

// ==================== ADMIN PANEL ====================
class AdminPanel extends BasePanel {
    constructor(userManager) { super(); this.um = userManager; }

    show() {
        if (!this.um.currentUser?.isAdmin) { Toast.show('Admin access required', 'error'); return; }
        if (this._el) this.close();
        const u = this.um.currentUser;

        const overlay = this._createOverlay(9500);
        overlay.innerHTML = `
            <div id="ovAdmin" style="
                background:linear-gradient(160deg,#0a0a16 0%,#10101e 100%);
                border:2px solid #FFD70033;border-radius:22px;
                width:96%;max-width:1180px;max-height:92vh;overflow:hidden;
                display:flex;flex-direction:column;color:white;font-family:${OMNIVERSE.fonts.body};
                box-shadow:0 0 100px rgba(255,215,0,0.1);
            ">
                <div style="padding:24px 32px;display:flex;align-items:center;gap:16px;border-bottom:1px solid rgba(255,215,0,0.1);flex-shrink:0;">
                    <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#FFD700,#FFAA00);display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 4px 20px rgba(255,215,0,0.4);">👑</div>
                    <div>
                        <div style="font-family:${OMNIVERSE.fonts.display};font-size:1.4rem;font-weight:700;color:#FFD700;letter-spacing:1px;">ADMIN CONTROL CENTER</div>
                        <div style="opacity:0.45;font-size:0.8rem;font-family:${OMNIVERSE.fonts.mono};">${Utils.sanitize(u.name)} ${u.isMaster ? '· MASTER' : ''} · ${new Date().toLocaleTimeString()}</div>
                    </div>
                    <button onclick="window._ovAdminPanel.close()" style="margin-left:auto;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
                </div>
                <div style="display:flex;flex:1;overflow:hidden;">
                    <nav style="width:180px;flex-shrink:0;padding:20px 12px;border-right:1px solid rgba(255,215,0,0.08);display:flex;flex-direction:column;gap:4px;">
                        ${this._tab('dashboard', '▤',  'Dashboard', true)}
                        ${this._tab('users',     '◉',  'Users',     false)}
                        ${this._tab('analytics', '▲',  'Analytics', false)}
                        ${this._tab('activity',  '◷',  'Activity',  false)}
                        ${this._tab('security',  '◈',  'Security',  false)}
                        ${u.isMaster ? this._tab('system', '⚙', 'System', false) : ''}
                    </nav>
                    <div id="_ovAdminContent" style="flex:1;overflow-y:auto;padding:28px 32px;"></div>
                </div>
                <div style="padding:12px 32px;border-top:1px solid rgba(255,215,0,0.08);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;opacity:0.6;font-size:0.78rem;font-family:${OMNIVERSE.fonts.mono};">
                    <span style="color:#00CC88">● SYSTEM OPERATIONAL</span>
                    <span>UPDATED <span id="_ovAdminClock">${new Date().toLocaleTimeString()}</span></span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._el = overlay;
        window._ovAdminPanel = this;

        this._tick(() => {
            const el = document.getElementById('_ovAdminClock');
            if (el) el.textContent = new Date().toLocaleTimeString();
        }, 10_000);

        this._loadTab('dashboard');
        this._bindTabs();
    }

    _tab(id, icon, label, active) {
        return `<button data-tab="${id}" style="
            background:${active ? 'rgba(255,215,0,0.12)' : 'transparent'};
            border:none;color:${active ? '#FFD700' : 'rgba(255,255,255,0.55)'};
            padding:11px 14px;border-radius:10px;cursor:pointer;
            font-family:${OMNIVERSE.fonts.display};font-size:0.88rem;font-weight:600;letter-spacing:0.5px;
            display:flex;align-items:center;gap:10px;text-align:left;width:100%;
            transition:background 0.2s,color 0.2s;
            border-left:3px solid ${active ? '#FFD700' : 'transparent'};
        "><span>${icon}</span>${label}</button>`;
    }

    _bindTabs() {
        const tabs = this._el.querySelectorAll('[data-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => { t.style.background='transparent'; t.style.color='rgba(255,255,255,0.55)'; t.style.borderLeftColor='transparent'; });
                tab.style.background='rgba(255,215,0,0.12)'; tab.style.color='#FFD700'; tab.style.borderLeftColor='#FFD700';
                this._loadTab(tab.dataset.tab);
            });
        });
    }

    _loadTab(name) {
        const el = document.getElementById('_ovAdminContent');
        if (!el) return;
        const map = {
            dashboard: () => this._renderDashboard(),
            users:     () => this._renderUsers(),
            analytics: () => this._renderAnalytics(),
            activity:  () => this._renderActivity(),
            security:  () => this._renderSecurity(),
            system:    () => this._renderSystem(),
        };
        el.innerHTML = map[name] ? map[name]() : '';
        if (name === 'users') this._bindUserSearch();
    }

    _loadTabPublic(name) {
        const tabs = this._el.querySelectorAll('[data-tab]');
        tabs.forEach(t => {
            const active = t.dataset.tab === name;
            t.style.background     = active ? 'rgba(255,215,0,0.12)' : 'transparent';
            t.style.color          = active ? '#FFD700' : 'rgba(255,255,255,0.55)';
            t.style.borderLeftColor= active ? '#FFD700' : 'transparent';
        });
        this._loadTab(name);
    }

    _renderDashboard() {
        const totalVisits  = Utils.storage.get(OMNIVERSE.storage.visitCount) ?? 0;
        const allStats     = Utils.storage.get(OMNIVERSE.storage.userStats) ?? {};
        const totalStories = Object.values(allStats).reduce((a, v) => a + (v.storiesRead ?? 0), 0);
        const onlineNow    = OMNIVERSE._onlineBase + Math.floor(Math.random() * 6) - 2;

        return `
            <h2 style="margin:0 0 24px;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">SYSTEM OVERVIEW</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:28px;">
                ${this._aStatCard('Total Visits',  totalVisits,                       '#00BBFF')}
                ${this._aStatCard('Stories Read',  totalStories,                      '#00CC88')}
                ${this._aStatCard('Online Now',    `${onlineNow} users`,              '#AA66FF', true)}
                ${this._aStatCard('Users',         Object.keys(allStats).length,      '#FFAA00')}
                ${this._aStatCard('Uptime',        '99.9%',                           '#00CC88', true)}
            </div>
            ${this._sectionBox('⚡ Quick Actions', `
                <div style="display:flex;flex-wrap:wrap;gap:10px;">
                    <button onclick="window._ovAdminPanel._loadTabPublic('users')" class="_ovABtn" style="background:linear-gradient(135deg,#0088FF,#005ACC);">◉ Users</button>
                    <button onclick="window._ovAdminPanel.runSecurityScan()" class="_ovABtn" style="background:linear-gradient(135deg,#00AA66,#007744);">◈ Security Scan</button>
                    <button onclick="window._ovAdminPanel._loadTabPublic('activity')" class="_ovABtn" style="background:linear-gradient(135deg,#FF8800,#CC5500);">◷ Activity</button>
                </div>
                <style>._ovABtn{border:none;color:white;padding:11px 18px;border-radius:9px;cursor:pointer;font-weight:600;font-size:0.88rem;font-family:${OMNIVERSE.fonts.body};}</style>
            `)}`;
    }

    _renderUsers() {
        const stats = Utils.storage.get(OMNIVERSE.storage.userStats) ?? {};
        const rows  = Object.keys(stats).map(name => {
            const s  = stats[name];
            const lv = OMNIVERSE.levels[s.level ?? 'newcomer'] ?? OMNIVERSE.levels.newcomer;
            return `
                <tr data-name="${Utils.sanitize(name)}" style="border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px 8px;display:flex;align-items:center;gap:10px;">
                        <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#00BBFF,#0055AA);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:white;">${name.charAt(0).toUpperCase()}</div>
                        <span style="font-weight:500;">${Utils.sanitize(name)}</span>
                    </td>
                    <td style="padding:12px 8px;"><span style="background:${lv.color}22;color:${lv.color};padding:3px 10px;border-radius:20px;font-size:0.78rem;text-transform:capitalize;">${lv.icon} ${s.level ?? 'newcomer'}</span></td>
                    <td style="padding:12px 8px;font-family:${OMNIVERSE.fonts.mono};opacity:0.7;">${s.storiesRead ?? 0}</td>
                    <td style="padding:12px 8px;opacity:0.5;font-size:0.8rem;">${Utils.timeAgo(s.lastActive)}</td>
                </tr>`;
        });

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
                <h2 style="margin:0;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">USER REGISTRY</h2>
                <input id="_ovUserSearch" placeholder="Search users…" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:white;padding:9px 14px;border-radius:9px;font-size:0.88rem;outline:none;width:200px;font-family:${OMNIVERSE.fonts.body};">
            </div>
            <div style="overflow-x:auto;">
                <table id="_ovUserTable" style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:rgba(255,215,0,0.06);">
                        ${['User','Level','Stories','Last Active'].map(h => `<th style="padding:12px 8px;text-align:left;opacity:0.5;font-size:0.78rem;letter-spacing:0.5px;font-family:${OMNIVERSE.fonts.display};">${h}</th>`).join('')}
                    </tr></thead>
                    <tbody>${rows.length ? rows.join('') : `<tr><td colspan="4" style="padding:24px;opacity:0.4;text-align:center;">No user data.</td></tr>`}</tbody>
                </table>
            </div>`;
    }

    _bindUserSearch() {
        const input = document.getElementById('_ovUserSearch');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase();
            document.querySelectorAll('#_ovUserTable tbody tr[data-name]').forEach(row => {
                row.style.display = row.dataset.name.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    _renderAnalytics() {
        const bars = [42, 68, 55, 78, 90, 65, 88].map((h, i) => `
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;">
                <div style="height:${h * 1.8}px;width:100%;max-width:36px;background:linear-gradient(180deg,#00BBFF,#0055AA);border-radius:6px 6px 0 0;opacity:0.85;"></div>
                <span style="font-size:0.72rem;opacity:0.5;font-family:${OMNIVERSE.fonts.mono};">D${i+1}</span>
            </div>`).join('');

        return `
            <h2 style="margin:0 0 24px;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">ANALYTICS</h2>
            ${this._sectionBox('Traffic (Last 7 Days)', `<div style="display:flex;align-items:flex-end;gap:8px;height:180px;padding:10px 0;">${bars}</div>`)}
            <div style="height:18px;"></div>
            ${this._sectionBox('User Level Breakdown', `
                ${Object.entries(OMNIVERSE.levels).map(([name, cfg]) => {
                    const pct = Math.round(Math.random() * 40 + 5);
                    return `<div style="margin-bottom:14px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.84rem;">
                            <span>${cfg.icon} ${name}</span>
                            <span style="opacity:0.5;font-family:${OMNIVERSE.fonts.mono};">${pct}%</span>
                        </div>
                        <div style="height:7px;background:rgba(255,255,255,0.07);border-radius:4px;">
                            <div style="width:${pct}%;height:100%;background:${cfg.color};border-radius:4px;"></div>
                        </div>
                    </div>`;
                }).join('')}
            `)}`;
    }

    _renderActivity() {
        const log  = ActivityLog.getAll();
        const rows = log.length
            ? log.map(e => `
                <div style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:center;">
                    <span style="font-weight:600;color:#00BBFF;">${Utils.sanitize(e.user)}</span>
                    <span style="font-size:0.85rem;">${Utils.sanitize(e.action.replace(/_/g,' '))}</span>
                    <span style="opacity:0.4;font-family:${OMNIVERSE.fonts.mono};font-size:0.78rem;text-align:right;">${Utils.timeAgo(e.ts)}</span>
                </div>`).join('')
            : `<div style="opacity:0.4;padding:24px 0;text-align:center;">No activity recorded.</div>`;

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
                <h2 style="margin:0;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">ACTIVITY LOG</h2>
                <button onclick="window._ovAdminPanel._clearActivity()" style="background:rgba(255,68,85,0.1);border:1px solid rgba(255,68,85,0.3);color:#FF4455;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.82rem;">Clear Log</button>
            </div>
            <div style="max-height:480px;overflow-y:auto;">${rows}</div>`;
    }

    _clearActivity() {
        Modal.confirm('Clear Activity Log', 'Delete all activity? This cannot be undone.').then(ok => {
            if (!ok) return;
            Utils.storage.remove(OMNIVERSE.storage.activityLog);
            Toast.show('Activity log cleared.', 'success');
            this._loadTab('activity');
        });
    }

    _renderSecurity() {
        return `
            <h2 style="margin:0 0 24px;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">SECURITY CENTER</h2>
            <div style="background:rgba(0,204,136,0.08);border:1px solid rgba(0,204,136,0.25);border-radius:14px;padding:20px;margin-bottom:22px;display:flex;align-items:center;gap:16px;">
                <div style="font-size:2rem;">✓</div>
                <div>
                    <div style="font-weight:700;color:#00CC88;margin-bottom:4px;">All Systems Secure</div>
                    <div style="font-size:0.84rem;opacity:0.7;">No threats detected. Auth & validation layers active.</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:22px;">
                ${this._aStatCard('Failed Logins', OMNIVERSE.security._attempts,         '#FF4455')}
                ${this._aStatCard('Max Attempts',  OMNIVERSE.security.maxAttempts,       '#FFAA00')}
                ${this._aStatCard('Cooldown (s)',  OMNIVERSE.security.cooldownMs / 1000, '#00BBFF')}
                ${this._aStatCard('Name Rules',    '2–20 chars',                         '#AA66FF', true)}
            </div>
            ${this._sectionBox('Security Rules Active', `
                <ul style="margin:0;padding-left:18px;opacity:0.8;line-height:2;font-size:0.88rem;">
                    <li>AI/bot usernames blocked via regex</li>
                    <li>Max ${OMNIVERSE.security.maxAttempts} login attempts before cooldown</li>
                    <li>Name sanitization prevents XSS injection</li>
                    <li>Admin names require password verification</li>
                    <li>All activity logged with timestamps</li>
                </ul>
            `)}
            <div style="height:14px;"></div>
            <button onclick="window._ovAdminPanel.runSecurityScan()" style="background:linear-gradient(135deg,#00AA66,#007744);border:none;color:white;padding:12px 24px;border-radius:10px;cursor:pointer;font-weight:600;font-family:${OMNIVERSE.fonts.body};">◈ Run Security Scan</button>`;
    }

    _renderSystem() {
        return `
            <h2 style="margin:0 0 24px;font-family:${OMNIVERSE.fonts.display};font-size:1.2rem;color:#FFD700;letter-spacing:1px;">SYSTEM CONTROL</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:22px;">
                ${this._systemControl('🔄 Restart',       'Reload all services',   'linear-gradient(135deg,#0088FF,#005ACC)', 'window._ovAdminPanel.restartSystem()')}
                ${this._systemControl('🧹 Clear Cache',   'Flush cached data',     'linear-gradient(135deg,#00AA66,#007744)', 'window._ovAdminPanel.clearCache()')}
                ${this._systemControl('📊 Reset Analytics','Wipe analytics data',  'linear-gradient(135deg,#FF8800,#CC5500)', 'window._ovAdminPanel.resetAnalytics()')}
            </div>
            <div style="background:rgba(255,68,85,0.08);border:1px solid rgba(255,68,85,0.25);border-radius:14px;padding:20px;">
                <div style="font-weight:700;color:#FF4455;margin-bottom:8px;">⚠ Danger Zone</div>
                <p style="opacity:0.7;font-size:0.88rem;margin:0 0 16px;">These actions are permanent and irreversible.</p>
                <div style="display:flex;gap:10px;">
                    <button onclick="window._ovAdminPanel.resetSystem()" style="background:rgba(255,68,85,0.15);border:1px solid rgba(255,68,85,0.4);color:#FF4455;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:600;">Reset System</button>
                    <button onclick="window._ovAdminPanel.deleteAllData()" style="background:rgba(255,68,85,0.15);border:1px solid rgba(255,68,85,0.4);color:#FF4455;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:600;">Delete All Data</button>
                </div>
            </div>`;
    }

    _aStatCard(label, value, color, small = false) {
        return `<div style="background:${color}12;border:1px solid ${color}33;border-radius:12px;padding:18px 16px;">
            <div style="font-size:0.78rem;opacity:0.55;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
            <div style="font-size:${small ? '1rem' : '1.6rem'};font-weight:700;color:${color};font-family:${OMNIVERSE.fonts.display};">${value}</div>
        </div>`;
    }

    _sectionBox(title, content) {
        return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:22px;">
            <h4 style="margin:0 0 16px;font-family:${OMNIVERSE.fonts.display};font-size:0.88rem;color:#FFD700;letter-spacing:1px;text-transform:uppercase;">${title}</h4>
            ${content}
        </div>`;
    }

    _systemControl(title, desc, bg, onclick) {
        return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
            <div style="font-weight:700;margin-bottom:6px;">${title}</div>
            <div style="font-size:0.84rem;opacity:0.6;margin-bottom:16px;">${desc}</div>
            <button onclick="${onclick}" style="width:100%;background:${bg};border:none;color:white;padding:11px;border-radius:9px;cursor:pointer;font-weight:600;font-family:${OMNIVERSE.fonts.body};">Execute</button>
        </div>`;
    }

    runSecurityScan() {
        Toast.show('Running security scan…', 'info');
        setTimeout(() => Toast.show('Scan complete. No threats found. ✓', 'success'), 2500);
        ActivityLog.add(this.um.currentUser?.name ?? 'admin', 'security_scan');
    }

    restartSystem() {
        Modal.confirm('Restart System?', 'All services will reload.').then(ok => {
            if (!ok) return;
            Toast.show('Restarting…', 'warning');
            ActivityLog.add(this.um.currentUser?.name ?? 'admin', 'system_restart');
            setTimeout(() => location.reload(), 2000);
        });
    }

    clearCache() {
        Modal.confirm('Clear Cache?', 'Cached data will be removed.').then(ok => {
            if (!ok) return;
            localStorage.removeItem('omniverse_cache');
            Toast.show('Cache cleared!', 'success');
        });
    }

    resetAnalytics() {
        Modal.confirm('Reset Analytics?', 'All analytics data will be wiped.').then(ok => {
            if (!ok) return;
            localStorage.removeItem('omniverse_analytics');
            Toast.show('Analytics reset.', 'success');
        });
    }

    resetSystem() {
        Modal.confirm('⚠ Reset System?', 'This will wipe ALL system data. Are you absolutely sure?').then(ok => {
            if (!ok) return;
            const typed = prompt('Type RESET to confirm:');
            if (typed !== 'RESET') { Toast.show('Reset cancelled.', 'info'); return; }
            Utils.storage.clear();
            Toast.show('System reset. Reloading…', 'warning');
            setTimeout(() => location.reload(), 2000);
        });
    }

    deleteAllData() {
        Modal.confirm('⚠ Delete ALL User Data?', 'This is permanent and cannot be undone.').then(ok => {
            if (!ok) return;
            const typed = prompt('Type DELETE ALL to confirm:');
            if (typed !== 'DELETE ALL') { Toast.show('Deletion cancelled.', 'info'); return; }
            localStorage.clear();
            Toast.show('All data deleted. Reloading…', 'error');
            setTimeout(() => location.reload(), 2000);
        });
    }
}

// ==================== THEME APPLIER ====================
function applyThemeStyles(theme) {
    document.documentElement.setAttribute('data-ov-theme', theme);
    document.body.setAttribute('data-ov-theme', theme);
}

// ==================== FAKE USER GENERATOR ====================
function generateFakeUsers() {
    const stats = Utils.storage.get(OMNIVERSE.storage.userStats) ?? {};
    if (Object.keys(stats).length > 2) return;

    const fakeNames = [
        'Orion', 'Lyra', 'Nova', 'Atlas', 'Vega', 'Polaris',
        'Sirius', 'Aurora', 'Zenith', 'Cosmo', 'Stella', 'Lunar'
    ];
    fakeNames.forEach(name => {
        if (stats[name]) return;
        const visits = Math.floor(Math.random() * 40) + 1;
        const level = (() => {
            if (visits >= 50) return 'legend';
            if (visits >= 20) return 'veteran';
            if (visits >= 10) return 'regular';
            if (visits >= 5) return 'explorer';
            return 'newcomer';
        })();
        stats[name] = {
            storiesRead: Math.floor(Math.random() * 30),
            bookmarks: Math.floor(Math.random() * 10),
            timeSpent: Math.floor(Math.random() * 10000),
            level: level,
            lastActive: new Date(Date.now() - Math.random() * 7*24*60*60*1000).toISOString(),
        };
    });

    const log = ActivityLog.getAll();
    fakeNames.slice(0, 5).forEach(name => {
        if (!log.some(e => e.user === name)) {
            ActivityLog.add(name, 'session_start');
            ActivityLog.add(name, 'story_read');
        }
    });

    Utils.storage.set(OMNIVERSE.storage.userStats, stats);
    OMNIVERSE._onlineBase = Math.floor(Math.random() * 12) + 15;
}

// ==================== FLOATING FAB — SCROLL-AWARE ====================
// FABs are fixed-position but slide out when the user scrolls UP (away from
// the bottom of the page) and slide back in when they scroll DOWN or reach
// the very top.  A manual "Hide Icons" toggle still works on top of this.

let _fabScrollY      = 0;       // last known scroll position
let _fabHiddenByUser = false;   // true when the user manually hid the buttons

function _fabSetVisible(visible) {
    const fab      = document.getElementById('_ovFAB');
    const notifFab = document.getElementById('_ovNotifFAB');
    if (!fab || !notifFab) return;

    const ty = visible ? '0' : '120px';   // slide down off-screen when hiding
    const op = visible ? '1' : '0';
    const pe = visible ? 'all' : 'none';

    [fab, notifFab].forEach(el => {
        el.style.transform       = `translateY(${ty})`;
        el.style.opacity         = op;
        el.style.pointerEvents   = pe;
    });
}

function _setupFabScrollBehaviour() {
    // Remove any previous listener to avoid duplicates
    window.removeEventListener('scroll', window._ovFabScrollHandler);

    window._ovFabScrollHandler = () => {
        if (_fabHiddenByUser) return;   // respect manual hide

        const currentY  = window.scrollY;
        const scrollingUp = currentY < _fabScrollY;
        const atTop       = currentY < 80;

        // Hide when scrolling UP (going back toward hero), show when scrolling
        // DOWN (going deeper into page) or when at the very top.
        if (atTop || !scrollingUp) {
            _fabSetVisible(true);
        } else {
            _fabSetVisible(false);
        }

        _fabScrollY = currentY;
    };

    window.addEventListener('scroll', window._ovFabScrollHandler, { passive: true });
}

function createFAB() {
    document.getElementById('_ovFAB')?.remove();
    document.getElementById('_ovNotifFAB')?.remove();

    const um = window.userManager;
    if (!um?.currentUser) return;
    const u     = um.currentUser;
    const color  = u.isAdmin ? '#FFD700' : '#00BBFF';
    const glow   = u.isAdmin ? 'rgba(255,215,0,0.5)' : 'rgba(0,187,255,0.5)';
    const cfg    = AvatarManager.getConfig();
    const avGrad = u.isAdmin ? 'linear-gradient(135deg,#FFD700,#FFAA00)' : AvatarManager.getGradient(cfg.colorId);
    const avIcon = u.isAdmin ? '👑' : cfg.icon;

    // ── Main FAB ─────────────────────────────────────────────
    const fab = document.createElement('div');
    fab.id = '_ovFAB';
    // Use fixed positioning but with CSS transition for smooth slide
    fab.style.cssText = `
        position:fixed;bottom:28px;left:28px;z-index:9998;
        transition:transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease;
    `;
    fab.innerHTML = `
        <div id="_ovFABBtn" style="
            width:60px;height:60px;border-radius:18px;
            background:${avGrad};
            display:flex;align-items:center;justify-content:center;
            font-size:1.6rem;cursor:pointer;user-select:none;
            box-shadow:0 8px 32px ${glow};
            transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s;
            animation:ovFABPulse 3s infinite;
        ">${avIcon}</div>
        <div id="_ovFABTip" style="
            position:absolute;bottom:72px;left:0;
            background:#0a0a1a;border:1px solid ${color}44;color:${color};
            padding:8px 14px;border-radius:10px;font-size:0.82rem;white-space:nowrap;pointer-events:none;
            font-family:${OMNIVERSE.fonts.display};letter-spacing:0.5px;
            opacity:0;transform:translateY(6px);transition:opacity 0.2s,transform 0.2s;
        ">${u.isAdmin ? '👑 Admin Panel' : '◈ Dashboard'}</div>
        <style>
            @keyframes ovFABPulse {
                0%,100%{box-shadow:0 8px 32px ${glow},0 0 0 0 ${glow};}
                50%{box-shadow:0 8px 32px ${glow},0 0 0 8px transparent;}
            }
        </style>
    `;
    document.body.appendChild(fab);
    const btn = fab.querySelector('#_ovFABBtn');
    const tip = fab.querySelector('#_ovFABTip');
    btn.addEventListener('mouseenter', () => { btn.style.transform='scale(1.15) rotate(-5deg)'; tip.style.opacity='1'; tip.style.transform='translateY(0)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform='scale(1)'; tip.style.opacity='0'; tip.style.transform='translateY(6px)'; });
    btn.addEventListener('click', () => { if (u.isAdmin) window._ovAdminPanel?.show(); else window._ovDash?.show(); });

    // ── Notification Bell FAB ────────────────────────────────
    const notifFAB = document.createElement('div');
    notifFAB.id = '_ovNotifFAB';
    notifFAB.style.cssText = `
        position:fixed;bottom:100px;left:28px;z-index:9997;
        transition:transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease;
    `;
    const unreadCount = Notifications.getUnread().length;
    notifFAB.innerHTML = `
        <div style="position:relative;width:48px;height:48px;">
            <div id="_ovNotifBtn" style="
                width:48px;height:48px;border-radius:14px;
                background:rgba(0,187,255,0.12);border:1px solid rgba(0,187,255,0.3);
                display:flex;align-items:center;justify-content:center;
                font-size:1.3rem;cursor:pointer;
                transition:transform 0.2s,background 0.2s;
                backdrop-filter:blur(10px);
            ">🔔</div>
            <div id="_ovNotifBadge" style="
                position:absolute;top:-6px;right:-6px;
                background:#FF4455;color:white;
                min-width:20px;height:20px;border-radius:10px;
                display:${unreadCount > 0 ? 'flex' : 'none'};
                align-items:center;justify-content:center;
                font-size:0.68rem;font-weight:700;padding:0 4px;
                font-family:${OMNIVERSE.fonts.mono};
                border:2px solid #0a0a1a;
            ">${unreadCount > 9 ? '9+' : unreadCount}</div>
        </div>
    `;
    document.body.appendChild(notifFAB);
    notifFAB.querySelector('#_ovNotifBtn').addEventListener('click', () => window._ovNotifCenter.show());
    notifFAB.querySelector('#_ovNotifBtn').addEventListener('mouseenter', function(){ this.style.transform='scale(1.1)'; this.style.background='rgba(0,187,255,0.22)'; });
    notifFAB.querySelector('#_ovNotifBtn').addEventListener('mouseleave', function(){ this.style.transform='scale(1)'; this.style.background='rgba(0,187,255,0.12)'; });

    // Reset scroll tracking and wire up scroll behaviour
    _fabScrollY = window.scrollY;
    _fabHiddenByUser = false;
    _setupFabScrollBehaviour();
}

// ==================== TOGGLE FAB VISIBILITY ====================
window.toggleFABs = function() {
    const fab      = document.getElementById('_ovFAB');
    const notifFab = document.getElementById('_ovNotifFAB');
    if (!fab || !notifFab) return;

    // If currently visible (opacity 1) → hide; otherwise → show
    const isVisible = fab.style.opacity !== '0';
    _fabHiddenByUser = isVisible;   // lock scroll-hide when user manually hides
    _fabSetVisible(!isVisible);

    const btn = document.getElementById('_ovToggleIconsBtn');
    if (btn) btn.textContent = isVisible ? '👁️ Show Icons' : '🙈 Hide Icons';

    Toast.show(isVisible ? 'Icons hidden' : 'Icons shown', 'info');
};

// ==================== AUTH ====================
function initAuth() {
    const sec = OMNIVERSE.security;
    if (Date.now() < sec._lockedUntil) {
        const wait = Math.ceil((sec._lockedUntil - Date.now()) / 1000);
        Toast.show(`Too many attempts. Wait ${wait}s.`, 'error'); return;
    }
    const existing = localStorage.getItem(OMNIVERSE.storage.userName);
    if (existing) { Toast.show(`Already signed in as ${existing}. Ctrl+Shift+L to logout.`, 'info'); return; }

    const overlay = document.createElement('div');
    overlay.id = '_ovAuth';
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.96);
        display:flex;align-items:center;justify-content:center;
        backdrop-filter:blur(20px);animation:ovFadeIn 0.3s ease;
    `;
    overlay.innerHTML = `
        <div style="
            background:linear-gradient(160deg,#09091a 0%,#111128 100%);
            border:1px solid rgba(0,187,255,0.2);border-radius:22px;
            width:92%;max-width:440px;padding:44px 36px;text-align:center;
            font-family:${OMNIVERSE.fonts.body};
            box-shadow:0 0 80px rgba(0,187,255,0.1),0 40px 80px rgba(0,0,0,0.8);
        ">
            <div style="width:72px;height:72px;margin:0 auto 24px;border-radius:20px;background:linear-gradient(135deg,#00BBFF,#0055CC);display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 8px 32px rgba(0,187,255,0.4);">◈</div>
            <h2 style="margin:0 0 6px;font-family:${OMNIVERSE.fonts.display};font-size:1.8rem;font-weight:700;color:#00BBFF;letter-spacing:2px;">OMNIVERSE</h2>
            <p style="margin:0 0 32px;opacity:0.5;font-size:0.88rem;letter-spacing:0.5px;">Enter your name to access the universe</p>
            <input id="_ovAuthName" type="text" placeholder="Your name…" autocomplete="off" autocapitalize="off" spellcheck="false"
                style="width:100%;padding:14px 18px;box-sizing:border-box;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:1rem;text-align:center;outline:none;font-family:${OMNIVERSE.fonts.body};transition:border-color 0.25s;">
            <div id="_ovAdminPwWrap" style="display:none;margin-top:12px;animation:ovFadeIn 0.2s;">
                <input id="_ovAuthPw" type="password" placeholder="Admin password…" style="width:100%;padding:14px 18px;box-sizing:border-box;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);border-radius:12px;color:#FFD700;font-size:1rem;text-align:center;outline:none;font-family:${OMNIVERSE.fonts.body};">
            </div>
            <div id="_ovAuthErr" style="min-height:22px;margin:10px 0;color:#FF4455;font-size:0.84rem;"></div>
            <button id="_ovAuthEnter" style="width:100%;padding:15px;background:linear-gradient(135deg,#0099FF,#0055CC);border:none;border-radius:12px;color:white;font-size:1rem;font-weight:700;cursor:pointer;font-family:${OMNIVERSE.fonts.display};letter-spacing:1px;transition:transform 0.2s;box-shadow:0 4px 20px rgba(0,153,255,0.35);margin-bottom:14px;">ENTER OMNIVERSE ▸</button>
            <div style="display:flex;gap:10px;">
                <button id="_ovAdminToggle" style="flex:1;padding:11px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);color:#FFD700;border-radius:10px;cursor:pointer;font-size:0.84rem;font-family:${OMNIVERSE.fonts.body};">👑 Admin Access</button>
                <button onclick="document.getElementById('_ovAuth').remove()" style="flex:1;padding:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);border-radius:10px;cursor:pointer;font-size:0.84rem;font-family:${OMNIVERSE.fonts.body};">✕ Close</button>
            </div>
            <p style="margin:24px 0 0;opacity:0.3;font-size:0.75rem;font-family:${OMNIVERSE.fonts.mono};">Ctrl+Shift+S to reopen · Ctrl+Shift+L to logout</p>
        </div>
    `;
    document.body.appendChild(overlay);

    const nameEl    = overlay.querySelector('#_ovAuthName');
    const pwEl      = overlay.querySelector('#_ovAuthPw');
    const errEl     = overlay.querySelector('#_ovAuthErr');
    const pwWrap    = overlay.querySelector('#_ovAdminPwWrap');
    const enterBtn  = overlay.querySelector('#_ovAuthEnter');
    const toggleBtn = overlay.querySelector('#_ovAdminToggle');

    nameEl.focus();
    nameEl.addEventListener('focus', () => nameEl.style.borderColor = '#00BBFF');
    nameEl.addEventListener('blur',  () => nameEl.style.borderColor = 'rgba(255,255,255,0.12)');
    toggleBtn.addEventListener('click', () => {
        const shown = pwWrap.style.display !== 'none';
        pwWrap.style.display = shown ? 'none' : 'block';
        if (!shown) pwEl.focus();
    });
    [nameEl, pwEl].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); }));
    enterBtn.addEventListener('click', submitAuth);
    enterBtn.addEventListener('mouseenter', () => enterBtn.style.transform = 'translateY(-2px)');
    enterBtn.addEventListener('mouseleave', () => enterBtn.style.transform = 'translateY(0)');
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    function submitAuth() {
        const name = nameEl.value.trim();
        const pw   = pwEl.value;
        errEl.textContent = '';

        if (Date.now() < sec._lockedUntil) {
            const wait = Math.ceil((sec._lockedUntil - Date.now()) / 1000);
            errEl.textContent = `Too many attempts. Wait ${wait}s.`; return;
        }
        if (!name) { errEl.textContent = 'Name is required.'; nameEl.focus(); return; }
        if (name.length < sec.minLength) { errEl.textContent = `Min ${sec.minLength} characters.`; return; }
        if (name.length > sec.maxLength) { errEl.textContent = `Max ${sec.maxLength} characters.`; return; }
        if (sec.bannedRegex.test(name)) { errEl.textContent = 'That name is not allowed.'; nameEl.focus(); return; }

        let userType = 'user';
        if (OMNIVERSE.admin.names.includes(name.toLowerCase())) {
            if (pw !== OMNIVERSE.admin.password) {
                sec._attempts++;
                if (sec._attempts >= sec.maxAttempts) {
                    sec._lockedUntil = Date.now() + sec.cooldownMs;
                    errEl.textContent = 'Too many attempts. Cooling down…';
                } else {
                    errEl.textContent = 'Incorrect admin password.';
                }
                pwEl.focus(); return;
            }
            userType = 'admin';
            sec._attempts = 0;
        }

        Utils.storage.set(OMNIVERSE.storage.userName, name);
        Utils.storage.set(OMNIVERSE.storage.userType, userType);
        if (!Utils.storage.get(OMNIVERSE.storage.firstVisit))
            Utils.storage.set(OMNIVERSE.storage.firstVisit, new Date().toISOString());

        ActivityLog.add(name, userType === 'admin' ? 'admin_login' : 'login');
        overlay.remove();

        Toast.show(
            userType === 'admin' ? `👑 Welcome, Admin ${Utils.sanitize(name)}!` : `✨ Welcome, ${Utils.sanitize(name)}!`,
            userType === 'admin' ? 'admin' : 'success',
        );

        setTimeout(() => {
            if (window.userManager) { window.userManager.init(); createFAB(); }
            else location.reload();
        }, 800);
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
function setupShortcuts() {
    document.addEventListener('keydown', e => {
        if (!e.ctrlKey || !e.shiftKey) return;
        switch (e.key) {
            case 'S': e.preventDefault(); initAuth(); break;
            case 'D': e.preventDefault(); window._ovDash?.show(); break;
            case 'A': e.preventDefault();
                if (window.userManager?.currentUser?.isAdmin) window._ovAdminPanel?.show();
                else Toast.show('Admin access required.', 'error'); break;
            case 'L': e.preventDefault(); window.userManager?.logout(); break;
            case 'T': e.preventDefault(); window._ovDash?._toggleTheme(); break;
            case 'N': e.preventDefault(); window._ovNotifCenter?.show(); break;
        }
    });
}

// ==================== GLOBAL STYLES ====================
function injectStyles() {
    document.getElementById('_ovStyles')?.remove();
    const style = document.createElement('style');
    style.id = '_ovStyles';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes ovFadeIn {
            from { opacity:0; transform:scale(0.97); }
            to   { opacity:1; transform:scale(1); }
        }

        [data-ov-theme="light"] {
            --ov-primary: #0066CC;
            --ov-accent:  #FF8800;
            --ov-bg:      #F0F2F8;
            --ov-text:    #1a1a2e;
        }
        [data-ov-theme="dark"] {
            --ov-primary: #00BBFF;
            --ov-accent:  #FFD700;
            --ov-bg:      #09091a;
            --ov-text:    #FFFFFF;
        }

        #ovDash::-webkit-scrollbar,
        #ovAdmin::-webkit-scrollbar,
        #_ovAdminContent::-webkit-scrollbar { width:6px; }
        #ovDash::-webkit-scrollbar-track,
        #ovAdmin::-webkit-scrollbar-track,
        #_ovAdminContent::-webkit-scrollbar-track { background:rgba(255,255,255,0.04);border-radius:3px; }
        #ovDash::-webkit-scrollbar-thumb,
        #ovAdmin::-webkit-scrollbar-thumb,
        #_ovAdminContent::-webkit-scrollbar-thumb { background:rgba(0,187,255,0.3);border-radius:3px; }
    `;
    document.head.appendChild(style);
}

// ==================== BOOT ====================
function boot() {
    injectStyles();
    generateFakeUsers();

    const savedTheme = Utils.storage.get(OMNIVERSE.storage.theme) ?? 'dark';
    applyThemeStyles(savedTheme);

    const existingName = Utils.storage.get(OMNIVERSE.storage.userName);

    window._ovNotifCenter     = new NotificationCenter();
    window._ovAvatarCustomizer= new AvatarCustomizer();

    if (existingName) {
        window.userManager   = new UserManager();
        window._ovDash       = new UserDashboard(window.userManager);
        window._ovAdminPanel = new AdminPanel(window.userManager);

        createFAB();
        setupShortcuts();

        const u = window.userManager.currentUser;
        if (u) {
            setTimeout(() => {
                Toast.show(
                    `${u.isAdmin ? '👑 ' : ''}Welcome back, ${u.name}! Session #${u.visitCount}`,
                    u.isAdmin ? 'admin' : 'info',
                );
            }, 600);
        }
    } else {
        window.userManager   = null;
        window._ovDash       = null;
        window._ovAdminPanel = null;
        setupShortcuts();
        setTimeout(() => initAuth(), 800);
    }

    Object.assign(window, {
        OMNIVERSE,
        showNotification: (msg, type) => Toast.show(msg, type),
        showSignInForm:   initAuth,
        initAuth,
        ovTrack:          (activity) => window.userManager?.track(activity),
        ovNotify:         (title, msg, type) => Notifications.add(title, msg, type),
        ovAchieve:        (id)   => AchievementManager.unlock(id),
    });

    console.log(`%c OMNIVERSE v${OMNIVERSE.version} `, 'background:#00BBFF;color:#000;font-weight:700;padding:4px 12px;border-radius:4px;font-family:monospace;');
    console.log('%cShortcuts: Ctrl+Shift+D·Dashboard | A·Admin | N·Notifications | T·Theme | L·Logout', 'color:#888;font-family:monospace;font-size:11px;');
}

document.addEventListener('DOMContentLoaded', boot);
