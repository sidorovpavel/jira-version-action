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
    const version = await this.#api.findProjectVersionByName(this.#project, versionName);
    const result = await Promise.all([
      ...issues.map(async (item) => this.#api.issueSetVersion(item, version)),
    ]);
    console.log(result);

    return result;
  };

  checkVersion = async (version) => {
    const result = await this.#api.findProjectVersionByName(this.#project, version);
    return !!result;
  }

  createVersion = async (version) => {
    const projectId = await this.#api.getProjectId(this.#project);
    return !!await this.#api.createVersion(projectId, version);
  }

  renameVersion = async (oldName, newName) => {
    if (!newName) {
      return false;
    }
    const version = await this.#api.findProjectVersionByName(this.#project, oldName);
    console.log(version)
    if (!version) {
      return false;
    }
    return await this.#api.renameVersion(version, newName);
  }
}

module.exports = Jira;
