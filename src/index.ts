import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import ioClient from "socket.io-client";
import { IOConnection } from "./socket/connection";

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  const socketClient = ioClient(`http://localhost:${PORT}`);
  socketClient.on("connect", async () => {
    console.log("Connected Client");
  });
  res.send("Running");
});

IOConnection(io);

export const serverListener = httpServer.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);
