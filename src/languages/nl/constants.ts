import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'nl',
			duration: {
				[TimeTypes.Year]: {
					1: 'jaar',
					DEFAULT: 'jaren'
				},
				[TimeTypes.Month]: {
					1: 'maand',
					DEFAULT: 'maanden'
				},
				[TimeTypes.Week]: {
					1: 'week',
					DEFAULT: 'weken'
				},
				[TimeTypes.Day]: {
					1: 'dag',
					DEFAULT: 'dagen'
				},
				[TimeTypes.Hour]: {
					1: 'uur',
					DEFAULT: 'uren'
				},
				[TimeTypes.Minute]: {
					1: 'minuut',
					DEFAULT: 'minuten'
				},
				[TimeTypes.Second]: {
					1: 'seconde',
					DEFAULT: 'seconden'
				}
			}
		});
	}
}
