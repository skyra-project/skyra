import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Piece } from '@sapphire/framework';

export class UserArgument extends Argument<Piece> {
	public async run(parameter: string) {
		for (const store of this.context.stores.values()) {
			const piece = store.get(parameter);
			if (piece) return this.ok(piece);
		}
		return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidPiece });
	}
}
