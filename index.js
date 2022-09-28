const fs = require('fs')
const YAML = require('yaml')
const core = require('@actions/core')
const Jira = require('./jira')

const configPath = `${process.env.HOME}/jira/config.yml`
const githubToken = process.env.GITHUB_TOKEN
const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));


async function run () {
  const { getInput, setFailed, setOutput } = core;
  try {
    const projectName = getInput('project-name', { required: true });
    const jira = new Jira(config, projectName);

    console.log(githubToken);
    console.log(config);
    process.exit(0);
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
