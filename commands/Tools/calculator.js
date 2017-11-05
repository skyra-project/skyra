const { structures: { Command }, util: { util, Stopwatch } } = require('../../index');
const math = require('mathjs');
const limitedEval = math.eval;

function createError() {
	throw new Error('Function import is disabled');
}

let inited = false;
if (inited === false) {
	math.import({
		import: createError,
		createUnit: createError,
		eval: createError,
		parse: createError,
		simplify: createError,
		derivative: createError,
		help: createError
	}, { override: true });
	inited = true;
}

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['calculate', 'calc', 'math'],
			mode: 1,
			cooldown: 10,

			usage: '<equation:string>',
			description: 'Calculate arbitrary maths.',
			extend: {
				EXPLANATION: [
					'Take a look in mathjs.org/docs/index.html#documentation'
				].join(' '),
				ARGUMENTS: '<equation>',
				EXP_USAGE: [
					['equation', 'The math equation to calculate.']
				],
				EXAMPLES: [
					'[3, 5] + [1, sin(6)]',
					'35 degC to degF',
					'120 km/h to km/second'
				],
				REMINDER: 'This command supports matrices, complex numbers, fractions, big numbers, and even, algebra.'
			}
		});
	}

	run(msg, [equation], settings, i18n) {
		const start = new Stopwatch(3);
		try {
			const evaled = limitedEval(equation);
			start.stop();
			return msg.send(i18n.get('COMMAND_CALC', start.friendlyDuration, util.codeBlock('js', util.clean(evaled))));
		} catch (error) {
			start.stop();
			return msg.send(i18n.get('COMMAND_CALC_FAILURE', start.friendlyDuration, util.codeBlock('js', error)));
		}
	}

};
