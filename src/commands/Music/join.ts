import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { Permissions, VoiceChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
const { FLAGS } = Permissions;

@ApplyOptions<MusicCommandOptions>({
	aliases: ['connect'],
	description: language => language.tget('COMMAND_JOIN_DESCRIPTION')
})
export default class extends MusicCommand {

	@requireUserInVoiceChannel()
	public async run(message: KlasaMessage) {
		// Get the voice channel the member is in
		const { channel } = message.member!.voice;

		// If the member is not in a voice channel then throw
		if (!channel) throw message.language.tget('COMMAND_JOIN_NO_VOICECHANNEL');

		// Check if the bot is already playing in this guild
		if (message.guild!.music.playing && message.guild!.music.voiceChannel !== null) {
			throw message.language.tget(
				channel.id === message.guild!.music.voiceChannel.id
					? 'COMMAND_JOIN_VOICE_SAME'
					: 'COMMAND_JOIN_VOICE_DIFFERENT'
			);
		}

		// Ensure Skyra has the correct permissions to play music
		this.resolvePermissions(message, channel);

		// Set the ChannelID to the current channel
		message.guild!.music.channelID = message.channel.id;

		// Check if the MusicHandler already has a voice channel and a player is present
		if (message.guild!.music.voiceChannel && message.guild!.music.player) {
			// Switch voice channels
			await message.guild!.music.switch(channel, this.getContext(message));
		} else {
			// Connect to Lavalink and join the voice channel
			await message.guild!.music.connect(channel, this.getContext(message));
		}

	}

	public resolvePermissions(message: KlasaMessage, voiceChannel: VoiceChannel): void {
		const permissions = voiceChannel.permissionsFor(message.guild!.me!)!;

		// Administrators can join voice channels even if they are full
		if (voiceChannel.full && !permissions.has(FLAGS.ADMINISTRATOR)) throw message.language.tget('COMMAND_JOIN_VOICE_FULL');
		if (!permissions.has(FLAGS.CONNECT)) throw message.language.tget('COMMAND_JOIN_VOICE_NO_CONNECT');
		if (!permissions.has(FLAGS.SPEAK)) throw message.language.tget('COMMAND_JOIN_VOICE_NO_SPEAK');
	}

}
