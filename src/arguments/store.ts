import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Piece, Store } from '@sapphire/framework';

export class UserArgument extends Argument<Store<Piece>> {
	public possibles: readonly string[] = [];

	public run(parameter: string, context: Argument.Context) {
		for (const store of this.container.stores.values()) {
			if (store.name === parameter) return this.ok(store);
		}
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Store, context: { ...context, possibles: this.possibles } });
	}

	public override onLoad() {
		this.possibles = this.container.stores.map((store) => `\`${store.name}\``);
		return super.onLoad();
	}
}
