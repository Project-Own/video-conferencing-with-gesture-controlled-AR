import { Server } from "socket.io";

export enum SocketEvent {
  created = "created",
  joined = "joined",
  join = "join",
  full = "full",
  ready = "ready",
  candidate = "candidate",
  offer = "offer",
  answer = "answer",
}

export const IOConnection = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User Connected :" + socket.id);

    socket.on(SocketEvent.join, function (roomName) {
      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(roomName);

      console.log(`Room ${roomName} Size: ${room?.size}`);
      //room == undefined when no such room exists.
      if (room == undefined) {
        console.log(SocketEvent.created);
        socket.join(roomName);
        socket.emit(SocketEvent.created);
      } else if (room.size < 10) {
        //room.size == 1 when one person is inside the room.
        console.log(SocketEvent.joined);

        socket.join(roomName);
        socket.emit(SocketEvent.joined);
      } else {
        //when there are already two people inside the room.
        console.log(SocketEvent.full);

        socket.emit(SocketEvent.full);
      }
      console.log(rooms);
    });

    //Triggered when the person who joined the room is ready to communicate.
    socket.on(SocketEvent.ready, function (roomName) {
      console.log(SocketEvent.ready);

      socket.broadcast.to(roomName).emit(SocketEvent.ready); //Informs the other peer in the room.
    });

    //Triggered when server gets an icecandidate from a peer in the room.

    socket.on(SocketEvent.candidate, function (candidate, roomName) {
      console.log(SocketEvent.candidate);

      console.log(candidate);
      socket.broadcast.to(roomName).emit(SocketEvent.candidate, candidate);
    });

    socket.on(SocketEvent.offer, function (offer, roomName) {
      console.log(SocketEvent.offer);

      socket.broadcast.to(roomName).emit(SocketEvent.offer, offer); //Sends Offer to the other peer in the room.
    });

    //Triggered when server gets an answer from a peer in the room.

    socket.on(SocketEvent.answer, function (answer, roomName) {
      console.log(SocketEvent.answer);

      socket.broadcast.to(roomName).emit(SocketEvent.answer, answer); //Sends Answer to the other peer in the room.
    });
  });
};
