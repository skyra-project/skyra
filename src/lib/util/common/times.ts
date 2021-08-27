import { Time } from '@sapphire/time-utilities';

/**
 * Converts a number of seconds to milliseconds.
 * @param seconds The amount of seconds
 * @returns The amount of milliseconds `seconds` equals to.
 */
export function seconds(seconds: number): number {
	return seconds * Time.Second;
}

/**
 * Converts a number of minutes to milliseconds.
 * @param minutes The amount of minutes
 * @returns The amount of milliseconds `minutes` equals to.
 */
export function minutes(minutes: number): number {
	return minutes * Time.Minute;
}

/**
 * Converts a number of hours to milliseconds.
 * @param hours The amount of hours
 * @returns The amount of milliseconds `hours` equals to.
 */
export function hours(hours: number): number {
	return hours * Time.Hour;
}

/**
 * Converts a number of days to milliseconds.
 * @param days The amount of days
 * @returns The amount of milliseconds `days` equals to.
 */
export function days(days: number): number {
	return days * Time.Day;
}

/**
 * Converts a number of months to milliseconds.
 * @param months The amount of months
 * @returns The amount of milliseconds `months` equals to.
 */
export function months(months: number): number {
	return months * Time.Month;
}

/**
 * Converts a number of years to milliseconds.
 * @param years The amount of years
 * @returns The amount of milliseconds `years` equals to.
 */
export function years(years: number): number {
	return years * Time.Year;
}
