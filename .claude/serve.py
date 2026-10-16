"""Static server for local preview — like `python -m http.server` but with
no-store headers so edits show up on reload instead of being cached."""
import http.server
import socketserver

PORT = 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
    print(f"serving {httpd.server_address} (no-store)")
    httpd.serve_forever()
