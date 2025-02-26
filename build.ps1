# PowerShell script to build the Go WebAssembly application

# Set environment variable for WebAssembly compilation
$env:GOOS = "js"
$env:GOARCH = "wasm"

# Compile the Go code to WebAssembly
Write-Host "Building WebAssembly file from Go code..."
go build -o main.wasm main.go

# Copy the WebAssembly execution JavaScript support file from Go installation
$goRoot = go env GOROOT
$wasmExecPath = Join-Path -Path $goRoot -ChildPath "misc\wasm\wasm_exec.js"

Write-Host "Copying wasm_exec.js from Go installation..."
if (Test-Path $wasmExecPath) {
    Copy-Item -Path $wasmExecPath -Destination "wasm_exec.js" -Force
} else {
    Write-Error "Could not find wasm_exec.js at $wasmExecPath"
    exit 1
}

Write-Host "Build completed successfully!"
Write-Host "Generated files:"
Write-Host "- main.wasm (WebAssembly binary)"
Write-Host "- wasm_exec.js (WebAssembly support JavaScript)"