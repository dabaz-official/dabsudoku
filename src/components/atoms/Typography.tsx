type TypographyProps = {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
};

export default function Typography({ as = "span", className, children }: TypographyProps) {
  const Comp = as as any;
  return <Comp className={className}>{children}</Comp>;
}