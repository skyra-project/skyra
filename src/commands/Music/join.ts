import { Permissions, VoiceChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
const { FLAGS } = Permissions;

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['connect'],
			description: language => language.tget('COMMAND_JOIN_DESCRIPTION'),
			music: ['USER_VOICE_CHANNEL']
		});
	}

	public async run(message: KlasaMessage) {
		if (!message.member) {
			await message.guild!.members.fetch(message.author.id).catch(() => {
				throw message.language.tget('COMMAND_JOIN_NO_MEMBER');
			});
		}

		const { channel } = message.member!.voice;
		if (!channel) throw message.language.tget('COMMAND_JOIN_NO_VOICECHANNEL');

		let skyraVoiceChannel: VoiceChannel;
		if (message.guild!.music.playing && (skyraVoiceChannel = message.guild!.music.voiceChannel!)) {
			if (channel.id === skyraVoiceChannel.id) throw message.language.tget('COMMAND_JOIN_VOICE_SAME');
			throw message.language.tget('COMMAND_JOIN_VOICE_DIFFERENT');
		}
		this.resolvePermissions(message, channel);

		await message.guild!.music.connect(channel);
		return message.sendLocale('COMMAND_JOIN_SUCCESS', [channel]);
	}

	public resolvePermissions(message: KlasaMessage, voiceChannel: VoiceChannel): void {
		const permissions = voiceChannel.permissionsFor(message.guild!.me!)!;

		// Administrators can join voice channels even if they are full
		if (voiceChannel.full && !permissions.has(FLAGS.ADMINISTRATOR)) throw message.language.tget('COMMAND_JOIN_VOICE_FULL');
		if (!permissions.has(FLAGS.CONNECT)) throw message.language.tget('COMMAND_JOIN_VOICE_NO_CONNECT');
		if (!permissions.has(FLAGS.SPEAK)) throw message.language.tget('COMMAND_JOIN_VOICE_NO_SPEAK');
	}

}
