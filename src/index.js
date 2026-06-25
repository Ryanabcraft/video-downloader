require('dotenv').config();
const express = require('express');
const path = require('path');
const { downloadVideo, detectPlatform } = require('./downloader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/download', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  try {
    const result = await downloadVideo(url);
    res.json({
      success: true,
      platform: result.platform,
      file: `/video/${encodeURIComponent(path.basename(result.filePath))}`,
      size: result.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/video/:name', (req, res) => {
  const file = path.join(__dirname, '..', 'downloads', req.params.name);
  res.download(file);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
