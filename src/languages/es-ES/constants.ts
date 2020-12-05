import { DurationFormatter, TimeTypes, Timestamp } from '@sapphire/time-utilities';

export const timestamp = new Timestamp('DD/MM/YYYY [a las] HH:mm:ss');

export const duration = new DurationFormatter({
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
});
