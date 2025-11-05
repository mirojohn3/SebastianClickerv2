// ====================================
// GLOBALE SPIELVARIABLEN
// ====================================
// Ressourcen-System (3 Währungen)
let cookies = 0;
let stars = 0; // Neue Währung: Sterne (für Spezial-Upgrades)
let power = 0; // Neue Währung: Macht (für Epochen-Aufstieg)

let cookiesPerSecond = 0;
let starsPerHour = 0;
let powerPerHour = 0;
const clickPower = 1;
let totalCookiesEarned = 0;
let totalClicks = 0;
let upgradesPurchased = 0;
let gameStartTime = Date.now();

// Click Speed Tracking
let clickTimes = [];
let clickSpeedCPS = 0;
const CLICK_SPEED_WINDOW = 1000; // 1 Sekunde Zeitfenster

// Epochen-System
let currentEpoch = 0; // 0=Steinzeit, 1=Antike, 2=Mittelalter, 3=Industrie, 4=Digital, 5=Weltraum
const EPOCHS = [
    { id: 0, name: '🪨 Steinzeit', powerCost: 0, unlocked: true },
    { id: 1, name: '🏛️ Antike', powerCost: 100, unlocked: false },
    { id: 2, name: '🏰 Mittelalter', powerCost: 500, unlocked: false },
    { id: 3, name: '🏭 Industriezeitalter', powerCost: 2000, unlocked: false },
    { id: 4, name: '💻 Digitales Zeitalter', powerCost: 10000, unlocked: false },
    { id: 5, name: '🚀 Weltraum-Ära', powerCost: 50000, unlocked: false }
];

// Quest-System
let dailyQuests = [];
let questsCompletedToday = 0;
let lastQuestReset = Date.now();

// Expedition-System
let lastExpedition = 0;
let expeditionActive = false;
const EXPEDITION_COOLDOWN = 8 * 60 * 1000; // 8 Minuten

// Event-System
let lastRandomEvent = 0;
const RANDOM_EVENT_COOLDOWN = 15 * 60 * 1000; // 15 Minuten
let eventActive = false;

// Golden Cookie Variablen
let goldenCookieActive = false;
let goldenCookieBonus = 1;
let goldenCookieBonusEndTime = 0;

// Bonus System (3 Minuten)
let lastBonus = 0;
const BONUS_COOLDOWN = 3 * 60 * 1000; // 3 Minuten in Millisekunden

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
        emoji: '👆',
        epoch: 0,
        synergyWith: [],
        powerGen: 0
    },
    {
        id: 'grandma',
        name: 'Oma',
        baseCost: 100,
        currentCost: 100,
        cps: 1,
        count: 0,
        emoji: '👵',
        epoch: 0, // Steinzeit
        synergyWith: ['farm'], // Bonus mit Farm
        powerGen: 0.1 // Generiert Macht pro Stunde
    },
    {
        id: 'farm',
        name: 'Farm',
        baseCost: 1100,
        currentCost: 1100,
        cps: 8,
        count: 0,
        emoji: '🌾',
        epoch: 0, // Steinzeit
        synergyWith: ['grandma', 'mine'],
        powerGen: 0.2
    },
    {
        id: 'mine',
        name: 'Mine',
        baseCost: 12000,
        currentCost: 12000,
        cps: 47,
        count: 0,
        emoji: '⛏️',
        epoch: 1, // Antike
        synergyWith: ['farm', 'factory'],
        powerGen: 0.5
    },
    {
        id: 'factory',
        name: 'Fabrik',
        baseCost: 130000,
        currentCost: 130000,
        cps: 260,
        count: 0,
        emoji: '🏭',
        epoch: 3, // Industriezeitalter
        synergyWith: ['mine', 'bank'],
        powerGen: 1
    },
    {
        id: 'bank',
        name: 'Bank',
        baseCost: 1400000,
        currentCost: 1400000,
        cps: 1400,
        count: 0,
        emoji: '🏦',
        epoch: 3, // Industriezeitalter
        synergyWith: ['factory', 'temple'],
        powerGen: 2
    },
    {
        id: 'temple',
        name: 'Tempel',
        baseCost: 20000000,
        currentCost: 20000000,
        cps: 7800,
        count: 0,
        emoji: '⛩️',
        epoch: 2, // Mittelalter
        synergyWith: ['wizard', 'bank'],
        powerGen: 5
    },
    {
        id: 'wizard',
        name: 'Zauberer',
        baseCost: 330000000,
        currentCost: 330000000,
        cps: 44000,
        count: 0,
        emoji: '🧙',
        epoch: 2, // Mittelalter
        synergyWith: ['temple', 'portal'],
        powerGen: 10
    },
    {
        id: 'portal',
        name: 'Portal',
        baseCost: 5000000000,
        currentCost: 5000000000,
        cps: 260000,
        count: 0,
        emoji: '🌀',
        epoch: 4, // Digital
        synergyWith: ['wizard', 'timemachine'],
        powerGen: 20
    },
    {
        id: 'timemachine',
        name: 'Zeitmaschine',
        baseCost: 75000000000,
        currentCost: 75000000000,
        cps: 1600000,
        count: 0,
        emoji: '⏰',
        epoch: 5, // Weltraum
        synergyWith: ['portal'],
        powerGen: 50
    }
];

// ====================================
// PERMANENTE VERBESSERUNGEN (ÜBERARBEITET)
// ====================================
// Tier 1: Frühe Upgrades (Moderate Kosten, moderate Effekte)
// Tier 2: Mittlere Upgrades (Hohe Kosten, starke Effekte)
// Tier 3: Späte Upgrades (Sehr hohe Kosten, mächtige Effekte)
// Tier 4: Prestige-Upgrades (Nur mit Prestige-Punkten kaufbar)

const permanentUpgrades = [
    // === TIER 1: FRÜHE UPGRADES ===
    {
        id: 'click_boost_1',
        name: 'Geschickte Finger',
        description: 'Klick-Power +50%',
        baseCost: 1000,
        tier: 1,
        purchased: false,
        emoji: '👆',
        effect: { type: 'clickPower', multiplier: 1.5 }
    },
    {
        id: 'cursor_boost_1',
        name: 'Verstärkte Cursor',
        description: 'Cursor +100% effizienter',
        baseCost: 2500,
        tier: 1,
        purchased: false,
        emoji: '👆',
        effect: { building: 'cursor', multiplier: 2 }
    },
    {
        id: 'grandma_boost_1',
        name: 'Omas Geheimrezept',
        description: 'Omas +100% effizienter',
        baseCost: 15000,
        tier: 1,
        purchased: false,
        emoji: '👵',
        effect: { building: 'grandma', multiplier: 2 }
    },
    
    // === TIER 2: MITTLERE UPGRADES ===
    {
        id: 'click_boost_2',
        name: 'Goldene Finger',
        description: 'Klick-Power +100%',
        baseCost: 50000,
        tier: 2,
        purchased: false,
        emoji: '✨',
        requiresUpgrade: 'click_boost_1',
        effect: { type: 'clickPower', multiplier: 2 }
    },
    {
        id: 'farm_boost_1',
        name: 'Bio-Landwirtschaft',
        description: 'Farmen +100% effizienter',
        baseCost: 100000,
        tier: 2,
        purchased: false,
        emoji: '🌾',
        effect: { building: 'farm', multiplier: 2 }
    },
    {
        id: 'global_boost_1',
        name: 'Effizienzsteigerung I',
        description: 'Alle Gebäude +15% CPS',
        baseCost: 250000,
        tier: 2,
        purchased: false,
        emoji: '⚡',
        effect: { type: 'global', multiplier: 1.15 }
    },
    {
        id: 'mine_boost_1',
        name: 'Diamant-Bohrer',
        description: 'Minen +100% effizienter',
        baseCost: 500000,
        tier: 2,
        purchased: false,
        emoji: '⛏️',
        effect: { building: 'mine', multiplier: 2 }
    },
    
    // === TIER 3: SPÄTE UPGRADES ===
    {
        id: 'factory_boost_1',
        name: 'Vollautomatisierung',
        description: 'Fabriken +150% effizienter',
        baseCost: 5000000,
        tier: 3,
        purchased: false,
        emoji: '🏭',
        effect: { building: 'factory', multiplier: 2.5 }
    },
    {
        id: 'global_boost_2',
        name: 'Effizienzsteigerung II',
        description: 'Alle Gebäude +25% CPS',
        baseCost: 10000000,
        tier: 3,
        purchased: false,
        requiresUpgrade: 'global_boost_1',
        emoji: '⚡',
        effect: { type: 'global', multiplier: 1.25 }
    },
    {
        id: 'lucky_boost',
        name: 'Glückskeks-Magnet',
        description: 'Golden Cookies 50% häufiger',
        baseCost: 2500000,
        tier: 3,
        purchased: false,
        emoji: '🧲',
        effect: { type: 'goldenCookie', multiplier: 0.67 }
    },
    {
        id: 'click_boost_3',
        name: 'Göttliche Berührung',
        description: 'Klick-Power +200%',
        baseCost: 25000000,
        tier: 3,
        purchased: false,
        requiresUpgrade: 'click_boost_2',
        emoji: '�',
        effect: { type: 'clickPower', multiplier: 3 }
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
const tier1Container = document.getElementById('tier1Container');
const tier2Container = document.getElementById('tier2Container');
const tier3Container = document.getElementById('tier3Container');
const clickAnimationContainer = document.getElementById('clickAnimationContainer');
const goldenCookieElement = document.getElementById('goldenCookie');
const dailyBonusBtn = document.getElementById('dailyBonusBtn');
const bonusTimer = document.getElementById('bonusTimer');
const rouletteBtn = document.getElementById('rouletteBtn');

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
    
    // Wichtig: Stelle sicher dass Cookies als Zahl behandelt werden
    cookies = Number(cookies) + Number(clickValue);
    totalCookiesEarned = Number(totalCookiesEarned) + Number(clickValue);
    totalClicks++;
    
    // Track Click-Speed für Auto-CPS
    const now = Date.now();
    clickTimes.push(now);
    
    // Entferne alte Clicks außerhalb des Zeitfensters (nutze filter ohne Reassignment)
    const recentClicks = clickTimes.filter(time => now - time < CLICK_SPEED_WINDOW);
    clickTimes.length = 0;
    clickTimes.push(...recentClicks);
    
    // Berechne Click-Speed CPS (Clicks pro Sekunde basierend auf letzter Sekunde)
    clickSpeedCPS = clickTimes.length * clickValue;
    
    // Update Quest Progress für Click-Quests
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress('earn_cookies_timed', totalCookiesEarned);
        // Für Click-Streak Quests
        const clicksInLastMinute = clickTimes.filter(time => now - time < 60000).length;
        updateQuestProgress('click_count_timed', clicksInLastMinute);
    }
    
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
        // Prüfe Epochen-Anforderung
        const epochLocked = upgrade.epoch && upgrade.epoch > currentEpoch;
        
        const upgradeButton = document.createElement('button');
        upgradeButton.className = 'upgrade-item not-affordable';
        upgradeButton.id = `upgrade-${upgrade.id}`;
        
        if (epochLocked) {
            upgradeButton.classList.add('epoch-locked');
            upgradeButton.disabled = true;
        }
        
        // Synergie-Indikator
        let synergyHtml = '';
        if (upgrade.synergyWith && upgrade.synergyWith.length > 0) {
            const activeSynergies = upgrade.synergyWith.filter(partnerId => {
                const partner = upgrades.find(u => u.id === partnerId);
                return partner && partner.count > 0;
            });
            
            if (activeSynergies.length > 0) {
                synergyHtml = `<div class="synergy-active">🔗 +${activeSynergies.length * 25}% Synergie</div>`;
            }
        }
        
        // Epochen-Indikator
        let epochHtml = '';
        if (epochLocked) {
            const requiredEpoch = EPOCHS[upgrade.epoch];
            epochHtml = `<div class="epoch-requirement">🔒 Benötigt: ${requiredEpoch.name}</div>`;
        }
        
        // Füge alle Upgrade-Informationen hinzu
        upgradeButton.innerHTML = `
            <div class="upgrade-name">${upgrade.emoji} ${upgrade.name}</div>
            <div class="upgrade-info">+${formatNumber(upgrade.cps)} CPS</div>
            ${synergyHtml}
            ${epochHtml}
            <div class="upgrade-count">Besitz: <span id="count-${upgrade.id}">${upgrade.count}</span></div>
            <div class="upgrade-cost">Kosten: <span id="cost-${upgrade.id}">${formatNumber(upgrade.currentCost)}</span> 🍪</div>
        `;
        
        // WICHTIG: Event Listener NACH innerHTML setzen
        upgradeButton.addEventListener('click', () => buyUpgrade(upgrade.id));
        
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
    
    // Prüfe ob Voraussetzungs-Upgrade gekauft wurde
    if (upgrade.requiresUpgrade) {
        const requiredUpgrade = permanentUpgrades.find(u => u.id === upgrade.requiresUpgrade);
        if (!requiredUpgrade || !requiredUpgrade.purchased) {
            showNotification(`⚠️ Benötigt: ${requiredUpgrade.name}`);
            return;
        }
    }
    
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
 * Erstellt UI für permanente Upgrades (nach Tiers sortiert)
 */
function createPermanentUpgradesUI() {
    tier1Container.innerHTML = '';
    tier2Container.innerHTML = '';
    tier3Container.innerHTML = '';
    
    permanentUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('button');
        upgradeDiv.className = 'upgrade-item not-affordable';
        upgradeDiv.id = `perm-upgrade-${upgrade.id}`;
        
        if (upgrade.purchased) {
            upgradeDiv.classList.add('purchased');
            upgradeDiv.disabled = true;
        }
        
        // Prüfe ob Voraussetzung erfüllt ist
        let requirementMet = true;
        let requirementText = '';
        if (upgrade.requiresUpgrade) {
            const requiredUpgrade = permanentUpgrades.find(u => u.id === upgrade.requiresUpgrade);
            requirementMet = requiredUpgrade && requiredUpgrade.purchased;
            if (!requirementMet) {
                requirementText = `<div class="upgrade-requirement">🔒 Benötigt: ${requiredUpgrade.name}</div>`;
            }
        }
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.emoji} ${upgrade.name}</div>
            <div class="upgrade-info">${upgrade.description}</div>
            ${requirementText}
            <div class="upgrade-cost">
                ${upgrade.purchased ? '✅ Gekauft' : `Kosten: ${formatNumber(upgrade.baseCost)} 🍪`}
            </div>
        `;
        
        // WICHTIG: Event Listener NACH innerHTML setzen
        upgradeDiv.addEventListener('click', () => buyPermanentUpgrade(upgrade.id));
        
        // Füge zum entsprechenden Tier hinzu
        if (upgrade.tier === 1) {
            tier1Container.appendChild(upgradeDiv);
        } else if (upgrade.tier === 2) {
            tier2Container.appendChild(upgradeDiv);
        } else if (upgrade.tier === 3) {
            tier3Container.appendChild(upgradeDiv);
        }
    });
}

/**
 * Aktualisiert UI für permanente Upgrades
 */
function updatePermanentUpgradesUI() {
    permanentUpgrades.forEach(upgrade => {
        const button = document.getElementById(`perm-upgrade-${upgrade.id}`);
        
        if (button && !upgrade.purchased) {
            // Prüfe Voraussetzung
            let requirementMet = true;
            if (upgrade.requiresUpgrade) {
                const requiredUpgrade = permanentUpgrades.find(u => u.id === upgrade.requiresUpgrade);
                requirementMet = requiredUpgrade && requiredUpgrade.purchased;
            }
            
            const canAfford = cookies >= upgrade.baseCost && requirementMet;
            
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
    
    // Permanente Upgrades
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
        
        // Quest-Tracking: Verschiedene Gebäude gekauft
        if (typeof updateQuestProgress === 'function') {
            const differentBuildings = upgrades.filter(u => u.count > 0).length;
            updateQuestProgress('buy_different_buildings', differentBuildings);
            
            // Synergie-Tracking
            if (typeof calculateSynergies === 'function') {
                const synergies = calculateSynergies();
                updateQuestProgress('activate_synergies', synergies);
            }
        }
        
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
 * Berücksichtigt permanente Verbesserungen, Click-Speed Bonus und Synergien
 */
function calculateCPS() {
    cookiesPerSecond = 0;
    
    // Summiere CPS von allen Upgrades mit Multiplikatoren UND Synergien
    upgrades.forEach(upgrade => {
        const baseCPS = upgrade.cps * upgrade.count;
        const buildingMultiplier = getBuildingMultiplier(upgrade.id);
        const synergyMultiplier = typeof getSynergyMultiplier === 'function' ? getSynergyMultiplier(upgrade.id) : 1;
        cookiesPerSecond += baseCPS * buildingMultiplier * synergyMultiplier;
    });
    
    // Füge Click-Speed CPS hinzu
    cookiesPerSecond += clickSpeedCPS;
    
    // Berechne Macht- und Sterne-Generierung
    if (typeof calculatePowerGeneration === 'function') calculatePowerGeneration();
    if (typeof calculateStarGeneration === 'function') calculateStarGeneration();
    
    // Prüfe Achievements
    checkAchievements();
    
    // Update Quest Progress
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress('reach_cps', cookiesPerSecond);
    }
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
            
            // Prüfe Epochen-Anforderung
            const epochLocked = upgrade.epoch && upgrade.epoch > currentEpoch;
            
            // Prüfe Kaufbarkeit
            const canAfford = cookies >= upgrade.currentCost && !epochLocked;
            
            // Button aktivieren/deaktivieren nur wenn epochLocked
            if (epochLocked) {
                button.disabled = true;
                button.classList.add('epoch-locked');
            } else {
                button.disabled = false;
                button.classList.remove('epoch-locked');
            }
            
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
    
    // Zeige Sterne und Macht
    const starsDisplay = document.getElementById('starsCount');
    const powerDisplay = document.getElementById('powerCount');
    if (starsDisplay) starsDisplay.textContent = formatNumber(Math.floor(stars));
    if (powerDisplay) powerDisplay.textContent = formatNumber(Math.floor(power));
    
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
// PRESTIGE SYSTEM
// ====================================
// COOKIE ROULETTE 🎰
// ====================================

// Roulette-Konfiguration
const ROULETTE_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

let currentBet = null;
let rouletteSpinning = false;
let wheelCanvas, wheelCtx;

/**
 * Zeichnet das Roulette-Rad
 */
function drawRouletteWheel(rotation = 0) {
    if (!wheelCanvas) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 135;
    const segmentAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;
    
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // Zeichne Segmente
    ROULETTE_NUMBERS.forEach((number, index) => {
        // Starte bei -90° (oben), damit Index 0 oben ist
        // Segmente werden ZENTRIERT auf ihrer Position gezeichnet
        const angle = (-Math.PI / 2) + (index * segmentAngle) + rotation;
        
        // Bestimme Farbe
        let color;
        if (number === 0) {
            color = '#10b981'; // Grün
        } else if (RED_NUMBERS.includes(number)) {
            color = '#ef4444'; // Rot
        } else {
            color = '#1f2937'; // Schwarz
        }
        
        // Zeichne Segment (zentriert um angle)
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, 
                     angle - segmentAngle / 2, 
                     angle + segmentAngle / 2);
        wheelCtx.closePath();
        wheelCtx.fillStyle = color;
        wheelCtx.fill();
        
        // Zeichne Rand
        wheelCtx.strokeStyle = '#FFD700';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        // Zeichne Zahl (in der Mitte des Segments)
        wheelCtx.save();
        wheelCtx.translate(centerX, centerY);
        wheelCtx.rotate(angle);
        wheelCtx.textAlign = 'center';
        wheelCtx.textBaseline = 'middle';
        wheelCtx.fillStyle = 'white';
        wheelCtx.font = 'bold 12px Arial';
        wheelCtx.fillText(number, radius * 0.75, 0);
        wheelCtx.restore();
    });
    
    // Zeichne Zentrum
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI); // Kleineres Zentrum
    wheelCtx.fillStyle = '#FFD700';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#FFA500';
    wheelCtx.lineWidth = 2;
    wheelCtx.stroke();
}

/**
 * Setzt die aktuelle Wette zurück
 */
function resetBet() {
    currentBet = null;
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('betAmount').value = 100;
    document.getElementById('rouletteResult').textContent = '';
    document.getElementById('rouletteResult').className = 'roulette-result';
    updateSpinButton();
}

/**
 * Setzt eine Wette
 */
function placeBet(type, value = null, targetElement = null) {
    if (rouletteSpinning) return;
    
    const betAmount = parseInt(document.getElementById('betAmount').value);
    
    if (isNaN(betAmount) || betAmount < 10) {
        showNotification('⚠️ Mindestens 10 Cookies setzen!');
        return;
    }
    
    if (betAmount > cookies) {
        showNotification('⚠️ Nicht genug Cookies!');
        return;
    }
    
    // Spezielle Validierung für Zahlen-Wetten
    if (type === 'number') {
        const selectedNumber = document.getElementById('singleNumberSelect').value;
        if (selectedNumber === '') {
            showNotification('⚠️ Bitte wähle eine Zahl!');
            return;
        }
        value = parseInt(selectedNumber);
    }
    
    currentBet = { type, value, amount: betAmount };
    
    // Markiere ausgewählte Wette
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (targetElement) {
        targetElement.classList.add('selected');
    }
    
    updateSpinButton();
}

/**
 * Aktualisiert den Spin-Button
 */
function updateSpinButton() {
    const spinBtn = document.getElementById('spinButton');
    spinBtn.disabled = !currentBet || rouletteSpinning;
}

/**
 * Dreht das Roulette-Rad
 */
function spinWheel() {
    if (!currentBet || rouletteSpinning) return;
    
    rouletteSpinning = true;
    updateSpinButton();
    
    // Ziehe Einsatz ab
    cookies -= currentBet.amount;
    updateDisplay();
    
    // Wähle zufällige Gewinnzahl
    const winningNumber = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
    
    // Berechne Ziel-Rotation
    const winningIndex = ROULETTE_NUMBERS.indexOf(winningNumber);
    const segmentAngle = (2 * Math.PI) / ROULETTE_NUMBERS.length;
    
    // Der Zeiger ist oben (0° / 12 Uhr Position)
    // Das Rad dreht sich im Uhrzeigersinn
    // Wir müssen das Rad so drehen, dass die Gewinnzahl oben unter dem Zeiger landet
    
    // Berechne wie weit wir drehen müssen (negativ = gegen Uhrzeigersinn vom Rad aus gesehen)
    // Die Gewinnzahl soll am Ende oben (bei 0°) sein
    // Aktuell ist Index 0 bei 0°, also müssen wir -winningIndex * segmentAngle drehen
    const targetAngle = -(winningIndex * segmentAngle);
    
    // Füge 5 volle Umdrehungen hinzu für den Effekt
    const fullRotations = Math.PI * 2 * 5; // 5 Umdrehungen
    const targetRotation = fullRotations + targetAngle;
    
    // Animation
    const duration = 3000; // 3 Sekunden
    const startTime = Date.now();
    const startRotation = 0;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (targetRotation * eased);
        
        drawRouletteWheel(currentRotation);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation beendet - zeige Ergebnis
            setTimeout(() => {
                showRouletteResult(winningNumber);
            }, 500);
        }
    }
    
    animate();
}

/**
 * Zeigt das Roulette-Ergebnis
 */
function showRouletteResult(winningNumber) {
    const resultDiv = document.getElementById('rouletteResult');
    
    // Bestimme Gewinnfarbe
    let numberColor = 'Grün';
    if (RED_NUMBERS.includes(winningNumber)) {
        numberColor = 'Rot';
    } else if (BLACK_NUMBERS.includes(winningNumber)) {
        numberColor = 'Schwarz';
    }
    
    // Prüfe ob gewonnen
    const won = checkWin(winningNumber);
    
    if (won) {
        const multiplier = getMultiplier(currentBet.type);
        const winnings = Math.floor(currentBet.amount * multiplier);
        cookies += winnings;
        totalCookiesEarned += (winnings - currentBet.amount);
        
        resultDiv.textContent = `🎉 GEWONNEN! Zahl: ${winningNumber} (${numberColor}) | +${formatNumber(winnings)} Cookies!`;
        resultDiv.className = 'roulette-result win';
    } else {
        resultDiv.textContent = `❌ Verloren! Zahl: ${winningNumber} (${numberColor}) | -${formatNumber(currentBet.amount)} Cookies`;
        resultDiv.className = 'roulette-result lose';
    }
    
    updateDisplay();
    rouletteSpinning = false;
    
    // Reset nach 5 Sekunden
    setTimeout(() => {
        resetBet();
    }, 5000);
}

/**
 * Prüft ob die Wette gewonnen hat
 */
function checkWin(winningNumber) {
    if (!currentBet) return false;
    
    switch(currentBet.type) {
        case 'red':
            return RED_NUMBERS.includes(winningNumber);
        case 'black':
            return BLACK_NUMBERS.includes(winningNumber);
        case 'even':
            return winningNumber !== 0 && winningNumber % 2 === 0;
        case 'odd':
            return winningNumber !== 0 && winningNumber % 2 === 1;
        case 'low':
            return winningNumber >= 1 && winningNumber <= 18;
        case 'high':
            return winningNumber >= 19 && winningNumber <= 36;
        case 'dozen1':
            return winningNumber >= 1 && winningNumber <= 12;
        case 'dozen2':
            return winningNumber >= 13 && winningNumber <= 24;
        case 'dozen3':
            return winningNumber >= 25 && winningNumber <= 36;
        case 'number':
            return winningNumber === currentBet.value;
        default:
            return false;
    }
}

/**
 * Gibt den Gewinn-Multiplikator für die Wettart zurück
 */
function getMultiplier(betType) {
    switch(betType) {
        case 'red':
        case 'black':
        case 'even':
        case 'odd':
        case 'low':
        case 'high':
            return 2; // 2x
        case 'dozen1':
        case 'dozen2':
        case 'dozen3':
            return 3; // 3x
        case 'number':
            return 36; // 36x
        default:
            return 1;
    }
}

/**
 * Initialisiert Cookie Roulette
 */
function initRoulette() {
    wheelCanvas = document.getElementById('wheelCanvas');
    wheelCtx = wheelCanvas?.getContext('2d');
    
    const spinBtn = document.getElementById('spinButton');
    
    if (spinBtn) {
        spinBtn.addEventListener('click', spinWheel);
    }
    
    // Quick Bet Buttons
    document.querySelectorAll('.quick-bet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            const betInput = document.getElementById('betAmount');
            
            if (amount === 'all') {
                betInput.value = Math.floor(cookies);
            } else {
                betInput.value = Math.min(parseInt(amount), Math.floor(cookies));
            }
        });
    });
    
    // Bet Buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            placeBet(type, null, e.target);
        });
    });
    
    // Zeichne Rad initial
    drawRouletteWheel();
}

// ====================================
// 3-MINUTEN BONUS
// ====================================
/**
 * Initialisiert den 3-Minuten Bonus
 */
function initDailyBonus() {
    dailyBonusBtn.addEventListener('click', claimBonus);
    updateBonusUI();
    
    // Prüfe alle 1 Sekunde für genauere Updates
    setInterval(updateBonusUI, 1000);
}

/**
 * Beansprucht den 3-Minuten Bonus
 */
function claimBonus() {
    const now = Date.now();
    
    if (now - lastBonus >= BONUS_COOLDOWN) {
        // BONUS: +50% Klick-Power für 60 Sekunden + moderate Cookie-Menge
        const cookieBonus = Math.max(100, cookiesPerSecond * 30); // 30 Sekunden Produktion oder min. 100
        cookies = Number(cookies) + Number(cookieBonus);
        totalCookiesEarned = Number(totalCookiesEarned) + Number(cookieBonus);
        
        // Temporärer Klick-Boost (wird in der Update-Schleife geprüft)
        goldenCookieBonus = 1.5;
        goldenCookieBonusEndTime = now + 60000; // 60 Sekunden
        
        lastBonus = now;
        
        updateDisplay();
        updateBonusUI();
        
        showNotification(`🎁 3-Min Bonus!\n+${formatNumber(cookieBonus)} Cookies\n+50% Klick-Power für 60s!`);
    }
}

/**
 * Aktualisiert Bonus UI
 */
function updateBonusUI() {
    const now = Date.now();
    const timeSinceLastBonus = now - lastBonus;
    const timeRemaining = BONUS_COOLDOWN - timeSinceLastBonus;
    
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
 * - Trackt Lifetime Cookies für Prestige
 */
function updateGame() {
    // Berechne Cookie-Gewinn für dieses Update (CPS / 30 für 33ms Updates)
    // 30 Updates pro Sekunde = cookiesPerSecond / 30
    const cpsGain = (Number(cookiesPerSecond) * Number(goldenCookieBonus)) / 30;
    
    // Wichtig: Stelle sicher dass Cookies als Zahl behandelt werden
    cookies = Number(cookies) + Number(cpsGain);
    totalCookiesEarned = Number(totalCookiesEarned) + Number(cpsGain);
    
    // Macht und Sterne pro Stunde generieren (passiv)
    const powerGain = (Number(powerPerHour) / 30 / 3600); // Pro Update
    const starGain = (Number(starsPerHour) / 30 / 3600);
    power = Number(power) + Number(powerGain);
    stars = Number(stars) + Number(starGain);
    
    // Prüfe ob Golden Cookie/Bonus-Buff abgelaufen ist
    if (goldenCookieBonus > 1 && Date.now() >= goldenCookieBonusEndTime) {
        goldenCookieBonus = 1;
    }
    
    // Check für Quest-Timer
    if (typeof updateQuestProgress === 'function') {
        // Update timed quests
        dailyQuests.forEach(quest => {
            if (quest.timeLimit && !quest.completed && !quest.failed) {
                if (Date.now() - quest.startTime > quest.timeLimit) {
                    quest.failed = true;
                }
            }
        });
    }
    
    // Check für Expeditionen
    if (typeof startExpedition === 'function' && !expeditionActive) {
        if (Date.now() - lastExpedition >= EXPEDITION_COOLDOWN) {
            startExpedition();
        }
    }
    
    // Check für Random Events
    if (typeof triggerRandomEvent === 'function' && !eventActive) {
        if (Date.now() - lastRandomEvent >= RANDOM_EVENT_COOLDOWN) {
            triggerRandomEvent();
        }
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
    
    // Initialisiere neue Features
    initRoulette();
    initDailyBonus();
    
    // Initialisiere neue Systeme
    if (typeof generateDailyQuests === 'function') generateDailyQuests();
    if (typeof updateEpochsUI === 'function') updateEpochsUI();
    if (typeof updateQuestsUI === 'function') updateQuestsUI();
    
    // Initiale Anzeigen aktualisieren
    updateDisplay();
    calculateCPS();
    
    // Starte Haupt-Game-Loop mit 33ms Intervall (30 FPS für flüssigen Zähler)
    // Dies sorgt für einen sehr flüssigen Cookie-Zähler
    setInterval(updateGame, 33);
    
    // Golden Cookie Spawner starten (erster Cookie nach 30 Sekunden für Demo-Zwecke)
    setTimeout(() => {
        spawnGoldenCookie();
        scheduleNextGoldenCookie();
    }, 30000);
    
    // Quest-Reset Check (täglich um Mitternacht)
    setInterval(() => {
        const now = Date.now();
        const daysSinceReset = (now - lastQuestReset) / (24 * 60 * 60 * 1000);
        if (daysSinceReset >= 1) {
            lastQuestReset = now;
            questsCompletedToday = 0;
            if (typeof generateDailyQuests === 'function') generateDailyQuests();
            showNotification('📜 Neue tägliche Quests verfügbar!');
        }
    }, 60000); // Check jede Minute
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
        lastBonus,
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
            lastBonus = data.lastBonus || data.lastDailyBonus || 0; // Backwards compatibility
            
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
            updatePrestigeUI();
            updatePrestigeUpgradesUI();
            updateAchievementsUI();
            updateBonusUI();
        } catch (e) {
            console.error('Fehler beim Laden des Spielstands:', e);
        }
    }
});
