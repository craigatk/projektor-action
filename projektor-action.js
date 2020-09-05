const core = require("@actions/core");
const { run, printLinkFromFile } = require("projektor-publish");

const collectAndPublishResults = async ({
  configFilePath,
  serverUrl,
  resultsInput,
  attachmentsInput,
  token,
}) => {
  const results = resultsInput ? resultsInput.split(/\r?\n/) : null;
  const attachments = attachmentsInput ? attachmentsInput.split(/\r?\n/) : null;

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

  const { reportUrl } = await run(args, token, "projektor.json");

  return { reportUrl };
};

const executeAction = () => {
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
      const token = core.getInput("token");

      const { reportUrl } = collectAndPublishResults({
        configFilePath,
        serverUrl,
        resultsInput,
        attachmentsInput,
        token,
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
