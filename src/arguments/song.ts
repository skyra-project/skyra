import { Argument, KlasaMessage, Possible } from 'klasa';
import { Track } from 'lavalink';

export default class extends Argument {

	public async run(arg: string, _: Possible, message: KlasaMessage) {
		if (!arg) throw message.language.tget('MUSICMANAGER_FETCH_NO_ARGUMENTS');
		if (!message.guild) return null;

		arg = arg.replace(/<(.+)>/g, '$1');
		const parsedURL = this.parseURL(arg);
		let returnAll: boolean;
		let tracks: Track[];
		let soundcloud = true;
		if (parsedURL) {
			tracks = await message.guild.music.fetch(arg).catch(() => [] as Track[]);
			returnAll = parsedURL.playlist;
		} else if (('sc' in message.flagArgs) || ('soundcloud' in message.flagArgs)) {
			tracks = await message.guild.music.fetch(`scsearch: ${arg}`).catch(() => [] as Track[]);
			returnAll = false;
			soundcloud = false;
		} else {
			tracks = await message.guild.music.fetch(`ytsearch: ${arg}`).catch(() => [] as Track[]);
			returnAll = false;
		}
		if (!tracks.length) {
			if (soundcloud) tracks.push(...await message.guild.music.fetch(`scsearch: ${arg}`).catch(() => [] as Track[]));
			if (!tracks.length) throw message.language.tget('MUSICMANAGER_FETCH_NO_MATCHES');
		}
		return returnAll ? tracks : tracks[0];
	}

	public parseURL(url: string): { url: string; playlist: boolean } | null {
		try {
			const parsed = new URL(url);
			return parsed.protocol && parsed.hostname && (parsed.protocol === 'https:' || parsed.protocol === 'http:')
				? { url: parsed.href, playlist: parsed.searchParams.has('list') }
				: null;
		} catch (error) {
			return null;
		}
	}

}
