const core = require('@actions/core')
const Jira = require('./jira')

async function run () {
  const { getInput, setFailed, setOutput } = core;

  try {
    const action = getInput('action', { required: true }).trim();
    const project = getInput('project', { required: false });
    const version = getInput('version', { required: false });
    const issues = getInput('issues', { required: false });
    const newName = getInput('new-name', { required: false });
    const branch = getInput('branch-name', { required: false });

    const { checkVersion, createVersion, setVersionToIssues, renameVersion, getBranchSummary } = new Jira()

    const actions = {
      'checkVersion': () => checkVersion(project, version),
      'createVersion': () => createVersion(project, version),
      'renameVersion': () => renameVersion(project, version, newName),
      'setVersionToIssues': () => setVersionToIssues(project, version, issues),
      'getBranchSummary': () => getBranchSummary(branch)
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
