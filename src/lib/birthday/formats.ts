export const dateFormats = new Map<string, RegExp>([
	['DD/MM/YYYY', /^(?<day>\d{1,2})\/(?<month>\d{1,2})(?:\/(?<year>\d{4}))?/],
	['DD-MM-YYYY', /^(?<day>\d{1,2})\-(?<month>\d{1,2})(?:\-(?<year>\d{4}))?/],
	['DD.MM.YYYY', /^(?<day>\d{1,2})\.(?<month>\d{1,2})(?:\.(?<year>\d{4}))?/],
	['MM/DD/YYYY', /^(?<month>\d{1,2})\/(?<day>\d{1,2})(?:\/(?<year>\d{4}))?/],
	['MM-DD-YYYY', /^(?<month>\d{1,2})\-(?<day>\d{1,2})(?:\-(?<year>\d{4}))?/],
	['MM.DD.YYYY', /^(?<month>\d{1,2})\.(?<day>\d{1,2})(?:\.(?<year>\d{4}))?/],
	['YYYY/MM/DD', /^(?:(?<year>\d{4})\/)?(?<month>\d{1,2})\/(?<day>\d{1,2})/],
	['YYYY-MM-DD', /^(?:(?<year>\d{4})\-)?(?<month>\d{1,2})\-(?<day>\d{1,2})/],
	['YYYY.MM.DD', /^(?:(?<year>\d{4})\.)?(?<month>\d{1,2})\.(?<day>\d{1,2})/],
	['YYYY/DD/MM', /^(?:(?<year>\d{4})\/)?(?<day>\d{1,2})\/(?<month>\d{1,2})/],
	['YYYY-DD-MM', /^(?:(?<year>\d{4})\-)?(?<day>\d{1,2})\-(?<month>\d{1,2})/],
	['YYYY.DD.MM', /^(?:(?<year>\d{4})\.)?(?<day>\d{1,2})\.(?<month>\d{1,2})/]
]);

/**
 * @param format The string format to use.
 * @param language The name of the language, used for the error message.
 * @returns The language-aware RegExp date parser.
 */
export function getDateFormat(format: string, language: string): RegExp {
	const value = dateFormats.get(format);

	// If it's undefined, there's a translation error that must be addressed:
	if (value === undefined) {
		throw new Error(`Could not find language format '${format}' from language '${language}'.`);
	}

	return value;
}

const removeYearReplacer = /^YYYY.|.YYYY$/;
export function removeYear(format: string): string {
	return format.replace(removeYearReplacer, '');
}
