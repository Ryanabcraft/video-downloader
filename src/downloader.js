const ytDlp = require('yt-dlp-exec');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

function detectPlatform(url) {
  const map = [
    ['TikTok', /tiktok\.com|vm\.tiktok/i],
    ['Shopee', /shopee/i],
    ['Pinterest', /pinterest|pin\.it/i],
    ['ML Clips', /mercadolivre/i],
    ['RedNote', /xiaohongshu|rednote/i],
    ['Facebook', /facebook|fb\.com|fb\.watch/i],
    ['Instagram', /instagram/i],
  ];
  for (const [name, pattern] of map) {
    if (pattern.test(url)) return name;
  }
  return 'Desconhecida';
}

async function scrapeShopeeVideo(url) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
    timeout: 15000,
  });

  const match = data.match(/"video_url":"([^"]+?)"/);
  if (!match) throw new Error('Vídeo não encontrado nesta página');

  let videoUrl = match[1];
  videoUrl = videoUrl.replace(/\\u002F/g, '/');
  videoUrl = videoUrl.replace(/\\\//g, '/');

  const id = `shopee_${Date.now()}`;
  const filePath = path.join(DOWNLOADS_DIR, `${id}.mp4`);

  const writer = fs.createWriteStream(filePath);
  const response = await axios({ method: 'get', url: videoUrl, responseType: 'stream', timeout: 30000 });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return filePath;
}

async function downloadViaYtDlp(url) {
  const output = path.join(DOWNLOADS_DIR, '%(id)s.%(ext)s');
  await ytDlp.exec(url, {
    output,
    noPlaylist: true,
    format: 'bestvideo+bestaudio/best',
    mergeOutputFormat: 'mp4',
    noWarnings: true,
  });
}

function getLatestFile() {
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return files[0] ? path.join(DOWNLOADS_DIR, files[0].name) : null;
}

async function downloadVideo(url) {
  const platform = detectPlatform(url);
  console.log(`[${platform}] ${url}`);

  if (platform === 'Shopee') {
    const filePath = await scrapeShopeeVideo(url);
    const stats = fs.statSync(filePath);
    return { filePath, platform, size: stats.size };
  }

  await downloadViaYtDlp(url);

  const filePath = getLatestFile();
  if (!filePath) throw new Error('Download falhou');

  const stats = fs.statSync(filePath);
  if (stats.size < 1024) throw new Error('Arquivo muito pequeno');

  return { filePath, platform, size: stats.size };
}

module.exports = { downloadVideo, detectPlatform };
