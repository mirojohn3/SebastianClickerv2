// =================== Spielkonstanten ===================
const RESET_COST = 40000000;    // Kosten für einen Reset
const PRICE_INCREASE = 0.05;        // Preiserhöhung um 15% (wie in Cookie Clicker)
const GOLDEN_COOKIE_FREQ = 0.8;     // 30% Chance pro Minute für Golden Sebastian
const GOLDEN_COOKIE_DURATION = 2;   // 13 Sekunden Dauer für Golden Sebastian

// =================== Spielvariablen ===================
let CookieCount = 0;                // Aktuelle Anzahl Sebastians
let CookiesPerSecond = 0;          // Sebastians pro Sekunde
let mengecookiesproklick = 1;      // Sebastians pro Klick
let resetCounter = 0;              // Anzahl der Resets
let totalCookies = 0;              // Gesamtanzahl gesammelter Sebastians
let goldenCookieTimer = null;      // Timer für Golden Sebastian

// Gebäude-Zähler
let Oma = 0;          // +1/s
let Farmer = 0;       // +5/s
let Mine = 0;         // +25/s
let Fabrik = 0;       // +100/s
let Bank = 0;         // +1.500/s
let Planet = 0;       // +10.000/s

// Gebäude-Preise
let preis_oma = 5;
let preis_Farm = 50;
let preis_Mine = 500;
let preis_Fabrik = 5500;
let preis_Bank = 100000;
let preis_Planet = 1000000;

// =================== Hilfsfunktionen ===================

// Formatiert große Zahlen leserlich
function formatNumber(num) {
    return num.toLocaleString('de-DE');
}

// Zufallszahl zwischen min und max
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Aktualisiert alle Anzeigen
function updateDisplay() {
    document.getElementById("CookieCount").innerText = formatNumber(CookieCount);
    document.getElementById("PerSecond").innerText = formatNumber(CookiesPerSecond);
    document.getElementById("Omacounterid").innerText = formatNumber(Oma);
    document.getElementById("Farmercookiecounterid").innerText = formatNumber(Farmer);
    document.getElementById("Minecookiecounterid").innerText = formatNumber(Mine);
    document.getElementById("Fabrikcookiecounterid").innerText = formatNumber(Fabrik);
    document.getElementById("bankcookiecounterid").innerText = formatNumber(Bank);
    document.getElementById("Planetcookiecounterid").innerText = formatNumber(Planet);
    document.getElementById("preis_oma_id").innerText = formatNumber(preis_oma);
    document.getElementById("preis_Farm_id").innerText = formatNumber(preis_Farm);
    document.getElementById("preis_Mine_id").innerText = formatNumber(preis_Mine);
    document.getElementById("preis_Fabrik_id").innerText = formatNumber(preis_Fabrik);
    document.getElementById("preis_Bank_id").innerText = formatNumber(preis_Bank);
    document.getElementById("preis_Planet_id").innerText = formatNumber(preis_Planet);
}

// =================== Hauptspiel-Funktionen ===================

// Klick auf Sebastian
function CookieClick() {
    const amount = mengecookiesproklick * getClickMultiplier();
    CookieCount += amount;
    totalCookies += amount;
    localStorage.setItem("CookieCount", CookieCount);
    localStorage.setItem("totalCookies", totalCookies);
    updateDisplay();
    createFloatingNumber(amount);
    // achievements removed: no-op
}

// Erstellt fliegende Bild-Animation
function createFloatingNumber(amount) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("floating-number");
    
    // Erstelle ein neues Bild-Element
    const img = document.createElement("img");
    img.src = "seb2.png";
    img.alt = "Mini Sebastian";
    newDiv.appendChild(img);
    
    // Position relativ zum Big Sebastian
    const cookie = document.getElementById("bigSebastian");
    const rect = cookie.getBoundingClientRect();
    const offset = 100; // Abstand vom Cookie
    
    // Zufällige Position und Rotation
    newDiv.style.left = (rect.left + randInt(-offset, offset)) + "px";
    newDiv.style.top = (rect.top + randInt(-offset, offset)) + "px";
    newDiv.style.setProperty('--random-rotation', `${randInt(-30, 30)}deg`);
    
    document.body.appendChild(newDiv);
    setTimeout(() => newDiv.classList.add("sichtbar"), 10);
    setTimeout(() => {
        newDiv.classList.remove("sichtbar");
        setTimeout(() => newDiv.remove(), 1000);
    }, 400);
}

// Golden Sebastian Funktionen
function spawnGoldenCookie() {
    if (Math.random() > GOLDEN_COOKIE_FREQ) return;
    
    const golden = document.createElement("img");
    golden.src = "Sebastian.png";
    golden.classList.add("goldenSebastian");
    
    // Zufällige Position am Bildschirm
    const maxX = window.innerWidth - 128;
    const maxY = window.innerHeight - 128;
    golden.style.left = randInt(0, maxX) + "px";
    golden.style.top = randInt(0, maxY) + "px";
    
    golden.onclick = () => {
        const effects = [
            { name: "Frenzy", multiplier: 7, duration: 77 },
            { name: "Lucky", cookies: Math.min(CookieCount * 0.1, CookiesPerSecond * 900) },
            { name: "Click Frenzy", clickMultiplier: 777, duration: 13 }
        ];
        
        const effect = effects[Math.floor(Math.random() * effects.length)];
        applyGoldenCookieEffect(effect);
        golden.remove();
    };
    
    document.getElementById("goldenCookieContainer").appendChild(golden);
    setTimeout(() => golden.remove(), GOLDEN_COOKIE_DURATION * 1000);
}

// Effekte von Golden Sebastian
let activeEffects = [];

function applyGoldenCookieEffect(effect) {
    if (effect.name === "Lucky") {
        CookieCount += effect.cookies;
        totalCookies += effect.cookies;
        createFloatingNumber(effect.cookies);
    } else {
        activeEffects.push(effect);
        setTimeout(() => {
            const index = activeEffects.indexOf(effect);
            if (index > -1) activeEffects.splice(index, 1);
        }, effect.duration * 1000);
    }
    
    updateDisplay();
    saveGameState();
}

// Berechnet aktuelle Multiplikatoren
function getClickMultiplier() {
    let multiplier = 1;
    for (const effect of activeEffects) {
        if (effect.clickMultiplier) multiplier *= effect.clickMultiplier;
    }
    return multiplier;
}

function getCPSMultiplier() {
    let multiplier = 1;
    for (const effect of activeEffects) {
        if (effect.multiplier) multiplier *= effect.multiplier;
    }
    return multiplier;
}

// Automatische Produktion pro Sekunde
setInterval(() => {
    const production = CookiesPerSecond * getCPSMultiplier();
    CookieCount += production;
    totalCookies += production;
    localStorage.setItem("CookieCount", CookieCount);
    localStorage.setItem("totalCookies", totalCookies);
    updateDisplay();
}, 1000);

// =================== Upgrade-Funktionen ===================

// Generische Upgrade-Funktion
function upgrade(cost, count, costId, counterId, perSecond) {
    if (CookieCount >= cost) {
        CookieCount -= cost;
        CookiesPerSecond += perSecond;
        count++;
        cost = Math.ceil(cost * (1 + PRICE_INCREASE));
        
        localStorage.setItem("CookieCount", CookieCount);
        localStorage.setItem("CookiesPerSecond", CookiesPerSecond);
        localStorage.setItem(counterId, count);
        localStorage.setItem(costId, cost);
        
        saveGameState(); // Save full game state after each upgrade
        updateDisplay();
        return { newCost: cost, newCount: count };
    } else {
        alert("Nicht genug Sebastians! Sammle weiter!");
        return null;
    }
}

// Spezifische Upgrade-Funktionen
function OmaUpgrade() {
    const result = upgrade(preis_oma, Oma, "preis_oma", "Omacookiecounter", 1);
    if (result) {
        preis_oma = result.newCost;
        Oma = result.newCount;
    }
}

function FarmerUpgrade() {
    const result = upgrade(preis_Farm, Farmer, "preis_Farm", "Farmercookiecounter", 5);
    if (result) {
        preis_Farm = result.newCost;
        Farmer = result.newCount;
    }
}

function MineUpgrade() {
    const result = upgrade(preis_Mine, Mine, "preis_Mine", "Minecookiecounter", 25);
    if (result) {
        preis_Mine = result.newCost;
        Mine = result.newCount;
    }
}

function FabrikUpgrade() {
    const result = upgrade(preis_Fabrik, Fabrik, "preis_Fabrik", "Fabrikcookiecounter", 100);
    if (result) {
        preis_Fabrik = result.newCost;
        Fabrik = result.newCount;
    }
}

function BankUpgrade() {
    const result = upgrade(preis_Bank, Bank, "preis_Bank", "bankcookiecounter", 1500);
    if (result) {
        preis_Bank = result.newCost;
        Bank = result.newCount;
    }
}

function PlanetUpgrade() {
    const result = upgrade(preis_Planet, Planet, "preis_Planet", "Planetcookiecounter", 10000);
    if (result) {
        preis_Planet = result.newCost;
        Planet = result.newCount;
    }
}

// Achievements and milk removed — simplified game state.

// =================== Reset und Speicher-Funktionen ===================

// Reset-Funktion (Prestige)
function resetleck() {
    if (CookieCount >= RESET_COST) {
        mengecookiesproklick *= 2;
        resetCounter++;
        
        // Zurücksetzen aller Werte
        CookieCount = 0;
        CookiesPerSecond = 0;
        Oma = 0;
        Farmer = 0;
        Mine = 0;
        Fabrik = 0;
        Bank = 0;
        Planet = 0;
        
        // Preise zurücksetzen
        preis_oma = 75;
        preis_Farm = 500;
        preis_Mine = 5000;
        preis_Fabrik = 75000;
        preis_Bank = 1000000;
        preis_Planet = 100000000;
        
        // Alles speichern
        localStorage.setItem("mengecookiesproklick", mengecookiesproklick);
        localStorage.setItem("resetcounter", resetCounter);
        saveGameState();
        updateDisplay();
    } else {
        alert("Du brauchst 400 Milliarden Sebastians für einen Reset!");
    }
}

// Speicher löschen
function deletestorage() {
    if (confirm("Möchtest du wirklich den gesamten Spielstand löschen?")) {
        localStorage.clear();
        location.reload();
    }
}

// Spielstand speichern
function saveGameState() {
    const variables = {
        CookieCount, CookiesPerSecond, mengecookiesproklick, resetCounter,
        Oma, Farmer, Mine, Fabrik, Bank, Planet,
        preis_oma, preis_Farm, preis_Mine, preis_Fabrik, preis_Bank, preis_Planet
    };
    
    for (const [key, value] of Object.entries(variables)) {
        localStorage.setItem(key, value);
    }
}

// Spielstand laden
window.addEventListener("DOMContentLoaded", () => {
    // Load game state with explicit assignments
    CookieCount = parseInt(localStorage.getItem("CookieCount")) || CookieCount;
    CookiesPerSecond = parseInt(localStorage.getItem("CookiesPerSecond")) || CookiesPerSecond;
    mengecookiesproklick = parseInt(localStorage.getItem("mengecookiesproklick")) || mengecookiesproklick;
    resetCounter = parseInt(localStorage.getItem("resetcounter")) || resetCounter;
    totalCookies = parseInt(localStorage.getItem("totalCookies")) || totalCookies;
    
    // Load building counts
    Oma = parseInt(localStorage.getItem("Omacookiecounter")) || Oma;
    Farmer = parseInt(localStorage.getItem("Farmercookiecounter")) || Farmer;
    Mine = parseInt(localStorage.getItem("Minecookiecounter")) || Mine;
    Fabrik = parseInt(localStorage.getItem("Fabrikcookiecounter")) || Fabrik;
    Bank = parseInt(localStorage.getItem("bankcookiecounter")) || Bank;
    Planet = parseInt(localStorage.getItem("Planetcookiecounter")) || Planet;
    
    // Load prices
    preis_oma = parseInt(localStorage.getItem("preis_oma")) || preis_oma;
    preis_Farm = parseInt(localStorage.getItem("preis_Farm")) || preis_Farm;
    preis_Mine = parseInt(localStorage.getItem("preis_Mine")) || preis_Mine;
    preis_Fabrik = parseInt(localStorage.getItem("preis_Fabrik")) || preis_Fabrik;
    preis_Bank = parseInt(localStorage.getItem("preis_Bank")) || preis_Bank;
    preis_Planet = parseInt(localStorage.getItem("preis_Planet")) || preis_Planet;
    
    updateDisplay();
    // Start golden cookie spawning
    setInterval(spawnGoldenCookie, 60000);

});
