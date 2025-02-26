GO_WASM = GOOS=js GOARCH=wasm go build -o main.wasm
WASM_EXEC = $(shell go env GOROOT)/misc/wasm/wasm_exec.js

.PHONY: build
build:
	$(GO_WASM)
	cp $(WASM_EXEC) .

.PHONY: serve
serve: build
	go run -mod=mod server.go

.PHONY: clean
clean:
	rm -f main.wasm wasm_exec.js
