import { Time } from '@sapphire/time-utilities';
import { roundNumber } from '@sapphire/utilities';

/**
 * Converts a number of seconds to milliseconds.
 * @param seconds The amount of seconds
 * @returns The amount of milliseconds `seconds` equals to.
 */
export function seconds(seconds: number): number {
	return seconds * Time.Second;
}

/**
 * Converts a number of milliseconds to seconds.
 * @param milliseconds The amount of milliseconds
 * @returns The amount of seconds `milliseconds` equals to.
 */
seconds.fromMilliseconds = (milliseconds: number): number => {
	return roundNumber(milliseconds / Time.Second);
};

/**
 * Converts a number of minutes to seconds.
 * @param minutes The amount of minutes
 * @returns The amount of seconds `minutes` equals to.
 */
seconds.fromMinutes = (minutes: number): number => {
	return minutes * 60;
};

/**
 * Converts a number of hours to seconds.
 * @param hours The amount of hours
 * @returns The amount of seconds `hours` equals to.
 */
seconds.fromHours = (hours: number): number => {
	return hours * 60 * 60;
};

/**
 * Converts a number of days to seconds.
 * @param days The amount of days
 * @returns The amount of seconds `days` equals to.
 */
seconds.fromDays = (days: number): number => {
	return days * 60 * 60 * 24;
};

/**
 * Converts a number of minutes to milliseconds.
 * @param minutes The amount of minutes
 * @returns The amount of milliseconds `minutes` equals to.
 */
export function minutes(minutes: number): number {
	return minutes * Time.Minute;
}

/**
 * Converts a number of minutes to seconds.
 * @param value The amount of minutes
 * @returns The amount of seconds `value` equals to.
 */
minutes.toSeconds = (value: number): number => {
	return roundNumber(minutes(value) / Time.Second);
};

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
