import { schedule } from "danger";

import jiraPrValidation from "./src/index";

schedule(
  jiraPrValidation("baseUrl", "username", "token", "projectKey", "fail"),
);
