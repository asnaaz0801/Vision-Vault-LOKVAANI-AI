const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const parts = line.split('=');
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        envVars[key] = val;
      }
    });
  }
  return envVars;
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Dynamic endpoint to expose safe Supabase credentials from .env to browser
  if (reqUrl === '/js/env-config.js') {
    const envVars = loadEnv();
    const configJs = `/* LokVaani AI Runtime Environment Config */\nwindow.SUPABASE_URL = "${envVars.SUPABASE_URL || ''}";\nwindow.SUPABASE_PUBLISHABLE_KEY = "${envVars.SUPABASE_PUBLISHABLE_KEY || ''}";\n`;
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    return res.end(configJs);
  }

  let filePath = path.join(__dirname, reqUrl);
  
  // Security check
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    if (stats.isDirectory()) {
      if (!reqUrl.endsWith('/')) {
        res.writeHead(301, { 'Location': reqUrl + '/' });
        return res.end();
      }
      filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err2, stats2) => {
      if (err2 || !stats2.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });
});

server.listen(PORT, () => {
  console.log(`LokVaani AI Server running at http://localhost:${PORT}`);
});
