"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const _1 = __importDefault(require("."));
describe("GET/", () => {
    afterAll(() => _1.default === null || _1.default === void 0 ? void 0 : _1.default.close());
    it("respond with Running", (done) => {
        supertest_1.default(_1.default)
            .get("/")
            .expect("Running")
            .then(() => done());
    });
    // it("", () => {});
});
