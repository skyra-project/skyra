import type { ScheduleEntity } from '#lib/database';
import { filter, first } from '#utils/common';
import { Store } from '@sapphire/pieces';
import { BirthdayScheduleEntity, DateWithOptionalYear, Month } from './types';

/**
 * Determines whether or not a month of a year contains a specific day.
 */
export function monthOfYearContainsDay(leap: boolean, month: Month, day: number) {
	if (day < 1) return false;

	switch (month) {
		case Month.February:
			return day <= (leap ? 29 : 28);
		case Month.January:
		case Month.March:
		case Month.May:
		case Month.July:
		case Month.August:
		case Month.October:
		case Month.December:
			return day <= 31;
		default:
			return day <= 30;
	}
}

/**
 * Determines whether or not a year is a leap year.
 */
export function yearIsLeap(year: number) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Determines whether or not a task is a birthday task.
 */
export function isBirthdayTask(task: ScheduleEntity): task is BirthdayScheduleEntity {
	return task.taskID === 'birthday';
}

/**
 * Gets all birthdays from the schedule's queue. This reads the data from {@link Store.injectedContext.schedule}.
 */
export function getBirthdays(): IterableIterator<BirthdayScheduleEntity> {
	return filter(Store.injectedContext.schedule.queue.values(), isBirthdayTask) as IterableIterator<BirthdayScheduleEntity>;
}

/**
 * Gets all birthdays from the schedule's queue and filters them by the guild ID.
 * @see getBirthdays
 */
export function getGuildBirthdays(guildID: string): IterableIterator<BirthdayScheduleEntity> {
	return filter(getBirthdays(), (task) => task.data.guildID === guildID);
}

/**
 * Gets the first entry from all birthdays from the schedule's queue that is a birthday task whose guild ID and user ID match.
 * @see getGuildBirthdays
 * @returns A {@link BirthdayScheduleEntity} if one was found, `null` otherwise.
 */
export function getGuildMemberBirthday(guildID: string, userID: string): BirthdayScheduleEntity | null {
	return first(filter(getGuildBirthdays(guildID), (task) => task.data.userID === userID));
}

/**
 * The time options for birthday functions.
 */
export interface TimeOptions {
	/**
	 * The time we wish to compare.
	 * @default Date.now()
	 */
	now?: number;
}

/**
 * Compares a date with now.
 * @param month The month to compare.
 * @param day The day to compare.
 * @param options The options for the operation of this function.
 * @returns One of the following:
 * - `-1`: `date < now`.
 * - `0`: `date === now`.
 * - `1`: `date > now`.
 */
export function compareDate(month: Month, day: number, { now = Date.now() }: TimeOptions = {}) {
	const date = new Date(now);

	// Compare the month, if it's earlier, pass -1, if it's later, pass 1:
	const dateMonth = date.getUTCMonth() + 1;
	if (month < dateMonth) return -1;
	if (month > dateMonth) return 1;

	// * The month is the same.
	// Compare the day, if it's earlier, pass -1, if it's later, pass 1:
	const dateDay = date.getUTCDate();
	if (day < dateDay) return -1;
	if (day > dateDay) return 1;

	// * The month and day are the same.
	return 0;
}

/**
 * Gets the current age from a date.
 * @param data The data to compare.
 * @param options The options for the operation of this function.
 * @returns `null` if `data.year` is `null`, a number of years otherwise.
 */
export function getAge(data: DateWithOptionalYear, { now = Date.now() }: TimeOptions = {}) {
	if (data.year === null) return null;

	// If the birthday has happened, we subtract the years by one, that way:
	//
	// * 2021/03/18 - 2020/05/10 = 0
	// * 2021/03/18 - 2020/02/26 = 1
	const extra = compareDate(data.month, data.day, { now }) === -1 ? 0 : -1;
	const years = new Date(now).getUTCFullYear() - data.year;
	return years + extra;
}

/**
 * The time options for birthday functions.
 */
export interface NextTimeOptions extends TimeOptions {
	/**
	 * Whether or not we wish to get a birthday this year if the month and day are the same.
	 * @default false
	 */
	nextYearIfToday?: boolean;

	/**
	 * The timezone offset in milliseconds.
	 * @default 0
	 */
	timeZoneOffset?: number;
}

/**
 * Gets the next birthday's date.
 * @param month The month component from the date, starting with 1.
 * @param day The day component from the date, starting with 1.
 * @param options The options for the operation of this function.
 * @returns A `Date` representing the next birthday, which can be `now`'s date if `options.nextYearIfToday` is set as `false`.
 */
export function nextBirthday(month: Month, day: number, { now = Date.now(), nextYearIfToday = false, timeZoneOffset = 0 }: NextTimeOptions = {}) {
	const yearNow = new Date(now).getUTCFullYear();

	const yearComparisonResult = compareDate(month, day, { now });
	const shouldBeScheduledForNextYear = nextYearIfToday ? yearComparisonResult <= 0 : yearComparisonResult < 0;
	const yearOffset = shouldBeScheduledForNextYear ? 1 : 0;

	return new Date(Date.UTC(yearNow + yearOffset, month - 1, day) + timeZoneOffset);
}
