exports.run = (client, guild, user) => client.Moderation.anonymousModLog(client, guild, user, "ban").catch(console.error);
