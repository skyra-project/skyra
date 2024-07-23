import { CommandMatcher, GuildEntity, readSettings } from '#lib/database';
import type { SkyraCommand } from '#lib/structures';
import { isModerator } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import {
	AllFlowsPrecondition,
	Command,
	Identifiers,
	Precondition,
	type ChatInputCommand,
	type ContextMenuCommand,
	type PreconditionContext,
	type PreconditionResult
} from '@sapphire/framework';
import type { CacheType, ChatInputCommandInteraction, ContextMenuCommandInteraction, Guild, GuildMember, Message } from 'discord.js';

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends AllFlowsPrecondition {
	public override messageRun(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
		return message.guild ? this.runGuild(message.guild!, message.member!, message.channelId, command, context) : this.runDM(command, context);
	}

	public override chatInputRun(
		interaction: ChatInputCommandInteraction<CacheType>,
		command: ChatInputCommand,
		context: PreconditionContext
	): PreconditionResult {
		return interaction.guildId
			? this.runGuild(interaction.guild!, interaction.member as GuildMember, interaction.channelId, command, context)
			: this.runDM(command, context);
	}

	public override contextMenuRun(
		interaction: ContextMenuCommandInteraction<CacheType>,
		command: ContextMenuCommand,
		context: PreconditionContext
	): PreconditionResult {
		return interaction.guildId
			? this.runGuild(interaction.guild!, interaction.member as GuildMember, interaction.channelId, command, context)
			: this.runDM(command, context);
	}

	private runDM(command: Command, context: Precondition.Context): Precondition.Result {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
	}

	private async runGuild(
		guild: Guild,
		member: GuildMember,
		channelId: string,
		command: Command,
		context: Precondition.Context
	): Precondition.AsyncResult {
		const settings = await readSettings(guild);
		const disabled = this.checkGuildDisabled(settings, channelId, command as SkyraCommand);
		if (disabled) {
			const canOverride = await isModerator(member);
			if (!canOverride) return this.error({ context: { ...context, silent: true } });
		}

		return this.runDM(command, context);
	}

	private checkGuildDisabled(settings: GuildEntity, channelId: string, command: SkyraCommand) {
		if (settings.disabledCommands.includes(channelId)) return true;
		if (CommandMatcher.matchAny(settings.disabledCommands, command)) return true;

		const entry = settings.disabledCommandsChannels.find((d) => d.channel === channelId);
		if (entry === undefined) return false;

		return CommandMatcher.matchAny(entry.commands, command);
	}
}
