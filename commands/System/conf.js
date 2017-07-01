const { inspect } = require("util");

const handle = (value) => {
    if (typeof value !== "object") return value;
    if (value === null) return "Not set";
    if (value instanceof Array) return value[0] ? `[ ${value.join(" | ")} ]` : "None";
    return value;
};

exports.run = async (client, msg, [action, key, ...value]) => {
    const configs = msg.guild.settings;

    switch (action) {
        case "set": {
            if (!key) return msg.send("You must provide a key");
            if (!value[0]) return msg.send("You must provide a value");
            if (!configs.id) await client.settingGateway.create(msg.guild);
            if (client.settingGateway.schemaManager.schema[key].array) {
                await client.settingGateway.updateArray(msg.guild, "add", key, value.join(" "));
                return msg.send(`Successfully added the value \`${value.join(" ")}\` to the key: **${key}**`);
            }
            const response = await client.settingGateway.update(msg.guild, key, value.join(" "));
            return msg.send(`Successfully updated the key **${key}**: \`${response}\``);
        }
        case "remove": {
            if (!key) return msg.send("You must provide a key");
            if (!value[0]) return msg.send("You must provide a value");
            if (!configs.id) await client.settingGateway.create(msg.guild);
            if (!client.settingGateway.schema[key].array) return msg.send("This key is not array type. Use the action 'reset' instead.");
            return client.settingGateway.updateArray(msg.guild, "remove", key, value.join(" "))
        .then(() => msg.send(`Successfully removed the value \`${value.join(" ")}\` from the key: **${key}**`))
        .catch(e => msg.send(e));
        }
        case "get": {
            if (!key) return msg.send("You must provide a key");
            if (!(key in configs)) return msg.send(`The key **${key}** does not seem to exist.`);
            return msg.send(`The value for the key **${key}** is: \`${inspect(configs[key])}\``);
        }
        case "reset": {
            if (!key) return msg.send("You must provide a key");
            if (!configs.id) await client.settingGateway.create(msg.guild);
            const response = await client.settingGateway.reset(msg.guild, key);
            return msg.send(`The key **${key}** has been reset to: \`${response}\``);
        }
        case "list": {
            const longest = Object.keys(configs).sort((a, b) => a.length < b.length)[0].length;
            const output = ["= Guild Settings ="];
            const entries = Object.entries(configs);
            for (let i = 0; i < entries.length; i++) {
                if (entries[i][0] === "id") continue;
                output.push(`${entries[i][0].padEnd(longest)} :: ${handle(entries[i][1])}`);
            }
            return msg.send(output, { code: "asciidoc" });
        }
    // no default
    }

    return null;
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 3,
    botPerms: [],
    requiredFuncs: [],
    requiredSettings: [],
};

exports.help = {
    name: "conf",
    description: "Define per-server configuration.",
    usage: "<set|get|reset|list|remove> [key:string] [value:string]",
    usageDelim: " ",
};
