
"use strict";

function getLiteralValue(node) {
  if (!node) return null;
  if (node.type === "Literal") return node.value;
  if (node.type === "TemplateLiteral" && node.quasis.length === 1) {
    return node.quasis[0].value.cooked;
  }
  return null;
}

function hasBgClass(classValue) {
  if (!classValue || typeof classValue !== "string") return false;
  return (/\bbg-/.test(classValue) || /\bbg-\[/.test(classValue) || /dark:bg-/.test(classValue));
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow inline background when Tailwind bg/dark:bg classes exist.",
      recommended: false
    },
    schema: [],
    messages: {
      noInlineBg: "Don't use inline background/backgroundColor with Tailwind bg/dark:bg classes."
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        let classNameValue = null;
        let hasInlineBackground = false;

        for (const attr of node.attributes) {
          if (attr.type !== "JSXAttribute") continue;
          const name = attr.name && attr.name.name;

          if (name === "className" && attr.value) {
            const lit = getLiteralValue(attr.value);
            if (typeof lit === "string") classNameValue = lit;
          }

          if (name === "style" && attr.value && attr.value.expression) {
            const expr = attr.value.expression;
            if (expr.type === "ObjectExpression") {
              for (const prop of expr.properties) {
                if (prop.type !== "Property") continue;

                const key = prop.key;
                const keyName = key.type === "Identifier"
                  ? key.name
                  : key.type === "Literal"
                  ? key.value
                  : null;

                if (keyName === "background" || keyName === "backgroundColor") {
                  hasInlineBackground = true;
                }
              }
            }
          }
        }

        if (hasInlineBackground && hasBgClass(classNameValue)) {
          context.report({ node, messageId: "noInlineBg" });
        }
      }
    };
  }
};
