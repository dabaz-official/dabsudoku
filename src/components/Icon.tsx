import type { ReactNode } from 'react';

export type IconName =
	| 'undo'
	| 'erase'
	| 'notes'
	| 'hint'
	| 'pause'
	| 'play'
	| 'question'
	| 'arrow-left'
	| 'arrow-right'
	| 'check'
	| 'close'
	| 'clock'
	| 'alert'
	| 'plus'
	| 'search'
	| 'layers'
	| 'keyboard'
	| 'grid'
	| 'sparkle'
	| 'rows'
	| 'columns'
	| 'boxes';

/**
 * Inline stroke icons on a 24px grid. Kept in-repo so the app needs no icon
 * dependency; stroke icons inherit `currentColor`.
 */
const GLYPHS: Record<IconName, ReactNode> = {
	undo: (
		<>
			<path d="M9 14 4 9l5-5" />
			<path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5 5.5 5.5 0 0 1 14.5 20H11" />
		</>
	),
	erase: (
		<>
			<path d="m7 21-4.3-4.3a2.4 2.4 0 0 1 0-3.4l9.6-9.6a2.4 2.4 0 0 1 3.4 0l5.6 5.6a2.4 2.4 0 0 1 0 3.4L13 21" />
			<path d="M22 21H7" />
			<path d="m5 11 9 9" />
		</>
	),
	notes: (
		<>
			<path d="M21.2 6.8a2 2 0 0 0-2.8-2.8L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z" />
			<path d="m15 5 4 4" />
		</>
	),
	hint: (
		<>
			<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5a6 6 0 1 0-12 0c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
			<path d="M9.5 18h5" />
			<path d="M10.5 21.5h3" />
		</>
	),
	pause: (
		<>
			<rect x="6.5" y="4.5" width="4" height="15" rx="1.4" fill="currentColor" stroke="none" />
			<rect x="13.5" y="4.5" width="4" height="15" rx="1.4" fill="currentColor" stroke="none" />
		</>
	),
	play: <path d="M7.5 4.6v14.8L19.5 12z" fill="currentColor" stroke="none" />,
	question: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M9.6 9.4a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2.2-2.5 3.7" />
			<path d="M12 17h.01" />
		</>
	),
	'arrow-left': (
		<>
			<path d="M19 12H5" />
			<path d="m11 6-6 6 6 6" />
		</>
	),
	'arrow-right': (
		<>
			<path d="M5 12h14" />
			<path d="m13 6 6 6-6 6" />
		</>
	),
	check: <path d="M20 6 9 17l-5-5" />,
	close: <path d="M18 6 6 18M6 6l12 12" />,
	clock: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.2V12l3.2 2" />
		</>
	),
	alert: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.8V13" />
			<path d="M12 16.3h.01" />
		</>
	),
	plus: <path d="M12 5v14M5 12h14" />,
	search: (
		<>
			<circle cx="11" cy="11" r="6.5" />
			<path d="m20 20-3.6-3.6" />
		</>
	),
	layers: (
		<>
			<path d="m12 3 9 4.8-9 4.8-9-4.8z" />
			<path d="m3 12.6 9 4.8 9-4.8" />
			<path d="m3 16.8 9 4.8 9-4.8" />
		</>
	),
	keyboard: (
		<>
			<rect x="2.5" y="5.5" width="19" height="13" rx="2.4" />
			<path d="M6 9.2h.01M9.4 9.2h.01M12.8 9.2h.01M16.2 9.2h.01" />
			<path d="M6 12.6h.01M9.4 12.6h.01M12.8 12.6h.01M16.2 12.6h.01" />
			<path d="M8 15.8h8" />
		</>
	),
	grid: (
		<>
			<rect x="3" y="3" width="18" height="18" rx="2.4" />
			<path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
		</>
	),
	sparkle: (
		<path
			d="M12 2.6 13.8 8.5 19.7 10.3 13.8 12.1 12 18 10.2 12.1 4.3 10.3 10.2 8.5z"
			fill="currentColor"
			stroke="none"
		/>
	),
	rows: (
		<>
			<rect x="3" y="4.5" width="18" height="3.6" rx="1.8" fill="currentColor" stroke="none" />
			<rect x="3" y="10.2" width="18" height="3.6" rx="1.8" fill="currentColor" stroke="none" />
			<rect x="3" y="15.9" width="18" height="3.6" rx="1.8" fill="currentColor" stroke="none" />
		</>
	),
	columns: (
		<>
			<rect x="4.5" y="3" width="3.6" height="18" rx="1.8" fill="currentColor" stroke="none" />
			<rect x="10.2" y="3" width="3.6" height="18" rx="1.8" fill="currentColor" stroke="none" />
			<rect x="15.9" y="3" width="3.6" height="18" rx="1.8" fill="currentColor" stroke="none" />
		</>
	),
	boxes: (
		<>
			<rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" stroke="none" />
			<rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" stroke="none" />
			<rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" stroke="none" />
			<rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" stroke="none" />
		</>
	),
};

export interface IconProps {
	readonly name: IconName;
	readonly size?: number;
	readonly className?: string;
	readonly strokeWidth?: number;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.7 }: IconProps) {
	return (
		<svg
			className={className}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{GLYPHS[name]}
		</svg>
	);
}
