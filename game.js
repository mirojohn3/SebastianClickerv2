/**
 * Sebastian Clicker - Refactored
 * A simple clicker game with a modern JS structure.
 */

// --- UTILITIES ---

/**
 * Formats a number into a compact, readable format (e.g., 1.2K, 3.4M).
 * @param {number} num - The number to format.
 * @returns {string} The formatted number string.
 */
function formatNumber(num) {
    if (num < 1000) return num.toFixed(0);
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= suffixes.length) return "∞";
    const shortNum = (num / Math.pow(1000, i));
    // Zeige eine Dezimalstelle für Zahlen unter 10, ansonsten keine.
    return (shortNum < 10 ? shortNum.toFixed(1) : shortNum.toFixed(0)) + suffixes[i];
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- GAME CLASS ---

class SebastianClickerGame {
    /**
     * Initializes the game, setting up state, UI elements, and event listeners.
     */
    constructor() {
        this.sebastians = 0;
        this.totalSebastians = 0;
        this.sebastiansPerSecond = 0;
        this.clicks = 0;
        this.goldenClicks = 0;
        this.activeEffects = [];

        // New state for the click upgrade
        this.clickUpgrade = {
            level: 1,
            basePrice: 50,
            priceMultiplier: 1.5,
        };

        // Rebalanced and expanded upgrades
        this.upgrades = {
            oma: { name: "Oma", basePrice: 15, cps: 1, count: 0 },
            farmer: { name: "Farmer", basePrice: 100, cps: 8, count: 0 },
            mine: { name: "Mine", basePrice: 1100, cps: 47, count: 0 },
            fabrik: { name: "Fabrik", basePrice: 12000, cps: 260, count: 0 },
            bank: { name: "Bank", basePrice: 130000, cps: 1400, count: 0 },
            temple: { name: "Tempel", basePrice: 1.4e6, cps: 7800, count: 0 },
            spaceship: { name: "Raumschiff", basePrice: 20e6, cps: 44000, count: 0 },
            alchemy: { name: "Alchemie-Labor", basePrice: 330e6, cps: 260000, count: 0 },
            portal: { name: "Portal", basePrice: 5.1e9, cps: 1.6e6, count: 0 },
            timeMachine: { name: "Zeitmaschine", basePrice: 75e9, cps: 10e6, count: 0 },
        };

        this.dom = {
            sebastianCount: document.getElementById("CookieCount"),
            cpsCount: document.getElementById("PerSecond"),
            bigSebastian: document.getElementById("bigSebastian"),
            productsContainer: document.getElementById("products"),
            resetButton: document.getElementById("resetStorageButton"),
            goldenCookieContainer: document.getElementById("goldenCookieContainer"),
            // Stats
            spcStat: document.getElementById("spcStat"),
            totalSebastiansStat: document.getElementById("totalSebastians"),
            totalClicksStat: document.getElementById("totalClicks"),
            goldenClicksStat: document.getElementById("goldenClicks"),
            activeEffectsContainer: document.getElementById("activeEffects"),
            rainContainer: document.getElementById("sebastian-rain-container"),
            cursorOrbitContainer: document.getElementById("cursor-orbit-container"), // Orbit container
        };

        this.loadGame();
        this.bindEvents();
        this.recalculateCPS();
        this.updateUI();
        this.updateCursorOrbit(); // Initial update for orbiting cursors

        // Game loops
        setInterval(() => this.gameTick(), 1000);
        setInterval(() => this.updateUI(), 100);
        setInterval(() => this.spawnGoldenCookie(), 15000); // Try to spawn every 15s
        setInterval(() => this.createRainingSebastian(), 500); // Create a falling sebastian every 500ms
    }

    /**
     * Binds all necessary event listeners.
     */
    bindEvents() {
        this.dom.bigSebastian.addEventListener("click", (e) => this.handleBigSebastianClick(e));
        this.dom.productsContainer.addEventListener("click", (e) => this.handleStoreClick(e));
        this.dom.resetButton.addEventListener("click", () => this.resetGame());
    }

    /**
     * Handles clicks on the main clicker element.
     */
    handleBigSebastianClick(e) {
        const clickValue = this.getClickValue();
        this.sebastians += clickValue;
        this.totalSebastians += clickValue;
        this.clicks++;
        this.createFloatingNumber(clickValue, e.clientX, e.clientY);
        this.createRainingSebastian(true); // Spawn extra rain on click
        this.updateUI(); // Immediate feedback
    }

    getClickValue() {
        let multiplier = 1;
        this.activeEffects.forEach(effect => {
            if (effect.clickMultiplier) {
                multiplier *= effect.clickMultiplier;
            }
        });
        // The value of a click is now determined by the click upgrade level
        return this.clickUpgrade.level * multiplier;
    }

    /**
     * Handles clicks within the store panel, delegating to buy upgrades.
     */
    handleStoreClick(e) {
        const productButton = e.target.closest(".product");
        if (productButton) {
            const upgradeKey = productButton.dataset.upgrade;
            if (upgradeKey === 'click') {
                this.buyClickUpgrade();
            } else if (this.upgrades[upgradeKey]) {
                this.buyBuilding(upgradeKey);
            }
        }
    }

    /**
     * Calculates the current price of a building.
     */
    getBuildingPrice(key) {
        const upgrade = this.upgrades[key];
        return Math.ceil(upgrade.basePrice * Math.pow(1.15, upgrade.count));
    }

    /**
     * Calculates the current price of the click upgrade.
     */
    getClickUpgradePrice() {
        return Math.ceil(this.clickUpgrade.basePrice * Math.pow(this.clickUpgrade.priceMultiplier, this.clickUpgrade.level - 1));
    }

    /**
     * Attempts to buy a building.
     */
    buyBuilding(key) {
        const upgrade = this.upgrades[key];
        const price = this.getBuildingPrice(key);

        if (this.sebastians >= price) {
            this.sebastians -= price;
            upgrade.count++;
            this.recalculateCPS();
            this.updateUI();
        }
    }

    /**
     * Attempts to buy the next click upgrade level.
     */
    buyClickUpgrade() {
        const price = this.getClickUpgradePrice();
        if (this.sebastians >= price) {
            this.sebastians -= price;
            this.clickUpgrade.level++;
            this.updateUI();
            this.updateCursorOrbit(); // Update cursors after purchase
        }
    }

    /**
     * Recalculates the total Sebastians per second.
     */
    recalculateCPS() {
        this.sebastiansPerSecond = Object.values(this.upgrades).reduce((total, upg) => {
            return total + upg.cps * upg.count;
        }, 0);
    }

    /**
     * The main game tick, called once per second.
     */
    gameTick() {
        const production = this.getProductionValue();
        this.sebastians += production;
        this.totalSebastians += production;
        this.saveGame();
    }

    getProductionValue() {
        let multiplier = 1;
        this.activeEffects.forEach(effect => {
            if (effect.productionMultiplier) {
                multiplier *= effect.productionMultiplier;
            }
        });
        return this.sebastiansPerSecond * multiplier;
    }

    /**
     * Updates all visible parts of the UI.
     */
    updateUI() {
        const sebastians = Math.floor(this.sebastians);
        this.dom.sebastianCount.textContent = formatNumber(sebastians);
        this.dom.cpsCount.textContent = formatNumber(this.getProductionValue());
        document.title = `${formatNumber(sebastians)} Sebastians - Sebastian Clicker`;

        // Update building shop items
        for (const key in this.upgrades) {
            const upgrade = this.upgrades[key];
            const price = this.getBuildingPrice(key);
            const productButton = this.dom.productsContainer.querySelector(`[data-upgrade="${key}"]`);

            if (productButton) {
                productButton.querySelector('.price span').textContent = formatNumber(price);
                productButton.querySelector('.owned span').textContent = upgrade.count;
                productButton.disabled = this.sebastians < price;
            }
        }

        // Update click upgrade UI
        const clickUpgradeButton = this.dom.productsContainer.querySelector('[data-upgrade="click"]');
        if (clickUpgradeButton) {
            const price = this.getClickUpgradePrice();
            clickUpgradeButton.querySelector('.price span').textContent = formatNumber(price);
            clickUpgradeButton.querySelector('.owned span').textContent = this.clickUpgrade.level;
            clickUpgradeButton.disabled = this.sebastians < price;
        }


        // Update stats
        this.dom.spcStat.textContent = formatNumber(this.getClickValue());
        this.dom.totalSebastiansStat.textContent = formatNumber(Math.floor(this.totalSebastians));
        this.dom.totalClicksStat.textContent = formatNumber(this.clicks);
        this.dom.goldenClicksStat.textContent = formatNumber(this.goldenClicks);

        // Update active effects display
        this.updateActiveEffectsUI();
    }

    /**
     * Updates the visual orbiting cursors around the main clicker.
     */
    updateCursorOrbit() {
        this.dom.cursorOrbitContainer.innerHTML = '';
        const cursorCount = this.clickUpgrade.level - 1;
        if (cursorCount <= 0) return;

        // Limit the number of visible cursors for performance and aesthetics
        const maxVisibleCursors = 50;
        const visibleCursors = Math.min(cursorCount, maxVisibleCursors);

        const orbitRadius = 160; // pixels

        for (let i = 0; i < visibleCursors; i++) {
            const cursor = document.createElement('div');
            cursor.className = 'orbiting-cursor';

            const angle = (360 / visibleCursors) * i;

            cursor.style.setProperty('--orbit-radius', `${orbitRadius}px`);
            cursor.style.setProperty('--rotation', `${angle}deg`);

            this.dom.cursorOrbitContainer.appendChild(cursor);
        }
    }

    /**
     * Creates a single falling Sebastian element for the background effect.
     * @param {boolean} isFromClick - If true, the rain drop is more prominent.
     */
    createRainingSebastian(isFromClick = false) {
        const sebastian = document.createElement('div');
        sebastian.className = 'raining-sebastian';

        const size = randInt(20, 50) + 'px';
        const duration = randInt(isFromClick ? 4 : 8, isFromClick ? 8 : 15) + 's';
        const delay = (isFromClick ? 0 : Math.random() * 5) + 's';
        const horizontalPosition = Math.random() * 100 + 'vw';

        if (isFromClick) {
            sebastian.style.opacity = '0.4'; // More visible when from a click
        }

        sebastian.style.width = size;
        sebastian.style.height = size;
        sebastian.style.left = horizontalPosition;
        sebastian.style.animationDuration = duration;
        sebastian.style.animationDelay = delay;

        this.dom.rainContainer.appendChild(sebastian);

        // Remove the element after it has fallen to keep the DOM clean
        setTimeout(() => {
            sebastian.remove();
        }, (parseFloat(duration) + parseFloat(delay)) * 1000);
    }

    /**
     * Spawns a golden sebastian at a random position, disguised as rain.
     */
    spawnGoldenCookie() {
        // Only one golden cookie at a time
        if (this.dom.rainContainer.querySelector('.golden-sebastian')) return;
        if (Math.random() > 0.15) return; // 15% chance every 15 seconds

        const goldenCookie = document.createElement("div");
        goldenCookie.className = "golden-sebastian"; // Styled to look like rain

        const size = randInt(40, 60) + 'px';
        const duration = randInt(7, 12) + 's';
        const horizontalPosition = Math.random() * 100 + 'vw';

        goldenCookie.style.width = size;
        goldenCookie.style.height = size;
        goldenCookie.style.left = horizontalPosition;
        goldenCookie.style.animationDuration = duration;

        goldenCookie.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from going to anything else
            this.handleGoldenCookieClick();
            goldenCookie.remove();
        }, { once: true });

        this.dom.rainContainer.appendChild(goldenCookie);

        setTimeout(() => {
            goldenCookie.remove();
        }, parseInt(duration) * 1000);
    }

    handleGoldenCookieClick() {
        this.goldenClicks++;
        const effects = [
            { name: "Frenzy", productionMultiplier: 7, duration: 77, description: "7x Produktion!" },
            { name: "Click Frenzy", clickMultiplier: 777, duration: 13, description: "777x Klicks!" },
            { name: "Lucky", type: "instant", description: "Glück gehabt!" }
        ];

        const effect = effects[randInt(0, effects.length - 1)];

        if (effect.type === "instant") {
            const reward = Math.min(this.sebastians * 0.15, this.sebastiansPerSecond * 900) + 13;
            this.sebastians += reward;
            this.createFloatingNumber(reward, window.innerWidth / 2, window.innerHeight / 2);
        } else {
            this.addEffect(effect);
        }
    }

    addEffect(effect) {
        const existingEffect = this.activeEffects.find(e => e.name === effect.name);
        if (existingEffect) {
            existingEffect.duration = effect.duration; // Reset duration
        } else {
            this.activeEffects.push({ ...effect,
                endTime: Date.now() + effect.duration * 1000
            });
        }
    }

    updateActiveEffectsUI() {
        this.dom.activeEffectsContainer.innerHTML = "";
        const now = Date.now();

        this.activeEffects = this.activeEffects.filter(effect => effect.endTime > now);

        this.activeEffects.forEach(effect => {
            const remaining = Math.ceil((effect.endTime - now) / 1000);
            const effectDiv = document.createElement('div');
            effectDiv.className = 'effect-badge';
            effectDiv.textContent = `${effect.description} (${remaining}s)`;
            this.dom.activeEffectsContainer.appendChild(effectDiv);
        });
    }

    /**
     * Creates a floating number animation at the click position.
     */
    createFloatingNumber(amount, x, y) {
        const numberDiv = document.createElement("div");
        numberDiv.className = "floating-number";
        numberDiv.textContent = `+${formatNumber(Math.floor(amount))}`;
        numberDiv.style.left = `${x}px`;
        numberDiv.style.top = `${y}px`;
        numberDiv.style.setProperty('--random-rotation', `${randInt(-15, 15)}deg`);

        document.body.appendChild(numberDiv);

        setTimeout(() => {
            numberDiv.classList.add("sichtbar");
        }, 10);

        setTimeout(() => {
            numberDiv.remove();
        }, 2000);
    }

    /**
     * Saves the current game state to localStorage.
     */
    saveGame() {
        const gameState = {
            sebastians: this.sebastians,
            totalSebastians: this.totalSebastians,
            clicks: this.clicks,
            goldenClicks: this.goldenClicks,
            upgrades: this.upgrades,
            clickUpgrade: this.clickUpgrade, // Save click upgrade state
        };
        try {
            localStorage.setItem("sebastianClickerSave", JSON.stringify(gameState));
        } catch (e) {
            console.error("Failed to save game state:", e);
        }
    }

    /**
     * Loads game state from localStorage.
     */
    loadGame() {
        try {
            const savedState = localStorage.getItem("sebastianClickerSave");
            if (savedState) {
                const gameState = JSON.parse(savedState);
                this.sebastians = gameState.sebastians || 0;
                this.totalSebastians = gameState.totalSebastians || 0;
                this.clicks = gameState.clicks || 0;
                this.goldenClicks = gameState.goldenClicks || 0;

                if (gameState.upgrades) {
                    for (const key in this.upgrades) {
                        if (gameState.upgrades[key]) {
                            this.upgrades[key] = { ...this.upgrades[key], ...gameState.upgrades[key] };
                        }
                    }
                }
                
                if (gameState.clickUpgrade) {
                    this.clickUpgrade = { ...this.clickUpgrade, ...gameState.clickUpgrade };
                }
            }
        } catch (e) {
            console.error("Failed to load game state:", e);
            this.resetGame();
        }
        // This needs to be called after loading the save to show cursors from a saved state
        this.updateCursorOrbit();
    }

    /**
     * Resets the game state and clears localStorage.
     */
    resetGame() {
        if (confirm("Möchtest du wirklich deinen gesamten Fortschritt zurücksetzen?")) {
            this.sebastians = 0;
            this.totalSebastians = 0;
            this.clicks = 0;
            this.goldenClicks = 0;
            
            // Reset buildings
            for (const key in this.upgrades) {
                this.upgrades[key].count = 0;
            }
            
            // Reset click upgrade
            this.clickUpgrade.level = 1;

            this.recalculateCPS();
            this.saveGame();
            location.reload();
        }
    }
}

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    new SebastianClickerGame();
});






