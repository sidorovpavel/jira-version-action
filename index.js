const core = require('@actions/core')
const Jira = require('./jira')

async function run () {
  const { getInput, setFailed, setOutput } = core;

  try {
    const project = getInput('project', { required: true });
    const version = getInput('version', { required: true });
    const action = getInput('action', { required: true });
    const jira = new Jira(project)

   // const actions = ['checkVersion', 'createVersion', 'renameVersion', 'issuesSetVersion', 'getIssueSummery'];
    const actions = {
      'checkVersion': jira.checkVersion(version)
    }

    if(!actions.hasOwnProperty(action)) {
      setFailed('You must use valid action');
      process.exit(1);
    }

    const result = await actions[action];
    console.log(result);
    setOutput('result', result);

    process.exit(0);
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
