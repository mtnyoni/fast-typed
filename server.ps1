# PowerShell script to serve the WebAssembly application

# Define the port to serve the application on
$port = 8080

# Check if we have the necessary files
if (-not (Test-Path "main.wasm")) {
    Write-Error "main.wasm not found. Please run build.ps1 first."
    exit 1
}

if (-not (Test-Path "wasm_exec.js")) {
    Write-Error "wasm_exec.js not found. Please run build.ps1 first."
    exit 1
}

if (-not (Test-Path "index.html")) {
    Write-Error "index.html not found."
    exit 1
}

# Create a simple HTTP server to serve the WebAssembly application
Write-Host "Starting HTTP server on http://localhost:$port"
Write-Host "Press Ctrl+C to stop the server"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $requestedFile = $request.Url.LocalPath.TrimStart('/')
        
        # Default to index.html if no file specified
        if ([string]::IsNullOrEmpty($requestedFile)) {
            $requestedFile = "index.html"
        }
        
        # Check if the file exists
        if (Test-Path $requestedFile) {
            $content = [System.IO.File]::ReadAllBytes($requestedFile)
            $response.ContentLength64 = $content.Length
            
            # Set the correct MIME type
            switch ([System.IO.Path]::GetExtension($requestedFile)) {
                ".html" { $response.ContentType = "text/html" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".wasm" { $response.ContentType = "application/wasm" }
                ".css"  { $response.ContentType = "text/css" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            # Write the content to the response
            $output = $response.OutputStream
            $output.Write($content, 0, $content.Length)
            $output.Close()
        } else {
            # File not found
            $response.StatusCode = 404
            $response.Close()
        }
    }
}
finally {
    # Ensure the listener is closed when the script is terminated
    $listener.Stop()
    $listener.Close()
}