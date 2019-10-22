import { Inhibitor, KlasaMessage, InhibitorStore, Finalizer } from 'klasa';
import { SkyraCommand } from '../lib/structures/SkyraCommand';

export default class extends Inhibitor {

	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			spamProtection: true
		});
	}

	public run(message: KlasaMessage, command: SkyraCommand) {
		if (this.client.owners.has(message.author!) || command.cooldown <= 0) return;

		let existing: Cooldown;

		try {
			const finalizer = this.client.finalizers.get('commandCooldown') as CommandCooldown;
			existing = finalizer.getCooldown(message, command);
		} catch (err) {
			return;
		}

		if (existing && existing.limited) throw message.language.tget('INHIBITOR_COOLDOWN', Math.ceil(existing.remainingTime / 1000));
	}

}

interface CommandCooldown extends Finalizer {
	getCooldown(message: KlasaMessage, command: SkyraCommand): Cooldown;
}

interface Cooldown {
	limited: boolean;
	remainingTime: number;
}
