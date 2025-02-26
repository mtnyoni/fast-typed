# Go WebAssembly Typing Game

This project implements a simple typing game similar to nitrotype.com using Go compiled to WebAssembly.

## Features

- Type paragraphs as fast as you can
- Car moves along the track based on typing speed
- Correctly typed characters appear in green
- Incorrectly typed characters appear in red
- Current character is highlighted
- Speed measured in words per minute (WPM)
- Accuracy percentage displayed
- Errors reduce car speed
- Win by completing the paragraph

## Requirements

- Go 1.18 or later
- A modern web browser with WebAssembly support (Chrome, Firefox, Safari, Edge)

## Building and Running

1. Clone this repository
2. Build the WebAssembly binary and run the server:

```bash
# Using the provided Makefile
make serve

# Or manually:
GOOS=js GOARCH=wasm go build -o main.wasm
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
go run server.go
```

3. Open your browser and navigate to: http://localhost:8080

## Project Structure

- `main.go`: Go code that compiles to WebAssembly, handles game logic
- `index.html`: HTML structure of the game
- `style.css`: CSS styling for the game
- `script.js`: JavaScript code to handle user interactions and UI updates
- `server.go`: Simple HTTP server to serve the game files
- `Makefile`: Build automation for compiling and running the game

## How to Play

1. Wait for the WASM module to load (you'll see a success message)
2. Click the "Start Game" button
3. Type the displayed text as quickly and accurately as possible
4. Watch your car move across the track as you type
5. Complete the text to win!

## Technical Details

- The game uses WebAssembly compiled from Go code
- Go handles the core game logic (timing, scoring, position calculation)
- JavaScript handles the UI updates and keyboard events
- Communication between Go and JavaScript happens via exported functions

## License

MIT