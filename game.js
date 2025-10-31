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
        this.sebastiansPerClick = 1;
        this.prestigeLevel = 0;
        this.clicks = 0;
        this.goldenClicks = 0;

        this.activeEffects = [];

        this.upgrades = {
            oma: { name: "Oma", basePrice: 15, cps: 1, count: 0 },
            farmer: { name: "Farmer", basePrice: 100, cps: 5, count: 0 },
            mine: { name: "Mine", basePrice: 1200, cps: 25, count: 0 },
            fabrik: { name: "Fabrik", basePrice: 15000, cps: 100, count: 0 },
            bank: { name: "Bank", basePrice: 200000, cps: 1500, count: 0 },
            planet: { name: "Planet", basePrice: 3000000, cps: 10000, count: 0 },
        };

        this.dom = {
            sebastianCount: document.getElementById("CookieCount"),
            cpsCount: document.getElementById("PerSecond"),
            bigSebastian: document.getElementById("bigSebastian"),
            productsContainer: document.getElementById("products"),
            prestigeButton: document.getElementById("prestigeButton"),
            resetButton: document.getElementById("resetStorageButton"),
            goldenCookieContainer: document.getElementById("goldenCookieContainer"),
            // Stats
            totalSebastiansStat: document.getElementById("totalSebastians"),
            totalClicksStat: document.getElementById("totalClicks"),
            goldenClicksStat: document.getElementById("goldenClicks"),
            activeEffectsContainer: document.getElementById("activeEffects"),
        };

        this.loadGame();
        this.bindEvents();
        this.recalculateCPS();
        this.updateUI();

        // Game loops
        setInterval(() => this.gameTick(), 1000);
        setInterval(() => this.updateUI(), 100);
        setInterval(() => this.spawnGoldenCookie(), 15000); // Try to spawn every 15s
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
        this.updateUI(); // Immediate feedback
    }

    getClickValue() {
        let multiplier = 1;
        this.activeEffects.forEach(effect => {
            if (effect.clickMultiplier) {
                multiplier *= effect.clickMultiplier;
            }
        });
        return this.sebastiansPerClick * multiplier;
    }

    /**
     * Handles clicks within the store panel, delegating to buy upgrades.
     */
    handleStoreClick(e) {
        const productButton = e.target.closest(".product");
        if (productButton) {
            const upgradeKey = productButton.dataset.upgrade;
            if (upgradeKey) {
                this.buyUpgrade(upgradeKey);
            }
        }
    }

    /**
     * Calculates the current price of an upgrade.
     */
    getUpgradePrice(key) {
        const upgrade = this.upgrades[key];
        return Math.ceil(upgrade.basePrice * Math.pow(1.15, upgrade.count));
    }

    /**
     * Attempts to buy an upgrade.
     */
    buyUpgrade(key) {
        const upgrade = this.upgrades[key];
        const price = this.getUpgradePrice(key);

        if (this.sebastians >= price) {
            this.sebastians -= price;
            upgrade.count++;
            this.recalculateCPS();
            this.updateUI();
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

        for (const key in this.upgrades) {
            const upgrade = this.upgrades[key];
            const price = this.getUpgradePrice(key);
            const productButton = this.dom.productsContainer.querySelector(`[data-upgrade="${key}"]`);

            if (productButton) {
                productButton.querySelector('.price span').textContent = formatNumber(price);
                productButton.querySelector('.owned span').textContent = upgrade.count;
                productButton.disabled = this.sebastians < price;
            }
        }

        // Update stats
        this.dom.totalSebastiansStat.textContent = formatNumber(Math.floor(this.totalSebastians));
        this.dom.totalClicksStat.textContent = formatNumber(this.clicks);
        this.dom.goldenClicksStat.textContent = formatNumber(this.goldenClicks);

        // Update active effects display
        this.updateActiveEffectsUI();
    }

    /**
     * Spawns a golden sebastian at a random position.
     */
    spawnGoldenCookie() {
        if (Math.random() > 0.3) return; // 30% chance every 15 seconds

        const goldenCookie = document.createElement("div");
        goldenCookie.className = "golden-sebastian";
        const x = randInt(10, 90);
        const y = randInt(10, 90);
        goldenCookie.style.left = `${x}vw`;
        goldenCookie.style.top = `${y}vh`;

        goldenCookie.addEventListener('click', () => {
            this.handleGoldenCookieClick();
            goldenCookie.remove();
        });

        this.dom.goldenCookieContainer.appendChild(goldenCookie);

        setTimeout(() => {
            goldenCookie.remove();
        }, 10000); // Despawns after 10 seconds
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
            prestigeLevel: this.prestigeLevel,
            clicks: this.clicks,
            goldenClicks: this.goldenClicks,
            upgrades: this.upgrades,
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
                this.prestigeLevel = gameState.prestigeLevel || 0;
                this.clicks = gameState.clicks || 0;
                this.goldenClicks = gameState.goldenClicks || 0;

                if (gameState.upgrades) {
                    for (const key in this.upgrades) {
                        if (gameState.upgrades[key]) {
                            this.upgrades[key] = { ...this.upgrades[key], ...gameState.upgrades[key] };
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load game state:", e);
            this.resetGame();
        }
    }

    /**
     * Resets the game state and clears localStorage.
     */
    resetGame() {
        if (confirm("Möchtest du wirklich deinen gesamten Fortschritt zurücksetzen?")) {
            this.sebastians = 0;
            this.totalSebastians = 0;
            this.prestigeLevel = 0;
            this.clicks = 0;
            this.goldenClicks = 0;
            for (const key in this.upgrades) {
                this.upgrades[key].count = 0;
            }
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






