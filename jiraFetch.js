const fetch = require('node-fetch');
const YAML = require("yaml");
const fs = require("fs");

class JiraFetch {
  #baseUrl;
  #headers;

  constructor() {
    const configPath = `${process.env.HOME}/jira/config.yml`
    const { email, token, baseUrl } = YAML.parse(fs.readFileSync(configPath, 'utf8'));
    const authString = Buffer.from(`${email}:${token}`).toString('base64');
    this.#baseUrl = baseUrl;
    this.#headers = { Accept: 'application/json', Authorization: `Basic ${(authString)}` }
  }

  #url = (command) => `${this.#baseUrl}/rest/api/3/${command}`;

  getRequest = async (command) => {
    const url = this.#url(command);
    const res = await fetch(
      url,
      {
        method: 'GET',
        headers: this.#headers,
      },
    );

    return res.json();
  };

  setRequest = async (command, body, isUpdate = false) => {
    console.log(body);
    const res = await fetch(this.#url(command),
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          ...this.#headers,
          'Content-Type': 'application/json',
        },
        body,
      });
    return isUpdate ? res : res.json();
  };
}

module.exports = JiraFetch;
