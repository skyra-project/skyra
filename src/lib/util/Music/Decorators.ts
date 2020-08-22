import { createFunctionInhibitor } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

export function requireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && !message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicNotPlaying')
	);
}

export function requireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicPaused')
	);
}

export function requireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.song !== null),
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicNothingPlaying')
	);
}

export function requireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.isDJ,
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicDjMember')
	);
}

export function requireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.queue && message.guild!.music.queue.length),
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicQueueEmpty')
	);
}

export function requireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel !== null,
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicUserVoiceChannel')
	);
}

export function requireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.guild!.music.voiceChannel !== null,
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicBotVoiceChannel')
	);
}

export function requireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel!.id === message.guild!.music.voiceChannel!.id,
		(message: KlasaMessage) => message.sendLocale('inhibitorMusicBothVoiceChannel')
	);
}
