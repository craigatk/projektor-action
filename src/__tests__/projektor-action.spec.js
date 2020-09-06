jest.mock("@actions/core");
jest.mock("projektor-publish");

const core = require("@actions/core");
const { printLinkFromFile, run } = require("projektor-publish");

const { executeAction } = require("../../projektor-action");

describe("Projektor action", () => {
  beforeEach(() => {
    core.getInput.mockReset();
    printLinkFromFile.mockReset();
    run.mockReset();
  });

  it("should log results when print results param is true", () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "print-link") {
        return "true";
      } else {
        return null;
      }
    });

    printLinkFromFile.mockReturnValue("http://localhost:8080/tests/ABC12345");

    executeAction();

    expect(printLinkFromFile).toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it("should send single results to server", () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "print-link") {
        return null;
      } else if (inputName === "server-url") {
        return "http://localhost:8080";
      } else if (inputName === "results") {
        return "test-results/*.xml";
      } else {
        return null;
      }
    });

    executeAction();

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: "http://localhost:8080",
        resultsFileGlobs: ["test-results/*.xml"],
      }),
      null,
      "projektor.json"
    );

    expect(printLinkFromFile).not.toHaveBeenCalled();
  });

  it("should send multiple results with token to server", () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "print-link") {
        return null;
      } else if (inputName === "server-url") {
        return "http://localhost:8080";
      } else if (inputName === "results") {
        return "test-results-1/*.xml\r\ntest-results-2/*.xml";
      } else if (inputName === "token") {
        return "my-token";
      } else {
        return null;
      }
    });

    executeAction();

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: "http://localhost:8080",
        resultsFileGlobs: ["test-results-1/*.xml", "test-results-2/*.xml"],
      }),
      "my-token",
      "projektor.json"
    );

    expect(printLinkFromFile).not.toHaveBeenCalled();
  });
});
