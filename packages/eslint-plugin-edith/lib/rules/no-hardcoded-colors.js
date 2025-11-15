
"use strict";

const COLOR_REGEX = /^(#(?:[0-9a-fA-F]{3,8})|rgb\(|rgba\(|hsl\(|hsla\(|transparent$)/;

function isColorString(str) {
  if (typeof str !== "string") return false;
  if (str.includes("var(")) return false;
  return COLOR_REGEX.test(str.trim());
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded color values in inline styles.",
      recommended: false
    },
    schema: [],
    messages: {
      hardcodedColor: "Hardcoded color '{{value}}' detected. Use a CSS variable."
    }
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (!node.name || node.name.name !== "style") return;
        if (!node.value || !node.value.expression) return;

        const expr = node.value.expression;
        if (expr.type !== "ObjectExpression") return;

        for (const prop of expr.properties) {
          if (prop.type !== "Property") continue;

          const val = prop.value;
          if (val.type === "Literal" && typeof val.value === "string") {
            if (isColorString(val.value)) {
              context.report({
                node: val,
                messageId: "hardcodedColor",
                data: { value: val.value }
              });
            }
          }
        }
      }
    };
  }
};
