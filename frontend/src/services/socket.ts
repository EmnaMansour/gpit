// import { io, Socket } from "socket.io-client";

// // 👉 Typage des events (optionnel mais PRO)
// interface ServerToClientEvents {
//   // ex: message: (data: string) => void;
// }

// interface ClientToServerEvents {
//   join_room: (room: string) => void;
//   leave_room: (room: string) => void;
// }

// // 👉 Instance socket typée
// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
//   "http://localhost:8000",
//   {
//     transports: ["websocket"],
//     withCredentials: true,
//     autoConnect: false,          // 🔥 IMPORTANT (évite erreurs au démarrage)
//     reconnectionAttempts: 3,
//     timeout: 5000,
//   }
// );

// // ✅ Connexion contrôlée
// socket.on("connect", () => {
//   console.log("🟢 Socket connecté:", socket.id);
// });

// socket.on("connect_error", (err: Error) => {
//   console.error("❌ Socket error:", err.message);
// });

// export default socket;
