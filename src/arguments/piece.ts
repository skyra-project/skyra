import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Piece } from '@sapphire/framework';

export class UserArgument extends Argument<Piece> {
	public run(parameter: string, context: Argument.Context) {
		for (const store of this.container.stores.values()) {
			const piece = store.get(parameter);
			if (piece) return this.ok(piece);
		}
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Piece, context });
	}
}
