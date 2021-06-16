import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { IOConnection } from "./socket/connection";

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 9000;

app.get("/", (req, res) => {
  res.send("Running");
});

IOConnection(io);
const server = httpServer.listen(PORT, async () =>
  console.log(`Server is running on port ${PORT}`)
);

export default server;
