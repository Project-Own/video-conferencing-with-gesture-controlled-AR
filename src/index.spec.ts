import request from "supertest";
import { serverListener } from ".";

afterAll(() => serverListener.close());
describe("GET/", () => {
  it("respond with Hello World", (done) => {
    request(serverListener).get("/").expect("Running", done);
  });
});
