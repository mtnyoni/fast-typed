// Sample paragraphs for typing
const paragraphs = [
	"The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. It is commonly used for touch-typing practice and testing typewriters and computer fonts.",
	"Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.",
	"WebAssembly (abbreviated Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications.",
];

// DOM Elements
const startBtn = document.getElementById("start-btn");
const textDisplay = document.getElementById("text-display");
const playerCar = document.getElementById("player-car");
const speedElement = document.getElementById("speed");
const accuracyElement = document.getElementById("accuracy");
const progressElement = document.getElementById("progress");
const gameMessage = document.getElementById("game-message");

let gameActive = false;
let wasmInstance = null;

// Load WASM
async function loadWasm() {
	// Check if Go is defined (wasm_exec.js should be loaded)
	if (!window.Go) {
		gameMessage.textContent = "Error: wasm_exec.js not loaded";
		return;
	}

	try {
		const go = new Go();
		const result = await WebAssembly.instantiateStreaming(
			fetch("main.wasm"),
			go.importObject
		);
		wasmInstance = result.instance;
		go.run(wasmInstance);

		// Enable start button once WASM is loaded
		startBtn.disabled = false;
		gameMessage.textContent =
			"WASM loaded successfully! Click Start to begin.";
	} catch (error) {
		console.error("Error loading WASM:", error);
		gameMessage.textContent = "Failed to load WASM: " + error.message;
	}
}

// Start the game
function startGame() {
	if (!wasmInstance) {
		gameMessage.textContent = "WASM not loaded yet. Please wait.";
		return;
	}

	// Choose random paragraph
	const text = paragraphs[Math.floor(Math.random() * paragraphs.length)];

	// Initialize game in WASM
	window.initGame(text);

	// Reset UI
	playerCar.style.left = "0%";
	speedElement.textContent = "0";
	accuracyElement.textContent = "100";
	progressElement.textContent = "0";

	// Setup text display
	renderText(text);

	// Change button to restart
	startBtn.textContent = "Restart Game";

	// Set game as active
	gameActive = true;

	// Set focus to game container to capture keyboard input
	document.querySelector(".game-container").focus();

	// Show instructions
	gameMessage.textContent = "Type the text above. Go!";
}

// Render text with proper formatting
function renderText(text) {
	textDisplay.innerHTML = "";

	// Create span for each character
	for (let i = 0; i < text.length; i++) {
		const charSpan = document.createElement("span");
		charSpan.textContent = text[i];
		charSpan.classList.add("char");
		if (i === 0) {
			charSpan.classList.add("current");
		}
		textDisplay.appendChild(charSpan);
	}
}

// Update text display based on current position
function updateTextDisplay(position) {
	const chars = textDisplay.querySelectorAll(".char");

	// Reset current marker
	chars.forEach((char) => char.classList.remove("current"));

	// Get game state from WASM
	const gameState = window.getGameState();

	// Update character classes based on game state
	for (let i = 0; i < chars.length; i++) {
		if (i < position) {
			chars[i].classList.add("correct");
			chars[i].classList.remove("incorrect");
		}
		// Current character
		if (i === position && gameState.gameActive) {
			chars[i].classList.add("current");
		}
	}

	// Check for incorrectly typed characters
	for (let i = 0; i < gameState.typed.length; i++) {
		if (
			i < gameState.text.length &&
			gameState.typed[i] !== gameState.text[i]
		) {
			chars[i].classList.remove("correct");
			chars[i].classList.add("incorrect");
		}
	}
}

// Update car position
function updateCar(position) {
	playerCar.style.left = position + "%";
}

// Handle keypress
function handleKeyPress(e) {
	if (!gameActive) return;

	// Ignore modifier keys and special keys
	if (e.ctrlKey || e.altKey || e.metaKey) return;
	if (e.key.length !== 1) return;

	e.preventDefault();

	// Process key press in WASM
	const result = window.processKeyPress(e.key);
	if (!result) return;

	// Update UI
	updateTextDisplay(result.position);
	updateCar(result.carPosition);
	speedElement.textContent = Math.round(result.speed);

	// Calculate accuracy
	const totalChars = result.correctChars + result.errorChars;
	const accuracy =
		totalChars > 0
			? Math.round((result.correctChars / totalChars) * 100)
			: 100;

	accuracyElement.textContent = accuracy;
	progressElement.textContent = Math.round(result.carPosition);

	// Check if game is complete
	if (!result.gameActive) {
		gameActive = false;
		gameMessage.textContent =
			"Game Complete! Your speed: " +
			Math.round(result.speed) +
			" WPM with " +
			accuracy +
			"% accuracy";
	}
}

// Add event listeners
document.addEventListener("DOMContentLoaded", loadWasm);
startBtn.addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyPress);
