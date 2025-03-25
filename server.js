// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();

// Serve static files from the "public" folder (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server on the '/ws' path
const wss = new WebSocketServer({ server, path: '/ws' });

// Broadcast a binary message to all connected clients except the sender
function broadcast(data, sender) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

app.get('/ws', (req, res) => {
  res.send("This endpoint is for WebSocket connections only.");
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  console.log(`Client connected from ${req.socket.remoteAddress}`);

  ws.on('message', (data, isBinary) => {
    // Broadcast incoming binary data (JPEG frame) to all connected clients.
    broadcast(data, ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
