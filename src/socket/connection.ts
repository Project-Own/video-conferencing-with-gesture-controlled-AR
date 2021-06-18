import { Server } from "socket.io";

export enum SocketEvent {
  me = "me",
  callEnded = "callEnded",
  callUser = "callUser",
  callAccepted = "callAccepted",
  disconnect="disconnect",
  connect="connect"
}

interface CallUserProps {
  userToCall:string, signalData:string, from:string, name:string
}
export const IOConnection = (io: Server) => {

  io.on(SocketEvent.connect, (socket) => {
    socket.emit("me", socket.id);
  
    socket.on(SocketEvent.disconnect, () => {
      socket.broadcast.emit(SocketEvent.callEnded)
    });
  
    socket.on(SocketEvent.callUser, ({ userToCall, signalData, from, name }:CallUserProps) => {
      io.to(userToCall).emit(SocketEvent.callUser, { signal: signalData, from, name });
    });
  
    socket.on(SocketEvent.callAccepted, (data:any) => {
      io.to(data.to).emit(SocketEvent.callAccepted, data.signal)
    });
  });
};
