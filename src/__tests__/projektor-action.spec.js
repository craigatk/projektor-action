jest.mock("@actions/core");
jest.mock("projektor-publish");

const core = require("@actions/core");
const { printLinkFromFile, run } = require("projektor-publish");

const { executeAction } = require("../../projektor-action");

describe("Projektor action", () => {
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
});
