import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage, Monitor, MonitorOptions } from 'klasa';
import { Colors } from '@klasa/console';

@ApplyOptions<MonitorOptions>({
	ignoreBots: false,
	ignoreEdits: false,
	ignoreOthers: false,
	ignoreSelf: false,
	ignoreWebhooks: false
})
export default class extends Monitor {

	private readonly kDebugColours = new Colors({ background: 'black', text: 'red' });
	private readonly kUserColours = new Colors({ background: 'yellow', text: 'black' });
	private readonly kShardColours = new Colors({ background: 'cyan', text: 'black' });
	private readonly kChannelColours: Record<string, Colors> = {
		text: new Colors({ background: 'green', text: 'black' }),
		dm: new Colors({ background: 'magenta' })
	};

	public run(message: KlasaMessage) {
		if (!message.commandText) return undefined;
		if (!message.command) return undefined;

		const { type } = message.channel;
		const shard = message.guild ? message.guild.shardID : 0;
		this.client.emit('debug', [
			this.kDebugColours.format('[Pre-Command-Run Debug Log]'),
			this.kShardColours.format(`[${shard}]`),
			`${message.command.name}(${message.args ? message.args.join(', ') : ''})`,
			this.kUserColours.format(`${message.author.username}[${message.author.id}]`),
			this.kChannelColours[type].format(type === 'dm' ? this.dm() : this.text(message))
		].join(' '));
	}

	private text(message: KlasaMessage) {
		return `${message.guild?.name}[${message.guild?.id}]`;
	}

	private dm() {
		return 'Direct Messages';
	}

}
