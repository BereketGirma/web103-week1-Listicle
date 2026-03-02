const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/api/characters', (req, res) => {
  const filePath = path.join(__dirname, 'characters.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Could not read characters.json:', err);
      return res.status(500).json({ error: 'Failed to load character data.' });
    }
    res.json(JSON.parse(data));
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
