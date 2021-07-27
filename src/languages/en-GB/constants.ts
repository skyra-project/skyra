import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'en-GB',
			duration: {
				[TimeTypes.Year]: {
					1: 'year',
					DEFAULT: 'years'
				},
				[TimeTypes.Month]: {
					1: 'month',
					DEFAULT: 'months'
				},
				[TimeTypes.Week]: {
					1: 'week',
					DEFAULT: 'weeks'
				},
				[TimeTypes.Day]: {
					1: 'day',
					DEFAULT: 'days'
				},
				[TimeTypes.Hour]: {
					1: 'hour',
					DEFAULT: 'hours'
				},
				[TimeTypes.Minute]: {
					1: 'minute',
					DEFAULT: 'minutes'
				},
				[TimeTypes.Second]: {
					1: 'second',
					DEFAULT: 'seconds'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		const cent = cardinal % 100;
		const dec = cardinal % 10;

		if (cent >= 10 && cent <= 20) {
			return `${cardinal}th`;
		}

		switch (dec) {
			case 1:
				return `${cardinal}st`;
			case 2:
				return `${cardinal}nd`;
			case 3:
				return `${cardinal}rd`;
			default:
				return `${cardinal}th`;
		}
	}
}
