import { GuildSettings } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(message: KlasaMessage, command: SkyraCommand) {
		if (!command.enabled || !message.guild) return;

		const [disabledChannels, disabledCommandChannels] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.DisabledChannels],
			settings[GuildSettings.DisabledCommandChannels]
		]);

		if (disabledChannels.includes(message.channel.id)) {
			if (await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return;
			throw true;
		}

		const disabledCommandChannel = disabledCommandChannels.find((d) => d.channel === message.channel.id);
		if (disabledCommandChannel && disabledCommandChannel.commands.includes(command.name)) {
			if (await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return;
			throw true;
		}
	}
}
