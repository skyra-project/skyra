import { Handler } from '#lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class ExtendedHandler extends Handler {
	public constructor() {
		super({
			name: 'es-419',
			duration: {
				[TimeTypes.Year]: {
					1: 'año',
					DEFAULT: 'años'
				},
				[TimeTypes.Month]: {
					1: 'mes',
					DEFAULT: 'meses'
				},
				[TimeTypes.Week]: {
					1: 'semana',
					DEFAULT: 'semanas'
				},
				[TimeTypes.Day]: {
					1: 'día',
					DEFAULT: 'días'
				},
				[TimeTypes.Hour]: {
					1: 'hora',
					DEFAULT: 'horas'
				},
				[TimeTypes.Minute]: {
					1: 'minuto',
					DEFAULT: 'minutos'
				},
				[TimeTypes.Second]: {
					1: 'segundo',
					DEFAULT: 'segundos'
				}
			}
		});
	}
}
