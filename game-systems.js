// ====================================
// ERWEITERTE SPIEL-SYSTEME
// Cookie Empire - Revolutionary Features
// ====================================

// ====================================
// QUEST-SYSTEM FUNKTIONEN
// ====================================

/**
 * Generiert 3 zufällige tägliche Quests
 */
function generateDailyQuests() {
    dailyQuests = [];
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        const template = shuffled[i];
        const difficulty = Math.floor(Math.random() * template.targetAmount.length);
        
        dailyQuests.push({
            id: template.id + '_' + Date.now() + '_' + i,
            name: template.name,
            description: template.description.replace('{amount}', formatNumber(template.targetAmount[difficulty])),
            type: template.type,
            target: template.targetAmount[difficulty],
            progress: 0,
            completed: false,
            reward: template.reward,
            emoji: template.emoji,
            startTime: template.timeLimit ? Date.now() : null,
            timeLimit: template.timeLimit || null
        });
    }
    
    updateQuestsUI();
}

/**
 * Aktualisiert Quest-Progress
 */
function updateQuestProgress(type, value) {
    dailyQuests.forEach(quest => {
        if (quest.completed) return;
        
        if (quest.type === type) {
            quest.progress = value;
            
            // Check Zeitlimit
            if (quest.timeLimit && Date.now() - quest.startTime > quest.timeLimit) {
                quest.failed = true;
                return;
            }
            
            if (quest.progress >= quest.target) {
                completeQuest(quest);
            }
        }
    });
    
    updateQuestsUI();
}

/**
 * Schließt Quest ab und gibt Belohnungen
 */
function completeQuest(quest) {
    if (quest.completed) return;
    
    quest.completed = true;
    questsCompletedToday++;
    
    // Belohnungen vergeben
    if (quest.reward.cookies) {
        cookies += quest.reward.cookies;
        showNotification(`🎉 Quest abgeschlossen! +${formatNumber(quest.reward.cookies)} Cookies!`);
    }
    if (quest.reward.stars) {
        stars += quest.reward.stars;
        showNotification(`⭐ +${quest.reward.stars} Sterne verdient!`);
    }
    if (quest.reward.power) {
        power += quest.reward.power;
        showNotification(`🔮 +${quest.reward.power} Macht erhalten!`);
    }
    if (quest.reward.powerMultiplier) {
        goldenCookieBonus = quest.reward.powerMultiplier;
        goldenCookieBonusEndTime = Date.now() + (10 * 60 * 1000); // 10 Minuten Buff
        showNotification(`⚡ ${quest.reward.powerMultiplier}x Produktions-Boost für 10 Minuten!`);
    }
    
    updateDisplay();
    updateQuestsUI();
}

/**
 * Erstellt Quest UI
 */
function updateQuestsUI() {
    const container = document.getElementById('questsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (dailyQuests.length === 0) {
        container.innerHTML = '<p class="no-quests">Neue Quests werden bald verfügbar sein!</p>';
        return;
    }
    
    dailyQuests.forEach(quest => {
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';
        
        if (quest.completed) questDiv.classList.add('quest-completed');
        if (quest.failed) questDiv.classList.add('quest-failed');
        
        const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
        
        let timeLeftHtml = '';
        if (quest.timeLimit && !quest.completed && !quest.failed) {
            const timeLeft = Math.max(0, quest.timeLimit - (Date.now() - quest.startTime));
            const minutesLeft = Math.floor(timeLeft / 60000);
            const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
            timeLeftHtml = `<div class="quest-timer">⏱️ ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}</div>`;
        }
        
        questDiv.innerHTML = `
            <div class="quest-header">
                <span class="quest-emoji">${quest.emoji}</span>
                <span class="quest-name">${quest.name}</span>
            </div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-progress-bar">
                <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                <span class="quest-progress-text">${formatNumber(quest.progress)} / ${formatNumber(quest.target)}</span>
            </div>
            ${timeLeftHtml}
            <div class="quest-rewards">
                ${quest.reward.cookies ? `🍪 +${formatNumber(quest.reward.cookies)}` : ''}
                ${quest.reward.stars ? `⭐ +${quest.reward.stars}` : ''}
                ${quest.reward.power ? `🔮 +${quest.reward.power}` : ''}
                ${quest.reward.powerMultiplier ? `⚡ ${quest.reward.powerMultiplier}x Boost` : ''}
            </div>
            ${quest.completed ? '<div class="quest-status">✅ Abgeschlossen!</div>' : ''}
            ${quest.failed ? '<div class="quest-status">❌ Fehlgeschlagen</div>' : ''}
        `;
        
        container.appendChild(questDiv);
    });
}

// ====================================
// EPOCHEN-SYSTEM FUNKTIONEN
// ====================================

/**
 * Erstellt Epochen UI
 */
function updateEpochsUI() {
    const container = document.getElementById('epochsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    EPOCHS.forEach((epoch, index) => {
        const epochDiv = document.createElement('div');
        epochDiv.className = 'epoch-item';
        
        if (index === currentEpoch) epochDiv.classList.add('epoch-current');
        if (index < currentEpoch) epochDiv.classList.add('epoch-completed');
        if (epoch.unlocked) epochDiv.classList.add('epoch-unlocked');
        
        const canAdvance = power >= epoch.powerCost && index === currentEpoch + 1;
        
        epochDiv.innerHTML = `
            <div class="epoch-icon">${epoch.name}</div>
            <div class="epoch-info">
                <div class="epoch-cost">Kosten: ${formatNumber(epoch.powerCost)} 🔮 Macht</div>
                ${index === currentEpoch ? '<div class="epoch-status">Aktuelle Epoche</div>' : ''}
                ${index < currentEpoch ? '<div class="epoch-status">✅ Abgeschlossen</div>' : ''}
                ${canAdvance ? '<button class="epoch-advance-btn" onclick="advanceEpoch(' + index + ')">Voranschreiten!</button>' : ''}
                ${index > currentEpoch + 1 ? '<div class="epoch-locked">🔒 Vorherige Epoche erforderlich</div>' : ''}
            </div>
        `;
        
        container.appendChild(epochDiv);
    });
}

/**
 * Schreitet zur nächsten Epoche voran
 */
function advanceEpoch(epochIndex) {
    const epoch = EPOCHS[epochIndex];
    
    if (power < epoch.powerCost) {
        showNotification('⚠️ Nicht genug Macht!');
        return;
    }
    
    if (epochIndex !== currentEpoch + 1) {
        showNotification('⚠️ Du musst die Epochen der Reihe nach freischalten!');
        return;
    }
    
    power -= epoch.powerCost;
    currentEpoch = epochIndex;
    epoch.unlocked = true;
    
    showNotification(`🎉 Willkommen im ${epoch.name}!`);
    
    // Epoch-Visual-Update
    document.getElementById('currentEpochName').textContent = epoch.name;
    
    updateDisplay();
    updateEpochsUI();
    updateUpgradesUI(); // Neue Gebäude könnten freigeschaltet werden
}

// ====================================
// EXPEDITIONS-SYSTEM
// ====================================

/**
 * Startet eine zufällige Expedition
 */
function startExpedition() {
    if (expeditionActive) return;
    
    const expeditionTypes = [
        {
            name: '🏝️ Schatzinsel',
            description: 'Eine mysteriöse Insel voller Schätze!',
            minigame: 'memory',
            rewards: { cookies: 50000, stars: 10 }
        },
        {
            name: '👽 Alien-Planet',
            description: 'Ein fremder Planet mit exotischen Ressourcen!',
            minigame: 'clickDuel',
            rewards: { stars: 15, power: 50 }
        },
        {
            name: '⏳ Zeitportal',
            description: 'Reise durch die Zeit!',
            minigame: 'choice',
            rewards: { cookies: 100000, power: 100 }
        },
        {
            name: '🏺 Antike Ruinen',
            description: 'Uralte Geheimnisse warten auf dich!',
            minigame: 'memory',
            rewards: { stars: 20, cookies: 75000 }
        }
    ];
    
    const expedition = expeditionTypes[Math.floor(Math.random() * expeditionTypes.length)];
    
    expeditionActive = true;
    showExpeditionModal(expedition);
}

/**
 * Zeigt Expeditions-Modal
 */
function showExpeditionModal(expedition) {
    const modal = document.getElementById('expeditionModal');
    const content = document.getElementById('expeditionContent');
    const title = document.getElementById('expeditionTitle');
    
    title.textContent = expedition.name;
    
    if (expedition.minigame === 'memory') {
        content.innerHTML = createMemoryGame(expedition);
    } else if (expedition.minigame === 'clickDuel') {
        content.innerHTML = createClickDuel(expedition);
    } else if (expedition.minigame === 'choice') {
        content.innerHTML = createChoiceGame(expedition);
    }
    
    modal.classList.remove('hidden');
}

/**
 * Memory-Spiel für Expeditionen
 */
function createMemoryGame(expedition) {
    const symbols = ['🍪', '⭐', '🔮', '🏆', '💎', '👑'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    
    let firstCard = null;
    let secondCard = null;
    let matches = 0;
    
    let html = `
        <p>${expedition.description}</p>
        <p class="expedition-challenge">Finde alle Paare, um die Belohnung zu verdoppeln!</p>
        <div class="memory-grid">
    `;
    
    cards.forEach((symbol, index) => {
        html += `<div class="memory-card" data-symbol="${symbol}" data-index="${index}" onclick="flipMemoryCard(this, '${JSON.stringify(expedition).replace(/'/g, "\\'")}')">?</div>`;
    });
    
    html += `
        </div>
        <button class="expedition-skip-btn" onclick="skipExpedition('${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
            Überspringen (normale Belohnung)
        </button>
    `;
    
    return html;
}

/**
 * Klick-Duell für Expeditionen
 */
function createClickDuel(expedition) {
    return `
        <p>${expedition.description}</p>
        <p class="expedition-challenge">Klicke so oft wie möglich in 10 Sekunden!</p>
        <div class="click-duel-area">
            <div class="click-duel-counter" id="clickDuelCount">0</div>
            <button class="click-duel-btn" id="clickDuelBtn" onclick="clickDuelClick()">KLICK!</button>
            <div class="click-duel-timer" id="clickDuelTimer">10</div>
        </div>
        <button class="expedition-start-btn" onclick="startClickDuel('${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
            Start!
        </button>
        <button class="expedition-skip-btn" onclick="skipExpedition('${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
            Überspringen
        </button>
    `;
}

/**
 * Entscheidungs-Spiel für Expeditionen
 */
function createChoiceGame(expedition) {
    return `
        <p>${expedition.description}</p>
        <p class="expedition-challenge">Wähle weise! Eine Option verdoppelt die Belohnung, eine halbiert sie!</p>
        <div class="choice-buttons">
            <button class="choice-btn" onclick="makeExpeditionChoice(2, '${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
                🎲 Risiko (0.5x oder 2x)
            </button>
            <button class="choice-btn" onclick="makeExpeditionChoice(1, '${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
                ✅ Sicher (1x)
            </button>
            <button class="choice-btn" onclick="makeExpeditionChoice(Math.random() < 0.5 ? 0.5 : 3, '${JSON.stringify(expedition).replace(/'/g, "\\'")}')">
                💰 Großes Risiko (0.5x oder 3x)
            </button>
        </div>
    `;
}

/**
 * Schließt Expedition ab
 */
function completeExpedition(expedition, multiplier = 1) {
    const rewards = expedition.rewards;
    
    if (rewards.cookies) {
        cookies += rewards.cookies * multiplier;
        showNotification(`🍪 +${formatNumber(rewards.cookies * multiplier)} Cookies!`);
    }
    if (rewards.stars) {
        stars += Math.floor(rewards.stars * multiplier);
        showNotification(`⭐ +${Math.floor(rewards.stars * multiplier)} Sterne!`);
    }
    if (rewards.power) {
        power += Math.floor(rewards.power * multiplier);
        showNotification(`🔮 +${Math.floor(rewards.power * multiplier)} Macht!`);
    }
    
    expeditionActive = false;
    lastExpedition = Date.now();
    document.getElementById('expeditionModal').classList.add('hidden');
    
    updateDisplay();
    updateQuestProgress('complete_expedition', 1);
}

function skipExpedition(expeditionStr) {
    const expedition = JSON.parse(expeditionStr);
    completeExpedition(expedition, 1);
}

function makeExpeditionChoice(multiplier, expeditionStr) {
    const expedition = JSON.parse(expeditionStr);
    completeExpedition(expedition, multiplier);
}

// ====================================
// RANDOM EVENTS
// ====================================

const RANDOM_EVENTS = [
    {
        id: 'cookie_tornado',
        name: '🌪️ Cookie-Tornado',
        description: 'Schnapp dir die fliegenden Cookies!',
        duration: 15000,
        action: startCookieTornado
    },
    {
        id: 'king_visit',
        name: '👑 Königsbesuch',
        description: 'Der König ist beeindruckt von deiner CPS!',
        duration: 5000,
        action: kingVisit
    },
    {
        id: 'lucky_wheel',
        name: '🎲 Glücksrad',
        description: 'Drehe das Rad des Schicksals!',
        duration: 0,
        action: luckyWheel
    },
    {
        id: 'time_rift',
        name: '⚡ Zeitriss',
        description: '30 Sekunden 10x Produktion!',
        duration: 30000,
        action: timeRift
    }
];

function triggerRandomEvent() {
    if (eventActive) return;
    
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    eventActive = true;
    event.action(event);
}

function startCookieTornado(event) {
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('eventTitle');
    const content = document.getElementById('eventContent');
    
    title.textContent = event.name;
    content.innerHTML = `
        <p>${event.description}</p>
        <div class="tornado-area" id="tornadoArea">
            <!-- Cookies werden hier spawnen -->
        </div>
        <div class="tornado-score">Gefangen: <span id="tornadoScore">0</span>/20</div>
    `;
    
    modal.classList.remove('hidden');
    
    let caught = 0;
    const interval = setInterval(() => {
        if (caught >= 20) {
            clearInterval(interval);
            const reward = caught * 1000;
            cookies += reward;
            showNotification(`🌪️ ${caught} Cookies gefangen! +${formatNumber(reward)} Belohnung!`);
            modal.classList.add('hidden');
            eventActive = false;
            lastRandomEvent = Date.now();
            return;
        }
        
        spawnFlyingCookie();
    }, 700);
}

function kingVisit(event) {
    const multiplier = Math.max(1, Math.floor(cookiesPerSecond / 1000));
    const reward = cookiesPerSecond * 60 * multiplier;
    
    cookies += reward;
    showNotification(`👑 Der König ist beeindruckt! +${formatNumber(reward)} Cookies!`);
    
    eventActive = false;
    lastRandomEvent = Date.now();
}

function luckyWheel(event) {
    const rewards = [
        { type: 'cookies', amount: 10000, emoji: '🍪' },
        { type: 'stars', amount: 20, emoji: '⭐' },
        { type: 'power', amount: 50, emoji: '🔮' },
        { type: 'multiplier', amount: 2, duration: 300000, emoji: '⚡' },
        { type: 'cookies', amount: 100000, emoji: '💰' }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (reward.type === 'cookies') {
        cookies += reward.amount;
        showNotification(`${reward.emoji} Glücksrad: +${formatNumber(reward.amount)} Cookies!`);
    } else if (reward.type === 'stars') {
        stars += reward.amount;
        showNotification(`${reward.emoji} Glücksrad: +${reward.amount} Sterne!`);
    } else if (reward.type === 'power') {
        power += reward.amount;
        showNotification(`${reward.emoji} Glücksrad: +${reward.amount} Macht!`);
    } else if (reward.type === 'multiplier') {
        goldenCookieBonus = reward.amount;
        goldenCookieBonusEndTime = Date.now() + reward.duration;
        showNotification(`${reward.emoji} Glücksrad: ${reward.amount}x Produktion für 5 Minuten!`);
    }
    
    eventActive = false;
    lastRandomEvent = Date.now();
    updateDisplay();
}

function timeRift(event) {
    goldenCookieBonus = 10;
    goldenCookieBonusEndTime = Date.now() + event.duration;
    showNotification('⚡ Zeitriss! 10x Produktion für 30 Sekunden!');
    
    setTimeout(() => {
        eventActive = false;
        lastRandomEvent = Date.now();
    }, event.duration);
}

// ====================================
// GEBÄUDE-SYNERGIEN
// ====================================

/**
 * Berechnet aktive Synergien
 */
function calculateSynergies() {
    let activeSynergies = 0;
    
    upgrades.forEach(building => {
        if (building.count === 0) return;
        
        building.synergyWith.forEach(partnerId => {
            const partner = upgrades.find(u => u.id === partnerId);
            if (partner && partner.count > 0) {
                activeSynergies++;
            }
        });
    });
    
    return activeSynergies;
}

/**
 * Berechnet Synergie-Bonus für Gebäude
 */
function getSynergyMultiplier(buildingId) {
    const building = upgrades.find(u => u.id === buildingId);
    if (!building || building.count === 0) return 1;
    
    let multiplier = 1;
    
    building.synergyWith.forEach(partnerId => {
        const partner = upgrades.find(u => u.id === partnerId);
        if (partner && partner.count > 0) {
            multiplier += 0.25; // +25% pro aktiver Synergie
        }
    });
    
    return multiplier;
}

// ====================================
// MACHT & STERNE GENERIERUNG
// ====================================

/**
 * Berechnet Macht-Generierung pro Stunde
 */
function calculatePowerGeneration() {
    powerPerHour = 0;
    
    upgrades.forEach(building => {
        if (building.count > 0 && building.powerGen) {
            powerPerHour += building.count * building.powerGen;
        }
    });
    
    // Epochen-Bonus
    powerPerHour *= (1 + currentEpoch * 0.1);
}

/**
 * Berechnet Sterne-Generierung
 */
function calculateStarGeneration() {
    // Sterne werden hauptsächlich durch Quests und Expeditionen verdient
    // Aber hohe CPS gibt auch passive Sterne
    starsPerHour = Math.floor(cookiesPerSecond / 10000);
}
