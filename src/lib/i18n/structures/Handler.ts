import { DurationFormatter, type DurationFormatAssetsTime } from '@sapphire/time-utilities';

export abstract class Handler {
	public readonly name: string;
	public readonly number: Intl.NumberFormat;
	public readonly numberCompact: Intl.NumberFormat;
	public readonly listAnd: Intl.ListFormat;
	public readonly listOr: Intl.ListFormat;
	public readonly dateTime: Intl.DateTimeFormat;
	public readonly duration: DurationFormatter;

	public constructor(options: Handler.Options) {
		this.name = options.name;
		this.number = new Intl.NumberFormat(this.name, { maximumFractionDigits: 2 });
		this.numberCompact = new Intl.NumberFormat(this.name, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2 });
		this.listAnd = new Intl.ListFormat(this.name, { type: 'conjunction' });
		this.listOr = new Intl.ListFormat(this.name, { type: 'disjunction' });
		this.dateTime = new Intl.DateTimeFormat(this.name, { timeZone: 'Etc/UTC', dateStyle: 'short', timeStyle: 'medium' });
		this.duration = new DurationFormatter(options.duration);
	}
}

export namespace Handler {
	export interface Options {
		name: string;
		duration: DurationFormatAssetsTime;
	}
}
