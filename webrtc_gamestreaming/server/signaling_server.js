import express from 'express';
import http from 'http';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.type('html');
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pixulse Signaling</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.5; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
      a { color: #0f766e; }
    </style>
  </head>
  <body>
    <h1>Pixulse signaling is running</h1>
    <p>This service hosts the WebRTC streamer and player pages.</p>
    <p><a href="/client.html?room=game-1">Open player client</a></p>
    <p><a href="/streamer.html?room=game-1">Open streamer panel</a></p>
    <p>Use matching room ids, for example <code>?room=game-1</code>.</p>
  </body>
</html>`);
});

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.PIXULSE_CONFIG = ${JSON.stringify({ rtcConfig: getRtcConfig() })};`);
});

app.use(express.static(path.join(__dirname, '../public')));

const wss = new WebSocketServer({ server });
const rooms = new Map();

function getRoom(roomId = 'default') {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      streamer: null,
      viewers: new Map()
    });
  }

  return rooms.get(roomId);
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (!room.streamer && room.viewers.size === 0) {
    rooms.delete(roomId);
  }
}

function getRtcConfig() {
  if (process.env.ICE_SERVERS_JSON) {
    try {
      return {
        iceServers: JSON.parse(process.env.ICE_SERVERS_JSON)
      };
    } catch (err) {
      console.error('ICE_SERVERS_JSON is invalid JSON:', err);
    }
  }

  const iceServers = [
    { urls: process.env.STUN_URL || 'stun:stun.l.google.com:19302' }
  ];

  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USERNAME || '',
      credential: process.env.TURN_CREDENTIAL || ''
    });
  }

  return { iceServers };
}

wss.on('connection', (ws) => {
  ws.meta = { role: null, roomId: 'default', id: null };

  ws.on('message', async (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      console.error('Invalid JSON message:', message);
      return;
    }

    if (msg.type === 'register') {
      const roomId = String(msg.room || 'default');
      const room = getRoom(roomId);
      ws.meta.roomId = roomId;
      ws.meta.role = msg.role;

      if (msg.role === 'streamer') {
        if (room.streamer && room.streamer !== ws) {
          room.streamer.close(1012, 'Streamer replaced');
        }

        room.streamer = ws;
        ws.send(JSON.stringify({ type: 'registered', role: 'streamer', room: roomId }));
        console.log(`Streamer registered in room: ${roomId}`);

        for (const id of room.viewers.keys()) {
          ws.send(JSON.stringify({ type: 'viewer-connected', id }));
        }
      } else if (msg.role === 'viewer') {
        const id = randomUUID();
        ws.meta.id = id;
        room.viewers.set(id, ws);
        ws.send(JSON.stringify({ type: 'registered', role: 'viewer', id, room: roomId }));
        console.log(`Viewer registered: ${id} in room: ${roomId}`);

        if (room.streamer) {
          room.streamer.send(JSON.stringify({ type: 'viewer-connected', id }));
        }
      }

      return;
    }

    const room = getRoom(ws.meta.roomId);

    if (msg.type === 'offer' && msg.to) {
      room.viewers.get(msg.to)?.send(JSON.stringify({ type: 'offer', data: msg.data }));
    }

    if (msg.type === 'answer' && msg.to === 'streamer') {
      room.streamer?.send(JSON.stringify({ type: 'answer', data: msg.data, from: msg.from }));
    }

    if (msg.type === 'ice-candidate') {
      const target = msg.to === 'streamer' ? room.streamer : room.viewers.get(msg.to);
      target?.send(JSON.stringify({ type: 'ice-candidate', data: msg.data, from: msg.from }));
    }
  });

  ws.on('close', () => {
    const { roomId, id } = ws.meta;
    const room = rooms.get(roomId);
    if (!room) return;

    if (ws === room.streamer) {
      console.log(`Streamer disconnected from room: ${roomId}`);
      room.streamer = null;

      for (const viewer of room.viewers.values()) {
        viewer.send(JSON.stringify({ type: 'streamer-disconnected' }));
      }
    } else if (id && room.viewers.get(id) === ws) {
      room.viewers.delete(id);
      console.log(`Viewer disconnected: ${id} from room: ${roomId}`);
      room.streamer?.send(JSON.stringify({ type: 'viewer-disconnected', id }));
    }

    cleanupRoom(roomId);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server and signaling running on http://0.0.0.0:${port}`);
});
