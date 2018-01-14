const { Extendable } = require('klasa');
const { util } = require('../index');
const snekfetch = require('snekfetch');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Command'], { klasa: true });
	}

	async extend(url, options, type) {
		if (typeof options === 'string' && typeof type === 'undefined') {
			type = options;
			options = undefined;
		}
		const result = await snekfetch.get(url, options)
			.catch(this.constructor.handleError);

		switch (type) {
			case 'json': return JSON.parse(result.text);
			case 'xml': return util.xml2js(result.text);
			case 'text': return result.text;
			case 'buffer': {
				const _buffer = result.body;
				if (_buffer instanceof Buffer) return _buffer;
				throw new Error(`[TYPE:BUFFER] ${url} - Did not return a buffer.`);
			}
			default: return result;
		}
	}

};
