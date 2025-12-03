const ws = new WebSocket('ws://localhost:8080');
let peerConnection;

ws.addEventListener('open', () => {
  console.log('✅ WebSocket connected (viewer)');
  ws.send(JSON.stringify({ type: 'register', role: 'viewer' }));
});

ws.addEventListener('message', async event => {
  const msg = JSON.parse(event.data);
  console.log('📩 Message from server:', msg);

  if (msg.type === 'offer') {
    peerConnection = new RTCPeerConnection();

    peerConnection.ontrack = (event) => {
      console.log('🎥 Received remote track:', event.streams);
      const video = document.getElementById('remoteVideo');
      video.srcObject = event.streams[0];
      video.play();
    };

    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        ws.send(JSON.stringify({ type: 'ice-candidate', data: e.candidate }));
      }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({ type: 'answer', data: answer }));
  }

  if (msg.type === 'ice-candidate' && peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
  }
});
