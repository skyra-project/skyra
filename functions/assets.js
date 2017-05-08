/* eslint-disable no-underscore-dangle */
class Assets {
  constructor(client) {
    Object.defineProperty(this, "_client", { value: client });
  }

  async createMuted(msg, message) {
    if (this._client.configs.get(msg.guild.id).roles.muted) throw new Error("There's already a muted role.");
    const role = await msg.guild.createRole({
      name: "Muted",
      color: "#422c0b",
      mentionable: false,
      hoist: false,
    });
    const channels = msg.guild.channels;
    await message.edit(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
    const denied = [];
    let accepted = 0;

    for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
      try {
        if (channel.type === "text") channel.overwritePermissions(role, { SEND_MESSAGES: false });
        else channel.overwritePermissions(role, { CONNECT: false });
        accepted += 1;
      } catch (e) {
        denied.push(channel.toString());
      }
    }

    const messageEdit2 = denied.length ? `, with exception of ${denied.join(", ")}.` : ". ";
    await msg.guild.configs.update({ roles: { muted: role.id } });
    return `Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`;
  }
}

exports.init = (client) => { client.Assets = Assets; };
