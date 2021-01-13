import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Message } from 'discord.js';
import { Event, Inhibitor, InhibitorStore } from 'klasa';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			spamProtection: true
		});
	}

	public async run(message: Message, command: SkyraCommand) {
		if (this.client.owners.has(message.author) || command.cooldown <= 0) return;

		let existing: Cooldown | undefined = undefined;

		try {
			const event = this.client.events.get('commandSuccessCooldown') as CommandCooldown;
			existing = event.getCooldown(message, command);
		} catch (err) {
			return;
		}

		if (existing && existing.limited) {
			const t = await message.fetchT();
			throw t(LanguageKeys.Inhibitors.Cooldown, { remaining: existing.remainingTime });
		}
	}
}

interface CommandCooldown extends Event {
	getCooldown(message: Message, command: SkyraCommand): Cooldown;
}

interface Cooldown {
	limited: boolean;
	remainingTime: number;
}
