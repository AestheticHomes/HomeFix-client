
"use strict";

module.exports = {
  rules: {
    "no-inline-background-with-bg-class": require("./lib/rules/no-inline-background-with-bg-class"),
    "no-hardcoded-colors": require("./lib/rules/no-hardcoded-colors")
  },
  configs: {
    recommended: {
      plugins: ["edith"],
      rules: {
        "edith/no-inline-background-with-bg-class": "error",
        "edith/no-hardcoded-colors": "warn"
      }
    }
  }
};
