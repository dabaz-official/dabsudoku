/** Formats elapsed seconds as `mm:ss`, or `h:mm:ss` past an hour. */
export function formatTime(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainder = seconds % 60;

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(remainder)}`;
	}
	return `${pad(minutes)}:${pad(remainder)}`;
}

function pad(value: number): string {
	return value.toString().padStart(2, '0');
}
