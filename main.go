package main

import (
	"syscall/js"
)

// Game represents the state of the typing game
type Game struct {
	currentText    string
	typedText      string
	position       int
	startTime      float64
	endTime        float64
	correctChars   int
	incorrectChars int
	speed          float64 // Words per minute
	carPosition    float64 // Position of the car on the track (0-100)
	gameActive     bool
}

var game Game

// Initialize the game with the given text
func initGame(this js.Value, args []js.Value) interface{} {
	text := args[0].String()
	game = Game{
		currentText:    text,
		typedText:      "",
		position:       0,
		correctChars:   0,
		incorrectChars: 0,
		speed:          0,
		carPosition:    0,
		gameActive:     true,
	}
	game.startTime = js.Global().Get("Date").New().Call("getTime").Float()

	return nil
}

// Process a key press from the user
// Process a key press from the user
func processKeyPress(this js.Value, args []js.Value) interface{} {
	if !game.gameActive {
		return nil
	}

	char := args[0].String()
	expected := ""

	if game.position < len(game.currentText) {
		expected = string(game.currentText[game.position])
	}

	game.typedText += char

	// Always advance position regardless of correctness
	if char == expected {
		game.correctChars++
	} else {
		game.incorrectChars++
	}

	// Always move to next character regardless of correctness
	game.position++

	// Calculate current typing speed (WPM)
	currentTime := js.Global().Get("Date").New().Call("getTime").Float()
	elapsedMinutes := (currentTime - game.startTime) / 60000
	if elapsedMinutes > 0 {
		game.speed = float64(game.correctChars) / 5 / elapsedMinutes // 5 chars = 1 word
	}

	// Update car position based on typing speed
	game.carPosition = calculateCarPosition()

	// Check if game is complete
	if game.position >= len(game.currentText) {
		game.gameActive = false
		game.endTime = currentTime
	}

	return map[string]interface{}{
		"position":     game.position,
		"speed":        game.speed,
		"carPosition":  game.carPosition,
		"gameActive":   game.gameActive,
		"correctChars": game.correctChars,
		"errorChars":   game.incorrectChars,
	}
}

// Calculate car position based on typing speed and errors
func calculateCarPosition() float64 {
	// Base position from correct typing
	basePosition := float64(game.position) / float64(len(game.currentText)) * 100

	// Adjust for typing speed - faster typing moves car faster
	speedFactor := 1.0
	if game.speed > 0 {
		// Normalize speed to a reasonable range (e.g. 40-100 WPM)
		normalizedSpeed := (game.speed - 40) / 60
		if normalizedSpeed > 0 {
			speedFactor = 1.0 + normalizedSpeed*0.5 // Up to 50% boost for fast typing
		} else if normalizedSpeed < 0 {
			speedFactor = 1.0 + normalizedSpeed*0.5 // Slower typing reduces progress
		}
	}

	// Errors reduce car position
	errorPenalty := float64(game.incorrectChars) * 0.5

	// Calculate final position
	position := basePosition*speedFactor - errorPenalty

	// Clamp to 0-100 range
	if position < 0 {
		position = 0
	}
	if position > 100 {
		position = 100
	}

	return position
}

// Get the current game state
func getGameState(this js.Value, args []js.Value) interface{} {
	return map[string]interface{}{
		"position":     game.position,
		"speed":        game.speed,
		"carPosition":  game.carPosition,
		"gameActive":   game.gameActive,
		"correctChars": game.correctChars,
		"errorChars":   game.incorrectChars,
		"text":         game.currentText,
		"typed":        game.typedText,
	}
}

func main() {
	c := make(chan struct{})

	js.Global().Set("initGame", js.FuncOf(initGame))
	js.Global().Set("processKeyPress", js.FuncOf(processKeyPress))
	js.Global().Set("getGameState", js.FuncOf(getGameState))

	<-c
}
