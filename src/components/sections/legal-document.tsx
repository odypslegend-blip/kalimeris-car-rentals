import * as React from "react";
import {Prose} from "@/components/sections/prose";
import {cn} from "@/lib/utils";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDocumentProps = {
  sections: LegalSection[];
  contentsLabel: string;
  className?: string;
};

/**
 * Long-form legal document: a numbered in-page index beside the prose.
 * The index is a real list of anchor links, so it works without JavaScript.
 */
export function LegalDocument({
  sections,
  contentsLabel,
  className
}: LegalDocumentProps) {
  return (
    <div
      className={cn(
        "grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14",
        className
      )}
    >
      <nav
        aria-label={contentsLabel}
        className="lg:sticky lg:top-[calc(var(--token-header-h)+24px)] lg:self-start"
      >
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-brand">
          {contentsLabel}
        </p>
        <ol className="mt-4 border-l border-line">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px flex min-h-11 items-center py-2 pl-3 pr-2 text-[0.8125rem] leading-snug text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:bg-surface hover:text-ink"
              >
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Prose>
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </React.Fragment>
        ))}
      </Prose>
    </div>
  );
}
