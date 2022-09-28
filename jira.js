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
    let version = await this.#api.findProjectVersionByName(this.#project, versionName);
    if (!version) {
      const projectId = await this.#api.getProjectId(this.#project);
      version = await this.#api.createVersion(projectId, versionName);
    }
    return Promise.all([
      ...issues.map(async (item) => this.#api.issueSetVersion(item, version)),
    ]);
  };

  checkVersion = async (version) => {
    await this.#api.findProjectVersionByName(this.#project, version);
  }
}

module.exports = Jira;
