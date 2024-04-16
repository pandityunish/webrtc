const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store active connections and their IDs
const clients = {};

wss.on('connection', function connection(ws) {
  console.log('WebSocket connected');

  // Assign a unique ID to the client
  const clientId = generateClientId();
  clients[clientId] = ws;

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    const { type, callerId, calleeId, sdpOffer, sdpAnswer, iceCandidate } = data;

    if (type === 'makeCall') {
      // Forward the call invitation (SDP offer) to the callee
      if (clients[calleeId]) {
        clients[calleeId].send(JSON.stringify({ type: 'offer', offer: sdpOffer, callerId }));
      }
    } else if (type === 'answerCall') {
      // Forward the call answer (SDP answer) to the caller
      if (clients[callerId]) {
        clients[callerId].send(JSON.stringify({ type: 'answer', answer: sdpAnswer }));
      }
    } else if (type === 'IceCandidate') {
      // Forward ICE candidates between peers
      if (clients[calleeId]) {
        clients[calleeId].send(JSON.stringify({ type: 'iceCandidate', iceCandidate }));
      }
    }
  });

  ws.on('close', function close() {
    console.log('WebSocket disconnected');
    // Remove client from active connections
    delete clients[clientId];
  });
});

function generateClientId() {
  // Generate a unique client ID (e.g., using UUID library)
}
