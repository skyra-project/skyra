const { Command, Stopwatch, util } = require('klasa');
const { inspect } = require('util');
const { post } = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ev'],
			description: (msg) => msg.language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permLevel: 10,
			usage: '<expression:str>'
		});
	}

	async run(msg, [code]) {
		const flagTime = 'wait' in msg.flags ? Number(msg.flags.wait) : 30000;
		const { success, result, time, type } = await this.timedEval(msg, code, flagTime);

		if (msg.flags.silent) {
			if (!success && result && result.stack) this.client.emit('error', result.stack);
			return null;
		}

		const footer = this.client.methods.util.codeBlock('ts', type);
		const sendAs = msg.flags.output || msg.flags['output-to'] || (msg.flags.log ? 'log' : null);
		return this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer });
	}

	async handleMessage(msg, options, { success, result, time, footer }) {
		switch (options.sendAs) {
			case 'file': {
				if (msg.channel.attachable) return msg.channel.sendFile(Buffer.from(result), 'output.txt', msg.language.get('COMMAND_EVAL_OUTPUT_FILE', time, footer));
				await this.getTypeOutput(msg, options);
				return this.handleMessage(msg, options, { success, result, time, footer });
			}
			case 'haste':
			case 'hastebin': {
				if (!options.url) options.url = await this.getHaste(result).catch(() => null);
				if (options.url) return msg.sendMessage(msg.language.get('COMMAND_EVAL_OUTPUT_HASTEBIN', time, options.url, footer));
				options.hastebinUnavailable = true;
				await this.getTypeOutput(msg, options);
				return this.handleMessage(msg, options, { success, result, time, footer });
			}
			case 'console':
			case 'log': {
				this.client.emit('log', result);
				return msg.sendMessage(msg.language.get('COMMAND_EVAL_OUTPUT_CONSOLE', time, footer));
			}
			case 'none':
				return null;
			default: {
				if (result.length > 2000) {
					await this.getTypeOutput(msg, options);
					return this.handleMessage(msg, options, { success, result, time, footer });
				}
				return msg.sendMessage(msg.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
					time, this.client.methods.util.codeBlock('js', result), footer));
			}
		}
	}

	async getTypeOutput(msg, options) {
		const _options = ['log'];
		if (msg.channel.attachable) _options.push('file');
		if (!options.hastebinUnavailable) _options.push('hastebin');
		let _choice;
		do {
			_choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none', null].includes(_choice.content));
		options.sendAs = _choice.content;
	}

	timedEval(msg, code, flagTime) {
		return Promise.race([
			util.sleep(flagTime).then(() => ({
				success: false,
				result: msg.language.get('COMMAND_EVAL_TIMEOUT', flagTime / 1000),
				time: '⏱ ...',
				type: 'EvalTimeoutError'
			})),
			this.eval(msg, code)
		]);
	}

	// Eval the input
	async eval(msg, code) {
		const stopwatch = new Stopwatch();
		let success, syncTime, asyncTime, result;
		let thenable = false;
		let type = '';
		try {
			if (msg.flags.async) code = `(async () => { ${code} })();`;
			result = eval(code);
			syncTime = stopwatch.friendlyDuration;
			if (this.client.methods.util.isThenable(result)) {
				thenable = true;
				type += this.client.methods.util.getTypeName(result);
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.friendlyDuration;
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.friendlyDuration;
			if (thenable && !asyncTime) asyncTime = stopwatch.friendlyDuration;
			result = error;
			success = false;
		}

		stopwatch.stop();
		type += thenable ? `<${this.client.methods.util.getDeepTypeName(result)}>` : this.client.methods.util.getDeepTypeName(result);
		if (success && typeof result !== 'string') {
			result = inspect(result, {
				depth: msg.flags.depth ? parseInt(msg.flags.depth) || 0 : 0,
				showHidden: Boolean(msg.flags.showHidden)
			});
		}
		return { success, type, time: this.formatTime(syncTime, asyncTime), result: this.client.methods.util.clean(result) };
	}

	formatTime(syncTime, asyncTime) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	async getHaste(result) {
		const { body } = await post('https://hastebin.com/documents').send(result);
		return `https://hastebin.com/${body.key}.js`;
	}

};
