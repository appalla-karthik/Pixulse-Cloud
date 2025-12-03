import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);


app.use(express.static(path.join(__dirname, '../public')));

const wss = new WebSocketServer({ server });
let streamer = null;
const viewers = new Map();

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      console.error('❌ Invalid JSON message:', message);
      return;
    }

    if (msg.type === 'register') {
      if (msg.role === 'streamer') {
        streamer = ws;
        ws.send(JSON.stringify({ type: 'registered' }));
        console.log('✅ Streamer registered');
      } else if (msg.role === 'viewer') {
        const id = Date.now().toString();
        viewers.set(id, ws);
        ws.send(JSON.stringify({ type: 'registered', id }));
        console.log(`👤 Viewer registered: ${id}`);
        if (streamer) {
          streamer.send(JSON.stringify({ type: 'viewer-connected', id }));
        }
      }
    }

    if (msg.type === 'offer' && msg.to) {
      viewers.get(msg.to)?.send(JSON.stringify({ type: 'offer', data: msg.data }));
    }

    if (msg.type === 'answer' && msg.to === 'streamer') {
      streamer?.send(JSON.stringify({ type: 'answer', data: msg.data, from: msg.from }));
    }

    if (msg.type === 'ice-candidate') {
      const target = msg.to === 'streamer' ? streamer : viewers.get(msg.to);
      target?.send(JSON.stringify({ type: 'ice-candidate', data: msg.data, from: msg.from }));
    }
  });

  ws.on('close', () => {
    if (ws === streamer) {
      console.log('❌ Streamer disconnected');
      streamer = null;
    } else {
      for (const [id, viewer] of viewers.entries()) {
        if (viewer === ws) {
          viewers.delete(id);
          console.log(`❌ Viewer ${id} disconnected`);
        }
      }
    }
  });
});

server.listen(8080, 'localhost',() => {
  console.log('🚀 Server and signaling running on http://localhost:8080');
});
