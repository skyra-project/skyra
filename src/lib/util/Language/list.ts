/**
 * Converts an array of strings to a enumerated string for users
 * @param values The values to list
 * @param conjunction The conjunction to use between the values
 */
export function list(values: readonly string[], conjunction: string) {
	switch (values.length) {
		case 0:
			return '';
		case 1:
			return values[0];
		case 2:
			return `${values[0]} ${conjunction} ${values[1]}`;
		default: {
			const trail = values.slice(0, -1);
			const head = values[values.length - 1];
			return `${trail.join(', ')}, ${conjunction} ${head}`;
		}
	}
}
