import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Finalizer, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			spamProtection: true
		});
	}

	public async run(message: KlasaMessage, command: SkyraCommand) {
		if (this.client.owners.has(message.author) || command.cooldown <= 0) return;

		let existing: Cooldown | undefined = undefined;

		try {
			const finalizer = this.client.finalizers.get('commandCooldown') as CommandCooldown;
			existing = finalizer.getCooldown(message, command);
		} catch (err) {
			return;
		}

		if (existing && existing.limited) {
			const language = await message.fetchLanguage();
			throw language.get(LanguageKeys.Inhibitors.Cooldown, { remaining: language.duration(existing.remainingTime) });
		}
	}
}

interface CommandCooldown extends Finalizer {
	getCooldown(message: KlasaMessage, command: SkyraCommand): Cooldown;
}

interface Cooldown {
	limited: boolean;
	remainingTime: number;
}
