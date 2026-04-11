import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Wenn gesetzt, wird ein `<a>` mit denselben Styles wie der Primary-Button gerendert. */
  href?: string;
  type?: "button" | "submit" | "reset";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:ring-[var(--foreground)]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--foreground)] text-[var(--background)] hover:bg-[#f3f0c8] active:bg-[#e7e3b8]",
  ghost:
    "bg-transparent border border-[rgba(255,255,227,0.25)] text-[var(--foreground)] hover:bg-[rgba(255,255,227,0.06)] active:bg-[rgba(255,255,227,0.12)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-10 px-5 text-[0.9rem]",
  lg: "h-11 px-6 text-[0.95rem]",
};

export function Button({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  href,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    "whitespace-nowrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href != null && href !== "") {
    const { disabled, ...anchorRest } = props;
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled ? true : undefined}
        {...(anchorRest as Omit<
          AnchorHTMLAttributes<HTMLAnchorElement>,
          "href" | "className" | "children"
        >)}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

