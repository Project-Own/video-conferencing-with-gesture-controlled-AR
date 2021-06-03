const request = require("supertest");

describe("GET/", () => {
  var server;
  beforeEach(() => {
    server = require("./index");
  });
  afterEach(() => server.close());

  it("respond with Hello World", (done) => {
    request(server).get("/").expect("Hello World", done);
  });
});
