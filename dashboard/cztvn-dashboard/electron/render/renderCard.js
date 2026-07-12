// The auto-print engine. Renders the Daily Road Card template to any of three
// destinations: on-screen PNG, saved PDF/PNG, physical printer.
const { BrowserWindow, app } = require('electron');
const fs = require('fs');
const path = require('path');
const { buildHtml } = require('./cardTemplate');

const OUT = app.isPackaged
  ? path.join(app.getPath('userData'), 'out')
  : path.join(__dirname, '..', '..', 'out');
const ensureOut = () => fs.mkdirSync(OUT, { recursive: true });

async function renderCard(data, destinations) {
  ensureOut();
  const html = buildHtml(data);
  const base = `road-card-${data.state.code}-${data.generatedAt.replace(/[:.]/g, '-')}`;
  const result = {};

  const win = new BrowserWindow({
    width: 1080, height: 1080, show: false, paintWhenInitiallyHidden: true,
    webPreferences: { offscreen: false }
  });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise(r => setTimeout(r, 400)); // let the SVG/fonts settle before capture

  if (destinations.screen || destinations.file) {
    try {
      const img = await win.webContents.capturePage();
      const pngPath = path.join(OUT, base + '.png');
      fs.writeFileSync(pngPath, img.toPNG());
      result.pngPath = pngPath;
    } catch (e) { console.error('png capture failed', e); }
  }
  if (destinations.file) {
    try {
      const pdf = await win.webContents.printToPDF({ printBackground: true, pageSize: 'Letter' });
      const pdfPath = path.join(OUT, base + '.pdf');
      fs.writeFileSync(pdfPath, pdf);
      result.pdfPath = pdfPath;
    } catch (e) { console.error('pdf failed', e); }
  }
  if (destinations.printer) {
    await new Promise(resolve => win.webContents.print({ printBackground: true, silent: false }, () => resolve()));
  }
  win.close();
  console.log('[card] generated', base, result);
  return result;
}

module.exports = { renderCard };
