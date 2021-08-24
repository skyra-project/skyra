import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, AsyncArgumentResult, Identifiers } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';

export class CoreArgument extends Argument<boolean> {
	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<boolean> {
		const boolean = parameter.toLowerCase();

		let truths = context.args.t(LanguageKeys.Arguments.BooleanTrueOptions).filter(Boolean);
		let falses = context.args.t(LanguageKeys.Arguments.BooleanFalseOptions).filter(Boolean);

		if (!truths.length) truths = context.args.t(LanguageKeys.Arguments.BooleanTrueOptions, { lng: 'en-US' }).filter(Boolean);
		if (!falses.length) falses = context.args.t(LanguageKeys.Arguments.BooleanFalseOptions, { lng: 'en-US' }).filter(Boolean);

		if (truths.includes(boolean)) return this.ok(true);
		if (falses.includes(boolean)) return this.ok(false);

		const possibles = truths.concat(falses);
		return this.error({ parameter, identifier: Identifiers.ArgumentBooleanError, context: { ...context, possibles, count: possibles.length } });
	}
}
