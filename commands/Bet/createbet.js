class Command {
    constructor(client, msg, pool) {
        this.client = client;
        this.msg = msg;
        this.pool = pool;
        this.awaitOptions = {
            errors: ["time"],
            max: 1,
            time: 30000,
        };
    }

    static parseProperty(type, options, output) {
        if (("min" in type && "min" in output) || ("max" in type && "max" in output)) throw "you can't set properties twice.";
        const num = parseInt(options);
        if (isNaN(num)) throw `${options} is not a number.`;
        else if ("min" in type && "max" in output && num > output.max) throw `the max value has been set to ${output.max} and you're trying to set a min value of ${num}, which is not possible.`;
        else if ("max" in type && "min" in output && num > output.min) throw `the min value has been set to ${output.min} and you're trying to set a max value of ${num}, which is not possible.`;
        return num;
    }

    static parseEq(options, output) {
        const num = Command.parseProperty({ min: true, max: true }, options, output);
        return { min: num, max: num };
    }

    static parseMax(options, output) {
        const num = Command.parseProperty({ max: true }, options, output);
        return { max: num };
    }

    static parseMin(options, output) {
        const num = Command.parseProperty({ min: true }, options, output);
        return { min: num };
    }

    static taxes(tax, output) {
        if ("tax" in output) throw `the tax value has been set to ${output.tax}, you can't set the tax twice.`;
        const num = parseInt(tax);
        if (isNaN(num)) throw `${tax} is not a number.`;
        return { tax: num };
    }

    static parse(options) {
        const output = {};
        const thisOp = options.split("|");
        for (let i = 0; i < thisOp.length; i++) {
            const element = thisOp[i];
            if (/^>.+/.test(element)) Object.assign(output, Command.parseMin(element.slice(1), output));
            else if (/^<.+/.test(element)) Object.assign(output, Command.parseMax(element.slice(1), output));
            else if (/^=.+/.test(element)) Object.assign(output, Command.parseEq(element.slice(1), output));
            else if (/^teams?$/.test(element)) Object.assign(output, { teams: true });
            else if (/^tax=.+/.test(element)) Object.assign(output, Command.taxes(element.slice(4), output));
            else throw "[PARSING] Error: options MUST be separated by '|' and the properties by '=', '>', '<'";
        }

        return output;
    }

    async prompt() {
        const responses = await this.msg.channel.awaitMessages(m => m.author.id === this.msg.author.id, this.awaitOptions);
        const response = responses.first();
        if (!/^(win|draw)$/g.test(response.content)) {
            this.msg.channel.send(`Dear ${this.msg.author}, you must specify **DRAW** or **WIN**`);
            return this.prompt();
        }
        if (response.content === "win") return this.runWins();
        if (response.content === "draw") return this.runDraw();

        return null;
    }

    async execute(action, options) {
        switch (action) {
            case "create": {
                if (this.pool) throw "there's a betting pool active.";
                const Options = {};
                Options.owner = this.msg.author.id;
                if (options) Object.assign(Options, this.parse(options));
                this.client.bettings.set(this.msg.guild.id, Options);
                this.msg.alert([
                    `Dear ${this.msg.author}, the betting pool has been successfully created with the following properties:`,
                    `${"min" in Options ? `\n**Min**: ${Options.min}` : ""}${"max" in Options ? `\n**Man**: ${Options.max}` : ""}`,
                ].join(""));
                break;
            }
            case "remove": {
                await this.msg.Prompt(`Dear ${this.msg.author}, are you sure you want to end the betting pool?`);
                await this.msg.send("How did the match go? Did somebody **WIN** or it has been a **DRAW**?");
                await this.prompt();
                break;
            }
            default:
                break;
        }
    }
}

exports.run = async (client, msg, [action, options = null]) => {
    const pool = client.bettings.get(msg.guild.id) || null;

    const run = new Command(client, msg, pool);
    await run.execute(action, options);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 10,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 5,
};

exports.help = {
    name: "bet",
    description: "Deposit money in a betting pool.",
    usage: "<create|remove> [options:string]",
    usageDelim: " ",
    extendedHelp: "",
};
