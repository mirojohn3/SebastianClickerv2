// ====================================
// GLOBALE SPIELVARIABLEN
// ====================================
let cookies = 0;
let cookiesPerSecond = 0;
const clickPower = 1;
let totalCookiesEarned = 0;
let totalClicks = 0;
let upgradesPurchased = 0;
let gameStartTime = Date.now();

// Golden Cookie Variablen
let goldenCookieActive = false;
let goldenCookieBonus = 1;
let goldenCookieBonusEndTime = 0;

// Täglicher Bonus (geändert auf 5 Minuten)
let lastDailyBonus = 0;
const DAILY_BONUS_COOLDOWN = 5 * 60 * 1000; // 5 Minuten in Millisekunden

// ====================================
// UPGRADE-DEFINITIONEN
// ====================================
const upgrades = [
    {
        id: 'cursor',
        name: 'Cursor',
        baseCost: 15,
        currentCost: 15,
        cps: 0.1,
        count: 0,
        emoji: '👆'
    },
    {
        id: 'grandma',
        name: 'Oma',
        baseCost: 100,
        currentCost: 100,
        cps: 1,
        count: 0,
        emoji: '👵'
    },
    {
        id: 'farm',
        name: 'Farm',
        baseCost: 1100,
        currentCost: 1100,
        cps: 8,
        count: 0,
        emoji: '🌾'
    },
    {
        id: 'mine',
        name: 'Mine',
        baseCost: 12000,
        currentCost: 12000,
        cps: 47,
        count: 0,
        emoji: '⛏️'
    },
    {
        id: 'factory',
        name: 'Fabrik',
        baseCost: 130000,
        currentCost: 130000,
        cps: 260,
        count: 0,
        emoji: '🏭'
    },
    {
        id: 'bank',
        name: 'Bank',
        baseCost: 1400000,
        currentCost: 1400000,
        cps: 1400,
        count: 0,
        emoji: '🏦'
    },
    {
        id: 'temple',
        name: 'Tempel',
        baseCost: 20000000,
        currentCost: 20000000,
        cps: 7800,
        count: 0,
        emoji: '⛩️'
    },
    {
        id: 'wizard',
        name: 'Zauberer',
        baseCost: 330000000,
        currentCost: 330000000,
        cps: 44000,
        count: 0,
        emoji: '🧙'
    }
];

// ====================================
// PERMANENTE VERBESSERUNGEN
// ====================================
const permanentUpgrades = [
    {
        id: 'cursor_boost_1',
        name: 'Verstärkte Cursor',
        description: 'Cursor sind 2x effizienter',
        baseCost: 500,
        purchased: false,
        emoji: '👆',
        effect: { building: 'cursor', multiplier: 2 }
    },
    {
        id: 'grandma_boost_1',
        name: 'Omas Geheimrezept',
        description: 'Omas sind 2x effizienter',
        baseCost: 5000,
        purchased: false,
        emoji: '👵',
        effect: { building: 'grandma', multiplier: 2 }
    },
    {
        id: 'farm_boost_1',
        name: 'Bio-Landwirtschaft',
        description: 'Farmen sind 2x effizienter',
        baseCost: 50000,
        purchased: false,
        emoji: '🌾',
        effect: { building: 'farm', multiplier: 2 }
    },
    {
        id: 'mine_boost_1',
        name: 'Diamant-Bohrer',
        description: 'Minen sind 2x effizienter',
        baseCost: 500000,
        purchased: false,
        emoji: '⛏️',
        effect: { building: 'mine', multiplier: 2 }
    },
    {
        id: 'click_boost_1',
        name: 'Goldene Finger',
        description: 'Klick-Power verdoppelt',
        baseCost: 1000,
        purchased: false,
        emoji: '✨',
        effect: { type: 'clickPower', multiplier: 2 }
    },
    {
        id: 'global_boost_1',
        name: 'Zeitbeschleunigung',
        description: 'Alle Gebäude +10% CPS',
        baseCost: 100000,
        purchased: false,
        emoji: '⚡',
        effect: { type: 'global', multiplier: 1.1 }
    },
    {
        id: 'factory_boost_1',
        name: 'Automatisierung',
        description: 'Fabriken sind 2x effizienter',
        baseCost: 1000000,
        purchased: false,
        emoji: '🏭',
        effect: { building: 'factory', multiplier: 2 }
    },
    {
        id: 'lucky_boost',
        name: 'Glückskeks-Magnet',
        description: 'Golden Cookies 2x häufiger',
        baseCost: 250000,
        purchased: false,
        emoji: '🧲',
        effect: { type: 'goldenCookie', multiplier: 0.5 }
    }
];

// ====================================
// ACHIEVEMENTS (ERFOLGE)
// ====================================
const achievements = [
    {
        id: 'first_click',
        name: 'Erste Schritte',
        description: 'Klicke deinen ersten Cookie',
        icon: '🍪',
        unlocked: false,
        condition: () => totalClicks >= 1
    },
    {
        id: 'click_100',
        name: 'Fleißiger Klicker',
        description: 'Klicke 100 Cookies',
        icon: '👆',
        unlocked: false,
        condition: () => totalClicks >= 100
    },
    {
        id: 'first_building',
        name: 'Baumeister',
        description: 'Kaufe dein erstes Gebäude',
        icon: '🏗️',
        unlocked: false,
        condition: () => upgrades.some(u => u.count > 0)
    },
    {
        id: 'cookies_1k',
        name: 'Cookie-Millionär',
        description: 'Verdiene 1.000 Cookies',
        icon: '💰',
        unlocked: false,
        condition: () => totalCookiesEarned >= 1000
    },
    {
        id: 'cookies_1m',
        name: 'Cookie-Milliardär',
        description: 'Verdiene 1 Million Cookies',
        icon: '💎',
        unlocked: false,
        condition: () => totalCookiesEarned >= 1000000
    },
    {
        id: 'cps_10',
        name: 'Automatisierung',
        description: 'Erreiche 10 CPS',
        icon: '⚙️',
        unlocked: false,
        condition: () => cookiesPerSecond >= 10
    },
    {
        id: 'first_upgrade',
        name: 'Verbesserungsexperte',
        description: 'Kaufe deine erste Verbesserung',
        icon: '⚡',
        unlocked: false,
        condition: () => permanentUpgrades.some(u => u.purchased)
    },
    {
        id: 'all_buildings',
        name: 'Diversifikation',
        description: 'Besitze von jedem Gebäudetyp mindestens eins',
        icon: '🌟',
        unlocked: false,
        condition: () => upgrades.every(u => u.count > 0)
    }
];

// DOM Elemente
const bigCookie = document.getElementById('bigCookie');
const cookieCountDisplay = document.getElementById('cookieCount');
const cpsDisplay = document.getElementById('cpsDisplay');
const totalEarnedDisplay = document.getElementById('totalEarned');
const upgradesContainer = document.getElementById('upgradesContainer');
const permanentUpgradesContainer = document.getElementById('permanentUpgradesContainer');
const clickAnimationContainer = document.getElementById('clickAnimationContainer');
const goldenCookieElement = document.getElementById('goldenCookie');
const dailyBonusBtn = document.getElementById('dailyBonusBtn');
const bonusTimer = document.getElementById('bonusTimer');

// Tab Buttons
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ====================================
// TAB-SYSTEM
// ====================================
/**
 * Initialisiert das Tab-System
 */
function initTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

/**
 * Wechselt zwischen Tabs
 */
function switchTab(tabName) {
    // Entferne active Klasse von allen Buttons und Contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Aktiviere den geklickten Tab
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
    }
}

// ====================================
// KLICK-LOGIK
// ====================================
// Event Listener für Big Cookie
bigCookie.addEventListener('click', (event) => {
    // Berechne effektive Klick-Power mit allen Multiplikatoren
    const clickMultiplier = getClickPowerMultiplier();
    const clickValue = clickPower * clickMultiplier * goldenCookieBonus;
    
    cookies += clickValue;
    totalCookiesEarned += clickValue;
    totalClicks++;
    
    // Aktualisiere die Anzeige sofort
    updateDisplay();
    
    // Prüfe Achievements
    checkAchievements();
    
    // Zeige Click Animation (Flying Number)
    createClickAnimation(event, clickValue);
    
    // Cookie-Bounce-Animation
    bigCookie.classList.add('clicked');
    setTimeout(() => {
        bigCookie.classList.remove('clicked');
    }, 300);
});

// ====================================
// ANIMATIONS-FUNKTIONEN
// ====================================
/**
 * Erstellt eine "Flying Number" Animation beim Klicken auf den Cookie
 * Zeigt den gewonnenen Wert als schwebende Zahl an
 * @param {Event} event - Das Click-Event
 * @param {number} value - Der Wert der hinzugefügt wurde
 */
function createClickAnimation(event, value) {
    const rect = bigCookie.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Erstelle Span-Element für die fliegende Zahl
    const animElement = document.createElement('span');
    animElement.className = 'click-number';
    animElement.textContent = `+${formatNumber(value)}`;
    
    // Positioniere an Klickposition
    animElement.style.left = `${x}px`;
    animElement.style.top = `${y}px`;
    
    // Füge leichte zufällige X-Verschiebung hinzu für Variation
    const randomOffset = (Math.random() - 0.5) * 40;
    animElement.style.setProperty('--random-x', `${randomOffset}px`);
    
    clickAnimationContainer.appendChild(animElement);
    
    // Entferne Animation nach 1.2 Sekunden (Dauer der Animation)
    setTimeout(() => {
        animElement.remove();
    }, 1200);
}

/**
 * Erstellt die UI-Elemente für alle Upgrades
 * Jedes Upgrade wird als Button mit allen relevanten Informationen angezeigt
 * Initial werden alle als 'not-affordable' markiert
 */
function createUpgradesUI() {
    // Lösche vorhandene Inhalte
    upgradesContainer.innerHTML = '';
    
    // Erstelle für jedes Upgrade einen Button
    upgrades.forEach(upgrade => {
        const upgradeButton = document.createElement('button');
        upgradeButton.className = 'upgrade-item not-affordable';
        upgradeButton.id = `upgrade-${upgrade.id}`;
        
        // Verknüpfe Button mit buyUpgrade Funktion
        upgradeButton.onclick = () => buyUpgrade(upgrade.id);
        
        // Füge alle Upgrade-Informationen hinzu
        upgradeButton.innerHTML = `
            <div class="upgrade-name">${upgrade.emoji} ${upgrade.name}</div>
            <div class="upgrade-info">+${formatNumber(upgrade.cps)} CPS</div>
            <div class="upgrade-count">Besitz: <span id="count-${upgrade.id}">${upgrade.count}</span></div>
            <div class="upgrade-cost">Kosten: <span id="cost-${upgrade.id}">${formatNumber(upgrade.currentCost)}</span> 🍪</div>
        `;
        
        // Füge Button zum Container hinzu
        upgradesContainer.appendChild(upgradeButton);
    });
}

// ====================================
// PERMANENTE UPGRADES
// ====================================
/**
 * Kauft ein permanentes Upgrade
 */
function buyPermanentUpgrade(id) {
    const upgrade = permanentUpgrades.find(u => u.id === id);
    
    if (!upgrade || upgrade.purchased) return;
    
    if (cookies >= upgrade.baseCost) {
        cookies -= upgrade.baseCost;
        upgrade.purchased = true;
        upgradesPurchased++;
        
        // Berechne CPS neu (da Multiplikatoren sich ändern)
        calculateCPS();
        
        // Aktualisiere alle Anzeigen
        updateDisplay();
        updatePermanentUpgradesUI();
        updateUpgradesUI();
        
        // Prüfe Achievements
        checkAchievements();
        
        // Visual Feedback
        showNotification(`${upgrade.emoji} ${upgrade.name} gekauft!`);
    }
}

/**
 * Erstellt UI für permanente Upgrades
 */
function createPermanentUpgradesUI() {
    permanentUpgradesContainer.innerHTML = '';
    
    permanentUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('button');
        upgradeDiv.className = 'upgrade-item not-affordable';
        upgradeDiv.id = `perm-upgrade-${upgrade.id}`;
        upgradeDiv.onclick = () => buyPermanentUpgrade(upgrade.id);
        
        if (upgrade.purchased) {
            upgradeDiv.classList.add('purchased');
            upgradeDiv.disabled = true;
        }
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.emoji} ${upgrade.name}</div>
            <div class="upgrade-info">${upgrade.description}</div>
            <div class="upgrade-cost">
                ${upgrade.purchased ? '✅ Gekauft' : `Kosten: ${formatNumber(upgrade.baseCost)} 🍪`}
            </div>
        `;
        
        permanentUpgradesContainer.appendChild(upgradeDiv);
    });
}

/**
 * Aktualisiert UI für permanente Upgrades
 */
function updatePermanentUpgradesUI() {
    permanentUpgrades.forEach(upgrade => {
        const button = document.getElementById(`perm-upgrade-${upgrade.id}`);
        
        if (button && !upgrade.purchased) {
            const canAfford = cookies >= upgrade.baseCost;
            
            button.disabled = !canAfford;
            
            if (canAfford) {
                button.classList.add('affordable');
                button.classList.remove('not-affordable');
            } else {
                button.classList.add('not-affordable');
                button.classList.remove('affordable');
            }
        }
    });
}

/**
 * Berechnet Klick-Power Multiplikator
 */
function getClickPowerMultiplier() {
    let multiplier = 1;
    
    permanentUpgrades.forEach(upgrade => {
        if (upgrade.purchased && upgrade.effect.type === 'clickPower') {
            multiplier *= upgrade.effect.multiplier;
        }
    });
    
    return multiplier;
}

/**
 * Berechnet Gebäude-Multiplikator
 */
function getBuildingMultiplier(buildingId) {
    let multiplier = 1;
    
    // Gebäude-spezifische Upgrades
    permanentUpgrades.forEach(upgrade => {
        if (upgrade.purchased && upgrade.effect.building === buildingId) {
            multiplier *= upgrade.effect.multiplier;
        }
    });
    
    // Globale Upgrades
    permanentUpgrades.forEach(upgrade => {
        if (upgrade.purchased && upgrade.effect.type === 'global') {
            multiplier *= upgrade.effect.multiplier;
        }
    });
    
    return multiplier;
}

// ====================================
// KAUF-LOGIK
// ====================================
/**
 * Kauft ein Upgrade basierend auf der ID
 * @param {string} id - Die ID des Upgrades
 */
function buyUpgrade(id) {
    // Finde das Upgrade im Array
    const upgrade = upgrades.find(u => u.id === id);
    
    // Abbrechen wenn Upgrade nicht existiert
    if (!upgrade) {
        console.error(`Upgrade mit ID "${id}" nicht gefunden`);
        return;
    }
    
    // Prüfe ob genug Cookies vorhanden sind
    if (cookies >= upgrade.currentCost) {
        // Subtrahiere die Kosten von den Cookies
        cookies -= upgrade.currentCost;
        
        // Erhöhe die Anzahl des Upgrades
        upgrade.count++;
        
        // Berechne den neuen Preis mit exponentieller Formel
        // Formel: neuerPreis = baseCost * 1.15^count
        upgrade.currentCost = Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.count));
        
        // Aktualisiere die gesamte cookiesPerSecond
        calculateCPS();
        
        // Aktualisiere alle Anzeigen
        updateDisplay();
        updateUpgradesUI();
    }
}

// ====================================
// CPS BERECHNUNG
// ====================================
/**
 * Berechnet die gesamte Cookies pro Sekunde basierend auf allen Upgrades
 * Berücksichtigt permanente Verbesserungen
 */
function calculateCPS() {
    cookiesPerSecond = 0;
    
    // Summiere CPS von allen Upgrades mit Multiplikatoren
    upgrades.forEach(upgrade => {
        const baseCPS = upgrade.cps * upgrade.count;
        const multiplier = getBuildingMultiplier(upgrade.id);
        cookiesPerSecond += baseCPS * multiplier;
    });
    
    // Prüfe Achievements
    checkAchievements();
}

// ====================================
// UI UPDATE FUNKTIONEN
// ====================================
/**
 * Aktualisiert die Upgrade-Buttons im UI
 * - Zeigt aktuelle Anzahl und Kosten
 * - Aktiviert/Deaktiviert Buttons basierend auf verfügbaren Cookies
 * - Fügt visuelle Klassen hinzu (affordable/not-affordable)
 */
function updateUpgradesUI() {
    upgrades.forEach(upgrade => {
        const button = document.getElementById(`upgrade-${upgrade.id}`);
        const countSpan = document.getElementById(`count-${upgrade.id}`);
        const costSpan = document.getElementById(`cost-${upgrade.id}`);
        
        if (button && countSpan && costSpan) {
            // Aktualisiere Anzahl und Kosten
            countSpan.textContent = upgrade.count;
            costSpan.textContent = formatNumber(upgrade.currentCost);
            
            // Prüfe Kaufbarkeit
            const canAfford = cookies >= upgrade.currentCost;
            
            // Button aktivieren/deaktivieren
            button.disabled = !canAfford;
            
            // Visuelle Klassen für Kaufbarkeit
            if (canAfford) {
                button.classList.add('affordable');
                button.classList.remove('not-affordable');
            } else {
                button.classList.add('not-affordable');
                button.classList.remove('affordable');
            }
        }
    });
}

/**
 * Aktualisiert die Haupt-Anzeigen (Cookie-Anzahl und CPS)
 */
function updateDisplay() {
    // Zeige Cookie-Anzahl gerundet auf ganze Zahlen
    cookieCountDisplay.textContent = formatNumber(Math.floor(cookies));
    
    // Zeige gesamt verdiente Cookies
    if (totalEarnedDisplay) {
        totalEarnedDisplay.textContent = formatNumber(Math.floor(totalCookiesEarned));
    }
    
    // Zeige CPS mit einer Dezimalstelle (mit Golden Cookie Bonus falls aktiv)
    const displayCPS = cookiesPerSecond * goldenCookieBonus;
    cpsDisplay.textContent = formatNumber(displayCPS.toFixed(1));
    
    // Aktualisiere Statistiken
    updateStats();
}

/**
 * Aktualisiert Statistiken-Tab
 */
function updateStats() {
    document.getElementById('totalClicksStat').textContent = formatNumber(totalClicks);
    document.getElementById('totalEarnedStat').textContent = formatNumber(Math.floor(totalCookiesEarned));
    document.getElementById('cpsStat').textContent = formatNumber(cookiesPerSecond.toFixed(1));
    
    const totalBuildings = upgrades.reduce((sum, u) => sum + u.count, 0);
    document.getElementById('totalBuildingsStat').textContent = formatNumber(totalBuildings);
    document.getElementById('upgradesPurchasedStat').textContent = upgradesPurchased;
    
    const playtime = Math.floor((Date.now() - gameStartTime) / 1000);
    const hours = Math.floor(playtime / 3600);
    const minutes = Math.floor((playtime % 3600) / 60);
    const seconds = playtime % 60;
    
    if (hours > 0) {
        document.getElementById('playtimeStat').textContent = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        document.getElementById('playtimeStat').textContent = `${minutes}m ${seconds}s`;
    } else {
        document.getElementById('playtimeStat').textContent = `${seconds}s`;
    }
}

// ====================================
// ZAHLEN-FORMATIERUNG
// ====================================
/**
 * Formatiert große Zahlen mit Abkürzungen (K, M, B, T)
 * Verwendet Tausender-Trennzeichen für kleine Zahlen
 * @param {number} num - Die zu formatierende Zahl
 * @returns {string} Formatierte Zahl als String
 * 
 * Beispiele:
 * 999 -> "999"
 * 1234 -> "1.23 K"
 * 1234567 -> "1.23 M"
 * 1234567890 -> "1.23 B"
 */
function formatNumber(num) {
    num = Number(num);
    
    // Quadrillionen (1.000.000.000.000.000+)
    if (num >= 1e15) {
        return (num / 1e15).toFixed(2) + ' Qa';
    }
    // Trillionen (1.000.000.000.000+)
    else if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + ' T';
    } 
    // Milliarden (1.000.000.000+)
    else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' B';
    } 
    // Millionen (1.000.000+)
    else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' M';
    } 
    // Tausend (1.000+)
    else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' K';
    }
    // Unter 1.000: Zeige ganze Zahl mit Dezimalpunkt falls nötig
    else if (num >= 100) {
        return Math.floor(num).toString();
    }
    // Sehr kleine Zahlen: Zeige mit einer Dezimalstelle
    else if (num >= 10) {
        return num.toFixed(1);
    }
    
    // Unter 10: Zeige mit einer Dezimalstelle
    return num.toFixed(1);
}

// ====================================
// ACHIEVEMENTS SYSTEM
// ====================================
/**
 * Prüft und schaltet Achievements frei
 */
function checkAchievements() {
    let newUnlocks = false;
    
    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            newUnlocks = true;
            showNotification(`🏆 Achievement freigeschaltet: ${achievement.name}!`);
        }
    });
    
    if (newUnlocks) {
        updateAchievementsUI();
    }
}

/**
 * Erstellt Achievements UI
 */
function createAchievementsUI() {
    const container = document.getElementById('achievementsContainer');
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        achievementDiv.id = `achievement-${achievement.id}`;
        
        achievementDiv.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;
        
        container.appendChild(achievementDiv);
    });
}

/**
 * Aktualisiert Achievements UI
 */
function updateAchievementsUI() {
    achievements.forEach(achievement => {
        const div = document.getElementById(`achievement-${achievement.id}`);
        if (div && achievement.unlocked) {
            div.classList.add('unlocked');
        }
    });
}

// ====================================
// TÄGLICHER BONUS
// ====================================
/**
 * Initialisiert den täglichen Bonus (5 Minuten)
 */
function initDailyBonus() {
    dailyBonusBtn.addEventListener('click', claimDailyBonus);
    updateDailyBonusUI();
    
    // Prüfe alle 1 Sekunde für genauere Updates
    setInterval(updateDailyBonusUI, 1000);
}

/**
 * Beansprucht den täglichen Bonus (5 Minuten)
 */
function claimDailyBonus() {
    const now = Date.now();
    
    if (now - lastDailyBonus >= DAILY_BONUS_COOLDOWN) {
        // Gebe 1 Stunde CPS sofort
        const bonus = cookiesPerSecond * 3600;
        cookies += bonus;
        totalCookiesEarned += bonus;
        
        lastDailyBonus = now;
        
        updateDisplay();
        updateDailyBonusUI();
        
        showNotification(`🎁 5-Minuten Bonus! +${formatNumber(bonus)} Cookies!`);
    }
}

/**
 * Aktualisiert Daily Bonus UI
 */
function updateDailyBonusUI() {
    const now = Date.now();
    const timeSinceLastBonus = now - lastDailyBonus;
    const timeRemaining = DAILY_BONUS_COOLDOWN - timeSinceLastBonus;
    
    if (timeRemaining <= 0) {
        dailyBonusBtn.disabled = false;
        dailyBonusBtn.classList.add('available');
        bonusTimer.textContent = 'Verfügbar!';
    } else {
        dailyBonusBtn.disabled = true;
        dailyBonusBtn.classList.remove('available');
        
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        bonusTimer.textContent = `In ${minutes}m ${seconds}s`;
    }
}

// ====================================
// GOLDEN COOKIE MECHANIK
// ====================================
/**
 * Lässt einen Golden Cookie an zufälliger Position erscheinen
 */
function spawnGoldenCookie() {
    if (goldenCookieActive) return;
    
    // Zufällige Position
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    goldenCookieElement.style.left = `${randomX}px`;
    goldenCookieElement.style.top = `${randomY}px`;
    goldenCookieElement.classList.remove('hidden');
    goldenCookieActive = true;
    
    // Auto-Verschwinden nach 10 Sekunden
    setTimeout(() => {
        if (goldenCookieActive) {
            goldenCookieElement.classList.add('hidden');
            goldenCookieActive = false;
        }
    }, 10000);
}

/**
 * Event Handler für Golden Cookie Klicks
 * Gewährt zufälligen Bonus
 */
goldenCookieElement.addEventListener('click', () => {
    if (!goldenCookieActive) return;
    
    goldenCookieElement.classList.add('hidden');
    goldenCookieActive = false;
    
    // Zufälliger Bonus
    const bonusType = Math.random();
    
    if (bonusType < 0.5) {
        // Sofortiger Cookie-Bonus (60 Sekunden Produktion)
        const bonus = Math.floor(cookiesPerSecond * 60);
        cookies += bonus;
        totalCookiesEarned += bonus;
        
        // Visual Feedback
        showNotification(`Golden Cookie! +${formatNumber(bonus)} Cookies!`);
    } else {
        // 7x CPS Multiplikator für 10 Sekunden
        goldenCookieBonus = 7;
        goldenCookieBonusEndTime = Date.now() + 10000;
        
        showNotification('Golden Cookie! 7x Produktion für 10 Sekunden!');
    }
    
    updateDisplay();
});

/**
 * Zeigt eine animierte Benachrichtigung an
 * @param {string} message - Die anzuzeigende Nachricht
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
        padding: 30px 50px;
        border-radius: 15px;
        font-size: 1.5em;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: notification-pop 0.5s ease-out;
    `;
    notification.textContent = message;
    
    // Animation hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notification-pop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'notification-pop 0.5s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 500);
    }, 2000);
}

/**
 * Plant den nächsten Golden Cookie Spawn
 * Zufällig zwischen 5 und 15 Minuten (oder kürzer mit Upgrade)
 */
function scheduleNextGoldenCookie() {
    // Basis: 5-15 Minuten
    let minTime = 5 * 60 * 1000;  // 5 Minuten
    let maxTime = 15 * 60 * 1000; // 15 Minuten
    
    // Prüfe ob Lucky Boost gekauft wurde
    const luckyBoost = permanentUpgrades.find(u => u.id === 'lucky_boost');
    if (luckyBoost && luckyBoost.purchased) {
        minTime *= luckyBoost.effect.multiplier;
        maxTime *= luckyBoost.effect.multiplier;
    }
    
    const randomTime = Math.random() * (maxTime - minTime) + minTime;
    
    setTimeout(() => {
        spawnGoldenCookie();
        scheduleNextGoldenCookie();
    }, randomTime);
}

// ====================================
// HAUPT-SPIEL-SCHLEIFE (GAME LOOP)
// ====================================
/**
 * Haupt-Update-Funktion die alle 33ms aufgerufen wird (30 FPS)
 * - Fügt Cookies basierend auf CPS hinzu (flüssiger Zähler)
 * - Aktualisiert alle Anzeigen
 * - Prüft Golden Cookie Bonus Timer
 * - Aktualisiert Kaufbarkeit der Upgrades
 */
function updateGame() {
    // Berechne Cookie-Gewinn für dieses Update (CPS / 30 für 33ms Updates)
    // 30 Updates pro Sekunde = cookiesPerSecond / 30
    const cpsGain = (cookiesPerSecond * goldenCookieBonus) / 30;
    cookies += cpsGain;
    totalCookiesEarned += cpsGain;
    
    // Prüfe ob Golden Cookie Bonus abgelaufen ist
    if (goldenCookieBonus > 1 && Date.now() >= goldenCookieBonusEndTime) {
        goldenCookieBonus = 1;
    }
    
    // Aktualisiere alle Anzeigen
    updateDisplay();
    updateUpgradesUI();
    updatePermanentUpgradesUI();
}

// ====================================
// SPIEL-INITIALISIERUNG
// ====================================
/**
 * Initialisiert das Spiel beim Start
 */
function initGame() {
    // Initialisiere Tab-System
    initTabs();
    
    // Erstelle UI für alle Upgrades
    createUpgradesUI();
    createPermanentUpgradesUI();
    createAchievementsUI();
    
    // Initiale Anzeigen aktualisieren
    updateDisplay();
    
    // Initialisiere Daily Bonus
    initDailyBonus();
    
    // Starte Haupt-Game-Loop mit 33ms Intervall (30 FPS für flüssigen Zähler)
    // Dies sorgt für einen sehr flüssigen Cookie-Zähler
    setInterval(updateGame, 33);
    
    // Golden Cookie Spawner starten (erster Cookie nach 30 Sekunden für Demo-Zwecke)
    setTimeout(() => {
        spawnGoldenCookie();
        scheduleNextGoldenCookie();
    }, 30000);
}

// Spiel starten
initGame();

// ====================================
// SAVE/LOAD SYSTEM
// ====================================
/**
 * Auto-Save alle 5 Sekunden
 * Speichert Spielstand im localStorage
 */
setInterval(() => {
    const saveData = {
        cookies,
        cookiesPerSecond,
        totalCookiesEarned,
        totalClicks,
        upgradesPurchased,
        gameStartTime,
        lastDailyBonus,
        upgrades: upgrades.map(u => ({
            id: u.id,
            count: u.count,
            currentCost: u.currentCost
        })),
        permanentUpgrades: permanentUpgrades.map(u => ({
            id: u.id,
            purchased: u.purchased
        })),
        achievements: achievements.map(a => ({
            id: a.id,
            unlocked: a.unlocked
        }))
    };
    localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
}, 5000);

/**
 * Auto-Load beim Start
 * Lädt gespeicherten Spielstand aus localStorage
 */
window.addEventListener('load', () => {
    const saveData = localStorage.getItem('cookieClickerSave');
    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            cookies = data.cookies || 0;
            totalCookiesEarned = data.totalCookiesEarned || 0;
            totalClicks = data.totalClicks || 0;
            upgradesPurchased = data.upgradesPurchased || 0;
            gameStartTime = data.gameStartTime || Date.now();
            lastDailyBonus = data.lastDailyBonus || 0;
            
            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.count = savedUpgrade.count;
                        upgrade.currentCost = savedUpgrade.currentCost;
                    }
                });
            }
            
            if (data.permanentUpgrades) {
                data.permanentUpgrades.forEach(savedUpgrade => {
                    const upgrade = permanentUpgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased;
                    }
                });
            }
            
            if (data.achievements) {
                data.achievements.forEach(savedAchievement => {
                    const achievement = achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                    }
                });
            }
            
            calculateCPS();
            updateDisplay();
            updateUpgradesUI();
            updatePermanentUpgradesUI();
            updateAchievementsUI();
            updateDailyBonusUI();
        } catch (e) {
            console.error('Fehler beim Laden des Spielstands:', e);
        }
    }
});
