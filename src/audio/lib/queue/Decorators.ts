import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { createFunctionInhibitor } from '#utils/decorators';

export function requireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.playing,
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicNotPlaying)
	);
}

export function requireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.paused,
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicPaused)
	);
}

export function requireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.getCurrentTrack().then((value) => value !== null),
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicNothingPlaying)
	);
}

export function requireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.isDJ(),
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicDjMember)
	);
}

export function requireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.canStart(),
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicQueueEmpty)
	);
}

export function requireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channel !== null,
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicUserVoiceChannel)
	);
}

export function requireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.voiceChannelID !== null,
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicBotVoiceChannel)
	);
}

export function requireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channelID === message.guild.audio.voiceChannelID,
		(message: GuildMessage) => message.sendTranslated(LanguageKeys.Preconditions.MusicBothVoiceChannel)
	);
}
