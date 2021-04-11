import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ColorHandler } from '#lib/structures';
import { parse } from '#utils/Color';
import { Argument, ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';

export class CoreArgument extends Argument<ColorHandler> {
	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<ColorHandler> {
		const color = parse(parameter);
		return color === null ? this.error({ parameter, identifier: LanguageKeys.Arguments.Color, context }) : this.ok(color);
	}
}
