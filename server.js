const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//Amazon fetch data function
const fetchAmazonData = async (url) => {

  try {

    const response = await axios.get(url, {

      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },

    });

    return response.data;

  } catch (error) {

        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            throw new Error('The request to Amazon timed out.');
    } else {

      throw new Error('Error fetching data from Amazon.');

    }
  }
};

//Parsing Amazon data funtion
const parseAmazonData = (html) => {

  const $ = cheerio.load(html);

  const products = [];

  $('.s-result-item').each((index, element) => {

    const titleElement = $(element).find('h2 span');
    const title = titleElement.length > 0 ? titleElement.text().trim() : null;

    const ratingElement = $(element).find('div.a-section.a-spacing-none.a-spacing-top-micro > div > span');
    const rating = ratingElement.length > 0 ? ratingElement.attr('aria-label') : null;

    const reviewsElement = $(element).find('div.a-section.a-spacing-none.a-spacing-top-micro > div > span > div > span');
    const reviews = reviewsElement.length > 0 ? reviewsElement.attr('aria-label') : null;

    const imageURLElement = $(element).find('img.s-image');
    const imageURL = imageURLElement.length > 0 ? imageURLElement.attr('src') : null;

    if (title !== null && rating !== null && reviews !== null && imageURL !== null) {

        products.push({ title, rating, reviews, imageURL });

    }
  });

  return products;

};

//API endpoint
app.get('/api/scrape', async (req, res) => {

  try {

    const { keyword } = req.query;

    if (!keyword || !keyword.trim()) {

      return res.status(400).json({ error: 'Missing keyword parameter' });

    }

    const url = `https://www.amazon.com/s?k=${keyword}&page=1`;
    const html = await fetchAmazonData(url);
    const products = parseAmazonData(html);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (products.length === 0) {

      res.status(404).json({ error: 'No products found for the given keyword' });

    } else {

      res.json(products);

    }

  } catch (error) {

    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });

  }
});

//Server start
app.listen(PORT, () => {

  console.log(`Server is running on http://localhost:${PORT}`);

});
