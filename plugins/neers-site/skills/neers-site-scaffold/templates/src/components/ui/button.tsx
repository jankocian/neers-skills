import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "~/lib/utils";

/**
 * The one button system.
 *
 * The base string is shadcn's, unchanged — keep it that way so
 * `bunx shadcn@latest add button --diff` stays readable. Brand styling arrives
 * through the surface-aware tokens, so the same variant renders correctly on every
 * surface: `--primary` is remapped inside each `.theme-*` scope.
 *
 * Ours: the `inverse` variant, the `href` prop (renders as a `next/link` anchor,
 * so a link-that-looks-like-a-button stays one `<Button>`), and the hover colours
 * (a real colour step rather than an opacity fade).
 *
 * Icons are children — the shadcn pattern, no prop. The base classes size any
 * `<svg>` to 1rem and the size variants set the gap:
 *   <Button><Mail /> Email</Button>                 icon + text
 *   <Button>Continue <ArrowRight /></Button>        text + icon
 *   <Button size="icon" aria-label="Close"><X /></Button>   icon only — name it
 * Any icon (Lucide or otherwise) works; add a `size-*` class on the icon to resize.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg border border-transparent bg-clip-padding font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        inverse:
          "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        outline:
          "border-input text-foreground hover:border-foreground/40 hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        link: "text-foreground underline decoration-from-font underline-offset-4 hover:text-primary",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 gap-1.5 px-4 text-sm",
        md: "h-11 gap-2 px-5 text-base",
        lg: "h-12 gap-2.5 px-7 text-lg",
        icon: "size-11",
        // shadcn's dialog close button asks for this size by name.
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** When set, the button renders as a `next/link` anchor styled as a button. */
    href?: string;
  };

function Button({ className, variant, size, href, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(href ? { render: <Link href={href} /> } : {})}
      {...props}
    />
  );
}

export type { ButtonProps };
export { Button, buttonVariants };
