package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/edgeflare/pgo/pkg/httputil"

	mw "github.com/edgeflare/pgo/pkg/httputil/middleware"
)

// Embed the static directory
//
//go:embed dist/fabreview-ui/browser/*
var embeddedFS embed.FS

var (
	port        = flag.Int("port", 8080, "port to listen on")
	directory   = flag.String("dir", "dist/fabreview-ui/browser", "directory to serve files from")
	spaFallback = flag.Bool("spa", false, "fallback to index.html for not-found files")
	useEmbedded = flag.Bool("embed", false, "use embedded static files")
)

func main() {
	flag.Parse()

	r := httputil.NewRouter()

	var fs *embed.FS
	if *useEmbedded {
		fs = &embeddedFS
	}

	r.Handle("GET /", mw.Static(*directory, *spaFallback, fs))

	go func() {
		if err := r.ListenAndServe(fmt.Sprintf(":%d", *port)); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Set up signal handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Wait for SIGINT or SIGTERM
	<-stop

	// Create a deadline for the shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := r.Shutdown(ctx); err != nil {
		fmt.Printf("server forced to shutdown: %s", err)
	}
	fmt.Println("Server gracefully stopped")
}

// go run . -port 8080 -spa -embed  // serve from embeddedFS
// go run . -port 4200 -dir dist/fabreview-ui/browser -spa         // serve from dist directory
