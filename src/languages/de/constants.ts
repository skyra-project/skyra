import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'de',
			duration: {
				[TimeTypes.Year]: {
					1: 'Jahr',
					DEFAULT: 'Jahre'
				},
				[TimeTypes.Month]: {
					1: 'Monat',
					DEFAULT: 'Monate'
				},
				[TimeTypes.Week]: {
					1: 'Woche',
					DEFAULT: 'Wochen'
				},
				[TimeTypes.Day]: {
					1: 'Tag',
					DEFAULT: 'Tage'
				},
				[TimeTypes.Hour]: {
					1: 'Stunde',
					DEFAULT: 'Stunden'
				},
				[TimeTypes.Minute]: {
					1: 'Minute',
					DEFAULT: 'Minuten'
				},
				[TimeTypes.Second]: {
					1: 'Sekunde',
					DEFAULT: 'Sekunden'
				}
			}
		});
	}
}
