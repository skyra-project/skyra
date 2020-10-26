import { Queue } from '@lib/audio';
import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { Permissions, VoiceChannel } from 'discord.js';
const { FLAGS } = Permissions;

@ApplyOptions<MusicCommand.Options>({
	aliases: ['connect'],
	description: (language) => language.get(LanguageKeys.Commands.Music.JoinDescription)
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: GuildMessage) {
		// Get the voice channel the member is in
		const { channel } = message.member.voice;

		// If the member is not in a voice channel then throw
		if (!channel) throw message.language.get(LanguageKeys.Commands.Music.JoinNoVoicechannel);

		const { audio } = message.guild;

		// Check if the bot is already playing in this guild
		this.checkSkyraPlaying(message, audio, channel);

		// Ensure Skyra has the correct permissions to play music
		this.resolvePermissions(message, channel);

		// Set the ChannelID to the current channel
		await audio.setTextChannelID(message.channel.id);

		try {
			// Connect to Lavalink and join the voice channel
			await audio.connect(channel.id);
		} catch {
			return message.sendLocale(LanguageKeys.Commands.Music.JoinFailed);
		}

		return message.sendLocale(LanguageKeys.Commands.Music.JoinSuccess, [{ channel: `<#${channel.id}>` }]);
	}

	private resolvePermissions(message: GuildMessage, voiceChannel: VoiceChannel): void {
		const permissions = voiceChannel.permissionsFor(message.guild.me!)!;

		// Administrators can join voice channels even if they are full
		if (voiceChannel.full && !permissions.has(FLAGS.ADMINISTRATOR)) throw message.language.get(LanguageKeys.Commands.Music.JoinVoiceFull);
		if (!permissions.has(FLAGS.CONNECT)) throw message.language.get(LanguageKeys.Commands.Music.JoinVoiceNoConnect);
		if (!permissions.has(FLAGS.SPEAK)) throw message.language.get(LanguageKeys.Commands.Music.JoinVoiceNoSpeak);
	}

	private checkSkyraPlaying(message: GuildMessage, audio: Queue, voiceChannel: VoiceChannel) {
		const selfVoiceChannel = audio.player.playing ? audio.voiceChannelID : null;
		if (selfVoiceChannel === null) return;

		throw message.language.get(
			voiceChannel.id === selfVoiceChannel ? LanguageKeys.Commands.Music.JoinVoiceSame : LanguageKeys.Commands.Music.JoinVoiceDifferent
		);
	}
}
