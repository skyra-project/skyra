import { ApplyOptions } from '@skyra/decorators';
import { Colors, KlasaMessage, Monitor, MonitorOptions } from 'klasa';

@ApplyOptions<MonitorOptions>({
	ignoreBots: false,
	ignoreEdits: false,
	ignoreOthers: false,
	ignoreSelf: false,
	ignoreWebhooks: false
})
export default class extends Monitor {

	private kDebugColours = new Colors({ background: 'black', text: 'red' });
	private kUserColours = new Colors({ background: 'yellow', text: 'black' });
	private kShardColours = new Colors({ background: 'cyan', text: 'black' });
	private kChannelColours: Record<string, Colors> = {
		text: new Colors({ background: 'green', text: 'black' }),
		dm: new Colors({ background: 'magenta' })
	};

	public run(message: KlasaMessage) {
		if (!message.command) return;

		const { type } = message.channel;
		const shard = message.guild ? message.guild.shardID : 0;
		this.client.emit('debug', [
			this.kDebugColours.format('[Pre-Command-Run Debug Log]'),
			this.kShardColours.format(`[${shard}]`),
			`${message.command.name}(${message.args ? message.args.join(', ') : ''})`,
			this.kUserColours.format(`${message.author.username}[${message.author.id}]`),
			this.kChannelColours[type].format(type === 'text' ? this.text(message) : this.dm())
		].join(' '));
	}

	private text(message: KlasaMessage) {
		return `${message.guild?.name}[${message.guild?.id}]`;
	}

	private dm() {
		return 'Direct Messages';
	}

}
