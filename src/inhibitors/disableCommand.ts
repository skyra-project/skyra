import { GuildEntity, GuildSettings } from '#lib/database';
import type { SkyraCommand } from '#lib/structures/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { isNullish } from '@sapphire/utilities';
import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public run(message: KlasaMessage, command: SkyraCommand) {
		return message.guild ? this.runGuild(message as GuildMessage, command) : this.runDM(message, command);
	}

	private async runDM(message: KlasaMessage, command: SkyraCommand) {
		if (!command.enabled) throw await message.resolveKey(LanguageKeys.Inhibitors.DisabledGlobal);
	}

	private async runGuild(message: GuildMessage, command: SkyraCommand) {
		const [disabled, t] = await message.guild.readSettings((settings) => [
			this.checkGuildDisabled(settings, message, command),
			settings.getLanguage()
		]);

		if (disabled) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) throw true;
		}

		if (!command.enabled) throw t(LanguageKeys.Inhibitors.DisabledGlobal);
	}

	private checkGuildDisabled(settings: GuildEntity, message: GuildMessage, command: SkyraCommand) {
		if (settings[GuildSettings.DisabledCommands].includes(command.name)) return true;
		if (settings[GuildSettings.DisabledChannels].includes(message.channel.id)) return true;

		const entry = settings[GuildSettings.DisabledCommandChannels].find((d) => d.channel === message.channel.id);
		if (isNullish(entry)) return false;

		return entry.commands.includes(command.name);
	}
}
