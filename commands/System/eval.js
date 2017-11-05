const { structures: { Command }, util: { util, Stopwatch } } = require('../../index');
const { inspect } = require('util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ev'],
			permLevel: 10,
			mode: 2,

			usage: '<expression:string>',
			description: 'Evaluates arbitrary Javascript.'
		});
	}

	async run(msg, [args]) {
		const { type, input } = this.parse(args.split(' '));
		const start = new Stopwatch(5);
		const out = await this.eval(msg, type ? `(async () => { ${input} })()` : input);
		start.stop();
		if (out.success === false && out.output.message) out.output = out.output.message;
		else if (out.output === '') out.output = '<void>';
		return msg.send([
			`Executed in ${start} | ${out.success ? '🔍 **Inspect:**' : '❌ **Error:**'}`,
			util.codeBlock('js', this.clean(out.output))
		]).catch(err => msg.error(err));
	}

	async eval(msg, input) {
		try {
			const res = await eval(input);
			return { success: true, output: res };
		} catch (err) {
			return { success: false, output: err };
		}
	}

	clean(text) {
		if (typeof text === 'object' && typeof text !== 'string') {
			return util.clean(inspect(text, { depth: 0, showHidden: true }));
		}
		return util.clean(String(text));
	}

	parse(toEval) {
		let input;
		let type;
		if (toEval[0] === 'async') {
			input = toEval.slice(1).join(' ');
			type = true;
		} else {
			input = toEval.join(' ');
			type = false;
		}
		return { type, input };
	}

};
