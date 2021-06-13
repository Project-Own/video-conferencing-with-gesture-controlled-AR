const request = require("supertest");

describe("GET/", () => {
  var server1;
  beforeEach(() => {
    server1 = require("./index");
  });
  afterEach(() => server1.close());

  it("respond with Hello World", (done) => {
    request(server1).get("/").expect("Hello World", done);
  });
});