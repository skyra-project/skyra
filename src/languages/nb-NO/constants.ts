import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'nb-NO',
			duration: {
				[TimeTypes.Year]: {
					1: 'år',
					DEFAULT: 'år'
				},
				[TimeTypes.Month]: {
					1: 'måned',
					DEFAULT: 'måneder'
				},
				[TimeTypes.Week]: {
					1: 'uke',
					DEFAULT: 'uker'
				},
				[TimeTypes.Day]: {
					1: 'dag',
					DEFAULT: 'dager'
				},
				[TimeTypes.Hour]: {
					1: 'time',
					DEFAULT: 'timer'
				},
				[TimeTypes.Minute]: {
					1: 'minutt',
					DEFAULT: 'minutter'
				},
				[TimeTypes.Second]: {
					1: 'sekund',
					DEFAULT: 'sekunder'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		const cent = cardinal % 100;
		const dec = cardinal % 10;
		if (cent > 10 && cent < 20) {
			switch (dec) {
				case 1:
				case 2:
					return `${cardinal}te`;
				default:
					return `${cardinal}de`;
			}
		}
		switch (dec) {
			case 1:
				return `${cardinal}ste`;
			case 2:
				return `${cardinal}ndre`;
			case 3:
				return `${cardinal}dje`;
			case 6:
				return `${cardinal}te`;
			default:
				return `${cardinal}de`;
		}
	}
}
