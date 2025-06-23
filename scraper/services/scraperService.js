import puppeteer from 'puppeteer';
import { parseTrailData } from '../utils/parser.js';

export async function scrapeTrailData(query) {
const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  const links = await page.$$eval('a', as =>
    as.map(a => a.href).filter(href =>
      href.includes('alltrails') || href.includes('hiking') || href.includes('trail'))
  );

  const results = [];

  for (let i = 0; i < Math.min(3, links.length); i++) {
    try {
      const link = links[i];
      await page.goto(link, { waitUntil: 'networkidle2' });

      try {
        const buttons = await page.$x("//button[contains(text(), 'Read More') or contains(text(), 'View')]");
        if (buttons.length) {
          await buttons[0].click();
          await page.waitForTimeout(2000);
        }
      } catch (e) {}

      const scrapedData = await page.evaluate(() => {
        const extractText = (selector) =>
          document.querySelector(selector)?.innerText.trim() || '';

        const extractMany = (selector) =>
          Array.from(document.querySelectorAll(selector)).map(e => e.innerText.trim()).filter(Boolean);

        return {
          title: document.title,
          description: extractText('meta[name="description"]'),
          distance: extractText('.distance, .TrailStats__distance'),
          difficulty: extractText('.difficulty, .TrailStats__difficulty'),
          location: extractText('.location, .TrailStats__location'),
          details: extractMany('h2, h3, .trail-details-section, .section-title'),
          source_url: window.location.href
        };
      });

      const enriched = await parseTrailData(scrapedData);
      enriched.source_url = link;
      results.push(enriched);

    } catch (err) {
      console.warn('Error scraping:', links[i], err.message);
    }
  }

  await browser.close();
  return { trails: results };
}
