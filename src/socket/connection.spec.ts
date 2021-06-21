import { createServer } from "http";
import { AddressInfo } from "net";
import { Server, Socket } from "socket.io";
import Client from "socket.io-client";
import { IOConnection, SocketEvent } from "./connection";

// jest.setTimeout(5000);
let port = 4000;
interface Callback {
  cb: (clients: ClientSocket[]) => void;
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
    return this.socket.emit(SocketEvent.join, roomName);
  }
  public onCreated(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.created, cb);
  }
  public onJoined(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.joined, cb);
  }
  public onFull(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.full, cb);
  }
  public onCandidate(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.candidate, cb);
  }
  public onOffer(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.offer, cb);
  }
  public onAnswer(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.answer, cb);
  }
  public onReady(cb: Callback["cb"]) {
    return this.socket.on(SocketEvent.ready, cb);
  }
}

interface TestFunction {
  fn: (client1: ClientSocket, client2: ClientSocket) => void;
}
/**
 * Creates Room named "test" by client1.
 * Joins Room "test" by client2.
 * Takes runTest() fn that executes the sequential test functions and callbacks
 * runTest must contain client close operations
 * */
const setup = (runTest: TestFunction["fn"]) => {
  const client1 = new ClientSocket("1");
  const stub = jest.fn();

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

    const [client1, client2] = clients!;

    runTest(client1, client2);
  };
  client1.join("test");
  client1.onCreated(() => client1Callback([client1]));
};
describe("Testing Socket.io Connection Room Creation", () => {
  let io: Server, serverSocket: Socket, clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    IOConnection(io);

    const listener = httpServer.listen(() => {
      io.on("connection", (socket) => {
        serverSocket = socket;
      });

      done();
    });

    const address = listener.address() as AddressInfo;
    port = address.port;
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

  it("Client 3 should not be able to join room test", (done) => {
    const test: TestFunction["fn"] = (client1, client2) => {
      const client3Callback: Callback["cb"] = (clients) => {
        clients?.forEach((client) => client.close());
        done();
      };

      const stub = jest.fn();
      stub();
      expect(stub).toBeCalled();

      const client3 = new ClientSocket("3");
      client3.join("test");
      client3.onFull(() => client3Callback([client1, client2, client3]));
    };

    setup(test);
  });

  it("Client Candidate Test", (done) => {
    const test: TestFunction["fn"] = (client1, client2) => {
      const client1CandidateCallback: Callback["cb"] = (clients) => {
        clients?.forEach((client) => client.close());
        done();
      };

      client1.onCandidate((candidate) => {
        expect(candidate).toBe("candidateName");
        client1CandidateCallback([client1, client2]);
      });
      client2.socket.emit(SocketEvent.candidate, "candidateName", "test");
    };

    setup(test);
  });

  it("Client Ready Test", (done) => {
    const test: TestFunction["fn"] = (client1, client2) => {
      const client1ReadyCallback: Callback["cb"] = (clients) => {
        clients?.forEach((client) => client.close());
        done();
      };

      client1.onReady(() => client1ReadyCallback([client1, client2]));
      client2.socket.emit(SocketEvent.ready, "test");
    };

    setup(test);
  });

  /**
   *
   * */

  it("Client Offer Test", (done) => {
    const test: TestFunction["fn"] = (client1, client2) => {
      const client1OfferCallback: Callback["cb"] = (clients) => {
        clients?.forEach((client) => client.close());
        done();
      };

      client1.onOffer((offer) => {
        expect(offer).toBe("offerName");
        client1OfferCallback([client1, client2]);
      });
      client2.socket.emit(SocketEvent.offer, "offerName", "test");
    };

    setup(test);
  });

  /**
   * Answer test answer event
   * */
  it("Client Answer Test", (done) => {
    const test: TestFunction["fn"] = (client1, client2) => {
      const client1AnswerCallback: Callback["cb"] = (clients) => {
        clients?.forEach((client) => client.close());
        done();
      };

      client1.onAnswer((answer) => {
        expect(answer).toBe("answerName");
        client1AnswerCallback([client1, client2]);
      });
      client2.socket.emit(SocketEvent.answer, "answerName", "test");
    };

    setup(test);
  });
});