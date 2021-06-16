"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOConnection = exports.SocketEvent = void 0;
var SocketEvent;
(function (SocketEvent) {
    SocketEvent["created"] = "created";
    SocketEvent["joined"] = "joined";
    SocketEvent["join"] = "join";
    SocketEvent["full"] = "full";
    SocketEvent["ready"] = "ready";
    SocketEvent["candidate"] = "candidate";
    SocketEvent["offer"] = "offer";
    SocketEvent["answer"] = "answer";
})(SocketEvent = exports.SocketEvent || (exports.SocketEvent = {}));
const IOConnection = (io) => {
    io.on("connection", (socket) => {
        console.log("User Connected :" + socket.id);
        socket.on(SocketEvent.join, function (roomName) {
            let rooms = io.sockets.adapter.rooms;
            let room = rooms.get(roomName);
            console.log(`Room ${roomName} Size: ${room === null || room === void 0 ? void 0 : room.size}`);
            //room == undefined when no such room exists.
            if (room == undefined) {
                console.log(SocketEvent.created);
                socket.join(roomName);
                socket.emit(SocketEvent.created);
            }
            else if (room.size === 1) {
                //room.size == 1 when one person is inside the room.
                console.log(SocketEvent.joined);
                socket.join(roomName);
                socket.emit(SocketEvent.joined);
            }
            else {
                //when there are already two people inside the room.
                console.log(SocketEvent.full);
                socket.emit(SocketEvent.full);
            }
            console.log(rooms);
        });
        //Triggered when the person who joined the room is ready to communicate.
        socket.on(SocketEvent.ready, function (roomName) {
            socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
        });
        //Triggered when server gets an icecandidate from a peer in the room.
        socket.on(SocketEvent.candidate, function (candidate, roomName) {
            console.log(candidate);
            socket.broadcast.to(roomName).emit("candidate", candidate);
        });
        socket.on(SocketEvent.offer, function (offer, roomName) {
            socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
        });
        //Triggered when server gets an answer from a peer in the room.
        socket.on(SocketEvent.answer, function (answer, roomName) {
            socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
        });
    });
};
exports.IOConnection = IOConnection;
