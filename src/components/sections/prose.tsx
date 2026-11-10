import * as React from "react";
import {cn} from "@/lib/utils";

type ProseProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Long-form legal prose. Typography lives in the `.prose-legal` class in
 * globals.css so no `@tailwindcss/typography` plugin is required.
 */
export function Prose({children, className}: ProseProps) {
  return (
    <div className={cn("prose-legal max-w-[68ch]", className)}>{children}</div>
  );
}
