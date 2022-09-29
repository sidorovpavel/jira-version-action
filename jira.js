const JiraApi = require('./jiraApi');

class Jira {
  #api;

  constructor() {
    this.#api = new JiraApi();
  }

  #checkResult = ({errors = {} , errorMessages = []}) => errorMessages.length === 0 &&   Object.keys(errors).length === 0

  getIssues = async (arr) => {
    const [types, ...issues] = await Promise.all([
      this.#api.getIssueType(),
      ...arr.map(async (item) => this.#api.getIssue(item)),
    ]);

    const sortArray = ['Bug', 'Improvement', 'New feature'];

    return issues
      .map((item) => ({
        ...item,
        issueType: types.get(item.issueTypeId).name,
      //  url: `${this.#baseUrl}/browse/${item.key}`,
      }))
      .filter((item) => item.issueType.toLowerCase() !== 'bug' || !item.existFixVersions)
      .sort((a, b) => sortArray.indexOf(b.issueType) - sortArray.indexOf(a.issueType));
  };

  setVersionToIssues = async (projectName, versionName, issuesString) => {
    let issues = [];

    try {
      issues = JSON.parse(issuesString)
    } catch (e) {
      return false;
    }

    if(!Array.isArray(issues) || !issues.length) {
      return false;
    }

    const { id } = await this.#api.findProjectVersionByName(projectName, versionName);

    if (!id) {
      return false;
    }
    const result = await Promise.all(
      issues.map((issue) => this.#api.issueSetVersion(issue, id)),
    );

    return result.map((item) => this.#checkResult(item)).find((item) => !item) === undefined
  };

  checkVersion = async (projectName, version) => {
    const result = await this.#api.findProjectVersionByName(projectName, version);

    return !!result;
  }

  createVersion = async (projectName, version) => {
    const projectId = await this.#api.getProjectId(projectName);
    const result = await this.#api.createVersion(projectId, version);

    return this.#checkResult(result);
  }

  renameVersion = async (projectName, oldName, newName) => {
    if (!newName) {
      return false;
    }
    const version = await this.#api.findProjectVersionByName(projectName, oldName);
    if (!version) {
      return false;
    }
    const result = await this.#api.renameVersion(version.id, newName);

    return this.#checkResult(result);
  }

  getBranchSummary = async (name) => {
    const jiraMatcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;
    const names = name.split('').reverse().join('').match(jiraMatcher);
    if (!names) {
      return false;
    }
    const [ firstMatch ] = names;
    const id = firstMatch.split('').reverse().join('');

    try {
      const {summary, key} = this.#api.getIssue(id);
      return `${key} / ${summary}`
    } catch (e) {
      return false;
    }
  }
}

module.exports = Jira;
