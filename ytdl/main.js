const snekie = require('snekfetch');
const ytdl = require('ytdl-core');
const fsn = require('fs-nextra');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(require('child_process').exec);
const getInfoAsync = util.promisify(ytdl.getInfo);

module.exports = async (id) => {
	if (typeof id !== 'string') return null;

	const result = await getInfoAsync(`https://youtu.be/${id}`).catch(() => { throw undefined; });
	return parseResult(result, result.formats.find(form => form.type === 'audio/mp4; codecs="mp4a.40.2"'));
};

async function parseResult(result, format) {
	const filetitle = sanitize(result.title);
	const filepath = path.join(__dirname, 'downloads', filetitle);
	const exists = await fsn.exists(`${filepath}.mp3`).catch(() => false);
	if (exists === false) {
		const data = await snekie.get(format.url);
		await fsn.writeFile(`${filepath}.m4a`, data.body);
		await execAsync(`avconv -i "${filepath}.m4a" "${filepath}.mp3" && rm "${filepath}.m4a"`);
	}

	const filebuffer = await fsn.readFile(`${filepath}.mp3`);
	return { filebuffer, filename: `${filetitle}.mp3` };
}

function sanitize(input) {
	return input
		.replace(/[/?<>\\:*|":]/g, '')
        .replace(/[\x00-\x1f\x80-\x9f]/g, '') // eslint-disable-line
		.replace(/^\.+$/, '')
		.replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '')
		.replace(/[. ]+$/, '')
		.replace(/\./g, '-')
		.replace(/ +/g, ' ')
		.slice(0, 150);
}
