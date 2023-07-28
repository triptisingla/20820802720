const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4444;

async function fetchData(url) {
  try {
    const response = await axios.get(url, { timeout: 500 }); // Set timeout to 500 milliseconds
    return response.data;
  } catch (error) {
    console.error(`Error while fetching data from ${url}:`, error.message);
    return null;
  }
}

app.get('/numbers', async (req, res, next) => {
  const urls = req.query.url;
  const Ui = new Set();

  try {
    if (Array.isArray(urls)) {
      const requests = urls.map(url => fetchData(url));
      const responses = await Promise.allSettled(requests);

      for (const response of responses) {
        if (response.status === 'fulfilled') {
          const jsonData = response.value;
          if (jsonData && Array.isArray(jsonData.numbers)) {
            jsonData.numbers.forEach(number => Ui.add(number));
          }
        }
      }
    } else if (typeof urls === 'string') {
      const jsonData = await fetchData(urls);
      if (jsonData && Array.isArray(jsonData.numbers)) {
        jsonData.numbers.forEach(number => Ui.add(number));
      }
    }

    res.json({ numbers: Array.from(Ui).sort((a, b) => a - b) });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});