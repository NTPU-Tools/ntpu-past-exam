import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import Balance from "react-wrap-balancer";

function PageHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("mb-8 pb-6", className)}
      {...props}
    >
      {children}
    </section>
  );
}

function PageHeaderHeading({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h1
      className={cn(
        "font-heading text-2xl font-black leading-tight tracking-tighter md:text-3xl border-l-[3px] border-primary pl-4",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Balance
      className={cn(
        "mt-2 text-muted-foreground text-sm pl-4 ml-[3px]",
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription };
