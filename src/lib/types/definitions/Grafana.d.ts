export namespace Grafana {
	export const enum TimeSeriesTargets {
		Guilds = 'guilds',
		Users = 'users'
	}

	export interface Body {
		panelId: number;
		range: Range;
		rangeRaw: RangeRaw;
		interval: string;
		intervalMs: number;
		targets: Target[];
		adhocFilters: AdhocFilter[];
		format: string;
		maxDataPoints: number;
	}

	export interface TimeSeriesResponse {
		target: TimeSeriesTargets;
		datapoints: readonly [number, number][];
	}

	export interface Raw {
		from: string;
		to: string;
	}

	export interface Range {
		from: Date;
		to: Date;
		raw: Raw;
	}

	export interface RangeRaw {
		from: string;
		to: string;
	}

	export interface Target {
		target: TimeSeriesTargets;
		refId: string;
		type: string;
	}

	export interface AdhocFilter {
		key: string;
		operator: string;
		value: string;
	}
}
