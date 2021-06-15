import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Client from "socket.io-client";
import { IOConnection } from "./connection";

// jest.setTimeout(5000);
const port = 4000;
interface Callback {
  cb: (clients?: ClientSocket[]) => void;
}
class ClientSocket {
  public socket;
  public name;
  constructor(name: string) {
    this.name = name;
    this.socket = Client(`http://localhost:${port}`);
    this.socket.on("connect", () => {
      console.log(`Client ${name} connected: ${this.socket.id}`);
    });
  }
  close() {
    console.log(`Closing Socket ${this.name}: ${this.socket.id}`);
    this.socket.close();
  }

  public join(roomName: string) {
    return this.socket.emit("join", roomName);
  }
  public onCreated(cb: Callback["cb"]) {
    return this.socket.on("created", cb);
  }
  public onJoined(cb: Callback["cb"]) {
    return this.socket.on("joined", cb);
  }
  public onFull(cb: Callback["cb"]) {
    return this.socket.on("full", cb);
  }
}

const callback = (cb: () => void) => {
  cb();
};
describe("Testing Socket.io Connection Room Creation", () => {
  let io: Server, serverSocket: Socket, clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    IOConnection(io);

    httpServer.listen(port, () => {
      io.on("connection", (socket) => {
        serverSocket = socket;
      });

      done();
    });
  });

  afterAll(() => {
    io.close();
  });

  it("Room test should be created", (done) => {
    const stub = jest.fn();

    const client1 = new ClientSocket("1");

    const client1Callback: Callback["cb"] = (clients) => {
      stub();
      expect(stub).toBeCalled();
      clients?.forEach((client) => client.close());
      done();
    };

    client1.join("test");
    client1.onCreated(() => client1Callback([client1]));
  });

  it("Client 1 should be able to join Room test", (done) => {
    const stub = jest.fn();

    const client1 = new ClientSocket("1");

    const client1Callback: Callback["cb"] = (clients) => {
      stub();
      expect(stub).toBeCalledTimes(2);
      clients?.forEach((client) => client.close());
      done();
    };

    client1.join("test");
    client1.onCreated(() => {
      stub();
      expect(stub).toBeCalled();
      client1.join("test");
      client1.onJoined(() => client1Callback([client1]));
    });
  });

  it("Client 1 should join Room test. Client 2 should not be able to join room test", (done) => {
    const stub = jest.fn();
    const client1 = new ClientSocket("1");

    const client1Callback: Callback["cb"] = (clients) => {
      stub();
      expect(stub).toBeCalled();

      const client2 = new ClientSocket("2");
      client2.join("test");
      clients?.push(client2);
      client2.onJoined(() => client2Callback(clients));
    };

    const client2Callback: Callback["cb"] = (clients) => {
      stub();
      expect(stub).toBeCalledTimes(2);

      const client3 = new ClientSocket("3");
      client3.join("test");
      clients?.push(client3);
      client3.onFull(() => client3Callback(clients));
    };

    const client3Callback: Callback["cb"] = (clients) => {
      stub();
      expect(stub).toBeCalledTimes(3);
      clients?.forEach((client) => client.close());
      done();
    };
    client1.join("test");
    client1.onCreated(() => client1Callback([client1]));
  });
});
