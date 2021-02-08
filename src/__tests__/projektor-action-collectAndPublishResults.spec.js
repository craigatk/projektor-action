const ServerMock = require("mock-http-server");
const { collectAndPublishResults } = require("../../projektor-action");
const waitForExpect = require("wait-for-expect");

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

  const expectResultsPost = (testId) => {
    server.on({
      method: "POST",
      path: "/groupedResults",
      reply: {
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uri: `/tests/${testId}`, id: testId }),
      },
    });
  };

  const expectAttachmentPost = (testId, attachmentFileName) => {
    server.on({
      method: "POST",
      path: `/run/${testId}/attachments/${attachmentFileName}`,
      reply: {
        status: 200,
      },
    });
  };

  const expectCoveragePost = (testId) => {
    server.on({
      method: "POST",
      path: `/run/${testId}/coverage`,
      reply: {
        status: 200,
      },
    });
  };

  it("should publish results from multiple directories", async () => {
    expectResultsPost("12345");

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
    expectResultsPost("12345");

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";
    const token = "my-token";

    await collectAndPublishResults({ resultsInput, serverUrl, token });

    const requests = server.requests();

    expect(requests.length).toBe(1);

    expect(requests[0].headers["x-projektor-token"]).toEqual("my-token");
  });

  it("should publish attachments from one attachments directory", async () => {
    expectResultsPost("12345");

    expectAttachmentPost("12345", "attachment1.txt");
    expectAttachmentPost("12345", "attachment2.txt");

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";
    const attachmentsInput = "src/__tests__/attachmentsDir1/*.txt";

    await collectAndPublishResults({
      resultsInput,
      serverUrl,
      attachmentsInput,
    });

    await waitForExpect(() => {
      const requests = server.requests();

      expect(requests.length).toBe(3);

      const requestUrls = requests.map((req) => req.url);

      expect(requestUrls).toContain("/run/12345/attachments/attachment1.txt");
      expect(requestUrls).toContain("/run/12345/attachments/attachment2.txt");
    });
  });

  it("should publish attachments from multiple attachments directories", async () => {
    expectResultsPost("12345");

    expectAttachmentPost("12345", "attachment1.txt");
    expectAttachmentPost("12345", "attachment2.txt");
    expectAttachmentPost("12345", "attachment3.txt");
    expectAttachmentPost("12345", "attachment4.txt");

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";
    const attachmentsInput =
      "src/__tests__/attachmentsDir1/*.txt\r\nsrc/__tests__/attachmentsDir2/*.txt";

    await collectAndPublishResults({
      resultsInput,
      serverUrl,
      attachmentsInput,
    });

    await waitForExpect(() => {
      const requests = server.requests();

      expect(requests.length).toBe(5);

      const requestUrls = requests.map((req) => req.url);

      expect(requestUrls).toContain("/run/12345/attachments/attachment1.txt");
      expect(requestUrls).toContain("/run/12345/attachments/attachment2.txt");
      expect(requestUrls).toContain("/run/12345/attachments/attachment3.txt");
      expect(requestUrls).toContain("/run/12345/attachments/attachment4.txt");
    });
  });

  it("should publish coverage from one coverage directory", async () => {
    expectResultsPost("12345");

    expectCoveragePost("12345");

    const resultsInput =
      "src/__tests__/resultsDir1/*.xml\r\nsrc/__tests__/resultsDir2/*.xml";
    const serverUrl = "http://localhost:9002";
    const coverageInput = "src/__tests__/coverageDir/*.xml";

    await collectAndPublishResults({
      resultsInput,
      serverUrl,
      coverageInput,
      compressionEnabled: false,
    });

    await waitForExpect(() => {
      const requests = server.requests();

      expect(requests.length).toBe(1);

      const requestUrls = requests.map((req) => req.url);

      expect(requestUrls).toContain("/groupedResults");

      const requestBody = requests[0].body;
      expect(requestBody.coverageFiles.length).toBe(1);
    });
  });

  it("should publish coverage only from one directory", async () => {
    expectResultsPost("12345");

    const performanceInput = "src/__tests__/performanceResults/*.json";
    const serverUrl = "http://localhost:9002";

    await collectAndPublishResults({
      performanceInput,
      serverUrl,
      compressionEnabled: false,
    });

    const requests = server.requests();

    expect(requests.length).toBe(1);

    const requestBody = requests[0].body;
    expect(requestBody.performanceResults.length).toBe(2);

    const file1 = requestBody.performanceResults.find(
      (file) => file.name === "perf-test-1.json"
    );
    expect(file1.resultsBlob).toContain("perf-test-1-body");

    const file2 = requestBody.performanceResults.find(
      (file) => file.name === "perf-test-2.json"
    );
    expect(file2.resultsBlob).toContain("perf-test-2-body");
  });
});
