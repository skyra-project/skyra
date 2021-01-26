import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, AsyncArgumentResult, Identifiers } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';

export class CoreArgument extends Argument<boolean> {
	public constructor(context: PieceContext) {
		super(context, { name: 'boolean' });
	}

	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<boolean> {
		const boolean = parameter.toLowerCase();
		const t = await context.message.fetchT();

		let truths = t(LanguageKeys.Arguments.BoolTrueOptions);
		let falses = t(LanguageKeys.Arguments.BoolFalseOptions);

		if (!truths || !truths.filter(Boolean).length) truths = t(LanguageKeys.Arguments.BoolTrueOptions, { lng: 'en-US' });
		if (!falses || !falses.filter(Boolean).length) falses = t(LanguageKeys.Arguments.BoolFalseOptions, { lng: 'en-US' });

		if (truths.includes(boolean)) return this.ok(true);
		if (falses.includes(boolean)) return this.ok(false);

		const possibles = truths.concat(falses);
		return this.error({ parameter, identifier: Identifiers.ArgumentBoolean, context: { ...context, possibles, count: possibles.length } });
	}
}
