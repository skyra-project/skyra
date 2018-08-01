const { Command, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const { Canvas } = require('canvas-constructor');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_THESEARCH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_THESEARCH_EXTENDED'),
			runIn: ['text'],
			usage: '<text:string>'
		});

		this.spam = true;
		this.template = null;
	}

	async run(msg, [text]) {
		const attachment = await this.generate(text);
		return msg.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	generate(text) {
		return new Canvas(700, 612)
			.addImage(this.template, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectPath(61, 335, 156, 60)
			.clip()
			.addMultilineText(text.toUpperCase(), 139, 360, 156, 28)
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/TheSearch.png'));
	}

};
