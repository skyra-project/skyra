import { ScheduleEntity } from '#lib/database';

export const enum Month {
	January = 1,
	February,
	March,
	April,
	May,
	June,
	July,
	August,
	September,
	October,
	November,
	December
}

export interface DateWithOptionalYear {
	year: number | null;
	month: Month;
	day: number;
}

export type BirthdayScheduleEntity = ScheduleEntity & { data: TaskBirthdayData };

export interface TaskBirthdayData extends DateWithOptionalYear, Record<string, unknown> {
	userID: string;
	guildID: string;
}
