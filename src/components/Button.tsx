import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'tool';
export type ButtonSize = 'md' | 'lg';

function classes(
	variant: ButtonVariant,
	size: ButtonSize,
	fullWidth: boolean,
	className?: string,
): string {
	return [
		styles.button,
		styles[variant],
		styles[size],
		fullWidth ? styles.fullWidth : '',
		className ?? '',
	]
		.filter(Boolean)
		.join(' ');
}

interface SharedProps {
	readonly variant?: ButtonVariant;
	readonly size?: ButtonSize;
	readonly icon?: IconName;
	readonly trailingIcon?: IconName;
	readonly fullWidth?: boolean;
	readonly children?: ReactNode;
}

export type ButtonProps = SharedProps & ComponentPropsWithRef<'button'>;

export function Button({
	variant = 'secondary',
	size = 'md',
	icon,
	trailingIcon,
	fullWidth = false,
	className,
	children,
	...rest
}: ButtonProps) {
	return (
		<button type="button" className={classes(variant, size, fullWidth, className)} {...rest}>
			{icon === undefined ? null : <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
			{children === undefined || children === null ? null : <span>{children}</span>}
			{trailingIcon === undefined ? null : <Icon name={trailingIcon} size={size === 'lg' ? 20 : 18} />}
		</button>
	);
}

export type ButtonLinkProps = SharedProps & ComponentPropsWithRef<'a'>;

export function ButtonLink({
	variant = 'secondary',
	size = 'md',
	icon,
	trailingIcon,
	fullWidth = false,
	className,
	children,
	...rest
}: ButtonLinkProps) {
	return (
		<a className={classes(variant, size, fullWidth, className)} {...rest}>
			{icon === undefined ? null : <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
			{children === undefined || children === null ? null : <span>{children}</span>}
			{trailingIcon === undefined ? null : <Icon name={trailingIcon} size={size === 'lg' ? 20 : 18} />}
		</a>
	);
}
