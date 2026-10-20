"""Serve only test-transfer files to the existing Parallels VM, never project/user data."""
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

root = Path(__file__).resolve().parents[1] / 'test-artifacts' / 'windows-transfer'
root.mkdir(parents=True, exist_ok=True)
os.chdir(root)

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.client_address[0] != '10.211.55.3':
            self.send_error(403)
            return
        super().do_GET()

    def do_POST(self):
        names = {'result.log', 'auth-result.log', 'windows-light.png', 'windows-dark-small.png', 'windows-failure.png', 'installer-result.log'}
        name = self.path.removeprefix('/results/')
        size = int(self.headers.get('Content-Length', '0'))
        if self.client_address[0] != '10.211.55.3' or name not in names or not 0 < size < 20_000_000:
            self.send_error(403)
            return
        (root / 'results').mkdir(exist_ok=True)
        (root / 'results' / name).write_bytes(self.rfile.read(size))
        self.send_response(200)
        self.end_headers()

HTTPServer(('10.211.55.2', 18765), Handler).serve_forever()
