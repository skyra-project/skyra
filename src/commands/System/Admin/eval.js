const { Command, Stopwatch, Type, util } = require('klasa');
const { inspect } = require('util');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ev'],
			description: (msg) => msg.language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>'
		});

		this.timeout = 30000;
	}

	async run(msg, [code]) {
		const flagTime = 'no-timeout' in msg.flags ? 'wait' in msg.flags ? Number(msg.flags.wait) : this.timeout : Infinity;
		const language = msg.flags.lang || msg.flags.language || (msg.flags.json ? 'json' : 'js');
		const { success, result, time, type } = await this.timedEval(msg, code, flagTime);

		if (msg.flags.silent) {
			if (!success && result && result.stack) this.client.emit('error', result.stack);
			return null;
		}

		const footer = util.codeBlock('ts', type);
		const sendAs = msg.flags.output || msg.flags['output-to'] || (msg.flags.log ? 'log' : null);
		return this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
	}

	async handleMessage(msg, options, { success, result, time, footer, language }) {
		switch (options.sendAs) {
			case 'file': {
				if (msg.channel.attachable) return msg.channel.sendFile(Buffer.from(result), 'output.txt', msg.language.get('COMMAND_EVAL_OUTPUT_FILE', time, footer));
				await this.getTypeOutput(msg, options);
				return this.handleMessage(msg, options, { success, result, time, footer, language });
			}
			case 'haste':
			case 'hastebin': {
				if (!options.url) options.url = await this.getHaste(result, language).catch(() => null);
				if (options.url) return msg.sendLocale('COMMAND_EVAL_OUTPUT_HASTEBIN', [time, options.url, footer]);
				options.hastebinUnavailable = true;
				await this.getTypeOutput(msg, options);
				return this.handleMessage(msg, options, { success, result, time, footer, language });
			}
			case 'console':
			case 'log': {
				this.client.emit('log', result);
				return msg.sendLocale('COMMAND_EVAL_OUTPUT_CONSOLE', [time, footer]);
			}
			case 'none':
				return null;
			default: {
				if (result.length > 2000) {
					await this.getTypeOutput(msg, options);
					return this.handleMessage(msg, options, { success, result, time, footer, language });
				}
				return msg.sendMessage(msg.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
					time, util.codeBlock(language, result), footer));
			}
		}
	}

	async getTypeOutput(msg, options) {
		const _options = ['log'];
		if (msg.channel.attachable) _options.push('file');
		if (!options.hastebinUnavailable) _options.push('hastebin');
		let _choice;
		do
			_choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
		while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none', null].includes(_choice.content));
		options.sendAs = _choice.content;
	}

	timedEval(msg, code, flagTime) {
		if (flagTime === Infinity || flagTime === 0) return this.eval(msg, code);
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
		let type;
		try {
			if (msg.flags.async) code = `(async () => {\n${code}\n})();`;
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (util.isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (!type) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = result instanceof Error ? result.stack : msg.flags.json ? JSON.stringify(result, null, 4) : inspect(result, {
				depth: msg.flags.depth ? parseInt(msg.flags.depth) || 0 : 0,
				showHidden: Boolean(msg.flags.showHidden)
			});
		}
		return { success, type, time: this.formatTime(syncTime, asyncTime), result: util.clean(result) };
	}

	formatTime(syncTime, asyncTime) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	async getHaste(evalResult, language) {
		const key = await fetch('https://hastebin.com/documents', { method: 'POST', body: evalResult })
			.then(response => response.json())
			.then(body => body.key);
		return `https://hastebin.com/${key}.${language}`;
	}

};
