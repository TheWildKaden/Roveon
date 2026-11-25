const { app, BrowserWindow, dialog, ipcMain, protocol } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

protocol.registerSchemesAsPrivileged([{ scheme: 'roveon', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);
let root = null;
const excluded = new Set(['.git', '.next', 'node_modules', 'dist', 'build']);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md', '.py', '.sql', '.rs', '.java', '.c', '.h', '.cpp', '.go', '.php', '.yaml', '.yml', '.sh', '.txt']);
function inside(base, candidate) { return candidate === base || candidate.startsWith(base + path.sep); }
async function safeFile(relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(x => x === '..' || x === '.')) throw new Error('Invalid workspace path');
  if (!root) throw new Error('Open a project first');
  const candidate = path.resolve(root, relative);
  if (!inside(root, candidate)) throw new Error('Outside workspace');
  const real = await fs.realpath(candidate);
  if (!inside(root, real)) throw new Error('Outside workspace');
  if (!extensions.has(path.extname(real).toLowerCase())) throw new Error('Unsupported file type');
  return real;
}
async function walk(dir, prefix = '', depth = 0) {
  const found = [];
  if (depth > 8) return found;
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    if (excluded.has(item.name) || item.name.startsWith('.')) continue;
    if (item.isDirectory()) found.push(...await walk(path.join(dir, item.name), prefix + item.name + '/', depth + 1));
    else if (item.isFile() && extensions.has(path.extname(item.name).toLowerCase())) found.push(prefix + item.name);
  }
  return found.sort();
}
ipcMain.handle('workspace:open', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return null;
  root = await fs.realpath(result.filePaths[0]);
  return { name: path.basename(root), files: await walk(root) };
});
ipcMain.handle('workspace:list', async () => root ? walk(root) : []);
ipcMain.handle('workspace:read', async (_event, relative) => {
  const file = await safeFile(relative); const stat = await fs.stat(file);
  if (stat.size > 1024 * 1024) throw new Error('Files over 1 MB are not supported');
  return { text: await fs.readFile(file, 'utf8'), modified: stat.mtimeMs };
});
ipcMain.handle('workspace:write', async (_event, relative, text, modified) => {
  const file = await safeFile(relative); const stat = await fs.stat(file);
  if (stat.mtimeMs !== modified) throw new Error('File changed on disk. Reopen it before saving.');
  if (typeof text !== 'string' || Buffer.byteLength(text) > 1024 * 1024) throw new Error('File too large');
  await fs.writeFile(file, text, 'utf8');
  return (await fs.stat(file)).mtimeMs;
});
app.whenReady().then(async () => {
  const output = path.join(__dirname, '..', 'out');
  protocol.handle('roveon', async request => {
    const url = new URL(request.url);
    const requested = decodeURIComponent(url.pathname);
    const relative = requested === '/' ? 'index.html' : requested.replace(/^\//, '');
    const candidate = path.resolve(output, relative);
    if (!inside(output, candidate)) return new Response('Not found', { status: 404 });
    let file = candidate;
    try { if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html'); }
    catch { if (!path.extname(file)) file += '.html'; }
    try {
      const bytes = await fs.readFile(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon' }[path.extname(file)] || 'application/octet-stream';
      return new Response(bytes, { headers: { 'content-type': type } });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  const window = new BrowserWindow({ width: 1440, height: 900, minWidth: 900, minHeight: 600, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  window.loadURL('roveon://app/');
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
