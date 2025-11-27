import React from "react";

/**
 * Renders Schema.org JSON-LD data for SEO-rich pages.
 */
export const JsonLd: React.FC<{ data: Record<string, any> }> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
