// ===== GLOBALS & CONFIG =====
const query = new URLSearchParams(window.location.search);
const room = query.get('room') || query.get('game') || 'default';
const pointerOffsetXPx = Number(query.get('pointerOffsetX')) || 0;
const pointerOffsetYPx = Number(query.get('pointerOffsetY')) || -18;
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${window.location.host}`;
const rtcConfig = window.PIXULSE_CONFIG?.rtcConfig || { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// WebRTC State
let ws;
let peerConnection;
let inputChannel;
let clientId = null;
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;
let statsInterval = null;

// Input State
let inputCaptured = false;
let lastMouseMoveAt = 0;
const pressedKeys = new Set();
const pressedButtons = new Set();
let isPointerLocked = false;

// DOM Elements
const video = document.getElementById('remoteVideo');
const waitingScreen = document.getElementById('waitingScreen');
const streamContainer = document.getElementById('streamContainer');
const perfHUD = document.getElementById('perfHUD');
const toolbar = document.getElementById('toolbar');
const controlStatus = document.getElementById('controlStatus');
const controlText = document.getElementById('controlText');
const toastContainer = document.getElementById('toastContainer');
const customCursor = document.getElementById('customCursor');
const reconnectOverlay = document.getElementById('reconnectOverlay');

// Setup Video
video.tabIndex = 0;
video.controls = false;
video.disablePictureInPicture = true;

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconClass = 'fa-circle-info info';
  if (type === 'success') iconClass = 'fa-circle-check success';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation warning';
  if (type === 'error') iconClass = 'fa-circle-xmark error';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ===== CONNECTION LOGIC =====
function updateStep(stepId, status) {
  const el = document.getElementById(stepId);
  if (!el) return;
  if (status === 'active') {
    el.classList.add('active');
    el.classList.remove('done');
  } else if (status === 'done') {
    el.classList.remove('active');
    el.classList.add('done');
  } else {
    el.classList.remove('active', 'done');
  }
}

function connectWebSocket() {
  updateStep('step-server', 'active');
  updateStep('step-streamer', '');
  updateStep('step-peer', '');
  updateStep('step-stream', '');
  
  ws = new WebSocket(wsUrl);
  
  ws.addEventListener('open', () => {
    updateStep('step-server', 'done');
    updateStep('step-streamer', 'active');
    ws.send(JSON.stringify({ type: 'register', role: 'viewer', room }));
    reconnectAttempts = 0;
    reconnectOverlay.classList.add('hidden');
  });

  ws.addEventListener('message', async (event) => {
    const msg = JSON.parse(event.data);
    
    if (msg.type === 'registered') clientId = msg.id;
    if (msg.type === 'streamer-disconnected') handleDisconnect('Streamer disconnected');

    if (msg.type === 'offer') {
      updateStep('step-streamer', 'done');
      updateStep('step-peer', 'active');
      setupPeerConnection(msg.data);
    }

    if (msg.type === 'ice-candidate' && peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
    }
  });

  ws.addEventListener('close', () => {
    handleDisconnect('Connection to server lost');
  });
}

async function setupPeerConnection(offerData) {
  if (peerConnection) peerConnection.close();
  peerConnection = new RTCPeerConnection(rtcConfig);

  peerConnection.ondatachannel = (event) => {
    inputChannel = event.channel;
    inputChannel.addEventListener('open', () => {
      controlStatus.classList.remove('hidden');
      controlText.textContent = "Input ready. Click stream to control";
      sendInput({ type: 'client-ready' });
    });
    inputChannel.addEventListener('close', () => {
      controlText.textContent = "Input disconnected";
    });
  };

  peerConnection.ontrack = (event) => {
    const track = event.streams[0];
    if (track.getVideoTracks().length === 0) return;
    
    updateStep('step-peer', 'done');
    updateStep('step-stream', 'active');
    
    video.srcObject = track;
    
    video.onplaying = () => {
      // Stream is actively playing - switch views
      updateStep('step-stream', 'done');
      setTimeout(() => {
        waitingScreen.classList.add('hidden');
        streamContainer.classList.remove('hidden');
        toolbar.classList.remove('hidden');
        
        // Cinematic Entry
        const flash = document.getElementById('cinematicFlash');
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 600);
        
        showToast('Stream Connected successfully', 'success');
        startStatsPolling();
        startSessionTimer();
      }, 500);
    };
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ice-candidate', data: e.candidate, to: 'streamer', from: clientId }));
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    const state = peerConnection.iceConnectionState;
    if (['disconnected', 'failed', 'closed'].includes(state)) {
      handleDisconnect('Peer connection lost');
    }
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offerData));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  ws.send(JSON.stringify({ type: 'answer', data: answer, to: 'streamer', from: clientId }));
}

function handleDisconnect(reason) {
  console.warn('Disconnected:', reason);
  stopStatsPolling();
  releaseAllControls();
  
  if (reconnectAttempts < MAX_RECONNECTS) {
    reconnectAttempts++;
    triggerReconnectAttempt();
  } else {
    streamContainer.classList.add('hidden');
    toolbar.classList.add('hidden');
    waitingScreen.classList.remove('hidden');
    showToast('Failed to reconnect after multiple attempts', 'error');
  }
}

function triggerReconnectAttempt() {
  reconnectOverlay.classList.remove('hidden');
  document.getElementById('reconnectAttempt').textContent = reconnectAttempts;
  let countdown = 5;
  const cdEl = document.getElementById('reconnectCountdown');
  cdEl.textContent = countdown;
  
  const int = setInterval(() => {
    countdown--;
    cdEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(int);
      if (ws.readyState === WebSocket.CLOSED) connectWebSocket();
    }
  }, 1000);
}

document.getElementById('btnCancelReconnect').addEventListener('click', () => {
  reconnectAttempts = MAX_RECONNECTS; // stop trying
  reconnectOverlay.classList.add('hidden');
  streamContainer.classList.add('hidden');
  toolbar.classList.add('hidden');
  waitingScreen.classList.remove('hidden');
});

// ===== INPUT SYSTEM =====
function sendInput(payload) {
  if (!inputChannel || inputChannel.readyState !== 'open') return;
  if (payload.type.startsWith('mouse-move') && inputChannel.bufferedAmount > 16384) return;
  inputChannel.send(JSON.stringify({ ...payload, ts: performance.now() }));
}

function getVideoPoint(event) {
  const rect = video.getBoundingClientRect();
  const adjustedX = event.clientX + pointerOffsetXPx;
  const adjustedY = event.clientY + pointerOffsetYPx;
  return {
    x: Math.max(0, Math.min(1, (adjustedX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (adjustedY - rect.top) / rect.height))
  };
}

function captureControls() {
  if (!inputChannel || inputChannel.readyState !== 'open') {
    showToast('Input not ready yet', 'warning');
    return false;
  }
  video.focus();
  inputCaptured = true;
  controlText.textContent = 'Input captured (Esc to release)';
  controlStatus.classList.add('active');
  video.classList.add('no-cursor');
  customCursor.classList.remove('hidden');
  return true;
}

function releaseAllControls() {
  inputCaptured = false;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  
  for (const code of pressedKeys) sendInput({ type: 'key', action: 'up', code });
  pressedKeys.clear();
  
  for (const button of pressedButtons) sendInput({ type: 'mouse-button', action: 'up', button });
  pressedButtons.clear();
  
  controlText.textContent = 'Click stream to control';
  controlStatus.classList.remove('active');
  video.classList.remove('no-cursor');
  customCursor.classList.add('hidden');
}

// Mouse Tracking for Custom Cursor
window.addEventListener('mousemove', (e) => {
  if (inputCaptured && !isPointerLocked) {
    customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }
});

video.addEventListener('mousemove', (event) => {
  if (!inputCaptured) return;
  const now = performance.now();
  if (now - lastMouseMoveAt < 8) return;
  lastMouseMoveAt = now;

  if (isPointerLocked) {
    sendInput({ type: 'mouse-move-relative', dx: event.movementX, dy: event.movementY });
  } else {
    const point = getVideoPoint(event);
    sendInput({ type: 'mouse-move-absolute', x: point.x, y: point.y });
  }
});

video.addEventListener('mousedown', (event) => {
  event.preventDefault();
  if (!captureControls()) return;
  
  customCursor.classList.add('clicking');
  const point = getVideoPoint(event);
  sendInput({ type: 'mouse-move-absolute', x: point.x, y: point.y });
  pressedButtons.add(event.button);
  sendInput({ type: 'mouse-button', action: 'down', button: event.button });
});

window.addEventListener('mouseup', (event) => {
  customCursor.classList.remove('clicking');
  if (!pressedButtons.has(event.button)) return;
  pressedButtons.delete(event.button);
  sendInput({ type: 'mouse-button', action: 'up', button: event.button });
});

video.addEventListener('contextmenu', e => e.preventDefault());
video.addEventListener('wheel', (event) => {
  event.preventDefault();
  if (!inputCaptured) return;
  sendInput({ type: 'mouse-wheel', deltaX: event.deltaX, deltaY: event.deltaY });
}, { passive: false });

window.addEventListener('keydown', (event) => {
  // Global Shortcuts
  if (event.code === 'Backquote' || event.code === 'F3') { perfHUD.classList.toggle('hidden'); return; }
  if (event.code === 'F11' || (event.code === 'KeyF' && !inputCaptured)) { toggleFullscreen(); event.preventDefault(); return; }
  
  // Input capture logic
  if (event.code === 'Escape') {
    if (inputCaptured) {
      event.preventDefault();
      releaseAllControls();
    }
    return;
  }
  // Custom shortcut for pointer lock (L)
  if (event.code === 'KeyL' && inputCaptured) {
     togglePointerLock();
     return;
  }

  if (!inputCaptured || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || event.repeat) return;
  event.preventDefault();
  pressedKeys.add(event.code);
  sendInput({ type: 'key', action: 'down', code: event.code });
});

window.addEventListener('keyup', (event) => {
  if (!pressedKeys.has(event.code)) return;
  event.preventDefault();
  pressedKeys.delete(event.code);
  sendInput({ type: 'key', action: 'up', code: event.code });
});

// ===== POINTER LOCK =====
function togglePointerLock() {
  if (!document.pointerLockElement) {
    video.requestPointerLock();
  } else {
    document.exitPointerLock();
  }
}
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = !!document.pointerLockElement;
  if (isPointerLocked) {
    customCursor.classList.add('hidden'); // hide custom cursor when locked
    showToast('Pointer Locked. Press Esc to release', 'info');
  } else {
    if (inputCaptured) customCursor.classList.remove('hidden');
  }
});

// ===== FULLSCREEN & UI =====
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => showToast('Fullscreen failed', 'error'));
  } else {
    document.exitFullscreen();
  }
}
document.addEventListener('fullscreenchange', () => {
  const isFS = !!document.fullscreenElement;
  document.getElementById('btnFullscreen').innerHTML = isFS ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
});

// Toolbar auto-hide logic
let hideToolbarTimeout;
window.addEventListener('mousemove', (e) => {
  const navbar = document.getElementById('navbar');
  if (document.fullscreenElement) {
    navbar.classList.add('auto-hidden');
    toolbar.classList.remove('auto-fade');
    clearTimeout(hideToolbarTimeout);
    hideToolbarTimeout = setTimeout(() => {
      toolbar.classList.add('auto-fade');
    }, 2500);
  } else {
    navbar.classList.remove('auto-hidden');
    toolbar.classList.remove('auto-fade');
    clearTimeout(hideToolbarTimeout);
  }
});

// ===== UI BUTTONS =====
document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);
document.getElementById('btnStats').addEventListener('click', () => perfHUD.classList.toggle('hidden'));
document.getElementById('btnPointerLock').addEventListener('click', () => { captureControls(); togglePointerLock(); });

document.getElementById('btnMute').addEventListener('click', (e) => {
  video.muted = !video.muted;
  e.currentTarget.innerHTML = video.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  e.currentTarget.classList.toggle('active', !video.muted);
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
  video.volume = e.target.value / 100;
  if (video.muted && video.volume > 0) {
    video.muted = false;
    document.getElementById('btnMute').innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  }
});

document.getElementById('btnHelp').addEventListener('click', () => { document.getElementById('helpModal').classList.remove('hidden'); });
document.getElementById('btnCloseHelp').addEventListener('click', () => { document.getElementById('helpModal').classList.add('hidden'); });

document.getElementById('btnDisconnect').addEventListener('click', () => {
  ws.close();
  location.href = '/'; 
});

document.getElementById('btnScreenshot').addEventListener('click', () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pixulse_Cloud_${Date.now()}.png`;
    a.click();
    
    // flash effect
    const flash = document.getElementById('screenshotFlash');
    flash.classList.remove('active');
    void flash.offsetWidth; // reflow
    flash.classList.add('active');
    
    showToast('Screenshot saved', 'success');
  } catch (err) {
    showToast('Failed to take screenshot', 'error');
  }
});

// ===== SESSION TIMER =====
let sessionStart = 0;
let sessionInterval;
function startSessionTimer() {
  document.getElementById('sessionTimer').classList.remove('hidden');
  sessionStart = Date.now();
  sessionInterval = setInterval(() => {
    const diff = Math.floor((Date.now() - sessionStart) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('sessionTime').textContent = `${h}:${m}:${s}`;
  }, 1000);
}

// ===== STATS & QUALITY =====
let lastBytes = 0;
let lastTimestamp = 0;

function startStatsPolling() {
  if (statsInterval) clearInterval(statsInterval);
  const qBadge = document.getElementById('qualityBadge');
  const qText = document.getElementById('qualityText');
  
  statsInterval = setInterval(async () => {
    if (!peerConnection || peerConnection.iceConnectionState !== 'connected') return;
    
    const stats = await peerConnection.getStats();
    let fps = 0, bitrate = 0, latency = 0, loss = 0, resolution = '', codec = '', jitter = 0, decodeTime = 0;
    
    stats.forEach(report => {
      // Inbound Video Stats
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const now = report.timestamp;
        const bytes = report.bytesReceived;
        if (lastTimestamp && now > lastTimestamp) {
          bitrate = ((bytes - lastBytes) * 8) / (now - lastTimestamp); // kbps
          bitrate = (bitrate / 1000).toFixed(1); // Mbps
        }
        lastBytes = bytes;
        lastTimestamp = now;
        
        fps = report.framesPerSecond || 0;
        loss = report.packetsLost || 0;
        resolution = `${report.frameWidth || 0}x${report.frameHeight || 0}`;
        jitter = (report.jitter * 1000 || 0).toFixed(1);
        decodeTime = (report.totalDecodeTime / report.framesDecoded * 1000 || 0).toFixed(1);
      }
      
      // Codec Info
      if (report.type === 'codec' && report.mimeType && report.mimeType.includes('video')) {
        codec = report.mimeType.split('/')[1];
      }
      
      // Candidate Pair (Latency/RTT)
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = (report.currentRoundTripTime * 1000).toFixed(0);
      }
    });

    // Update HUD
    document.getElementById('hudFps').textContent = fps;
    document.getElementById('hudLatency').textContent = latency ? `${latency} ms` : '-- ms';
    document.getElementById('hudBitrate').textContent = bitrate ? `${bitrate} Mbps` : '-- Mbps';
    document.getElementById('hudResolution').textContent = resolution;
    document.getElementById('hudCodec').textContent = codec || 'H264';
    document.getElementById('hudLoss').textContent = loss;
    document.getElementById('hudJitter').textContent = jitter ? `${jitter} ms` : '-- ms';
    document.getElementById('hudDecode').textContent = decodeTime !== 'NaN' ? `${decodeTime} ms` : '-- ms';
    
    // Update Quality Badge
    qBadge.className = 'nav-pill'; // reset
    if (latency && latency < 40) {
      qBadge.classList.add('quality-excellent');
      qText.textContent = 'Excellent';
    } else if (latency && latency < 80) {
      qBadge.classList.add('quality-good');
      qText.textContent = 'Good';
    } else if (latency && latency < 150) {
      qBadge.classList.add('quality-fair');
      qText.textContent = 'Fair';
    } else if (latency) {
      qBadge.classList.add('quality-poor');
      qText.textContent = 'Poor';
    } else {
      qBadge.classList.add('quality-unknown');
      qText.textContent = 'Unknown';
    }
    
  }, 1000);
}

function stopStatsPolling() {
  if (statsInterval) clearInterval(statsInterval);
}

// Start connection on load
connectWebSocket();
