const fetch = require('node-fetch');
const YAML = require("yaml");
const fs = require("fs");

class JiraFetch {
  #authString;
  #baseUrl;

  constructor() {
    const configPath = `${process.env.HOME}/jira/config.yml`
    const { email, token, baseUrl } = YAML.parse(fs.readFileSync(configPath, 'utf8'));
    this.#authString = Buffer.from(`${email}:${token}`).toString('base64');
    this.#baseUrl = baseUrl;
  }

  #url = (command) => `${this.#baseUrl}/rest/api/3/${command}`;

  getRequest = async (command) => {
    console.log(this.#url(command), this.#baseUrl.length);
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

    console.log('request');
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
