const { io } = require("socket.io-client");

const socket = io("http://localhost:3000/chat", {
  query: {
    token: "ed40902a-147b-4fa6-84ed-9cc7933a7326",
    roomId: "room_840787e2-7868-4c68-910d-6ae3e028b0b4"
  }
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("room:joined", (data) => {
  console.log("Joined:", data);
});

socket.on("message:new", (msg) => {
  console.log("New message:", msg);
});