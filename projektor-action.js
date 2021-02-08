const core = require("@actions/core");
const { run, printLinkFromFile } = require("projektor-publish");

const collectAndPublishResults = async ({
  configFilePath,
  serverUrl,
  resultsInput,
  attachmentsInput,
  coverageInput,
  performanceInput,
  token,
  compressionEnabled,
  projectName,
}) => {
  const results = resultsInput ? resultsInput.split(/\r?\n/) : null;
  const attachments = attachmentsInput ? attachmentsInput.split(/\r?\n/) : null;
  const coverage = coverageInput ? coverageInput.split(/\r?\n/) : null;
  const performance = performanceInput ? performanceInput.split(/\r?\n/) : null;

  const args = {};

  if (configFilePath) {
    args.configFile = configFilePath;
  }

  if (serverUrl) {
    args.serverUrl = serverUrl;
  }

  if (results) {
    args.resultsFileGlobs = results;
  }

  if (attachments) {
    args.attachments = attachments;
  }

  if (coverage) {
    args.coverage = coverage;
  }

  if (performance) {
    args.performance = performance;
  }

  if (projectName) {
    args.projectName = projectName;
  }

  args.compressionEnabled = compressionEnabled;

  const { reportUrl } = await run(args, process.env, token, "projektor.json");

  return { reportUrl };
};

const executeAction = async () => {
  try {
    const printLink = core.getInput("print-link");

    if (printLink === "true") {
      const reportUrl = printLinkFromFile();
      core.setOutput("report-url", reportUrl);
    } else {
      const configFilePath = core.getInput("config-file");
      const serverUrl = core.getInput("server-url");
      const resultsInput = core.getInput("results");
      const attachmentsInput = core.getInput("attachments");
      const coverageInput = core.getInput("coverage");
      const performanceInput = core.getInput("performance");
      const token = core.getInput("token");
      const compressionEnabled =
        core.getInput("compression-enabled") !== "false";
      const projectName = core.getInput("project-name");

      const { reportUrl } = await collectAndPublishResults({
        configFilePath,
        serverUrl,
        resultsInput,
        attachmentsInput,
        coverageInput,
        performanceInput,
        token,
        compressionEnabled,
        projectName,
      });

      core.setOutput("report-url", reportUrl);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = {
  collectAndPublishResults,
  executeAction,
};
