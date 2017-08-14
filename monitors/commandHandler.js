const { Monitor, CommandMessage, util: { regExpEsc } } = require('../index');
const friendly = new RegExp('^((?:Hey )?Skyra(?:,|!) +)', 'i');
const now = require('performance-now');

module.exports = class extends Monitor {

    run(msg, settings) {
        const { command, prefix, prefixLength } = this.parseCommand(msg, settings);
        if (!command) return;
        const validCommand = this.client.commands.get(command);
        if (!validCommand) return;
        const start = now();
        this.client.inhibitors.run(msg, validCommand, false, settings)
            .then(() => this.runCommand(this.makeProxy(msg, new CommandMessage(msg, validCommand, prefix, prefixLength)), start, settings))
            .catch((response) => { if (response) msg.reply(response); });
    }

    parseCommand(msg, settings) {
        const prefix = this.getPrefix(msg, settings);
        if (!prefix) return { command: false };
        const prefixLength = prefix.exec(msg.content)[0].length;
        return {
            command: msg.content.slice(prefixLength).trim().split(' ')[0].toLowerCase(),
            prefix,
            prefixLength
        };
    }

    prefixCheck(prefix, str) {
        for (let i = prefix.length - 1; i >= 0; i--) {
            if (str[i] === prefix[i]) continue;
            return false;
        }
        return true;
    }

    getPrefix(msg, settings) {
        const prefix = settings.master.prefix;
        if (this.prefixCheck(prefix, msg.content)) return new RegExp(`^${regExpEsc(prefix)}`);
        if (this.client.config.prefixMention.test(msg.content)) return this.client.config.prefixMention;
        if (friendly.test(msg.content)) return friendly;
        return false;
    }

    makeProxy(msg, cmdMsg) {
        return new Proxy(msg, {
            get: function handler(target, param) {
                return param in msg ? msg[param] : cmdMsg[param];
            }
        });
    }

    runCommand(msg, start, settings) {
        msg.validateArgs()
            .then((params) => msg.cmd.run(msg, params, settings)
                .then(mes => this.client.finalizers.run(msg, mes, start))
                .catch(error => this.handleError(msg, error))
            )
            .catch((error) => this.handleError(msg, error));
    }

    handleError(msg, error) {
        return msg.error(error);
    }

    init() {
        this.ignoreSelf = this.client.user.bot;
    }

};
