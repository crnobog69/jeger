const express = require('express');
const server = express();

server.get('/', (req, res) => {
  res.send('Bot is alive!');
});

function keepAlive() {
  // Try ports from 3000 to 3010
  const tryPort = (port) => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}!`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE' && port < 3010) {
        // Try next port
        tryPort(port + 1);
      } else {
        console.error('Failed to start server:', err);
      }
    });
  };

  tryPort(3000);
}

module.exports = keepAlive;
