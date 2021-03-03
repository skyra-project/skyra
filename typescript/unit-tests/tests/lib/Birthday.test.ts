import {
	compareDate,
	getAge,
	getBirthdays,
	getDateFormat,
	getGuildBirthdays,
	getGuildMemberBirthday,
	isBirthdayTask,
	Month,
	monthOfYearContainsDay,
	nextBirthday,
	removeYear,
	TaskBirthdayData,
	yearIsLeap
} from '#lib/birthday';
import { ScheduleEntity } from '#lib/database';
import { ScheduleManager } from '#lib/structures';
import { Store } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';

describe('Birthday', () => {
	/**
	 * @natural Sat Apr 18 2020 12:00:00 UTC+0
	 * @date `2020-04-18T12:00:00.000+00:00`
	 */
	const April18th2020 = 1587211200000;
	const realDateNow = Date.now.bind(global.Date);

	beforeAll(() => {
		global.Date.now = jest.fn(() => April18th2020);
	});

	afterAll(() => {
		global.Date.now = realDateNow;
	});

	describe('yearIsLeap', () => {
		test('GIVEN 2019 THEN returns false', () => {
			expect(yearIsLeap(2019)).toBe(false);
		});

		test('GIVEN 2020 THEN returns true', () => {
			expect(yearIsLeap(2020)).toBe(true);
		});

		test('GIVEN 1900 THEN returns false', () => {
			expect(yearIsLeap(1900)).toBe(false);
		});

		test('GIVEN 2200 THEN returns false', () => {
			expect(yearIsLeap(2200)).toBe(false);
		});
	});

	describe('monthOfYearContainsDay', () => {
		describe('WHEN leap year', () => {
			test('GIVEN february WHEN day is 28 THEN returns true', () => {
				expect(monthOfYearContainsDay(true, Month.February, 28)).toBe(true);
			});

			test('GIVEN february WHEN day is 29 THEN returns true', () => {
				expect(monthOfYearContainsDay(true, Month.February, 29)).toBe(true);
			});

			test('GIVEN february WHEN day is 30 THEN returns false', () => {
				expect(monthOfYearContainsDay(true, Month.February, 30)).toBe(false);
			});

			test('GIVEN february WHEN day is 31 THEN returns false', () => {
				expect(monthOfYearContainsDay(true, Month.February, 31)).toBe(false);
			});

			test('GIVEN february WHEN day is 0 THEN returns false', () => {
				expect(monthOfYearContainsDay(true, Month.February, 0)).toBe(false);
			});

			test('GIVEN february WHEN day is -1 THEN returns false', () => {
				expect(monthOfYearContainsDay(true, Month.February, -1)).toBe(false);
			});
		});

		describe('WHEN NOT leap year', () => {
			test('GIVEN february WHEN day is 28 THEN returns true', () => {
				expect(monthOfYearContainsDay(false, Month.February, 28)).toBe(true);
			});

			test('GIVEN february WHEN day is 29 THEN returns true', () => {
				expect(monthOfYearContainsDay(false, Month.February, 29)).toBe(false);
			});

			test('GIVEN february WHEN day is 30 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.February, 30)).toBe(false);
			});

			test('GIVEN february WHEN day is 31 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.February, 31)).toBe(false);
			});

			test('GIVEN february WHEN day is -1 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.February, -1)).toBe(false);
			});

			test('GIVEN january WHEN day is -1 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.January, -1)).toBe(false);
			});

			test('GIVEN february WHEN day is 0 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.February, 0)).toBe(false);
			});

			test('GIVEN january WHEN day is 0 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.January, 0)).toBe(false);
			});

			test('GIVEN january WHEN day is 30 THEN returns true', () => {
				expect(monthOfYearContainsDay(false, Month.January, 30)).toBe(true);
			});

			test('GIVEN january WHEN day is 31 THEN returns true', () => {
				expect(monthOfYearContainsDay(false, Month.January, 31)).toBe(true);
			});

			test('GIVEN january WHEN day is 32 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.January, 32)).toBe(false);
			});

			test('GIVEN april WHEN day is -1 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.April, -1)).toBe(false);
			});

			test('GIVEN april WHEN day is 30 THEN returns true', () => {
				expect(monthOfYearContainsDay(false, Month.April, 30)).toBe(true);
			});

			test('GIVEN april WHEN day is 31 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.April, 31)).toBe(false);
			});

			test('GIVEN april WHEN day is 32 THEN returns false', () => {
				expect(monthOfYearContainsDay(false, Month.April, 32)).toBe(false);
			});
		});
	});

	describe('tasks', () => {
		Store.injectedContext.schedule = new ScheduleManager(null!);

		let i = 0;
		const create = (data: TaskBirthdayData) => {
			const entity = new ScheduleEntity();
			entity.id = i++;
			entity.time = new Date();
			entity.taskID = 'birthday';
			entity.recurring = null;
			entity.data = data;
			entity.catchUp = true;

			return entity;
		};

		Store.injectedContext.schedule.queue.push(create({ guildID: '1', userID: '1', day: 21, month: 9, year: 1998 }));
		Store.injectedContext.schedule.queue.push(create({ guildID: '2', userID: '2', day: 18, month: 2, year: 1996 }));

		{
			const entity = new ScheduleEntity();
			entity.id = i++;
			entity.time = new Date();
			entity.taskID = 'poststats';
			entity.recurring = null;
			entity.data = {};
			entity.catchUp = true;
			Store.injectedContext.schedule.queue.push(entity);
		}

		Store.injectedContext.schedule.queue.push(create({ guildID: '1', userID: '3', day: 21, month: 2, year: 1995 }));
		Store.injectedContext.schedule.queue.push(create({ guildID: '2', userID: '4', day: 31, month: 8, year: 1969 }));
		Store.injectedContext.schedule.queue.push(create({ guildID: '1', userID: '5', day: 15, month: 5, year: 1964 }));

		describe('isBirthdayTask', () => {
			test('GIVEN a birthday schedule entity THEN returns true', () => {
				expect(isBirthdayTask(create(null!))).toBe(true);
			});

			test('GIVEN a non-birthday schedule entity THEN returns false', () => {
				const entity = new ScheduleEntity();
				entity.taskID = 'poststats';
				expect(isBirthdayTask(entity)).toBe(false);
			});
		});

		describe('getBirthdays', () => {
			test('GIVEN nothing THEN returns all birthday tasks', () => {
				const entries = [...getBirthdays()];
				expect(entries.map((entry) => entry.id)).toStrictEqual([0, 1, 3, 4, 5]);
			});
		});

		describe('getGuildBirthdays', () => {
			test('GIVEN guildID 1 THEN returns 3 entries', () => {
				const entries = [...getGuildBirthdays('1')];
				expect(entries.map((entry) => entry.id)).toStrictEqual([0, 3, 5]);
			});

			test('GIVEN guildID 2 THEN returns 2 entries', () => {
				const entries = [...getGuildBirthdays('2')];
				expect(entries.map((entry) => entry.id)).toStrictEqual([1, 4]);
			});

			test('GIVEN guildID 3 THEN returns no entries', () => {
				const entries = [...getGuildBirthdays('3')];
				expect(entries).toStrictEqual([]);
			});
		});

		describe('getGuildMemberBirthday', () => {
			test('GIVEN guildID 1 WHEN userID is 1 THEN returns non-null', () => {
				const entry = getGuildMemberBirthday('1', '1');
				expect(entry).not.toBeNull();
				expect(entry!.id).toBe(0);
			});

			test('GIVEN guildID 1 WHEN userID is 2 THEN returns null', () => {
				const entry = getGuildMemberBirthday('1', '2');
				expect(entry).toBeNull();
			});

			test('GIVEN guildID 3 WHEN userID is 1 THEN returns null', () => {
				const entry = getGuildMemberBirthday('3', '1');
				expect(entry).toBeNull();
			});
		});
	});

	describe('compareDate', () => {
		describe('WITH default now', () => {
			test('GIVEN a date earlier by one day THEN returns -1', () => {
				expect(compareDate(Month.April, 17)).toBe(-1);
			});

			test('GIVEN a date earlier by one month THEN returns -1', () => {
				expect(compareDate(Month.March, 18)).toBe(-1);
			});

			test('GIVEN a date on the same day THEN returns 0', () => {
				expect(compareDate(Month.April, 18)).toBe(0);
			});

			test('GIVEN a date later by one day THEN returns 1', () => {
				expect(compareDate(Month.April, 19)).toBe(1);
			});

			test('GIVEN a date later by one month THEN returns 1', () => {
				expect(compareDate(Month.May, 18)).toBe(1);
			});
		});

		describe('WITH custom now', () => {
			test('GIVEN a date later by 3 months and 10 days THEN returns 1', () => {
				expect(compareDate(Month.June, 12, { now: new Date('2021-03-02T12:00:00.000Z').getTime() })).toBe(1);
			});
		});

		describe('WITH third parameter = {}', () => {
			test('GIVEN empty third parameter THEN returns 1', () => {
				expect(compareDate(Month.June, 12, {})).toBe(1);
			});
		});
	});

	describe('getAge', () => {
		describe('WITH default now', () => {
			test('GIVEN day before now THEN returns 20', () => {
				expect(getAge({ year: 2000, month: Month.April, day: 5 })).toBe(20);
			});

			test('GIVEN day after now THEN returns 19', () => {
				expect(getAge({ year: 2000, month: Month.May, day: 5 })).toBe(19);
			});
		});

		describe('WITH custom now', () => {
			test('GIVEN day before now THEN returns 20', () => {
				expect(getAge({ year: 2000, month: Month.February, day: 5 }, { now: new Date('2020-03-02T12:00:00.000Z').getTime() })).toBe(20);
			});

			test('GIVEN day after now THEN returns 19', () => {
				expect(getAge({ year: 2000, month: Month.April, day: 5 }, { now: new Date('2020-03-02T12:00:00.000Z').getTime() })).toBe(19);
			});
		});

		describe('WITHOUT year', () => {
			test('GIVEN no year THEN returns null', () => {
				expect(getAge({ year: null, month: Month.April, day: 5 })).toBe(null);
			});
		});

		describe('WITH second parameter = {}', () => {
			test('GIVEN day before now THEN returns 20', () => {
				expect(getAge({ year: 2000, month: Month.April, day: 5 })).toBe(20);
			});

			test('GIVEN day after now THEN returns 19', () => {
				expect(getAge({ year: 2000, month: Month.May, day: 5 })).toBe(19);
			});

			test('GIVEN no year THEN returns null', () => {
				expect(getAge({ year: null, month: Month.April, day: 5 }, {})).toBe(null);
			});
		});
	});

	describe('nextBirthday', () => {
		describe('WITH default now', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1).getTime()).toBe(new Date('2021-03-01T00:00:00.000Z').getTime());
			});
		});

		describe('WITH custom now', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 10, { now: new Date('2020-03-02T12:00:00.000Z').getTime() }).getTime()).toBe(
					new Date('2020-03-10T00:00:00.000Z').getTime()
				);
			});
		});

		describe('WITH nextYearIfToday = false', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1, { nextYearIfToday: false }).getTime()).toBe(new Date('2021-03-01T00:00:00.000Z').getTime());
			});

			test('GIVEN date matching today THEN returns this year', () => {
				expect(nextBirthday(Month.April, 18, { nextYearIfToday: false }).getTime()).toBe(new Date('2020-04-18T00:00:00.000Z').getTime());
			});

			test('GIVEN month after now THEN returns this year', () => {
				expect(nextBirthday(Month.July, 1, { nextYearIfToday: false }).getTime()).toBe(new Date('2020-07-01T00:00:00.000Z').getTime());
			});
		});

		describe('WITH nextYearIfToday = true', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1, { nextYearIfToday: true }).getTime()).toBe(new Date('2021-03-01T00:00:00.000Z').getTime());
			});

			test('GIVEN date matching today THEN returns next year', () => {
				expect(nextBirthday(Month.April, 18, { nextYearIfToday: true }).getTime()).toBe(new Date('2021-04-18T00:00:00.000Z').getTime());
			});

			test('GIVEN month after now THEN returns this year', () => {
				expect(nextBirthday(Month.July, 1, { nextYearIfToday: true }).getTime()).toBe(new Date('2020-07-01T00:00:00.000Z').getTime());
			});
		});

		describe('WITH timeZoneOffset = 1h', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1, { timeZoneOffset: Time.Hour }).getTime()).toBe(new Date('2021-03-01T01:00:00.000Z').getTime());
			});

			test('GIVEN month after now THEN returns this year', () => {
				expect(nextBirthday(Month.July, 1, { timeZoneOffset: Time.Hour }).getTime()).toBe(new Date('2020-07-01T01:00:00.000Z').getTime());
			});
		});

		describe('WITH timeZoneOffset = 0', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1, { timeZoneOffset: 0 }).getTime()).toBe(new Date('2021-03-01T00:00:00.000Z').getTime());
			});

			test('GIVEN month after now THEN returns this year', () => {
				expect(nextBirthday(Month.July, 1, { timeZoneOffset: 0 }).getTime()).toBe(new Date('2020-07-01T00:00:00.000Z').getTime());
			});
		});

		describe('WITH third parameter = {}', () => {
			test('GIVEN month before now THEN returns next year', () => {
				expect(nextBirthday(Month.March, 1, {}).getTime()).toBe(new Date('2021-03-01T00:00:00.000Z').getTime());
			});

			test('GIVEN month after now THEN returns this year', () => {
				expect(nextBirthday(Month.July, 1, {}).getTime()).toBe(new Date('2020-07-01T00:00:00.000Z').getTime());
			});
		});
	});

	describe('getDateFormat', () => {
		test('GIVEN DD/MM/YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('DD/MM/YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN DD-MM-YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('DD-MM-YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN DD.MM.YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('DD.MM.YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN MM/DD/YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('MM/DD/YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN MM-DD-YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('MM-DD-YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN MM.DD.YYYY THEN returns RegExp instance', () => {
			expect(getDateFormat('MM.DD.YYYY', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY/MM/DD THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY/MM/DD', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY-MM-DD THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY-MM-DD', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY.MM.DD THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY.MM.DD', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY/DD/MM THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY/DD/MM', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY-DD-MM THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY-DD-MM', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN YYYY.DD.MM THEN returns RegExp instance', () => {
			expect(getDateFormat('YYYY.DD.MM', 'en-US')).toBeInstanceOf(RegExp);
		});

		test('GIVEN DD/YYYY/MM THEN throws Error', () => {
			expect(() => getDateFormat('DD/YYYY/MM', 'en-US')).toThrow(Error);
		});

		test('GIVEN DD-YYYY-MM THEN throws Error', () => {
			expect(() => getDateFormat('DD-YYYY-MM', 'en-US')).toThrow(Error);
		});

		test('GIVEN DD.YYYY.MM THEN throws Error', () => {
			expect(() => getDateFormat('DD.YYYY.MM', 'en-US')).toThrow(Error);
		});
	});

	describe('removeYear', () => {
		test('GIVEN DD/MM/YYYY THEN returns DD/MM', () => {
			expect(removeYear('DD/MM/YYYY')).toBe('DD/MM');
		});

		test('GIVEN DD-MM-YYYY THEN returns DD-MM', () => {
			expect(removeYear('DD-MM-YYYY')).toBe('DD-MM');
		});

		test('GIVEN DD.MM.YYYY THEN returns DD.MM', () => {
			expect(removeYear('DD.MM.YYYY')).toBe('DD.MM');
		});

		test('GIVEN MM/DD/YYYY THEN returns MM/DD', () => {
			expect(removeYear('MM/DD/YYYY')).toBe('MM/DD');
		});

		test('GIVEN MM-DD-YYYY THEN returns MM-DD', () => {
			expect(removeYear('MM-DD-YYYY')).toBe('MM-DD');
		});

		test('GIVEN MM.DD.YYYY THEN returns MM.DD', () => {
			expect(removeYear('MM.DD.YYYY')).toBe('MM.DD');
		});

		test('GIVEN YYYY/MM/DD THEN returns MM/DD', () => {
			expect(removeYear('YYYY/MM/DD')).toBe('MM/DD');
		});

		test('GIVEN YYYY-MM-DD THEN returns MM-DD', () => {
			expect(removeYear('YYYY-MM-DD')).toBe('MM-DD');
		});

		test('GIVEN YYYY.MM.DD THEN returns MM.DD', () => {
			expect(removeYear('YYYY.MM.DD')).toBe('MM.DD');
		});

		test('GIVEN YYYY/DD/MM THEN returns DD/MM', () => {
			expect(removeYear('YYYY/DD/MM')).toBe('DD/MM');
		});

		test('GIVEN YYYY-DD-MM THEN returns DD-MM', () => {
			expect(removeYear('YYYY-DD-MM')).toBe('DD-MM');
		});

		test('GIVEN YYYY.DD.MM THEN returns DD.MM', () => {
			expect(removeYear('YYYY.DD.MM')).toBe('DD.MM');
		});
	});
});
