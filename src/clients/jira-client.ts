import axios, { AxiosInstance } from "axios";

export class JiraKey {
  constructor(
    public project: string,
    public keyNumber: string,
  ) {}

  toString(): string {
    return `${this.project}-${this.keyNumber}`;
  }
}

export class JiraIssue {
  constructor(
    public key: JiraKey,
    public link: string,
    public title: string | undefined,
    public type: string | undefined,
    public fixVersions?: string[],
  ) {}

  toString(): string {
    let issue = `${this.key} | ${this.type} | ${this.title}`;
    if (this.fixVersions?.length) {
      issue += `\nFix versions: ${this.fixVersions.join(" ")}`;
    }
    return issue;
  }
}

export class JiraClient {
  client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private username: string,
    private token: string,
    private projectKey: string,
  ) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.username,
        password: this.token,
      },
      timeout: 2000,
    });
  }

  extractJiraKey(input: string): JiraKey | undefined {
    const regex = new RegExp(`${this.projectKey}-(?<number>\\d+)`, "i");
    const match = input.match(regex);

    if (!match?.groups?.number) {
      return undefined;
    }

    return new JiraKey(this.projectKey, match?.groups?.number);
  }

  async getIssue(key: JiraKey): Promise<JiraIssue | undefined> {
    try {
      const res = await this.client.get(
        this.getRestApiUrl(`issue/${key}?fields=issuetype,summary,fixVersions`),
      );
      const obj = res.data;

      let issuetype: string | undefined;
      let title: string | undefined;
      let fixVersions: string[] | undefined;
      for (const field in obj.fields) {
        if (field === "issuetype") {
          issuetype = obj.fields[field].name?.toLowerCase();
        } else if (field === "summary") {
          title = obj.fields[field];
        } else if (field === "fixVersions") {
          fixVersions = obj.fields[field]
            .map(({ name }) => name)
            .filter(Boolean);
        }
      }

      return new JiraIssue(
        key,
        `${this.baseUrl}/browse/${key}`,
        title,
        issuetype,
        fixVersions,
      );
    } catch (error) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }

  private getRestApiUrl(endpoint: string): string {
    return `${this.baseUrl}/rest/api/3/${endpoint}`;
  }
}
