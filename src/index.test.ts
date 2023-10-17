import jiraPrValidation from "./index";

declare const global: any;

describe("jiraPrValidation()", () => {
  beforeEach(() => {
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

  it("Checks for a that message has been called", async () => {
    global.danger = {
      github: {
        pr: {
          title: "My Test Title",
          base: { ref: "pr-base" },
          head: { ref: "pr-head" },
        },
      },
    };

    await jiraPrValidation("baseUrl", "username", "token", "projectKey");

    expect(global.message).toHaveBeenCalledWith("PR Title: My Test Title");
    expect(global.message).toHaveBeenCalledWith("PR Base: pr-base");
    expect(global.message).toHaveBeenCalledWith("PR Head: pr-head");
  });
});
