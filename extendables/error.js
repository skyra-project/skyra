const { structures: { Extendable }, util: { util } } = require('../index');

const isException = (error) => error && error.constructor ? error.constructor.name.endsWith('Error') : false;

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message']);
	}

	extend(content, log = false) {
		if (!content) return null;
		if (log) this.client.emit('log', content, 'error');

		if (typeof error === 'string')
			return this.alert(this.language.get('ERROR_STRING', this.author, content));

		if (isException(content)) {
			this.client.emit('log', `${content.code ? `[${content.code}] ` : ''}ERROR: /${this.guild ? this.guild.id : 'DM'}/${this.channel.id}/${this.id}/${this.cmd ? `CMD:${this.cmd.name}` : ''} (${this.author.id}) | ${content.constructor.name}`, 'warn');
			this.client.emit('log', content, 'wtf');
			content = this.author.id === '242043489611808769'
				? content.stack || content.message
				: this.language.get('ERROR_WTF');
		} else
			content = content.stack && this.author.id === '242043489611808769'
				? content.stack
				: content.message || content;

		return this.alert(`|\`❌\`| **ERROR**:\n${util.codeBlock('js', content)}`);
	}

};
