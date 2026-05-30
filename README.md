# Pixulse Cloud

<p align="center">
  <strong>Browser-based interactive game streaming with WebRTC, Django, and a host-side input agent.</strong>
</p>

<p align="center">
  <img alt="WebRTC" src="https://img.shields.io/badge/WebRTC-low_latency-00b894?style=for-the-badge">
  <img alt="Django" src="https://img.shields.io/badge/Django-web_app-092e20?style=for-the-badge">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-signaling-339933?style=for-the-badge">
  <img alt="Render" src="https://img.shields.io/badge/Render-ready-5f45ff?style=for-the-badge">
</p>

---

## Overview

Pixulse Cloud is a prototype cloud-gaming platform that lets a player open a browser, watch a live game stream, and send keyboard/mouse input back to the gaming PC.

The project is split into two layers:

| Layer | Purpose |
| --- | --- |
| Django web app | Game catalog, login/admin, game detail pages, and "Subscribe & Play" entry point |
| WebRTC streaming app | Signaling server, streamer page, player page, and real-time input bridge |

The player does not need gaming hardware. The game runs on the host/gaming PC, and the browser only receives video plus sends input.

---

## How It Works

```text
Player Browser
  opens client.html
  sends keyboard/mouse input
        |
        | WebRTC video + data channel
        v
Render Signaling Server
  matches streamer and player by room id
        |
        | WebRTC negotiation
        v
Gaming PC Browser
  opens streamer.html
  captures screen/audio
        |
        | local WebSocket
        v
Input Agent on Gaming PC
  injects keyboard/mouse events into the game
```

The important rule:

```text
streamer.html and input-agent must run on the same PC where the game is running.
client.html can run from any other laptop/browser.
```

---

## Features

- Low-latency WebRTC video/audio streaming.
- Browser player page with remote mouse, clicks, wheel, and keyboard input.
- Host-side input agent powered by `@nut-tree-fork/nut-js`.
- Room-based sessions using URLs like `?room=game-1`.
- Django admin for managing games and genres.
- Render-ready Node signaling service.
- Configurable STUN/TURN support for internet NAT traversal.
- TeamViewer-style absolute mouse control for desktop/game interaction.

---

## Project Structure

```text
Pixulse-Cloud/
  ak/
    manage.py
    ak/
      settings.py
      urls.py
    pcloud/
      models.py
      views.py
      admin.py
    templates/
      home.html
      gamepage.html
    assets/
    staticfiles/

  webrtc_gamestreaming/
    server/
      signaling_server.js
      input_agent.js
    public/
      client.html
      streamer.html
      client.js
      style.css
    package.json

  render.yaml
  requirements.txt
```

---

## Local Setup

### 1. Install Django dependencies

Run from the repo root:

```powershell
cd "D:\New folder\Pixulse-Cloud"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1
```

### 2. Run Django

```powershell
cd "D:\New folder\Pixulse-Cloud\ak"
python manage.py migrate
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

Create an admin user:

```powershell
python manage.py createsuperuser
```

Admin panel:

```text
http://127.0.0.1:8000/admin/
```

---

## Local Streaming Test

Open two terminals.

### Terminal 1: input agent

This terminal must run on the gaming PC.

```powershell
cd "D:\New folder\Pixulse-Cloud\webrtc_gamestreaming"
npm install
npm run input-agent
```

Expected output:

```text
Pixulse input agent listening on ws://127.0.0.1:9090
```

### Terminal 2: signaling server

```powershell
cd "D:\New folder\Pixulse-Cloud\webrtc_gamestreaming"
npm start
```

Open streamer on the gaming PC:

```text
http://localhost:8080/streamer.html?room=game-1
```

Open player on another browser/laptop:

```text
http://localhost:8080/client.html?room=game-1
```

The `room` value must match on both pages.

---

## Deployed Test Flow

Once the signaling service is deployed:

### Gaming PC

Run the input agent locally:

```powershell
cd "D:\New folder\Pixulse-Cloud\webrtc_gamestreaming"
npm run input-agent
```

Open streamer:

```text
https://your-signaling-service.onrender.com/streamer.html?room=game-1
```

Click `Start Streaming`, then share the entire screen or game window.

### Player Laptop

Open:

```text
https://your-signaling-service.onrender.com/client.html?room=game-1
```

Click inside the stream to begin controlling the host PC.

---

## Deploying On Render

This repository uses two deployable services.

### 1. Django web service

Use the existing Python service for the website.

Recommended values:

```text
Root Directory: .
Build Command: cd ak && pip install -r ../requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
Start Command: gunicorn -w 2 -b 0.0.0.0:$PORT ak.wsgi:application --chdir=ak
```

Add this environment variable after the signaling service is live:

```text
WEBRTC_PUBLIC_URL=https://your-signaling-service.onrender.com
```

### 2. Node signaling service

Create a separate Render Web Service.

```text
Name: pixulse-signaling
Runtime: Node
Root Directory: webrtc_gamestreaming
Build Command: npm install
Start Command: npm start
```

The signaling service serves:

```text
/client.html
/streamer.html
/config.js
```

---

## Environment Variables

### Django service

| Key | Required | Example | Purpose |
| --- | --- | --- | --- |
| `WEBRTC_PUBLIC_URL` | Yes for deployment | `https://pixulse-signaling.onrender.com` | Tells Django where player pages should open |

### Signaling service

| Key | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | Render provides it | `10000` | Port for the Node service |
| `STUN_URL` | No | `stun:stun.l.google.com:19302` | STUN server for WebRTC discovery |
| `TURN_URL` | Production recommended | `turn:your-turn-host:3478` | TURN relay fallback |
| `TURN_USERNAME` | If TURN is used | `user` | TURN auth username |
| `TURN_CREDENTIAL` | If TURN is used | `password` | TURN auth password |
| `ICE_SERVERS_JSON` | Optional | JSON array | Full custom ICE server config |

If no TURN values are set, the app falls back to Google's public STUN server. That is fine for early testing, but production-grade internet streaming should use TURN.

### Input agent

| Key | Required | Default | Purpose |
| --- | --- | --- | --- |
| `INPUT_AGENT_PORT` | No | `9090` | Local WebSocket port |
| `INPUT_AGENT_HOST` | No | `127.0.0.1` | Keep local only for safety |
| `INPUT_AGENT_TOKEN` | No | empty | Optional local auth token |
| `INPUT_AGENT_MOUSE_SENSITIVITY` | No | `1` | Relative mouse tuning |

---

## Mouse Calibration

If the remote pointer feels slightly offset, tune the player URL:

```text
https://your-signaling-service.onrender.com/client.html?room=game-1&pointerOffsetY=-18
```

Useful examples:

```text
pointerOffsetY=-10   less upward shift
pointerOffsetY=-25   more upward shift
pointerOffsetX=10    shift right
pointerOffsetX=-10   shift left
```

---

## Current Limitations

This is a working interactive streaming prototype, not a full commercial cloud-gaming stack yet.

Important gaps before production:

- A real TURN service is needed for reliable connections across strict networks.
- The host PC still needs to run the input agent locally.
- Game launching/session management is not automated yet.
- No billing, queueing, GPU orchestration, or per-user cloud VM management yet.
- Running AAA games in the cloud requires GPU instances such as AWS G-series, Azure NV-series, Paperspace, or similar infrastructure.

---

## Roadmap

- Package the host input agent as a Windows executable.
- Add session codes like TeamViewer for easier pairing.
- Add authenticated streamer/player rooms.
- Add automatic game launch on the host machine.
- Add gamepad support through the WebRTC data channel.
- Add TURN provider integration.
- Add monitoring for latency, bitrate, packet loss, and connection state.
- Add cloud GPU host support for true no-host-PC cloud gaming.

---

## Quick Command Reference

```powershell
# Django
cd "D:\New folder\Pixulse-Cloud"
.\.venv\Scripts\Activate.ps1
cd ak
python manage.py runserver

# Input agent on gaming PC
cd "D:\New folder\Pixulse-Cloud\webrtc_gamestreaming"
npm run input-agent

# Local signaling server
cd "D:\New folder\Pixulse-Cloud\webrtc_gamestreaming"
npm start
```

---

## License

This project currently uses the license declared in `webrtc_gamestreaming/package.json`.
