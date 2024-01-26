import { ApplyOptions } from '@sapphire/decorators';
import { Command, Events, Listener, LogLevel, type MessageCommandSuccessPayload } from '@sapphire/framework';
import { cyan } from 'colorette';
import type { Guild, User } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.MessageCommandSuccess })
export class UserListener extends Listener<typeof Events.MessageCommandSuccess> {
	public run({ message, command }: MessageCommandSuccessPayload) {
		const shard = this.shard(message.guild?.shardId ?? 0);
		const commandName = this.command(command);
		const author = this.author(message.author);
		const sentAt = message.guild ? this.guild(message.guild) : this.direct();
		this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`);
	}

	public override onLoad() {
		this.enabled = this.container.logger.has(LogLevel.Debug);
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
