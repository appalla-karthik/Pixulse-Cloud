## Pixulse Cloud – WebRTC Game Streaming Platform

Pixulse Cloud is a custom WebRTC-based game streaming system that enables low-latency streaming of a host PC’s screen to any browser.

This repository includes:

- A Node.js WebSocket signaling server
- Streamer client (host PC)
- Viewer client (browser)
- Django integration for serving dynamic game pages

## Features

- Real-time WebRTC video/audio streaming
- Room-based architecture using game IDs
- Django integration for streamer and viewer pages
- Live stream detection (“Waiting for Stream…”)

## Tech Stack

- Frontend: HTML, CSS, JavaScript, WebRTC
- Backend: Node.js (WebSocket signaling), Django (web app integration)

## Interactive Cloud Gaming Flow

The player browser receives the stream and sends keyboard/mouse input over a WebRTC data channel. The gaming PC opens the streamer page, captures the game screen, and forwards player input to a local input agent running on that same PC.

### Run locally

```bash
cd webrtc_gamestreaming
npm install
npm run input-agent
npm start
```

Open the host streamer on the gaming PC:

```text
http://localhost:8080/streamer.html?room=game-1
```

Open the player page:

```text
http://localhost:8080/client.html?room=game-1
```

Click the video once to focus controls and request pointer lock. Press `Esc` to release pointer lock.

### Deploying signaling

Deploy `webrtc_gamestreaming` as a Node service and keep the input agent on the gaming PC. Set Django's `WEBRTC_PUBLIC_URL` environment variable to the public signaling URL, for example:

```text
WEBRTC_PUBLIC_URL=https://your-signaling-service.onrender.com
```

For internet NAT traversal, set TURN credentials on the signaling service. STUN alone will not work reliably on all networks.

```text
TURN_URL=turn:your-turn-host:3478
TURN_USERNAME=your-user
TURN_CREDENTIAL=your-password
```

You can also set `ICE_SERVERS_JSON` to a full JSON array of WebRTC ICE server objects.

