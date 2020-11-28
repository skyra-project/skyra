import type { GuildMessage } from '#lib/types/Discord';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { createFunctionInhibitor } from '@skyra/decorators';

export function requireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.playing,
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicNotPlaying)
	);
}

export function requireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.paused,
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicPaused)
	);
}

export function requireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.getCurrentTrack().then((value) => value !== null),
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicNothingPlaying)
	);
}

export function requireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.isDJ(),
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicDjMember)
	);
}

export function requireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.canStart(),
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicQueueEmpty)
	);
}

export function requireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channel !== null,
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicUserVoiceChannel)
	);
}

export function requireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.guild.audio.voiceChannelID !== null,
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicBotVoiceChannel)
	);
}

export function requireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channelID === message.guild.audio.voiceChannelID,
		(message: GuildMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicBothVoiceChannel)
	);
}
