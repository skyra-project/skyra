import { ScheduleEntity } from '#lib/database';
import { filter, first } from '#utils/iterator';
import { Store } from '@sapphire/pieces';
import { BirthdayScheduleEntity, DateWithOptionalYear, Month } from './types';

export function monthOfYearContainsDay(leap: boolean, month: Month, day: number) {
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

export function yearIsLeap(year: number) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isBirthdayTask(task: ScheduleEntity): task is BirthdayScheduleEntity {
	return task.taskID === 'birthday';
}

export function getBirthdays(): IterableIterator<BirthdayScheduleEntity> {
	return filter(Store.injectedContext.client.schedules.queue.values(), isBirthdayTask) as IterableIterator<BirthdayScheduleEntity>;
}

export function getGuildBirthdays(guildID: string): IterableIterator<BirthdayScheduleEntity> {
	return filter(getBirthdays(), (task) => task.data.guildID === guildID);
}

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
 * @param now The time we wish to compare, defaults to `Date.now()`
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

export function getAge(data: DateWithOptionalYear, { now = Date.now() }: TimeOptions = {}) {
	if (data.year === null) return null;

	// If the birthday has happened, we substract the years by one, that way:
	//
	// * 2021/03/18 - 2020/05/10 = 0
	// * 2021/03/18 - 2020/02/26 = 1
	const extra = compareDate(data.month, data.day) === 1 ? 0 : -1;
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

export function nextBirthday(month: number, day: number, { now = Date.now(), nextYearIfToday = false, timeZoneOffset = 0 }: NextTimeOptions = {}) {
	const yearNow = new Date(now).getUTCFullYear();

	const yearComparisonResult = compareDate(month, day, { now });
	const shouldBeScheduledForNextYear = nextYearIfToday ? yearComparisonResult <= 0 : yearComparisonResult < 0;
	const yearOffset = shouldBeScheduledForNextYear ? 1 : 0;

	return new Date(Date.UTC(yearNow + yearOffset, month - 1, day) + timeZoneOffset);
}
