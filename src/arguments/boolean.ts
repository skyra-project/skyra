import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Identifiers } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';
import { cast } from '@sapphire/utilities';
import { t } from 'i18next';

export class CoreArgument extends Argument<boolean> {
	private defaultTruthValues: string[] | null = null;
	private defaultFalseValues: string[] | null = null;

	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public run(parameter: string, context: Argument.Context): Argument.Result<boolean> {
		const boolean = parameter.toLowerCase();

		let truths = context.args.t(LanguageKeys.Arguments.BooleanTrueOptions).filter(Boolean);
		let falses = context.args.t(LanguageKeys.Arguments.BooleanFalseOptions).filter(Boolean);

		if (!truths.length) truths = this.getDefaultTruthValues;
		if (!falses.length) falses = this.getDefaultFalseValues;

		if (truths.includes(boolean)) return this.ok(true);
		if (falses.includes(boolean)) return this.ok(false);

		const possibles = truths.concat(falses);
		return this.error({ parameter, identifier: Identifiers.ArgumentBooleanError, context: { ...context, possibles, count: possibles.length } });
	}

	private get getDefaultTruthValues() {
		return (this.defaultTruthValues ??= cast<string[]>(t(LanguageKeys.Arguments.BooleanTrueOptions, { lng: 'en-US' })).filter(Boolean));
	}

	private get getDefaultFalseValues() {
		return (this.defaultFalseValues ??= cast<string[]>(t(LanguageKeys.Arguments.BooleanFalseOptions, { lng: 'en-US' })).filter(Boolean));
	}
}
