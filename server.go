package main

import (
	"flag"
	"log"
	"net/http"
)

var (
	listen = flag.String("listen", ":8080", "listen address")
	dir    = flag.String("dir", ".", "directory to serve")
)

func main() {
	flag.Parse()
	log.Printf("listening on %q...", *listen)
	
	// Serve static files
	fileServer := http.FileServer(http.Dir(*dir))
	
	// Special handler for wasm files to set correct MIME type
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/main.wasm" {
			w.Header().Set("Content-Type", "application/wasm")
		}
		fileServer.ServeHTTP(w, r)
	})
	
	err := http.ListenAndServe(*listen, nil)
	if err != nil {
		log.Fatal(err)
	}
}