import request from "supertest";
import server from ".";

describe("GET/", () => {
  afterAll(() => server?.close());
  it("respond with Running", (done) => {
    request(server)
      .get("/")
      .expect("Running")
      .then(() => done());
  });

  // it("", () => {});
});
