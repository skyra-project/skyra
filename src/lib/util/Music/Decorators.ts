import { createFunctionInhibitor } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

export function requireMusicPlaying(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && !message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_NOT_PLAYING')
	);
}

export function requireMusicPaused(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.paused),
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_PAUSED')
	);
}

export function requireSongPresent(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.playing && message.guild!.music.song !== null),
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_NOTHING_PLAYING')
	);
}

export function requireDj(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.isDJ,
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_DJ_MEMBER')
	);
}

export function requireQueueNotEmpty(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => Boolean(message.guild!.music.queue && message.guild!.music.queue.length),
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_QUEUE_EMPTY')
	);
}

export function requireUserInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel !== null,
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_USER_VOICE_CHANNEL')
	);
}

export function requireSkyraInVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.guild!.music.voiceChannel !== null,
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_BOT_VOICE_CHANNEL')
	);
}

export function requireSameVoiceChannel(): MethodDecorator {
	return createFunctionInhibitor(
		(message: KlasaMessage) => message.member!.voice.channel!.id === message.guild!.music.voiceChannel!.id,
		(message: KlasaMessage) => message.sendLocale('INHIBITOR_MUSIC_BOTH_VOICE_CHANNEL')
	);
}

