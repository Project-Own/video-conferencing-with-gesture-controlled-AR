"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const connection_1 = require("./connection");
// jest.setTimeout(5000);
let port = 4000;
class ClientSocket {
    constructor(name) {
        this.name = name;
        this.socket = socket_io_client_1.default(`http://localhost:${port}`);
        this.socket.on("connect", () => {
            console.log(`Client ${name} connected: ${this.socket.id}`);
        });
    }
    close() {
        console.log(`Closing Socket ${this.name}: ${this.socket.id}`);
        this.socket.close();
    }
    join(roomName) {
        return this.socket.emit(connection_1.SocketEvent.join, roomName);
    }
    onCreated(cb) {
        return this.socket.on(connection_1.SocketEvent.created, cb);
    }
    onJoined(cb) {
        return this.socket.on(connection_1.SocketEvent.joined, cb);
    }
    onFull(cb) {
        return this.socket.on(connection_1.SocketEvent.full, cb);
    }
    onCandidate(cb) {
        return this.socket.on(connection_1.SocketEvent.candidate, cb);
    }
    onOffer(cb) {
        return this.socket.on(connection_1.SocketEvent.offer, cb);
    }
    onAnswer(cb) {
        return this.socket.on(connection_1.SocketEvent.answer, cb);
    }
    onReady(cb) {
        return this.socket.on(connection_1.SocketEvent.ready, cb);
    }
}
/**
 * Creates Room named "test" by client1.
 * Joins Room "test" by client2.
 * Takes runTest() fn that executes the sequential test functions and callbacks
 * runTest must contain client close operations
 * */
const setup = (runTest) => {
    const client1 = new ClientSocket("1");
    const stub = jest.fn();
    const client1Callback = (clients) => {
        stub();
        expect(stub).toBeCalled();
        const client2 = new ClientSocket("2");
        client2.join("test");
        clients === null || clients === void 0 ? void 0 : clients.push(client2);
        client2.onJoined(() => client2Callback(clients));
    };
    const client2Callback = (clients) => {
        stub();
        expect(stub).toBeCalledTimes(2);
        const [client1, client2] = clients;
        runTest(client1, client2);
    };
    client1.join("test");
    client1.onCreated(() => client1Callback([client1]));
};
describe("Testing Socket.io Connection Room Creation", () => {
    let io, serverSocket, clientSocket;
    beforeAll((done) => {
        const httpServer = http_1.createServer();
        io = new socket_io_1.Server(httpServer);
        connection_1.IOConnection(io);
        const listener = httpServer.listen(() => {
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            done();
        });
        const address = listener.address();
        port = address.port;
    });
    afterAll(() => {
        io.close();
    });
    it("Room test should be created", (done) => {
        const stub = jest.fn();
        const client1 = new ClientSocket("1");
        const client1Callback = (clients) => {
            stub();
            expect(stub).toBeCalled();
            clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
            done();
        };
        client1.join("test");
        client1.onCreated(() => client1Callback([client1]));
    });
    it("Client 1 should be able to join Room test", (done) => {
        const stub = jest.fn();
        const client1 = new ClientSocket("1");
        const client1Callback = (clients) => {
            stub();
            expect(stub).toBeCalledTimes(2);
            clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
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
        const test = (client1, client2) => {
            const client3Callback = (clients) => {
                clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
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
        const test = (client1, client2) => {
            const client1CandidateCallback = (clients) => {
                clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
                done();
            };
            client1.onCandidate((candidate) => {
                expect(candidate).toBe("candidateName");
                client1CandidateCallback([client1, client2]);
            });
            client2.socket.emit(connection_1.SocketEvent.candidate, "candidateName", "test");
        };
        setup(test);
    });
    it("Client Ready Test", (done) => {
        const test = (client1, client2) => {
            const client1ReadyCallback = (clients) => {
                clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
                done();
            };
            client1.onReady(() => client1ReadyCallback([client1, client2]));
            client2.socket.emit(connection_1.SocketEvent.ready, "test");
        };
        setup(test);
    });
    /**
     *
     * */
    it("Client Offer Test", (done) => {
        const test = (client1, client2) => {
            const client1OfferCallback = (clients) => {
                clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
                done();
            };
            client1.onOffer((offer) => {
                expect(offer).toBe("offerName");
                client1OfferCallback([client1, client2]);
            });
            client2.socket.emit(connection_1.SocketEvent.offer, "offerName", "test");
        };
        setup(test);
    });
    /**
     * Answer test answer event
     * */
    it("Client Answer Test", (done) => {
        const test = (client1, client2) => {
            const client1AnswerCallback = (clients) => {
                clients === null || clients === void 0 ? void 0 : clients.forEach((client) => client.close());
                done();
            };
            client1.onAnswer((answer) => {
                expect(answer).toBe("answerName");
                client1AnswerCallback([client1, client2]);
            });
            client2.socket.emit(connection_1.SocketEvent.answer, "answerName", "test");
        };
        setup(test);
    });
});
