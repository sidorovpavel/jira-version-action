const JiraApi = require('./jiraApi');

class Jira {
  #api;

  #project;

  constructor(project) {
    this.#api = new JiraApi();
    this.#project = project;
  }

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

  setVersionToIssues = async (versionName, issues) => {
    if(!issues.length) {
      return false;
    }
    const version = await this.#api.findProjectVersionByName(this.#project, versionName);
    if (!version) {
      return false;
    }
    const result = await Promise.all([
      ...issues.map(async (item) => this.#api.issueSetVersion(item, version)),
    ]);
    console.log(result);

    return result;
  };

  checkVersion = async (version) => {
    const result = await this.#api.findProjectVersionByName(this.#project, version);
    console.log(result);
    return !!result;
  }

  createVersion = async (version) => {
    const projectId = await this.#api.getProjectId(this.#project);
    const result = await this.#api.createVersion(projectId, version);

    return !result.errors;
  }

  renameVersion = async (oldName, newName) => {
    if (!newName) {
      return false;
    }
    const version = await this.#api.findProjectVersionByName(this.#project, oldName);
    if (!version) {
      return false;
    }
    const result = await this.#api.renameVersion(version, newName);

    return !result.errors;
  }
}

module.exports = Jira;
