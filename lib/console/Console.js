const { Console } = require('console');
const Colors = require('./Colors');
const moment = require('moment');
const { inspect } = require('util');

class SkyraConsole extends Console {

    /**
     * @param {boolean} [stdout=process.stdout] The location of standard output. Must be a writable stream.
     * @param {boolean} [stderr=process.stderr] The location of standrad error outputt. Must be a writable stream.
     * @param {boolean} [timestamps=false]      Whether or not Timestamps should be enabled.
     */
    constructor({ stdout, stderr, timestamps = false }) {
        super(stdout, stderr);

        Object.defineProperty(this, 'stdout', { value: stdout });
        Object.defineProperty(this, 'stderr', { value: stderr });

        this.timestamps = timestamps;
        this.colors = {
            debug: {
                type: 'log',
                message: { background: null, text: null, style: null },
                time: { background: null, text: 'magenta', style: null }
            },
            error: {
                type: 'error',
                message: { background: null, text: null, style: null },
                time: { background: 'red', text: null, style: null }
            },
            log: {
                type: 'log',
                message: { background: null, text: null, style: null },
                time: { background: null, text: 'lightblue', style: null }
            },
            verbose: {
                type: 'log',
                message: { background: null, text: 'gray', style: null },
                time: { background: null, text: 'gray', style: null }
            },
            warn: {
                type: 'warn',
                message: { background: null, text: null, style: null },
                time: { background: null, text: 'lightyellow', style: null }
            },
            wtf: {
                type: 'error',
                message: { background: null, text: 'red', style: null },
                time: { background: 'red', text: null, style: null }
            }
        };
    }

    log(stuff, type = 'log') {
        stuff = SkyraConsole.flatten(stuff);
        const color = this.colors[type];
        const message = color.message;
        const time = color.time;

        const timestamp = this.timestamps ? `[${moment().format('YYYY-MM-DD HH:mm:ss')}]` : null;
        const prefix = timestamp ? `${this.timestamp(timestamp, time)} ` : '';

        super[color.type](stuff.split('\n').map(str => prefix + this.messages(str, message)).join('\n'));
    }

    timestamp(timestamp, time) {
        return Colors.format(timestamp, time);
    }

    messages(string, message) {
        return Colors.format(string, message);
    }

    static flatten(data) {
        data = data.stack || data.message || data;
        if (typeof data === 'object' && typeof data !== 'string' && !Array.isArray(data)) data = inspect(data, { depth: 0, colors: true });
        if (Array.isArray(data)) data = data.join('\n');
        return data;
    }

}

module.exports = SkyraConsole;
