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

  it("should send coverage to server", () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "print-link") {
        return null;
      } else if (inputName === "server-url") {
        return "http://localhost:8080";
      } else if (inputName === "results") {
        return "test-results-1/*.xml\r\ntest-results-2/*.xml";
      } else if (inputName === "coverage") {
        return "coverageDir/*.xml";
      } else {
        return null;
      }
    });

    executeAction();

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: "http://localhost:8080",
        resultsFileGlobs: ["test-results-1/*.xml", "test-results-2/*.xml"],
        coverage: ["coverageDir/*.xml"],
      }),
      null,
      "projektor.json"
    );
  });

  it("should set action output", async () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "config-file") {
        return "projektor-config.json";
      } else {
        return null;
      }
    });

    run.mockImplementation(async (_) => {
      return { reportUrl: "http://localhost:8080/tests/12345" };
    });

    await executeAction();

    expect(core.setOutput).toHaveBeenCalledWith(
      "report-url",
      "http://localhost:8080/tests/12345"
    );
  });

  it("should pass config file to run", () => {
    core.getInput.mockImplementation((inputName) => {
      if (inputName === "config-file") {
        return "projektor-config.json";
      } else {
        return null;
      }
    });

    executeAction();

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        configFile: "projektor-config.json",
      }),
      null,
      "projektor.json"
    );
  });

  it("should set failed when error happens", () => {
    core.getInput.mockImplementation((inputName) => {
      throw new Error();
    });

    executeAction();
  });
});
