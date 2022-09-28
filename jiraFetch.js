const fetch = require('node-fetch');
const YAML = require("yaml");
const fs = require("fs");

class JiraFetch {
  #authString;

  #url;

  constructor() {
    const configPath = `${process.env.HOME}/jira/config.yml`
    const {email, token, baseUrl} = YAML.parse(fs.readFileSync(configPath, 'utf8'));
    this.#authString = Buffer.from(`${email}:${token}`).toString('base64');
    this.#url = (command) => `${baseUrl}/rest/api/3/${command}`;
  }

  getRequest = async (command) => {
    const res = await fetch(
      this.#url(command),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${(this.#authString)}`,
        },
      },
    );
    return res.json();
  };

  setRequest = async (command, body, isUpdate = false) => {
    const res = await fetch(this.#url(command),
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.#authString}`,
          'Content-Type': 'application/json',
        },
        body,
      });
    return isUpdate ? res : res.json();
  };
}

module.exports = JiraFetch;
