const query = new URLSearchParams(window.location.search);
const room = query.get('room') || query.get('game') || 'default';
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);
const rtcConfig = window.PIXULSE_CONFIG?.rtcConfig || {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

let peerConnection;
let inputChannel;
let id = null;

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ type: 'register', role: 'viewer', room }));
});

ws.addEventListener('message', async event => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'registered') {
    id = msg.id;
  }

  if (msg.type === 'offer') {
    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.ondatachannel = (event) => {
      inputChannel = event.channel;
    };

    peerConnection.ontrack = (event) => {
      const video = document.getElementById('remoteVideo');
      video.srcObject = event.streams[0];
      video.play();
    };

    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          data: e.candidate,
          to: 'streamer',
          from: id
        }));
      }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({
      type: 'answer',
      data: answer,
      to: 'streamer',
      from: id
    }));
  }

  if (msg.type === 'ice-candidate' && peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
  }
});

window.sendPixulseInput = (payload) => {
  if (!inputChannel || inputChannel.readyState !== 'open') return;
  if (payload.type?.startsWith('mouse-move') && inputChannel.bufferedAmount > 16384) return;
  inputChannel.send(JSON.stringify(payload));
};
