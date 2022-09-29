const core = require('@actions/core')
const Jira = require('./jira')

async function run () {
  const { getInput, setFailed, setOutput } = core;

  try {
    const project = getInput('project', { required: true }).trim();
    const action = getInput('action', { required: true }).trim();
    const version = getInput('version', { required: false }).trim();
    const issues = getInput('issues', { required: false });
    const newName = getInput('new-name', { required: false });
    const branch = getInput('branch-name', { required: false });
    const { checkVersion, createVersion, setVersionToIssues, renameVersion, getBranchSummary } = new Jira(project)

   // const actions = ['checkVersion', 'createVersion', 'renameVersion', 'setVersionToIssues', 'getIssueSummery'];
    const actions = {
      'checkVersion': () => checkVersion(version),
      'createVersion': () => createVersion(version),
      'renameVersion': () => renameVersion(version, newName),
      'setVersionToIssues': () => setVersionToIssues(version, issues),
      'getBranchSummary': () => getBranchSummary(branch-name)
    }

    if(!actions.hasOwnProperty(action)) {
      setFailed('You must use valid action');
      process.exit(1);
    }

    const result = await actions[action]();
    console.log(result);
    setOutput('result', result);

    process.exit(0);
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
