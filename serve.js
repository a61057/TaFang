const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');
const server = http.createServer((req, res) => {
  let f = req.url === '/' ? '/index.html' : req.url;
  const fp = path.join(dir, f);
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('404'); return; }
  const ext = path.extname(fp);
  const types = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.json':'application/json' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  res.end(fs.readFileSync(fp));
});
server.listen(3000, () => console.log('Server running at http://localhost:3000'));
