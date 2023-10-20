import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL";
import { JiraClient } from "./clients/jira-client";
declare const danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

/**
 * Import metadata from the issue on Jira and perform validations
 */
export default async function jiraPrValidation(
  baseUrl: string,
  username: string,
  token: string,
  projectKey: string,
  level: "fail" | "warn" = "fail",
) {
  const title = danger.github.pr.title;
  const base = danger.github.pr.base.ref;
  const head = danger.github.pr.head.ref;

  const jiraClient = new JiraClient(baseUrl, username, token, projectKey);

  const jiraKey = jiraClient.extractJiraKey(title + head);

  if (!jiraKey) {
    warn("⚠️ No Jira key found in branch name, exiting");
    return;
  }

  const jiraIssue = await jiraClient.getIssue(jiraKey);
  if (!jiraIssue) {
    warn("⚠️ Could not get issue, exiting");
    return;
  }

  message("Jira issue: " + jiraIssue);

  if (!fixVersionsMatchesBranch(base, jiraIssue.fixVersions)) {
    const message = "🚨 Base branch doesn't match Jira fixVersion";
    if (level === "warn") {
      warn(message);
    } else {
      fail(message);
    }
  }
}

function fixVersionsMatchesBranch(branch: string, fixVersions?: string[]) {
  if (!fixVersions?.length) {
    return true;
  }

  if (fixVersions.some((version) => branch.includes(version))) {
    return true;
  }

  return false;
}
