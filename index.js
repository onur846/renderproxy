const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('https://fpprotr.com/cihazimi-tamir-et/iphone-serileri/iphone-16-serisi/', {
      waitUntil: 'networkidle2'
    });

    const fiyatlar = await page.evaluate(() => {
      const items = document.querySelectorAll('.elementor-widget-container');
      const result = {};
      items.forEach(item => {
        const modelElement = item.querySelector('h2, h3');
        if (modelElement) {
          const modelIsmi = modelElement.innerText.trim();
          const text = item.innerText;
          const fiyatMatch = text.match(/([\d.,]+)\s*₺/);
          if (fiyatMatch && fiyatMatch[1]) {
            const fiyat = parseFloat(fiyatMatch[1].replace('.', '').replace(',', '.'));
            if (!isNaN(fiyat)) {
              result[modelIsmi] = fiyat;
            }
          }
        }
      });
      return result;
    });

    await browser.close();
    res.json(fiyatlar);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Fiyatlar çekilemedi.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
