import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { lookupBggServerInfo } from './bggInfoServer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const dataFilePath = path.resolve(__dirname, 'data.json');
const uploadsDir = path.resolve(__dirname, 'public/uploads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(uploadsDir));

// API: Get Data
app.get('/api/data', (req, res) => {
  console.log(`[API] GET /api/data`);
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error reading data.json:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API: Write Data
app.post('/api/data', (req, res) => {
  console.log(`[API] POST /api/data (${JSON.stringify(req.body).length} bytes)`);
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing data.json:', error);
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// API: Handle Image Upload
app.post('/api/upload', (req, res) => {
  const { image, name } = req.body;
  if (!image || !name) {
    return res.status(400).json({ error: 'Missing image or name' });
  }

  console.log(`[API] Handling upload: ${name} (${image.length} bytes)`);
  
  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const safeName = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const fileName = `${Date.now()}-${safeName}`;
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.resolve(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    res.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API: BGG Info Lookup (local data + Wikidata fallback)
app.get('/api/bgg-info', async (req, res) => {
  const bggId = req.query.id;
  console.log(`[API] GET /api/bgg-info (${bggId})`);

  if (!bggId || !/^\d+$/.test(bggId)) {
    return res.status(400).json({ error: 'Missing BGG ID' });
  }

  let game = null;
  try {
    game = await lookupBggServerInfo(bggId);
  } catch (error) {
    console.error('Error in /api/bgg-info:', error);
    return res.status(500).json({ error: 'Failed to fetch BGG info' });
  }

  if (game) {
    return res.json({
      success: true,
      game: {
        title: game.title || '',
        subtitle: game.subtitle || '',
        publishedYear: game.publishedYear || null,
        players: game.players || '',
        playTime: game.playTime || '',
        weight: game.weight || null,
        imageUrl: game.imageUrl || '',
        bggUrl: game.bggUrl || `https://boardgamegeek.com/boardgame/${bggId}`
      }
    });
  }

  res.json({ success: false, error: 'Game not found for BGG ID' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
