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
}
