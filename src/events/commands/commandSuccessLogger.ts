import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandSuccessPayload, Event, EventOptions, Events, LogLevel } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { cyan } from 'colorette';
import type { Guild, User } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export class UserEvent extends Event {
	public run({ message, command }: CommandSuccessPayload) {
		const shard = this.shard(message.guild?.shardID ?? 0);
		const commandName = this.command(command);
		const author = this.author(message.author);
		const sentAt = message.guild ? this.guild(message.guild) : this.direct();
		this.context.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`);
	}

	public onLoad() {
		this.enabled = (this.context.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}

	private shard(id: number) {
		return `[${cyan(id.toString())}]`;
	}

	private command(command: Command) {
		return cyan(command.name);
	}

	private author(author: User) {
		return `${author.username}[${cyan(author.id)}]`;
	}

	private direct() {
		return cyan('Direct Messages');
	}

	private guild(guild: Guild) {
		return `${guild.name}[${cyan(guild.id)}]`;
	}
}
