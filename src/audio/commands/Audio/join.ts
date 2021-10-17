import { AudioCommand, Queue, RequireUserInVoiceChannel } from '#lib/audio';
import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { send } from '@sapphire/plugin-editable-commands';
import { Permissions } from 'discord.js';

const { FLAGS } = Permissions;

@ApplyOptions<AudioCommand.Options>({
	aliases: ['connect'],
	description: LanguageKeys.Commands.Music.JoinDescription,
	detailedDescription: LanguageKeys.Commands.Music.JoinExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireUserInVoiceChannel()
	public async messageRun(message: GuildMessage, args: AudioCommand.Args) {
		// Get the voice channel the member is in
		const { channel } = message.member.voice;

		// If the member is not in a voice channel then throw
		if (!channel) this.error(LanguageKeys.Commands.Music.JoinNoVoiceChannel);

		// Check if the channel is allowed
		await this.checkAllowedChannel(message, channel);

		const audio = getAudio(message.guild);

		// Check if the bot is already playing in this guild
		this.checkSkyraPlaying(audio, channel);

		// Ensure Skyra has the correct permissions to play music
		this.resolvePermissions(message, channel);

		// Set the ChannelId to the current channel
		await audio.setTextChannelId(message.channel.id);

		try {
			// Connect to Lavalink and join the voice channel
			await audio.connect(channel.id);
		} catch {
			const content = args.t(LanguageKeys.Commands.Music.JoinFailed);
			return send(message, content);
		}

		const content = args.t(LanguageKeys.Commands.Music.JoinSuccess, { channel: `<#${channel.id}>` });
		return send(message, content);
	}

	private resolvePermissions(message: GuildMessage, voiceChannel: VoiceBasedChannelTypes): void {
		const permissions = voiceChannel.permissionsFor(message.guild.me!)!;

		// Administrators can join voice channels even if they are full
		if (voiceChannel.full && !permissions.has(FLAGS.ADMINISTRATOR)) this.error(LanguageKeys.Commands.Music.JoinVoiceFull);
		if (!permissions.has(FLAGS.CONNECT)) this.error(LanguageKeys.Commands.Music.JoinVoiceNoConnect);
		if (!permissions.has(FLAGS.SPEAK)) this.error(LanguageKeys.Commands.Music.JoinVoiceNoSpeak);
	}

	private checkSkyraPlaying(audio: Queue, voiceChannel: VoiceBasedChannelTypes): void {
		const selfVoiceChannel = audio.player.playing ? audio.voiceChannelId : null;
		if (selfVoiceChannel === null) return;

		this.error(voiceChannel.id === selfVoiceChannel ? LanguageKeys.Commands.Music.JoinVoiceSame : LanguageKeys.Commands.Music.JoinVoiceDifferent);
	}

	private async checkAllowedChannel(message: GuildMessage, voiceChannel: VoiceBasedChannelTypes): Promise<void> {
		const allowedChannels = await readSettings(message.guild, GuildSettings.Music.AllowedVoiceChannels);
		if (allowedChannels.length === 0) return;
		if (allowedChannels.includes(voiceChannel.id)) return;
		this.error(LanguageKeys.Commands.Music.JoinVoiceNotAllowed, { channel: voiceChannel.toString() });
	}
}
