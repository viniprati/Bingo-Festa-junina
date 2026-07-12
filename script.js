(() => {
    const TOTAL_NUMBERS = 75;
    const COLUMN_SIZE = 15;
    const HISTORY_LIMIT = 6;
    const STORAGE_KEY = "bingo-festa-junina-state";
    const ALL_NUMBERS = Array.from({ length: TOTAL_NUMBERS }, (_, index) => index + 1);
    const LETTERS = ["B", "I", "N", "G", "O"];
    const CONFETTI_COLORS = ["#d73b2f", "#f9c642", "#2369b3", "#2f8f4e", "#ef7f22"];

    const elements = {};
    let state = createInitialState();
    let lastFocusedElement = null;

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        cacheElements();
        state = loadState();
        buildBoard();
        render();
        bindEvents();
    }

    function cacheElements() {
        elements.drawButton = document.getElementById("draw-button");
        elements.rulesButton = document.getElementById("rules-button");
        elements.resetButton = document.getElementById("reset-button");
        elements.closeRulesButton = document.getElementById("close-rules-button");
        elements.currentBall = document.getElementById("current-ball");
        elements.currentLetter = document.getElementById("current-letter");
        elements.currentNumber = document.getElementById("current-number");
        elements.drawStatus = document.getElementById("draw-status");
        elements.historyList = document.getElementById("history-list");
        elements.remainingCount = document.getElementById("remaining-count");
        elements.rulesModal = document.getElementById("rules-modal");
        elements.confettiLayer = document.getElementById("confetti-layer");
        elements.columns = {
            B: document.getElementById("all-b"),
            I: document.getElementById("all-i"),
            N: document.getElementById("all-n"),
            G: document.getElementById("all-g"),
            O: document.getElementById("all-o"),
        };
    }

    function createInitialState() {
        return {
            drawnNumbers: [],
            availableNumbers: [...ALL_NUMBERS],
            lastNumber: null,
        };
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (!isValidSavedState(saved)) {
                return createInitialState();
            }

            return normalizeState(saved);
        } catch (error) {
            return createInitialState();
        }
    }

    function isValidSavedState(saved) {
        if (!saved || !Array.isArray(saved.drawnNumbers) || !Array.isArray(saved.availableNumbers)) {
            return false;
        }

        const allSavedNumbers = [...saved.drawnNumbers, ...saved.availableNumbers];
        const uniqueNumbers = new Set(allSavedNumbers);

        return allSavedNumbers.length === TOTAL_NUMBERS
            && uniqueNumbers.size === TOTAL_NUMBERS
            && allSavedNumbers.every(isBingoNumber)
            && (saved.lastNumber === null || saved.drawnNumbers.includes(saved.lastNumber));
    }

    function normalizeState(saved) {
        return {
            drawnNumbers: saved.drawnNumbers.map(Number),
            availableNumbers: saved.availableNumbers.map(Number),
            lastNumber: saved.lastNumber === null ? null : Number(saved.lastNumber),
        };
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function isBingoNumber(number) {
        return Number.isInteger(number) && number >= 1 && number <= TOTAL_NUMBERS;
    }

    function getLetter(number) {
        const index = Math.ceil(number / COLUMN_SIZE) - 1;
        return LETTERS[index];
    }

    function formatCall(number) {
        return `${getLetter(number)}${String(number).padStart(2, "0")}`;
    }

    function buildBoard() {
        Object.values(elements.columns).forEach((column) => {
            column.textContent = "";
        });

        ALL_NUMBERS.forEach((number) => {
            const ball = document.createElement("span");
            ball.className = "ball";
            ball.id = `ball-${number}`;
            ball.textContent = number;
            ball.setAttribute("aria-label", `${getLetter(number)} ${number}`);
            elements.columns[getLetter(number)].appendChild(ball);
        });
    }

    function bindEvents() {
        elements.drawButton.addEventListener("click", drawNumber);
        elements.resetButton.addEventListener("click", resetRound);
        elements.rulesButton.addEventListener("click", openModal);
        elements.closeRulesButton.addEventListener("click", closeModal);

        document.addEventListener("click", (event) => {
            if (isModalOpen() && !event.target.closest(".modal-content") && event.target !== elements.rulesButton) {
                closeModal({ restoreFocus: false });
            }
        });

        document.addEventListener("keydown", handleKeyboard);
    }

    function handleKeyboard(event) {
        if (event.key === "Escape" && isModalOpen()) {
            closeModal();
            return;
        }

        if ((event.key === " " || event.key === "Enter") && canUseDrawShortcut(event)) {
            event.preventDefault();
            drawNumber();
        }
    }

    function canUseDrawShortcut(event) {
        const activeTag = document.activeElement?.tagName;
        const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
        const isButtonFocused = activeTag === "BUTTON";

        return !isTyping && !isButtonFocused && !isModalOpen() && !elements.drawButton.disabled;
    }

    function drawNumber() {
        if (state.availableNumbers.length === 0) {
            updateFinishedState();
            return;
        }

        const randomIndex = Math.floor(Math.random() * state.availableNumbers.length);
        const [newNumber] = state.availableNumbers.splice(randomIndex, 1);

        state.drawnNumbers.push(newNumber);
        state.lastNumber = newNumber;
        saveState();
        render(newNumber);
        celebrateDraw();
    }

    function resetRound() {
        const confirmed = window.confirm("Reiniciar a rodada e apagar todos os números sorteados?");

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
        state = createInitialState();
        render();
        elements.drawButton.focus();
    }

    function render(newNumber = null) {
        renderCurrentBall();
        renderBoard(newNumber);
        renderHistory();
        renderRemainingCount();
        updateFinishedState();
    }

    function renderCurrentBall() {
        if (!state.lastNumber) {
            elements.currentLetter.textContent = "?";
            elements.currentNumber.textContent = "--";
            elements.currentBall.setAttribute("aria-label", "Nenhum número sorteado");
            elements.drawStatus.textContent = "Nenhum número foi sorteado ainda.";
            return;
        }

        elements.currentLetter.textContent = getLetter(state.lastNumber);
        elements.currentNumber.textContent = String(state.lastNumber).padStart(2, "0");
        elements.currentBall.setAttribute("aria-label", `Número atual ${formatCall(state.lastNumber)}`);
        elements.drawStatus.textContent = `Prenda sorteada: ${formatCall(state.lastNumber)}.`;
    }

    function renderBoard(newNumber) {
        ALL_NUMBERS.forEach((number) => {
            const ball = document.getElementById(`ball-${number}`);
            const isDrawn = state.drawnNumbers.includes(number);

            ball.classList.toggle("drawn", isDrawn);
            ball.classList.toggle("just-drawn", number === newNumber);
            ball.setAttribute("aria-label", `${getLetter(number)} ${number}${isDrawn ? ", sorteado" : ""}`);
        });

        if (newNumber) {
            window.setTimeout(() => {
                document.getElementById(`ball-${newNumber}`)?.classList.remove("just-drawn");
            }, 650);
        }
    }

    function renderHistory() {
        elements.historyList.textContent = "";
        const latestNumbers = state.drawnNumbers.slice(-HISTORY_LIMIT).reverse();

        if (latestNumbers.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "history-empty";
            emptyItem.textContent = "O balaio ainda está cheio.";
            elements.historyList.appendChild(emptyItem);
            return;
        }

        latestNumbers.forEach((number) => {
            const item = document.createElement("li");
            item.textContent = formatCall(number);
            elements.historyList.appendChild(item);
        });
    }

    function renderRemainingCount() {
        const count = state.availableNumbers.length;
        const label = count === 1 ? "prenda no balaio" : "prendas no balaio";
        elements.remainingCount.textContent = `${count} ${label}.`;
    }

    function updateFinishedState() {
        const finished = state.availableNumbers.length === 0;

        elements.drawButton.disabled = finished;

        if (finished) {
            elements.drawStatus.textContent = "Todas as 75 prendas já foram sorteadas!";
        }
    }

    function celebrateDraw() {
        replayBallAnimation();
        createConfetti();
    }

    function replayBallAnimation() {
        elements.currentBall.classList.remove("is-drawing");
        void elements.currentBall.offsetWidth;
        elements.currentBall.classList.add("is-drawing");
    }

    function createConfetti() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const pieces = 22;
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < pieces; index += 1) {
            const piece = document.createElement("span");
            piece.className = "confetti";
            piece.style.left = `${randomBetween(18, 82)}vw`;
            piece.style.background = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
            piece.style.setProperty("--x-drift", `${randomBetween(-80, 80)}px`);
            piece.style.animationDelay = `${randomBetween(0, 120)}ms`;
            fragment.appendChild(piece);
        }

        elements.confettiLayer.appendChild(fragment);
        window.setTimeout(() => {
            elements.confettiLayer.textContent = "";
        }, 1200);
    }

    function randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        elements.rulesModal.classList.remove("hidden");
        elements.closeRulesButton.focus();
    }

    function closeModal({ restoreFocus = true } = {}) {
        elements.rulesModal.classList.add("hidden");

        if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
            return;
        }

        document.activeElement?.blur();
    }

    function isModalOpen() {
        return !elements.rulesModal.classList.contains("hidden");
    }
})();
