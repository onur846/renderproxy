const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
  try {
    const url = 'https://fpprotr.com/cihazimi-tamir-et/iphone-serileri/iphone-16-serisi/';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    const fiyatlar = {};

    $('.elementor-widget-container').each((i, el) => {
      const modelIsmi = $(el).find('h2, h3').text().trim();
      const fiyatText = $(el).text();

      if (modelIsmi && fiyatText.includes('₺')) {
        const fiyatMatch = fiyatText.match(/([\d.,]+)\s*₺/);
        if (fiyatMatch && fiyatMatch[1]) {
          const fiyat = parseFloat(fiyatMatch[1].replace('.', '').replace(',', '.'));
          if (!isNaN(fiyat)) {
            fiyatlar[modelIsmi] = fiyat;
          }
        }
      }
    });

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
