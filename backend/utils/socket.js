import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5500"; // backend server

export const createSocket = (token) => {
  return io(BASE_URL, {
    auth: { token },
    transports: ["websocket"],
  });
};
