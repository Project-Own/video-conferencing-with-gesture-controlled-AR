import { Server } from "socket.io";
export const IOConnection = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User Connected :" + socket.id);

    socket.on("join", function (roomName) {
      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(roomName);

      console.log(`Room ${roomName} Size: ${room?.size}`);
      //room == undefined when no such room exists.
      if (room == undefined) {
        console.log("Created");
        socket.join(roomName);
        socket.emit("created");
      } else if (room.size === 1) {
        //room.size == 1 when one person is inside the room.
        console.log("Joined");

        socket.join(roomName);
        socket.emit("joined");
      } else {
        //when there are already two people inside the room.
        console.log("Full");

        socket.emit("full");
      }
      console.log(rooms);
    });

    //Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", function (roomName) {
      socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
    });

    //Triggered when server gets an icecandidate from a peer in the room.

    socket.on("candidate", function (candidate, roomName) {
      console.log(candidate);
      socket.broadcast.to(roomName).emit("candidate", candidate);
    });

    socket.on("offer", function (offer, roomName) {
      socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
    });

    //Triggered when server gets an answer from a peer in the room.

    socket.on("answer", function (answer, roomName) {
      socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
    });
  });
};
