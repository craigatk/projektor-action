const ServerMock = require("mock-http-server");
const { collectAndPublishResults } = require("../../index");

describe("publishing results to server", () => {
  const server = new ServerMock({ host: "localhost", port: 9002 });

  beforeAll((done) => {
    console.log("Starting mock server");
    server.start(done);
  });

  beforeEach(() => {
    server.reset();
  });

  afterAll((done) => {
    console.log("Stopping mock server");
    server.stop(done);
  });

  it("should publish results from multiple directories", async () => {
    server.on({
      method: "POST",
      path: "/results",
      reply: {
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uri: "/tests/12345", id: "12345" }),
      },
    });

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";

    await collectAndPublishResults({ resultsInput, serverUrl });

    const requests = server.requests();

    expect(requests.length).toBe(1);

    const requestBody = JSON.stringify(requests[0].body);

    expect(requestBody).toContain("resultsDir1-results1");
    expect(requestBody).toContain("resultsDir1-results2");
    expect(requestBody).toContain("resultsDir2-results1");
    expect(requestBody).toContain("resultsDir2-results2");
  });

  it("should include token in call to Projektor server", async () => {
    server.on({
      method: "POST",
      path: "/results",
      reply: {
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uri: "/tests/12345", id: "12345" }),
      },
    });

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";
    const token = "my-token";

    await collectAndPublishResults({ resultsInput, serverUrl, token });

    const requests = server.requests();

    expect(requests.length).toBe(1);

    expect(requests[0].headers["x-projektor-token"]).toEqual("my-token");
  });
});
