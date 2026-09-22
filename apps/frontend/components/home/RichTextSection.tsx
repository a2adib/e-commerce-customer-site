import React from "react";
import { RichTextSectionConfig } from "@/lib/types/api";

interface RichTextSectionProps {
  config: RichTextSectionConfig;
}

export function RichTextSection({ config }: RichTextSectionProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      {config.heading && (
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
          {config.heading}
        </h2>
      )}
      <div
        className="prose prose-sm sm:prose-base dark:prose-invert mx-auto text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: config.body_html_or_markdown }}
      />
    </section>
  );
}
