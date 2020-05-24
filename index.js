const core = require("@actions/core");
const { run } = require("projektor-publish");

const execute = async () => {
  try {
    const configFilePath = core.getInput("config-file");
    const resultsInput = core.getInput("results");
    const attachmentsInput = core.getInput("attachmentsInput");

    const results = resultsInput ? resultsInput.split(/\r?\n/) : null;
    const attachments = attachmentsInput ? resultsInput.split(/\r?\n/) : null;

    const args = [];

    if (configFilePath) {
      args.push(`--configFile=${configFilePath}`);
    }

    const { reportUrl } = await run(args, null, "projektor.json");

    core.setOutput("report-url", reportUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
};

execute();
