import { Inhibitor, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../lib/structures/SkyraCommand';
import { GuildSettingsDisabledCommandsChannels } from '../lib/types/Misc';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: SkyraCommand): Promise<void> {
		if (!command.enabled || !message.guild) return;

		const disabledChannels = message.guild.settings.get('disabledChannels') as string[];
		if (disabledChannels.includes(message.channel.id)) {
			if (await message.hasAtLeastPermissionLevel(5)) return;
			throw true;
		}

		const disabledCommandChannels = message.guild.settings.get('disabledCommandsChannels') as GuildSettingsDisabledCommandsChannels;
		const disabledCommandChannel = disabledCommandChannels.find((d) => d.channel === message.channel.id);
		if (disabledCommandChannel && disabledCommandChannel.commands.includes(command.name)) {
			if (await message.hasAtLeastPermissionLevel(5)) return;
			throw true;
		}
	}

}
