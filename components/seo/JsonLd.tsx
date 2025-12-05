/**
 * JSON-LD renderer — safe helper for structured data injection.
 */
import React from "react";

type JsonLdProps = {
  data?: Record<string, any>;
  item?: Record<string, any>;
};

/**
 * Renders Schema.org JSON-LD data for SEO-rich pages.
 */
export function JsonLd({ data, item }: JsonLdProps) {
  const payload = data || item || {};
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export default JsonLd;
