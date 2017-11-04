const snekfetch = require('snekfetch');

class Hastebin {

	static async upload(text) {
		const res = await snekfetch.post('https://hastebin.com/documents').send(text).catch((err) => { throw err; });
		return `https://hastebin.com/${res.body.key}.js`;
	}

	static async download(url) {
		const res = await snekfetch.get(url).catch((err) => { throw err; });
		return res.text;
	}

}

module.exports = Hastebin;
