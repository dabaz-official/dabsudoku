import { clsx } from "clsx";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base",
  };
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100",
  };
  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />
  );
}