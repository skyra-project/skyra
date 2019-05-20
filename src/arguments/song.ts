import { Argument, KlasaMessage, Possible } from 'klasa';
import { Track } from 'lavalink';
import { URL } from 'url';

export default class extends Argument {

	public async run(arg: string, _: Possible, message: KlasaMessage): Promise<any> {
		if (!arg) throw message.language.get('MUSICMANAGER_FETCH_NO_ARGUMENTS');
		if (!message.guild) return null;

		arg = arg.replace(/<(.+)>/g, '$1');
		const parsedURL = this.parseURL(arg);
		if (parsedURL) {
			const tracks = await message.guild.music.fetch(arg);
			return parsedURL.playlist ? tracks : tracks[0];
		} else if (('sc' in message.flags) || ('soundcloud' in message.flags)) {
			const tracks = await message.guild.music.fetch(`scsearch: ${arg}`);
			return tracks[0];
		}
		const tracks = await message.guild.music.fetch(`ytsearch: ${arg}`).catch(() => [] as Track[]);
		if (!tracks.length) tracks.push(...await message.guild.music.fetch(`scsearch: ${arg}`).catch(() => [] as Track[]));
		if (!tracks.length) throw message.language.get('MUSICMANAGER_FETCH_NO_MATCHES');
		return tracks[0];
	}

	public parseURL(url: string): { url: string; playlist: boolean } {
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
