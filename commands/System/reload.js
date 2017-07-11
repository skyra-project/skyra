const Command = require("../../classes/command");

/* eslint-disable class-methods-use-this */
module.exports = class Reload extends Command {

    constructor(...args) {
        super(...args, "reboot", {
            aliases: ["r", "load"],
            permLevel: 10,
            mode: 2,

            usage: "<inhibitor|finalizer|monitor|event|command> <name:str>",
            usageDelim: " ",
            description: "Reloads the command file, if it's been updated or modified.",
        });
    }

    async run(msg, [type, name]) {
        return this[type](msg, name);
    }

    async inhibitor(msg, name) {
        if (name === "all") {
            await this.client.funcs.loadCommandInhibitors();
            await Promise.all(this.client.commandInhibitors.map((piece) => {
                if (piece.init) return piece.init(this.client);
                return true;
            }));
            return msg.send("✅ Reloaded all inhibitors.");
        }
        await msg.send(`Attempting to reload inhibitor ${name}`);
        return this.client.funcs.reloadInhibitor(name)
            .then(mes => msg.send(`✅ ${mes}`))
            .catch(err => msg.send(`❌ ${err}`));
    }

    async finalizer(msg, name) {
        if (name === "all") {
            await this.client.funcs.loadCommandFinalizers();
            await Promise.all(this.client.commandFinalizers.map((piece) => {
                if (piece.init) return piece.init(this.client);
                return true;
            }));
            return msg.send("✅ Reloaded all finalizers.");
        }
        await msg.send(`Attempting to reload finalizer ${name}`);
        return this.client.funcs.reloadFinalizer(name)
            .then(mes => msg.send(`✅ ${mes}`))
            .catch(err => msg.send(`❌ ${err}`));
    }

    async monitor(msg, name) {
        if (name === "all") {
            await this.client.funcs.loadMessageMonitors();
            await Promise.all(this.client.messageMonitors.map((piece) => {
                if (piece.init) return piece.init(this.client);
                return true;
            }));
            return msg.send("✅ Reloaded all monitors.");
        }
        await msg.send(`Attempting to reload monitor: ${name}`);
        return this.client.funcs.reloadMessageMonitor(name)
            .then(mes => msg.send(`✅ ${mes}`))
            .catch(err => msg.send(`❌ ${err}`));
    }

    async event(msg, name) {
        if (name === "all") {
            await this.client.funcs.loadEvents();
            return msg.send("✅ Reloaded all events.");
        }
        await msg.send(`Attempting to reload event: ${name}`);
        return this.client.funcs.reloadEvent(name)
            .then(mes => msg.send(`✅ ${mes}`))
            .catch(err => msg.send(`❌ ${err}`));
    }

    async command(msg, name) {
        if (name === "all") {
            await this.client.funcs.loadCommands();
            await Promise.all(this.client.commands.map((piece) => {
                if (piece.init) return piece.init(this.client);
                return true;
            }));
            return msg.send("✅ Reloaded all commands.");
        }
        await msg.send(`Attempting to reload command ${name}`);
        return this.client.funcs.reloadCommand(name)
            .then(mes => msg.send(`✅ ${mes}`))
            .catch(err => msg.send(`❌ ${err}`));
    }

};
