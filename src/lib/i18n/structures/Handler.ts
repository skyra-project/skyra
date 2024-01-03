import { DurationFormatter, type DurationFormatAssetsTime } from '@sapphire/time-utilities';

export abstract class Handler {
	public readonly name: string;
	public readonly duration: DurationFormatter;

	public constructor(options: Handler.Options) {
		this.name = options.name;
		this.duration = new DurationFormatter(options.duration);
	}
}

export namespace Handler {
	export interface Options {
		name: string;
		duration: DurationFormatAssetsTime;
	}
}
