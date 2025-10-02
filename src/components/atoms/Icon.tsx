type IconProps = {
  name: string;
  className?: string;
};

export default function Icon({ name, className }: IconProps) {
  return <span aria-hidden className={className}>{name}</span>;
}