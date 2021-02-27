import { CommandMatcher, GuildEntity, GuildSettings } from '#lib/database';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends Precondition {
	public run(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
		return message.guild ? this.runGuild(message as GuildMessage, command, context) : this.runDM(command, context);
	}

	private runDM(command: Command, context: Precondition.Context): Precondition.Result {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
	}

	private async runGuild(message: GuildMessage, command: Command, context: Precondition.Context): Precondition.AsyncResult {
		const disabled = await message.guild.readSettings((settings) => this.checkGuildDisabled(settings, message, command as SkyraCommand));
		if (disabled) {
			const isModerator = await message.member.isModerator();
			if (!isModerator) return this.error({ context: { ...context, silent: true } });
		}

		return this.runDM(command, context);
	}

	private checkGuildDisabled(settings: GuildEntity, message: GuildMessage, command: SkyraCommand) {
		if (settings[GuildSettings.DisabledChannels].includes(message.channel.id)) return true;
		if (CommandMatcher.matchAny(settings[GuildSettings.DisabledCommands], command)) return true;

		const entry = settings[GuildSettings.DisabledCommandChannels].find((d) => d.channel === message.channel.id);
		if (entry === undefined) return false;

		return CommandMatcher.matchAny(entry.commands, command);
	}
}
