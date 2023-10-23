import nock from "nock";

import jiraPrValidation from "./index";

declare const global: any;

describe("jiraPrValidation()", () => {
  const baseUrl = "https://some.jira.net";
  const key = "PRJ";
  const issue = "001";

  beforeEach(() => {
    global.danger = {
      github: {
        pr: {
          title: `${key}-${issue} - My Test Title`,
          base: { ref: "pr-base" },
          head: { ref: "pr-head" },
        },
      },
    };
    global.warn = jest.fn();
    global.message = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();
  });

  afterEach(() => {
    global.warn = undefined;
    global.message = undefined;
    global.fail = undefined;
    global.markdown = undefined;
  });

  it("should not call fail message if Jira issue has no fixVersions", async () => {
    nock(baseUrl)
      .get(
        `/rest/api/3/issue/${key}-${issue}?fields=issuetype,summary,fixVersions`,
      )
      .reply(200, {
        fields: {
          fixVersions: [],
          issuetype: { name: "issue" },
          summary: "title",
        },
      });

    await jiraPrValidation(baseUrl, "username", "token", key);

    expect(global.message).toHaveBeenCalledWith(
      "Jira issue: PRJ-001 | issue | title",
    );
    expect(global.fail).not.toHaveBeenCalled();
  });

  it("should call fail message if Jira issue has fixVersions that doesn`t match base branch", async () => {
    nock(baseUrl)
      .get(
        `/rest/api/3/issue/${key}-${issue}?fields=issuetype,summary,fixVersions`,
      )
      .reply(200, {
        fields: {
          fixVersions: [{ name: "v1" }],
          issuetype: { name: "issue" },
          summary: "title",
        },
      });

    await jiraPrValidation(baseUrl, "username", "token", key);

    expect(global.message).toHaveBeenCalledWith(
      "Jira issue: PRJ-001 | issue | title\nFix versions: v1",
    );
    expect(global.fail).toHaveBeenCalledWith(
      "🚨 Base branch doesn't match Jira fixVersion",
    );
  });
});
