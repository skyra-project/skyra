import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, Piece } from '@sapphire/framework';

export class UserArgument extends Argument<Piece> {
	public async run(parameter: string, context: ArgumentContext) {
		for (const store of this.context.stores.values()) {
			const piece = store.get(parameter);
			if (piece) return this.ok(piece);
		}
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Piece, context });
	}
}
