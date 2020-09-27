import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { createFunctionInhibitor } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

export function requireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && !message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicNotPlaying)
	);
}

export function requireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicPaused)
	);
}

export function requireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.song !== null),
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicNothingPlaying)
	);
}

export function requireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.isDJ,
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicDjMember)
	);
}

export function requireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.queue && message.guild!.music.queue.length),
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicQueueEmpty)
	);
}

export function requireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel !== null,
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicUserVoiceChannel)
	);
}

export function requireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.guild!.music.voiceChannel !== null,
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicBotVoiceChannel)
	);
}

export function requireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel!.id === message.guild!.music.voiceChannel!.id,
		(message: KlasaMessage) => message.sendLocale(LanguageKeys.Inhibitors.MusicBothVoiceChannel)
	);
}
