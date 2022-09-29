const JiraApi = require('./jiraApi');

class Jira {
  #api;

  #project;

  constructor(project) {
    this.#api = new JiraApi();
    this.#project = project;
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

  setVersionToIssues = async (versionName, issuesString) => {
    let issues = [];

    try {
      issues = JSON.parse(issuesString)
    } catch (e) {
      return false;
    }

    if(!Array.isArray(issues) || !issues.length) {
      return false;
    }

    const { id } = await this.#api.findProjectVersionByName(this.#project, versionName);

    if (!id) {
      return false;
    }
    const result = await Promise.all(
      issues.map(async (issue) => await this.#api.issueSetVersion(issue, id)),
    );

    return result.map((item) => this.#checkResult(item)).find((item) => !item) === undefined
  };

  checkVersion = async (version) => {
    const result = await this.#api.findProjectVersionByName(this.#project, version);

    return !!result;
  }

  createVersion = async (version) => {
    const projectId = await this.#api.getProjectId(this.#project);
    const result = await this.#api.createVersion(projectId, version);

    return this.#checkResult(result);
  }

  renameVersion = async (oldName, newName) => {
    if (!newName) {
      return false;
    }
    const version = await this.#api.findProjectVersionByName(this.#project, oldName);
    if (!version) {
      return false;
    }
    const result = await this.#api.renameVersion(version.id, newName);

    return this.#checkResult(result);
  }
}

module.exports = Jira;
