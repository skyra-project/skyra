import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Piece, Store } from '@sapphire/framework';

export class UserArgument extends Argument<Store<Piece>> {
	public async run(parameter: string) {
		for (const store of this.context.stores.values()) {
			if (store.name === parameter) return this.ok(store);
		}
		return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidStore });
	}
}
