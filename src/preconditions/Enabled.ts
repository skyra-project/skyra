import { GuildEntity, GuildSettings } from '#lib/database';
import { GuildMessage } from '#lib/types';
import { Command, Identifiers, Precondition } from '@sapphire/framework';
import type { PieceContext } from '@sapphire/pieces';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public constructor(context: PieceContext) {
		super(context, { position: 10 });
	}

	public run(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
		return message.guild ? this.runGuild(message as GuildMessage, command, context) : this.runDM(command, context);
	}

	private runDM(command: Command, context: Precondition.Context): Precondition.Result {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
	}

	private async runGuild(message: GuildMessage, command: Command, context: Precondition.Context): Precondition.AsyncResult {
		const disabled = await message.guild.readSettings((settings) => this.checkGuildDisabled(settings, message, command));
		if (disabled) {
			const isModerator = await message.member.isModerator();
			if (!isModerator) return this.error({ context: { ...context, silent: true } });
		}

		return this.runDM(command, context);
	}

	private checkGuildDisabled(settings: GuildEntity, message: GuildMessage, command: Command) {
		if (settings[GuildSettings.DisabledCommands].includes(command.name)) return true;
		if (settings[GuildSettings.DisabledChannels].includes(message.channel.id)) return true;

		const entry = settings[GuildSettings.DisabledCommandChannels].find((d) => d.channel === message.channel.id);
		if (entry === undefined) return false;

		return entry.commands.includes(command.name);
	}
}
