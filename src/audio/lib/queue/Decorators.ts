import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { createFunctionInhibitor } from '#utils/decorators';
import { getAudio, isDJ, sendLocalizedMessage } from '#utils/functions';

export function RequireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => getAudio(message.guild).playing,
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicNotPlaying)
	);
}

export function RequireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => getAudio(message.guild).paused,
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicPaused)
	);
}

export function RequireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) =>
			getAudio(message.guild)
				.getCurrentTrack()
				.then((value) => value !== null),
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicNothingPlaying)
	);
}

export function RequireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => isDJ(message.member),
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicDjMember)
	);
}

export function RequireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => getAudio(message.guild).canStart(),
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicQueueEmpty)
	);
}

export function RequireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channel !== null,
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicUserVoiceChannel)
	);
}

export function RequireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => getAudio(message.guild).voiceChannelId !== null,
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicBotVoiceChannel)
	);
}

export function RequireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: GuildMessage) => message.member.voice.channelId === getAudio(message.guild).voiceChannelId,
		(message: GuildMessage) => sendLocalizedMessage(message, LanguageKeys.Preconditions.MusicBothVoiceChannel)
	);
}
