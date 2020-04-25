import { Time } from '@utils/constants';
import { Client, MessageEmbed, MessageReaction, Permissions, TextChannel } from 'discord.js';
import { KlasaMessage, KlasaUser, ReactionHandler, RichDisplay, RichDisplayRunOptions, util } from 'klasa';

export class UserRichDisplay extends RichDisplay {

	public constructor(embed?: MessageEmbed) {
		super(embed);
		this.useCustomFooters();
	}

	public async start(message: KlasaMessage, target: string = message.author.id, options: RichDisplayRunOptions = {}): Promise<ReactionHandler> {
		util.mergeDefault({
			filter: (_: MessageReaction, user: KlasaUser) => user.id === target,
			time: Time.Minute * 5
		}, options);
		if (target) {
			// Stop the previous display and cache the new one
			const display = UserRichDisplay.handlers.get(target);
			if (display) display.stop();
		}

		this.setAuthorizedFooter(message.client, message.channel as TextChannel);
		const handler = (await super.run(message, options))
			.once('end', () => UserRichDisplay.handlers.delete(target));
		UserRichDisplay.handlers.set(target, handler);

		return handler;
	}

	private setAuthorizedFooter(client: Client, channel: TextChannel) {
		const priviledged = channel.permissionsFor(client.user!)?.has(UserRichDisplay.kPermissions) ?? false;
		if (priviledged) {
			for (let i = 1; i <= this.pages.length; i++) this.pages[i - 1].setFooter(`${this.footerPrefix}${i}/${this.pages.length}${this.footerSuffix}`);
			if (this.infoPage) this.infoPage.setFooter('ℹ');
		}
	}

	public static readonly handlers: Map<string, ReactionHandler> = new Map();

	private static readonly kPermissions = new Permissions([
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.MANAGE_MESSAGES
	]).freeze();

}
