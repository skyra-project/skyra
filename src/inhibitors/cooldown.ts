import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { OWNERS } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Event, Inhibitor, InhibitorOptions } from 'klasa';

@ApplyOptions<InhibitorOptions>({ spamProtection: true })
export default class extends Inhibitor {
	public async run(message: Message, command: SkyraCommand) {
		if (command.cooldown <= 0 || OWNERS.includes(message.author.id)) return;

		let existing: Cooldown | undefined = undefined;

		try {
			const event = this.context.client.events.get('commandSuccessCooldown') as CommandCooldown;
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
