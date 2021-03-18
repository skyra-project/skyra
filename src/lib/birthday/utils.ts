import { ScheduleEntity } from '#lib/database';
import { filter, first } from '#utils/iterator';
import { Store } from '@sapphire/pieces';
import { BirthDayScheduleEntity, DateWithOptionalYear, Month } from './types';

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

export function isBirthDayTask(task: ScheduleEntity): task is BirthDayScheduleEntity {
	return task.taskID === 'birthday';
}

export function getBirthDays(): IterableIterator<BirthDayScheduleEntity> {
	return filter(Store.injectedContext.client.schedules.queue.values(), isBirthDayTask) as IterableIterator<BirthDayScheduleEntity>;
}

export function getGuildBirthDays(guildID: string): IterableIterator<BirthDayScheduleEntity> {
	return filter(getBirthDays(), (task) => task.data.guildID === guildID);
}

export function getGuildMemberBirthDay(guildID: string, userID: string): BirthDayScheduleEntity | null {
	return first(filter(getGuildBirthDays(guildID), (task) => task.data.userID === userID));
}

export function dateIsBeforeToday(month: Month, day: number, now = Date.now()) {
	const date = new Date(now);
	const dateMonth = date.getUTCMonth() + 1;
	const dateDay = date.getUTCDate();

	// If the month has passed, or it's the same month but the day has passed, the birthday should be scheduled for next year:
	return month < dateMonth || (month === dateMonth && day < dateDay);
}

export function getAge(data: DateWithOptionalYear, now = Date.now()) {
	if (data.year === null) return null;

	// If the birthday hasn't happened yet, we substract the years by one, that way:
	//
	// * 2021/03/18 - 2020/05/10 = 0
	// * 2021/03/18 - 2020/02/26 = 1
	const extra = dateIsBeforeToday(data.month, data.day) ? 0 : -1;
	const years = new Date(now).getUTCFullYear() - data.year;
	return years + extra;
}

export function nextBirthday(month: number, day: number, now = Date.now()) {
	// If the month has passed, or it's the same month but the day has passed, the birthday should be scheduled for next year:
	return new Date(new Date(now).getUTCFullYear() + (dateIsBeforeToday(month, day, now) ? 1 : 0), month - 1, day);
}
