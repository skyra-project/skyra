exports.run = (client, guild, user) => client.Moderation.anonymousModLog(client, guild, user, "unban").catch(console.error);
