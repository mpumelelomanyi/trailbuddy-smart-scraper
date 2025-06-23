import express from 'express';
import dotenv from 'dotenv';
import { scrapeTrailData } from './services/scraperService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing search query' });
  try {
    const data = await scrapeTrailData(query);
    res.json({ results: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Smart scraper running on port ${port}`));

