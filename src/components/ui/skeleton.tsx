import {cn} from "@/lib/utils";

function Skeleton({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-card bg-hairline", className)}
      {...props}
    />
  );
}

export {Skeleton};
