/* eslint object-curly-newline: "off", max-len: "off" */

/**
 * ################################
 * #          UNCOMPLETE          #
 * #         MISSING LINES        #
 * ################################
 */

const { Language, version, Timestamp } = require('klasa');
const { LanguageHelp, FriendlyDuration, klasaUtil: { codeBlock, toTitleCase }, constants: { EMOJIS: { SHINY } } } = require('../index');

const builder = new LanguageHelp()
	.setExplainedUsage('⚙ | ***Explained usage***')
	.setPossibleFormats('🔢 | ***Possible formats***')
	.setExamples('🔗 | ***Exemples***')
	.setReminder('⏰ | ***Rappel***');
const timestamp = new Timestamp('YYYY/MM/DD [at] HH:mm:ss');

const TIMES = {
	YEAR: {
		1: 'an',
		DEFAULT: 'années'
	},
	MONTH: {
		1: 'mois',
		DEFAULT: 'mois'
	},
	WEEK: {
		1: 'semaine',
		DEFAULT: 'semaines'
	},
	DAY: {
		1: 'journée',
		DEFAULT: 'journées'
	},
	HOUR: {
		1: 'heure',
		DEFAULT: 'heures'
	},
	MINUTE: {
		1: 'minute',
		DEFAULT: 'minutes'
	},
	SECOND: {
		1: 'seconde',
		DEFAULT: 'secondes'
	}
};

const PERMS = {
	ADMINISTRATOR: 'Administrateur',
	VIEW_AUDIT_LOG: 'Voir Les Logs Du Serveur',
	MANAGE_GUILD: 'Gérer Le Serveur',
	MANAGE_ROLES: 'Gérer Les Rôles',
	MANAGE_CHANNELS: 'Gérer Les Salons',
	KICK_MEMBERS: 'Expulser Des Membres',
	BAN_MEMBERS: 'Bannir Des Membres',
	CREATE_INSTANT_INVITE: 'Créer Una Invitation',
	CHANGE_NICKNAME: 'Changer De Pseudo',
	MANAGE_NICKNAMES: 'Gérer Les Pseudos',
	MANAGE_EMOJIS: 'Gérer Les Emojis',
	MANAGE_WEBHOOKS: 'Gérer Les Webhooks',
	VIEW_CHANNEL: 'Lire Les Salons Textuels & Voir Les Salons Vocaux',
	SEND_MESSAGES: 'Envoyer Des Messages',
	SEND_TTS_MESSAGES: 'Envoyer Des Messages TTS',
	MANAGE_MESSAGES: 'Gérer Les Messages',
	EMBED_LINKS: 'Intégrer Des Liens',
	ATTACH_FILES: 'Attacher Des Fichiers',
	READ_MESSAGE_HISTORY: 'Voir Les Anciens Messages',
	MENTION_EVERYONE: 'Mentionner Everyone',
	USE_EXTERNAL_EMOJIS: 'Utiliser Des Émojis Externes',
	ADD_REACTIONS: 'Ajouter Des Réactions',
	CONNECT: 'Se Connecter',
	SPEAK: 'Parler',
	MUTE_MEMBERS: 'Rendre Des Membres Muets',
	DEAFEN_MEMBERS: 'Rendre Des Membres Sourds',
	MOVE_MEMBERS: 'Déplacer Les Membres',
	USE_VAD: 'Utiliser La Détection De Voix'
};

const random = num => Math.round(Math.random() * num);

const EIGHT_BALL = {
	WHEN: ['Soon™', 'Maybe tomorrow.', 'Maybe next year...', 'Right now.', 'In a few months.'],
	WHAT: ['A plane.', 'What? Ask again.', 'A gift.', 'Nothing.', 'A ring.', 'I do not know, maybe something.'],
	HOWMUCH: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', 'I do not know, ask a physicist.', 'Nothing.', `Within ${random(10)} and ${random(1000)}L.`, `${random(10)}e${random(1000)}L.`, "2 or 3 liters, I don't remember.", 'Infinity.', '1010 liters.'],
	HOWMANY: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', "I don't know, ask a physicist.", 'Nothing.', `Within ${random(10)} and ${random(1000)}.`, `${random(10)}e${random(1000)}.`, '2 or 3, I do not remember.', 'Infinity', '1010.'],
	WHY: ['Maybe genetics.', 'Because somebody decided it.', 'For the glory of satan, of course!', 'I do not know, maybe destiny.', 'Because I said so.', 'I have no idea.', 'Harambe did nothing wrong.', 'Ask the owner of this server.', 'Ask again.', 'To get to the other side.', 'It says so in the Bible.'],
	WHO: ['A human.', 'A robot.', 'An airplane.', 'A bird.', 'A carbon composition.', 'A bunch of zeroes and ones.', 'I have no clue, is it material?', 'That is not logical.'],
	ELSE: ['Most likely.', 'Nope.', 'YES!', 'Maybe.']
};

function duration(time) { // eslint-disable-line no-unused-vars
	return FriendlyDuration.duration(time, TIMES);
}

module.exports = class extends Language {

	constructor(client, store, file, directory) {
		super(client, store, file, directory);

		this.PERMISSIONS = PERMS;
		this.EIGHT_BALL = EIGHT_BALL;

		this.HUMAN_LEVELS = {
			0: 'Aucun',
			1: 'Faible',
			2: 'Moyen',
			3: '(╯°□°）╯︵ ┻━┻',
			4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
		};

		this.duration = duration;

		this.language = {
			/**
			 * ################################
			 * #      FRAMEWORK MESSAGES      #
			 * #         KLASA 0.5.0d         #
			 * ################################
			 */

			DEFAULT: (key) => `${key} n'a pas encore été traduit en 'fr-FR'.`,
			DEFAULT_LANGUAGE: 'Langue par défaut',
			SETTING_GATEWAY_EXPECTS_GUILD: 'Le paramètre <Guild> attend soit un identifiant soit une instance de serveur.',
			SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `La valeur '${data}' pour la clef '${key}' n'existe pas.`,
			SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `La valeur '${data}' pour la clef '${key}' existe déjà.`,
			SETTING_GATEWAY_SPECIFY_VALUE: 'Vous devez spécifier une clef pour ajouter ou filtrer.',
			SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `La clef '${key}' n'est pas une matrice.`,
			SETTING_GATEWAY_KEY_NOEXT: (key) => `La clef '${key}' n'existe pas dans le schema de données actuel.`,
			SETTING_GATEWAY_INVALID_TYPE: 'Le paramètre \'type\' doit être soit \'add\' ou \'remove\'.',
			RESOLVER_INVALID_PIECE: (name, piece) => `${name} doit être un nom de ${piece} valide.`,
			RESOLVER_INVALID_MSG: (name) => `${name} doit être un identifiant de message valide.`,
			RESOLVER_INVALID_USER: (name) => `${name} doit être une mention ou un identifiant d'utilisateur valide.`,
			RESOLVER_INVALID_MEMBER: (name) => `${name} doit être une mention ou un identifiant d'utilisateur valide.`,
			RESOLVER_INVALID_CHANNEL: (name) => `${name} doit être un tag ou un identifiant de salon valide.`,
			RESOLVER_INVALID_EMOJI: (name) => `${name} doit être un tag d'émoji personnalisé ou un identifiant d'émoji valide.`,
			RESOLVER_INVALID_GUILD: (name) => `${name} doit être un identifiant de serveur valide.`,
			RESOLVER_INVALID_ROLE: (name) => `${name} doit être une mention ou un identifiant de rôle.`,
			RESOLVER_INVALID_LITERAL: (name) => `Votre option ne correspond pas à la seule possibilité : ${name}`,
			RESOLVER_INVALID_BOOL: (name) => `${name} doit être vrai ou faux.`,
			RESOLVER_INVALID_INT: (name) => `${name} doit être un entier.`,
			RESOLVER_INVALID_FLOAT: (name) => `${name} doit être un nombre valide.`,
			RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} doit respecter ce motif regex \`${pattern}\`.`,
			RESOLVER_INVALID_URL: (name) => `${name} doit être une url valide.`,
			RESOLVER_INVALID_DATE: (name) => `${name} doit être une date valide.`,
			RESOLVER_INVALID_DURATION: (name) => `${name} doit être une chaîne de caractères de durée valide.`,
			RESOLVER_INVALID_TIME: (name) => `${name} doit être une chaîne de caractères de durée ou de date valide.`,
			RESOLVER_STRING_SUFFIX: ' caractères',
			RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} doit être exactement ${min}${suffix}.`,
			RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} doit être entre ${min} et ${max}${suffix}.`,
			RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} doit être plus grand que ${min}${suffix}.`,
			RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} doit être plus petit que ${max}${suffix}.`,
			COMMANDMESSAGE_MISSING: 'Il manque au moins un argument à la fin de l\'entrée.',
			COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} est un argument requis.`,
			COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Il manque une option requise : (${possibles})`,
			COMMANDMESSAGE_NOMATCH: (possibles) => `Votre option ne correspond à aucune des possibilités : (${possibles})`,
			// eslint-disable-next-line max-len
			MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time) => `${tag} | **${error}** | Vous avez **${time}** secondes pour répondre à ce message avec un argument valide. Tapez **"ABORT"** pour annuler ce message.`,
			MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) => `${tag} | **${name}** est un argument répétitif | Vous avez **${time}** secondes pour répondre à ce message avec des arguments additionnels valides. Saisissez **"CANCEL"** pour annuler.`, // eslint-disable-line max-len
			MONITOR_COMMAND_HANDLER_ABORTED: 'Annulé',
			INHIBITOR_COOLDOWN: (remaining) => `Vous venez d'utiliser cette commande. Vous pourrez à nouveau utiliser cette commande dans ${remaining} secondes.`,
			INHIBITOR_DISABLED: 'Cette commande est actuellement désactivée',
			INHIBITOR_MISSING_BOT_PERMS: (missing) => `Permissions insuffisantes, il manque : **${missing}**`,
			INHIBITOR_NSFW: 'Vous ne pouvez pas utiliser de commande NSFW dans ce salon.',
			INHIBITOR_PERMISSIONS: 'Vous n\'avez pas la permission d\'utiliser cette commmande',
			// eslint-disable-next-line max-len
			INHIBITOR_REQUIRED_SETTINGS: (settings) => `Votre serveur n'a pas le${settings.length > 1 ? 's' : ''} paramètre${settings.length > 1 ? 's' : ''} **${settings.join(', ')}** et ne peux pas s'exécuter.`,
			INHIBITOR_RUNIN: (types) => `Cette commande est uniquement disponible dans les salons ${types}`,
			INHIBITOR_RUNIN_NONE: (name) => `La commande ${name} n'est pas configurée pour s'exécuter dans un salon.`,
			COMMAND_BLACKLIST_DESCRIPTION: 'Ajoute ou retire des utilisateurs et des guildes sur la liste noire du bot.',
			COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
				usersAdded.length ? `**Utilisateurs Ajoutés**\n${codeBlock('', usersAdded.join(', '))}` : '',
				usersRemoved.length ? `**Utilisateurs Retirés**\n${codeBlock('', usersRemoved.join(', '))}` : '',
				guildsAdded.length ? `**Guildes Ajoutées**\n${codeBlock('', guildsAdded.join(', '))}` : '',
				guildsRemoved.length ? `**Guildes Retirées**\n${codeBlock('', guildsRemoved.join(', '))}` : ''
			].filter(val => val !== '').join('\n'),
			COMMAND_UNLOAD: (type, name) => `✅ ${toTitleCase(this.piece(type))} déchargé${this.isFeminine(type) ? 'e' : ''} : ${name}`,
			COMMAND_UNLOAD_DESCRIPTION: 'Décharge le composant.',
			COMMAND_TRANSFER_ERROR: '❌ Ce fichier a déjà été transféré ou n\'a jamais existé.',
			COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ ${toTitleCase(this.piece(type))} transféré${this.isFeminine(type) ? 'e' : ''} avec succès : ${name}`,
			COMMAND_TRANSFER_FAILED: (type, name) => `Le transfert de ${this.piece(type)} : ${name} au Client a échoué. Veuillez vérifier votre Console.`,
			COMMAND_TRANSFER_DESCRIPTION: 'Transfert un composant du noyau dans son dossier respectif',
			COMMAND_RELOAD: (type, name) => `✅ ${toTitleCase(this.piece(type))} rechargé${this.isFeminine(type) ? 'e' : ''} : ${name}`,
			COMMAND_RELOAD_ALL: (type) => `✅ Tou${this.isFeminine(type) ? 'te' : ''}s les ${this.piece(type)} ont été rechargé${this.isFeminine(type) ? 'e' : ''}s.`,
			COMMAND_RELOAD_DESCRIPTION: 'Recharge un composant, ou tous les composants d\'un cache.',
			COMMAND_REBOOT: 'Redémarrage...',
			COMMAND_REBOOT_DESCRIPTION: 'Redémarre le bot.',
			COMMAND_PING: 'Ping?',
			COMMAND_PING_DESCRIPTION: 'Exécute un test de connexion à Discord.',
			COMMAND_PINGPONG: (diff, ping) => `Pong ! (L'aller-retour a pris : ${diff}ms. Pulsation : ${ping}ms.)`,
			COMMAND_INVITE_SELFBOT: 'Pourquoi auriez-vous besoin d\'un lien d\'invitation pour un selfbot...',
			COMMAND_INVITE_DESCRIPTION: 'Displays the join server link of the bot.',
			COMMAND_INFO: [
				"Klasa est un framework 'plug-and-play' qui étend la librairie Discord.js.",
				'Une grande partie du code est modularisée, ce qui permet aux développeurs de modifier Klasa pour répondre à leurs besoins.',
				'',
				'Les fonctionnalités de Klasa comprennent :',
				'• 🐇💨 Temps de chargement rapide avec le support de l\'ES2017 (`async`/`await`)',
				'• 🎚🎛 Paramètres par serveur, qui peuvent être étendus avec votre propre code',
				'• 💬 Système de commandes personnalisable avec l\'analyse automatique de l\'usage ainsi qu\'un téléchargement et rechargement de modules faciles à utiliser',
				'• 👀 "Moniteurs" qui peuvent observer et agir sur les messages, comme un évenement message normal (Filtre à Injures, Spam Protection, etc)',
				'• ⛔ "Inhibiteurs" qui peuvent empêcher l\'exécution d\'une commande en fonction de paramètres (Permissions, Blacklists, etc)',
				'• 🗄 "Fournisseurs" qui vous permettent de vous connecter à une base de données externe de votre choix.',
				'• ✅ "Finaliseurs" qui s\'exécutent après une commande réussie.',
				'• ➕ "Extendables", code qui agit passivement. Ils ajoutent des propriétés et des méthodes aux classes existantes de Discord.js.',
				'• 🌐 "Langages", qui vous permettent de localiser votre bot.',
				'• ⏲ "Tâches", qui peuvent être planifiées pour s\'exécuter dans le futur, potentiellement de manière récurrente.',
				'',
				'Nous aspirons à être un framework personnalisable à 100% pour répondre à tous les publics. Nous faisons de fréquentes mises-à-jour et corrections de bugs.',
				'Si vous vous intéressez à nous, consultez notre site https://klasa.js.org'
			],
			COMMAND_INFO_DESCRIPTION: 'Fournit des informations à propos du bot.',
			COMMAND_HELP_DESCRIPTION: 'Affiche l\'aide pour une commande.',
			COMMAND_HELP_NO_EXTENDED: 'Pas d\'aide étendue disponible.',
			COMMAND_HELP_DM: '📥 | Les commandes ont été envoyées dans vos MPs.',
			COMMAND_HELP_NODM: '❌ | Vous avez désactivé vos MPs, je ne peux pas vous envoyer les commandes.',
			COMMAND_HELP_COMMAND_NOT_FOUND: '❌ | Commande inconnue, veuillez exécuter la commande help sans argument pour avoir toute la liste.',
			COMMAND_ENABLE: (type, name) => `+ ${toTitleCase(this.piece(type))} activé${this.isFeminine(type) ? 'e' : ''} : ${name}`,
			COMMAND_ENABLE_DESCRIPTION: 'Réactive ou active temporairement un(e) commande/inhibiteur/moniteur/finaliseur/événement. L\'état par défaut sera rétabli au redémarrage.',
			COMMAND_DISABLE: (type, name) => `+ ${toTitleCase(this.piece(type))} désactivé${this.isFeminine(type) ? 'e' : ''} : ${name}`,
			COMMAND_DISABLE_DESCRIPTION: 'Redésactive ou désactive temporairement un(e) commande/inhibiteur/moniteur/finaliseur/événement. L\'état par défaut sera rétabli au redémarrage.',
			COMMAND_DISABLE_WARN: 'Vous ne voulez probablement pas désactiver cela, car vous ne serez plus capable d\'exécuter une commande pour le réactiver',
			COMMAND_CONF_GUARDED: (name) => `${toTitleCase(name)} ne peut pas être désactivé.`,
			COMMAND_CONF_ADDED: (value, key) => `La valeur \`${value}\` a été ajoutée avec succès à la clef : **${key}**`,
			COMMAND_CONF_UPDATED: (key, response) => `La clef **${key}** a été mise à jour avec succès : \`${response}\``,
			COMMAND_CONF_KEY_NOT_ARRAY: 'Cette clef n\'est pas une matrice. Utilisez plutôt l\'action \'reset\'.',
			COMMAND_CONF_REMOVE: (value, key) => `La valeur \`${value}\` a été otée avec succès de la clef : **${key}**`,
			COMMAND_CONF_GET_NOEXT: (key) => `La clef **${key}** ne semble pas exister.`,
			COMMAND_CONF_GET: (key, value) => `La valeur pour la clef **${key}** est : \`${value}\``,
			COMMAND_CONF_RESET: (key, response) => `La clef **${key}** a été réinitialisée à : \`${response}\``,
			COMMAND_CONF_SERVER_DESCRIPTION: 'Établit une configuration par serveur.',
			COMMAND_CONF_SERVER: (key, list) => `**Configuration Serveur${key}**\n${list}`,
			COMMAND_CONF_USER_DESCRIPTION: 'Établit une configuration par utilisateur.',
			COMMAND_CONF_USER: (key, list) => `**Configuration Utilisateur${key}**\n${list}`,
			MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',
			COMMAND_LOAD: (time, type, name) => `✅ ${toTitleCase(this.piece(type))} chargé${this.isFeminine(type) ? 'e' : ''} avec succès : ${name}. (Temps: ${time})`,
			COMMAND_LOAD_FAIL: 'Le fichier n\'existe pas, ou une erreur s\'est produite lors du chargement. Veuillez vérifier votre console.',
			COMMAND_LOAD_ERROR: (type, name, error) => `❌ Échec lors du chargement de ${this.piece(type)}: ${name}. Raison : ${codeBlock('js', error)}`,
			COMMAND_LOAD_DESCRIPTION: 'Charge un composant de votre bot.',

			/**
			 * ################################
			 * #     COMMAND DESCRIPTIONS     #
			 * ################################
			 */

			/**
			 * ##############
			 * ANIME COMMANDS
			 */
			COMMAND_ANIME_DESCRIPTION: 'Search your favourite anime by title with this command.',
			COMMAND_ANIME_EXTENDED: builder.display('anime', {
				extendedHelp: `This command queries MyAnimeList to show data for the anime you request. In a near future, this command
				will allow you to navigate between the results so you can read the information of the anime.`,
				explainedUsage: [
					['query', `The anime's name you are looking for.`]
				],
				examples: ['One Piece']
			}),
			COMMAND_MANGA_DESCRIPTION: 'Search your favourite manga by title with this command.',
			COMMAND_MANGA_EXTENDED: builder.display('manga', {
				extendedHelp: `This command queries MyAnimeList to show data for the manga you request. In a near future, this command',
				'will allow you to navigate between the results so you can read the information of the manga.`,
				explainedUsage: [
					['query', `The manga's name you are looking for.`]
				],
				examples: ['Stone Ocean', 'One Piece']
			}),

			/**
			 * #####################
			 * ANNOUNCEMENT COMMANDS
			 */
			COMMAND_ANNOUNCEMENT_DESCRIPTION: 'Send new announcements, mentioning the announcement role.',
			COMMAND_ANNOUNCEMENT_EXTENDED: builder.display('announcement', {
				extendedHelp: `This command requires an announcement channel (**channels.announcement** in the configuration command)
				which tells Skyra where she should post the announcement messages. Question is, is this command needed?
				Well, nothing stops you from making your announcements by yourself, however, there are many people who hate
				being mentioned by at everyone/here. To avoid this, Skyra gives you the option of creating a subscriber role,
				which is unmentionable (to avoid people spam mentioning the role), and once you run this command,
				Skyra will set the role to be mentionable, post the message, and back to unmentionable.`,
				explainedUsage: [
					['announcement', 'The announcement text to post.']
				],
				examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!']
			}),
			COMMAND_SUBSCRIBE_DESCRIPTION: `Subscribe to this server's announcements.`,
			COMMAND_SUBSCRIBE_EXTENDED: builder.display('subscribe', {
				extendedHelp: `This command serves the purpose of **giving** you the subscriber role, which must be configured by the
				server's administrators. When a moderator or administrator use the **announcement** command, you
					will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested
					users.`
			}),
			COMMAND_UNSUBSCRIBE_DESCRIPTION: `Unsubscribe from this server's announcements.`,
			COMMAND_UNSUBSCRIBE_EXTENDED: builder.display('unsubscribe', {
				extendedHelp: `This command serves the purpose of **removing** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention
					only the interested users.`
			}),

			/**
			 * ############
			 * FUN COMMANDS
			 */

			COMMAND_8BALL_DESCRIPTION: 'Skyra will read the Holy Bible to find the correct answer for your question.',
			COMMAND_8BALL_EXTENDED: builder.display('8ball', {
				extendedHelp: `This command provides you a random question based on your questions' type. Be careful, it may be too smart.`,
				explainedUsage: [
					['question', 'The Holy Question']
				],
				examples: ['Why did the chicken cross the road?']
			}),
			COMMAND_CHOICE_DESCRIPTION: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
			COMMAND_CHOICE_EXTENDED: builder.display('choice', {
				extendedHelp: `I have an existencial doubt... should I wash the dishes or throw them throught the window? The search
					continues. List me items separated by comma and I will choose one them. On a side note, I am not
					responsible of what happens next.`,
				explainedUsage: [
					['words', 'A list of words separated by comma.']
				],
				examples: ['Should Wash the dishes, Throw the dishes throught the window', 'Cat, Dog']
			}),
			COMMAND_CATFACT_DESCRIPTION: 'Let me tell you a misterious cat fact.',
			COMMAND_CATFACT_EXTENDED: builder.display('catfact', {
				extendedHelp: `Do you know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
			}),
			COMMAND_DICE_DESCRIPTION: `Roll the dice, 'x' rolls and 'y' sides.`,
			COMMAND_DICE_EXTENDED: builder.display('dice', {
				extendedHelp: `The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice
				can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once.
				However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random
					number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave
					a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will
					return 10 as output.`,
				explainedUsage: [
					['rolls', 'Defaults to 1, amount of times the dice should roll.'],
					['sides', 'Defaults to 6, amount of sides the dice should have.']
				],
				examples: ['370 24', '100 6', '6'],
				reminder: 'If you write numbers out of the range between 1 and 1024, Skyra will default the number to 1 or 6.'
			}),
			COMMAND_ESCAPEROPE_DESCRIPTION: 'Use the escape rope from Pokemon.',
			COMMAND_ESCAPEROPE_EXTENDED: builder.display('escaperope', {
				extendedHelp: '**Skyra** used **Escape Rope**.'
			}),
			COMMAND_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
			COMMAND_FOX_EXTENDED: builder.display('fox', {
				extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
				it may not be exactly accurate and show you other kinds of foxes.`
			}),
			COMMAND_HOWTOFLIRT_DESCRIPTION: 'Captain America, you do not know how to flirt.',
			COMMAND_HOWTOFLIRT_EXTENDED: builder.display('howtoflirt', {
				extendedHelp: `Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain
				America, I can guarantee that you'll get him.`,
				explainedUsage: [
					['user', 'The user to flirt with.']
				],
				examples: ['Skyra']
			}),
			COMMAND_LOVE_DESCRIPTION: 'Lovemeter, online!',
			COMMAND_LOVE_EXTENDED: builder.display('love', {
				extendedHelp: `Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it!
				Don't be shy and try it!`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra']
			}),
			COMMAND_NORRIS_DESCRIPTION: `Enjoy your day reading Chuck Norris' jokes.`,
			COMMAND_NORRIS_EXTENDED: builder.display('norris', {
				extendedHelp: `Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?
				Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io
				and retrieves a fact (do not assume they're false, not in front of him) so you can read it`
			}),
			COMMAND_RATE_DESCRIPTION: 'Let bots have opinions and rate somebody.',
			COMMAND_RATE_EXTENDED: builder.display('rate', {
				extendedHelp: `Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number
				generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.`,
				explainedUsage: [
					['user', 'The user to rate.']
				],
				examples: ['Skyra', 'me']
			}),
			COMMAND_XKCD_DESCRIPTION: 'Read comics from XKCD.',
			COMMAND_XKCD_EXTENDED: builder.display('xkcd', {
				extendedHelp: `**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't
				provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve
				the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches
				with your input and display it. For example, \`Skyra, xkcd Curiosity\` will show the comic number 1091.`,
				explainedUsage: [
					['query', 'Either the number of the comic, or a title to search for.']
				],
				examples: ['1091', 'Curiosity']
			}),

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */
			COMMAND_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
			COMMAND_CREATEMUTE_EXTENDED: builder.display('createmute', {
				extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
				the guild configuration. This command also modifies all channels (where possible) permissions and disables
					the permission **${PERMS.SEND_MESSAGES}** in text channels and **${PERMS.CONNECT}** in voice channels for said role.`
			}),
			COMMAND_FETCH_DESCRIPTION: 'Read the context of a message.',
			COMMAND_FETCH_EXTENDED: builder.display('fetch', {
				extendedHelp: `This command fetches the context of a message given its id (you need to turn on the developer mode)
					and optionally a channel and limit. The channel defaults to the channel the message was sent, and limit
					defaults to 10. To do so, this command will (by default) show you the 10 messages around the one selected.`,
				explainedUsage: [
					['message', 'The message id (requires Developer Mode).'],
					['channel', '(OPTIONAL) The channel to fetch the message from. Defaults to the channel the message got sent.'],
					['limit', '(OPTIONAL) The amount of messages to retrieve. Defaults to 10.']
				],
				reminder: `Skyra needs the permissions **${PERMS.VIEW_CHANNEL}** and **${PERMS.READ_MESSAGE_HISTORY}** in order
					to be able to fetch the messages.`
			}),
			COMMAND_GIVEAWAY_DESCRIPTION: 'Start a new giveaway.',
			COMMAND_GIVEAWAY_EXTENDED: builder.display('giveaway', {
				extendedHelp: `This command is designed to manage giveaways. You can start them with this command by giving it the
				time and a title. When a giveaway has been created, Skyra will send a giveaway message and react to it with 🎉
				so the members of the server can participate on it. Once the timer ends, Skyra will retrieve all the users who
				reacted and send the owner of the giveaway a message in direct messages with the winner, and other 10 possible
				winners (in case of needing to re-roll).`,
				explainedUsage: [
					['time', 'The time the giveaway should last.'],
					['title', 'The title of the giveaway.']
				],
				examples: ['6h A hug from Skyra.']
			}),
			COMMAND_LIST_DESCRIPTION: 'Check the list of channels, roles, members or warnings for this guild.',
			COMMAND_LIST_EXTENDED: builder.display('list', {
				extendedHelp: `This command is designed to list (sorted) information for this guild with possible filters. For example,
				you can read all the channels with their ids or all the roles from the guild, sorted by their position and hierarchy
				position, respectively. However, this command also allows to display the members of a role or check the warnings given.`,
				explainedUsage: [
					['channels', 'Show a list of all channels for this guild.'],
					['roles', 'Show a list of all roles for this guild.'],
					['members', 'Show a list of all members for a role. If not provided, defaults to the author\'s highest role.'],
					['warnings', 'Show a list of all warnings for this guild, or all warnings given to a user.'],
					['input', 'If you take the members parameter, this parameter will select a role. In warnings this will select a member of the guild, otherwise it is ignored.']
				],
				examples: ['channels', 'warnings Skyra', 'members Moderators']
			}),
			COMMAND_MANAGEALIAS_DESCRIPTION: 'Manage aliases for commands for this server.',
			COMMAND_MANAGEALIAS_EXTENDED: builder.display('managealias', {
				extendedHelp: `Command aliases are custom aliases you can use to define a command with its parameters, for example, let's say
				the usage of a command is quite complicated or its parameters are very used. For example, let's say you want Skyra to
				recognize 'Skyra, ps4' as 'Skyra, roles claim ps4'. This is one of the things this system can do. However, you
				are also able to 'translate' them, i.e. you have a Spanish community and you want 'Skyra, suscribirse' as an alias of
				'Skyra, subscribe'.`,
				explainedUsage: [
					['add', 'Add an alias.'],
					['remove', 'Remove an alias.'],
					['list', 'List all aliases for this guild.'],
					['command', 'The command to define the alias to. (i.e. `ping`).'],
					['alias', 'The alias to apply for the aforementioned command.']
				],
				examples: ['add subscribe suscribirse', 'add "roles claim ps4" ps4']
			}),
			COMMAND_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
			COMMAND_ROLEINFO_EXTENDED: builder.display('roleinfo', {
				extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
				(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
				role, and its permissions. It sends an embedded message with the colour of the role.`,
				explainedUsage: [
					['role', 'The role name, partial name, mention or id.']
				],
				examples: ['Administrator', 'Moderator']
			}),
			COMMAND_SERVERINFO_DESCRIPTION: 'Check the information of the guild.',
			COMMAND_SERVERINFO_EXTENDED: builder.display('serverinfo', {
				extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
				with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`,
				reminder: `The command may not show an accurate amount of users online and offline, that's intended to save server costs for caching
					many unnecesary members from the API. However, this should happen more likely in giant guilds.`
			}),

			/**
				 * ###################
				 * MANAGEMENT COMMANDS
			 */

			COMMAND_NICK_DESCRIPTION: `Change Skyra's nickname for this guild.`,
			COMMAND_NICK_EXTENDED: builder.display('nick', {
				extendedHelp: `This command allows you to change Skyra's nickname easily for the guild.`,
				reminder: `This command requires the **${PERMS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
				explainedUsage: [
					['nick', `The new nickname. If you don't put any, it'll reset it instead.`]
				],
				examples: ['SkyNET', 'Assistant', '']
			}),

			/**
			 * #################################
			 * MANAGEMENT/CONFIGURATION COMMANDS
			 */

			COMMAND_SETIGNORECHANNELS_DESCRIPTION: 'Set a channel to the ignore channel list.',
			COMMAND_SETIGNORECHANNELS_EXTENDED: builder.display('setIgnoreChannels', {
				extendedHelp: `This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators
				can use Skyra's commands. Unlike removing the **${PERMS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore
					execute commands) messages, which allows moderators to use moderation commands in the channel. Use this if you want to ban
					any command usage from the bot in a specific channel.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
				examples: ['#general', 'here']
			}),
			COMMAND_SETMEMBERLOGS_DESCRIPTION: 'Set the member logs channel.',
			COMMAND_SETMEMBERLOGS_EXTENDED: builder.display('setMemberLogs', {
				extendedHelp: `This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and
				"Member Leave". If a muted user joins, it will send a special "Muted Member Join" event. All messages are in embeds so you will need to enable
				the permission **${PERMS.EMBED_LINKS}** for Skyra. You also need to individually set the "events" you want to listen: "events.memberAdd" and
				"events.memberRemove". For roles, you would enable "events.memberNicknameChange" and/or "events.memberRolesChange" via the "config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				examples: ['#member-logs', 'here']
			}),
			COMMAND_SETMESSAGELOGS_DESCRIPTION: 'Set the message logs channel.',
			COMMAND_SETMESSAGELOGS_EXTENDED: builder.display('setMessageLogs', {
				extendedHelp: `This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete",
				"Message Edit", and "Message Prune". All messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. You
				also need to individually set the "events" you want to listen: "events.messageDelete", "events.messageEdit", and "events.messagePrune" via the
				"config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the
				permission **${PERMS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
				examples: ['#message-logs', 'here']
			}),
			COMMAND_SETMODLOGS_DESCRIPTION: 'Set the mod logs channel.',
			COMMAND_SETMODLOGS_EXTENDED: builder.display('setModLogs', {
				extendedHelp: `This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with
				"claimable" reasons and moderators. This channel is not a must and you can always retrieve specific modlogs with the "case" command. All
				messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. For auto-detection, you need to individually
				set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.`,
				explainedUsage: [
					['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
				],
				reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
				examples: ['#mod-logs', 'here']
			}),
			COMMAND_SETPREFIX_DESCRIPTION: 'Set Skyra\'s prefix.',
			COMMAND_SETPREFIX_EXTENDED: builder.display('setPrefix', {
				extendedHelp: `This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.
				It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts. If
				you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix. Alternatively, you can take advantage
				of Skyra's NLP (Natural Language Processing) and prefix the commands with her name and a comma. For example, "Skyra, ping".`,
				explainedUsage: [
					['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]
				],
				reminder: `Your prefix should only contain characters everyone can write and type.`,
				examples: ['&', '=']
			}),

			/**
			 * #############
			 * MISC COMMANDS
			 */

			COMMAND_CUDDLE_DESCRIPTION: 'Cuddle somebody!',
			COMMAND_CUDDLE_EXTENDED: builder.display('cuddle', {
				extendedHelp: `Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can
				imagine and draw a image of you cuddling somebody in the bed, I hope you like it!`,
				explainedUsage: [
					['user', 'The user to cuddle with.']
				],
				examples: ['Skyra']
			}),
			COMMAND_DELETTHIS_DESCRIPTION: '*Sees offensive post* DELETTHIS!',
			COMMAND_DELETTHIS_EXTENDED: builder.display('deletthis', {
				extendedHelp: `I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If
				you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!`,
				explainedUsage: [
					['user', 'The user that should start deleting his post.']
				],
				examples: ['John Doe']
			}),
			COMMAND_DOG_DESCRIPTION: 'Cute doggos! ❤',
			COMMAND_DOG_EXTENDED: builder.display('dog', {
				extendedHelp: `Do **you** know how cute are dogs? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_F_DESCRIPTION: 'Press F to pay respects.',
			COMMAND_F_EXTENDED: builder.display('f', {
				extendedHelp: `This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra
				react the image if she has permissions to react messages.`,
				explainedUsage: [
					['user', 'The user to pray respects to.']
				],
				examples: ['John Doe', 'Jake']
			}),
			COMMAND_GOODNIGHT_DESCRIPTION: 'Give somebody a nice Good Night!',
			COMMAND_GOODNIGHT_EXTENDED: builder.display('goodnight', {
				extendedHelp: `Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?`,
				explainedUsage: [
					['user', 'The user to give the goodnight kiss.']
				],
				examples: ['Jake', 'DefinitivelyNotSleeping']
			}),
			COMMAND_GOOFYTIME_DESCRIPTION: `It's Goofy time!`,
			COMMAND_GOOFYTIME_EXTENDED: builder.display('goofytime', {
				extendedHelp: `IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme,
					what else would it be?`,
				explainedUsage: [
					['user', `The user who will say IT'S GOOFY TIME!`]
				],
				examples: ['TotallyNotADaddy']
			}),
			COMMAND_HUG_DESCRIPTION: 'Hugs!',
			COMMAND_HUG_EXTENDED: builder.display('hug', {
				extendedHelp: `What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it!
				Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!`,
				explainedUsage: [
					['user', 'The user to hug with.']
				],
				examples: ['Bear']
			}),
			COMMAND_INEEDHEALING_DESCRIPTION: `*Genji's voice* I NEED HEALING!`,
			COMMAND_INEEDHEALING_EXTENDED: builder.display('ineedhealing', {
				extendedHelp: `Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES! You know it,
				it's a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.
				Well, don't expect so much, this command actually shows a medic with some tool in your chest.`,
				explainedUsage: [
					['healer', 'The healer you need to heal you.']
				],
				examples: ['Mercy']
			}),
			COMMAND_KITTY_DESCRIPTION: 'KITTENS!',
			COMMAND_KITTY_EXTENDED: builder.display('kitty', {
				extendedHelp: `Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images
				From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
				some images that, sadly, got deleted and I cannot retrieve them 💔.`
			}),
			COMMAND_PINGKYRA_DESCRIPTION: 'How dare you pinging me!?',
			COMMAND_PINGKYRA_EXTENDED: builder.display('pingkyra', {
				extendedHelp: `There are a few things that annoy kyra, one of them are **Windows 10's notifications**! Which also
				includes mentions from Discord, hence why this command exists.`,
				explainedUsage: [
					['pinger', 'The user who pinged Kyra.']
				],
				examples: ['IAmInnocent'],
				reminder: `If you mentioned kyra, you must self-execute this command against you.`
			}),
			COMMAND_SHINDEIRU_DESCRIPTION: 'Omae wa mou shindeiru.',
			COMMAND_SHINDEIRU_EXTENDED: builder.display('shindeiru', {
				extendedHelp: `"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga
				and anime series Fist of the North Star. This shows a comic strip of the character pronouncing the aforementioned words,
				which makes the opponent reply with "nani?" (what?).`,
				explainedUsage: [
					['user', `The person you're telling that phrase to.`]
				],
				examples: ['Jack']
			}),
			COMMAND_SLAP_DESCRIPTION: 'Slap another user using the Batman & Robin Meme.',
			COMMAND_SLAP_EXTENDED: builder.display('slap', {
				extendedHelp: `The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.`,
				explainedUsage: [
					['user', 'The user you wish to slap.']
				],
				examples: ['Jake'],
				reminder: `You try to slap me and I'll slap you instead.`
			}),
			COMMAND_THESEARCH_DESCRIPTION: 'Are we the only one in the universe, this man on earth probably knows.',
			COMMAND_THESEARCH_EXTENDED: builder.display('thesearch', {
				extendedHelp: `One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.`,
				explainedUsage: [
					['answer', 'The sentence that will reveal the truth.']
				],
				examples: ['Your waifu is not real.']
			}),
			COMMAND_TRIGGERED_DESCRIPTION: 'I am getting TRIGGERED!',
			COMMAND_TRIGGERED_EXTENDED: builder.display('triggered', {
				extendedHelp: `What? My commands are not enough userfriendly?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image
					your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.`,
				explainedUsage: [
					['user', 'The user that is triggered.']
				],
				examples: ['kyra']
			}),
			COMMAND_VAPORWAVE_DESCRIPTION: 'Vapowave characters!',
			COMMAND_VAPORWAVE_EXTENDED: builder.display('vaporwave', {
				extendedHelp: `Well, what can I tell you? This command turns your messages into unicode monospaced characters. That
					is, what humans call 'Ａ　Ｅ　Ｓ　Ｔ　Ｈ　Ｅ　Ｔ　Ｉ　Ｃ'. I wonder what it means...`, // eslint-disable-line no-irregular-whitespace
				explainedUsage: [
					['phrase', 'The phrase to convert']
				],
				examples: ['A E S T H E T I C']
			}),

			/**
				 * #############################
				 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_CASE_DESCRIPTION: 'Get the information from a case given its index.',
			COMMAND_CASE_EXTENDED: builder.display('case', {
				extendedHelp: ``
			}),

			/**
			 * ###################
			 * MODERATION COMMANDS
			 */

			/**
			 * ##################
			 * OVERWATCH COMMANDS
			 */

			/**
			 * ###############
			 * SOCIAL COMMANDS
			 */

			COMMAND_BALANCE_DESCRIPTION: 'Check your current balance.',
			COMMAND_BALANCE_EXTENDED: builder.display('balance', {
				extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
			}),
			COMMAND_DAILY_DESCRIPTION: `Get your semi-daily ${SHINY}.`,
			COMMAND_DAILY_EXTENDED: builder.display('daily', {
				extendedHelp: `Shiiiiny!`,
				reminder: [
					'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
					'You can claim dailies once every 12 hours.'
				].join('\n')
			}),
			COMMAND_LEADERBOARD_DESCRIPTION: 'Check the leaderboards.',
			COMMAND_LEADERBOARD_EXTENDED: builder.display('leaderboard', {
				extendedHelp: `The leaderboard command shows a list of users sorted by their local or global amount of points,
				by default, when using no arguments, it will show the local leaderboard. The leaderboards refresh after 10
					minutes.`,
				reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.'
			}),
			COMMAND_LEVEL_DESCRIPTION: 'Check your global level.',
			COMMAND_LEVEL_EXTENDED: builder.display('level', {
				extendedHelp: `How much until next level?`,
				explainedUsage: [
					['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
				]
			}),
			COMMAND_PAY_DESCRIPTION: `Pay somebody with your ${SHINY}.`,
			COMMAND_PAY_EXTENDED: builder.display('pay', {
				extendedHelp: `Businessmen! Today is payday!`,
				explainedUsage: [
					['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
					['user', 'The targetted user to pay. (Must be mention/id)']
				],
				examples: [
					'200 @kyra'
				]
			}),
			COMMAND_PROFILE_DESCRIPTION: 'Check your user profile.',
			COMMAND_PROFILE_EXTENDED: builder.display('profile', {
				extendedHelp: `This command sends a card image with some of your user profile such as your global rank, experience...
				Additionally, you are able to customize your colours with the 'setColor' command.`,
				explainedUsage: [
					['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
				]
			}),
			COMMAND_REMINDME_DESCRIPTION: 'Manage your reminders.',
			COMMAND_REMINDME_EXTENDED: builder.display('remindme', {
				extendedHelp: `This command allows you to set, delete and list reminders.`,
				explainedUsage: [
					['title', 'What you want me to remind you.'],
					['time', 'The time the reminder should last. If not provided, Skyra will ask for it in a prompt.']
				],
				examples: [
					'me in 6h to fix this command.',
					'list',
					'delete jedbcuywb'
				]
			}),
			COMMAND_REPUTATION_DESCRIPTION: 'Give somebody a reputation point.',
			COMMAND_REPUTATION_EXTENDED: builder.display('reputation', {
				extendedHelp: `This guy is so helpful... I'll give him a reputation point!`,
				explainedUsage: [
					['user', 'The user to give a reputation point.']
				],
				reminder: 'You can give a reputation point once every 24 hours.'
			}),
			COMMAND_REPUTATIONS_DESCRIPTION: 'Check your amount of reputation points.',
			COMMAND_REPUTATIONS_EXTENDED: builder.display('reputations', {
				extendedHelp: `This command tells you the amount of reputation points. They are points you achieve from other users
				when they use the reputation command.`,
				reminder: 'You can give users a reputation point with the \'reputation\' command every 24 hours.'
			}),
			COMMAND_SETCOLOR_DESCRIPTION: 'Change your user profile\'s color.',
			COMMAND_SETCOLOR_EXTENDED: builder.display('setColor', {
				extendedHelp: `The setColor command sets a color for your profile.`,
				explainedUsage: [
					['color', 'A color resolvable.']
				],
				possibleFormats: [
					['HEX', '#dfdfdf'],
					['RGB', 'rgb(200, 200, 200)'],
					['HSL', 'hsl(350, 100, 100)'],
					['B10', '14671839']
				]
			}),

			/**
			 * ###############
			 * SYSTEM COMMANDS
			 */

			COMMAND_BACKUP_DESCRIPTION: 'Performs a backup of the database.',
			COMMAND_BACKUP_EXTENDED: builder.display('backup', {
				extendedHelp: `The backup command force-starts the backup task which runs twice a week.`
			}),
			COMMAND_CPPEVAL_DESCRIPTION: 'Evaluates arbitrary C++. Reserved for bot owner.',
			COMMAND_CPPEVAL_EXTENDED: builder.display('c++eval', {
				extendedHelp: `The C++eval command evaluates command as-in, and wraps it into a main method. No namespaces are exported.
				The --raw flag disables the code wrap, making it accept raw input.`,
				examples: [
					'std::cout << 2 + 2 - 1;'
				]
			}),
			COMMAND_CSEVAL_DESCRIPTION: 'Evaluates arbitrary C#. Reserved for bot owner.',
			COMMAND_CSEVAL_EXTENDED: builder.display('c#eval', {
				extendedHelp: `The C#eval command evaluates command as-in, and wraps it into a main method.
				The --raw flag disables the code wrap, making it accept raw input.
					Exported namespaces are:
					- System
					- System.Collections
					- System.Collections.Generic
					- System.Linq
					- System.Reflection`,
				// Please do not translate the namespaces
				examples: [
					'return new[] { 2, 2 }.Sum() - 1;',
					'return 2 + 2 - 1;'
				]
			}),
			COMMAND_DM_DESCRIPTION: 'Sends a Direct Message. Reserved for bot owner for replying purposes.',
			COMMAND_DM_EXTENDED: builder.display('dm', {
				extendedHelp: `The DM command is reserved for bot owner, and it's only used for very certain purposes, such as replying feedback
				messages sent by users.`
			}),
			COMMAND_EVAL_DESCRIPTION: 'Evalue du Javascript arbitraire. Reservé aux propriétaires du bot.',
			COMMAND_EVAL_EXTENDED: builder.display('eval', {
				extendedHelp: `The eval command evaluates code as-in, any error thrown from it will be handled.
					It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.
					The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.
					The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.
					The --delete flag makes the command delete the message that executed the message after evaluation.
					The --silent flag will make it output nothing.
					The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.
					The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword
					The --showHidden flag will enable the showHidden option in util.inspect.
					If the output is too large, it'll send the output as a file, or in the console if the bot does not have the **${PERMS.ATTACH_FILES}** permission.`,
				examples: [
					'msg.author.username;',
					'1 + 1;'
				]
			}, true),
			COMMAND_EXEC_DESCRIPTION: 'Execute Order 66.',
			COMMAND_EXEC_EXTENDED: builder.display('exec', {
				extendedHelp: `You better not know about this.`
			}),
			COMMAND_PYEVAL_DESCRIPTION: 'Evaluates arbitrary Python code. Reserved for bot owner.',
			COMMAND_PYEVAL_EXTENDED: builder.display('pyeval', {
				extendedHelp: `The pyeval command evaluates command as-in. No namespaces are exported.
				The --py3 flag changes the eval mode from python 2.7 to python 3.6.`,
				examples: [
					'print(2 + 2 - 1)'
				]
			}),
			COMMAND_SETAVATAR_DESCRIPTION: `Set Skyra's avatar.`,
			COMMAND_SETAVATAR_EXTENDED: builder.display('setAvatar', {
				extendedHelp: `This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel.`
			}),
			COMMAND_DONATE_DESCRIPTION: 'Get information about how to donate to keep Skyra alive longer.',
			COMMAND_DONATE_EXTENDED: builder.display('donate', {
				extendedHelp: `
				Skyra Project started on 24th October 2016, if you are reading this, you are
				using the version 3.1.0 (Royal Update), which is the twelfth rewrite. I have
				improved a lot every single function from Skyra, and now, she is extremely fast.

				However, not everything is free, I need your help to keep Skyra alive in a VPS so
				you can enjoy her functions longer. I will be very thankful if you help me, really,
				I have been working on a lot of things, but she is my beautiful baby, take care of her ❤

				Do you want to support this amazing project? Feel free to do so! https://www.patreon.com/kyranet`
			}),
			COMMAND_ECHO_DESCRIPTION: 'Make Skyra send a message to this (or another) channel.',
			COMMAND_ECHO_EXTENDED: builder.display('echo', {
				extendedHelp: `This should be very obvious...`
			}),
			COMMAND_FEEDBACK_DESCRIPTION: `Send a feedback message to the bot's owner.`,
			COMMAND_FEEDBACK_EXTENDED: builder.display('feedback', {
				extendedHelp: `This command sends a message to a feedback channel where the bot's owner can read. You'll be replied
					as soon as an update comes.`
			}),
			COMMAND_STATS_DESCRIPTION: 'Fournit des détails et statistiques à propos du bot.',
			COMMAND_STATS_EXTENDED: builder.display('stats', {
				extendedHelp: `This should be very obvious...`
			}),

			/**
			 * #############
			 * TAGS COMMANDS
			 */

			COMMAND_TAGMANAGER_DESCRIPTION: `Manage this guilds' tags.`,
			COMMAND_TAGMANAGER_EXTENDED: builder.display('tagmanager', {
				extendedHelp: `This command gives you tag management (you can use it to add, remove or edit them).
				What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
				you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
				Besides that, tags are also used for memes, who doesn't like memes?`,
				explainedUsage: [
					['action', 'The action to perform: **add** to add new tags, **remove** to delete them, and **edit** to edit them.'],
					['tag', `The tag's name.`],
					['contents', 'Required for the actions **add** and **edit**, specifies the content for the tag.']
				],
				examples: [
					'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
					'edit rule1 Just be respectful with the others.',
					'remove rule1'
				]
			}),
			COMMANDS_TAGS_DESCRIPTION: `List or get a tag.`,
			COMMANDS_TAGS_EXTENDED: builder.display('tags', {
				extendedHelp: `What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
				you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
				Besides that, tags are also used for memes, who doesn't like memes?`,
				explainedUsage: [
					['list', 'Show a list of all tags for this server.'],
					['tag', 'Show the content of the selected tag.']
				],
				examples: ['list', 'rule1']
			}),

			/**
			 * ##############
			 * TOOLS COMMANDS
			 */

			COMMAND_COLOR_DESCRIPTION: 'Display some awesome colours.',
			COMMAND_COLOR_EXTENDED: builder.display('color', {
				extendedHelp: `The color command displays a set of colours with nearest tones given a difference between 1 and 255..`,
				explainedUsage: [
					['color', 'A color resolvable.']
				],
				possibleFormats: [
					['HEX', '#dfdfdf'],
					['RGB', 'rgb(200, 200, 200)'],
					['HSL', 'hsl(350, 100, 100)'],
					['B10', '14671839']
				],
				examples: ['#dfdfdf >25', 'rgb(200, 130, 75)']
			}),
			COMMAND_CONTENT_DESCRIPTION: 'Get messages\' raw content.',
			COMMAND_CONTENT_EXTENDED: builder.display('content', {}),
			COMMAND_DEFINE_DESCRIPTION: 'Check the definition of a word.',
			COMMAND_DEFINE_EXTENDED: builder.display('define', {
				extendedHelp: `What does "heel" mean?`,
				explainedUsage: [
					['Word', 'The word or phrase you want to get the definition from.']
				],
				examples: ['heel']
			}),
			COMMAND_EMOJI_DESCRIPTION: 'Get info from an emoji.',
			COMMAND_EMOJI_EXTENDED: builder.display('emoji', {}),
			COMMAND_GOOGL_DESCRIPTION: 'Short your links with this tool.',
			COMMAND_GOOGL_EXTENDED: builder.display('googl', {
				extendedHelp: `Shorten your urls with Googl!`,
				explainedUsage: [
					['URL', 'The URL to shorten or expand.']
				],
				examples: ['https://github.com/', 'https://goo.gl/un5E']
			}),
			COMMAND_POLL_DESCRIPTION: 'Manage polls.',
			COMMAND_POLL_EXTENDED: builder.display('poll', {}),
			COMMAND_PRICE_DESCRIPTION: 'Convert the currency with this tool.',
			COMMAND_PRICE_EXTENDED: builder.display('price', {}),
			COMMAND_QUOTE_DESCRIPTION: 'Quote another people\'s message.',
			COMMAND_QUOTE_EXTENDED: builder.display('quote', {}),
			COMMAND_ROLES_DESCRIPTION: 'List all public roles from a guild, or claim/unclaim them.',
			COMMAND_ROLES_EXTENDED: builder.display('roles', {
				extendedHelp: `Public roles? They are roles that are available for everyone, an administrator must configure
					them throught a configuration command.`,
				explainedUsage: [
					['Roles', 'The list of roles to claim and unclaim. Leave this empty to get a list of roles']
				],
				reminder: [
					'When using claim/unclaim, the roles can be individual, or multiple.',
					'To claim multiple roles, you must separate them by a comma.',
					'You can specify which roles by writting their ID, name, or a section of the name.'
				].join('\n'),
				examples: ['', 'Designer, Programmer', 'Designer']
			}),
			COMMAND_SEARCH_DESCRIPTION: 'Search things from the Internet with DuckDuckGo.',
			COMMAND_SEARCH_EXTENDED: builder.display('search', {}),
			COMMAND_URBAN_DESCRIPTION: 'Check the definition of a word on UrbanDictionary.',
			COMMAND_URBAN_EXTENDED: builder.display('urban', {
				extendedHelp: `What does "spam" mean?`,
				explainedUsage: [
					['Word', 'The word or phrase you want to get the definition from.'],
					['Page', 'Defaults to 1, the page you wish to read.']
				],
				examples: ['spam']
			}),
			COMMAND_WHOIS_DESCRIPTION: 'Who are you?',
			COMMAND_WHOIS_EXTENDED: builder.display('whois', {}),
			COMMAND_WIKIPEDIA_DESCRIPTION: 'Search something throught Wikipedia.',
			COMMAND_WIKIPEDIA_EXTENDED: builder.display('wikipedia', {}),
			COMMAND_YOUTUBE_DESCRIPTION: 'Search something throught YouTube.',
			COMMAND_YOUTUBE_EXTENDED: builder.display('youtube', {}),

			/**
			 * ################
			 * WEATHER COMMANDS
			 */

			COMMAND_WEATHER_DESCRIPTION: 'Check the weather status in a location.',
			COMMAND_WEATHER_EXTENDED: builder.display('weather', {
				extendedHelp: `This command uses Google Maps to get the coordinates of the place, this step also allows multilanguage
				support as it is... Google Search. Once this command got the coordinates, it queries DarkSky to retrieve
					information about the weather. Note: temperature is in **Celsius**`,
				explainedUsage: [
					['city', 'The locality, governing, country or continent to check the weather from.']
				],
				examples: ['Antarctica', 'Arizona']
			}),

			/**
			 * #################################
			 * #       COMMAND RESPONSES       #
			 * #################################
			 */

			/**
			 * ##############
			 * ANIME COMMANDS
			 */

			COMMAND_ANIME_TYPES: {
				TV: '📺 TV',
				MOVIE: '🎥 Movie',
				OVA: '📼 Original Video Animation',
				SPECIAL: '🎴 Special'
			},
			COMMAND_ANIME_QUERY_FAIL: 'I am sorry, but the API returned a bad answer. Are you sure you wrote the name correctly?',
			COMMAND_ANIME_INVALID_CHOICE: `That's an invalid choice. Please try again but with a different choice.`,
			COMMAND_ANIME_NO_CHOICE: 'Well, the time ended, try again later when you decide it!',
			COMMAND_ANIME_OUTPUT_DESCRIPTION: (entry, synopsis) => [
				`**English title:** ${entry.english}`,
				synopsis
			],
			COMMAND_ANIME_OUTPUT_STATUS: (entry) => [
				`  ❯  Current status: **${entry.status}**`,
				`    • Started: **${entry.start_date}**\n${entry.end_date[0] === '0000-00-00' ? '' : `    • Finished: **${entry.end_date[0]}**`}`
			],
			COMMAND_ANIME_TITLES: {
				TYPE: 'Type',
				SCORE: 'Score',
				STATUS: 'Status',
				WATCH_IT: 'Watch it here:',
				READ_IT: 'Read it here:'
			},
			COMMAND_MANGA_OUTPUT_DESCRIPTION: (entry, synopsis) => [
				`**English title:** ${entry.english}`,
				synopsis
			],
			COMMAND_MANGA_OUTPUT_STATUS: (entry) => [
				`  ❯  Current status: **${entry.status}**`,
				`    • Started: **${entry.start_date}**\n${entry.end_date[0] === '0000-00-00' ? '' : `    • Finished: **${entry.end_date[0]}**`}`
			],
			COMMAND_MANGA_TITLES: {
				MANGA: '📘 Manga',
				NOVEL: '📕 Novel',
				MANHWA: '🇰🇷 Manhwa',
				'ONE-SHOT': '☄ One Shot',
				SPECIAL: '🎴 Special'
			},

			/**
			 * #####################
			 * ANNOUNCEMENT COMMANDS
			 */

			COMMAND_SUBSCRIBE_NO_ROLE: 'Ce serveur n\'a pas configuré de rôle d\'annoncement.',
			COMMAND_SUBSCRIBE_SUCCESS: (role) => `Accordé avec succès le rôle: **${role}**`,
			COMMAND_UNSUBSCRIBE_SUCCESS: (role) => `Retiré avec succès le rôle: **${role}***`,
			COMMAND_SUBSCRIBE_NO_CHANNEL: 'Ce serveur n\'a pas configuré de salon d\'annonces.',
			COMMAND_ANNOUNCEMENT: (role) => `**Nouvelle annonce pour** ${role}:`,

			/**
			 * ################
			 * GENERAL COMMANDS
			 */

			COMMAND_HELP_TITLE: (name, description) => `📃 | ***Help Message*** | __**${name}**__\n${description}\n`,
			COMMAND_HELP_USAGE: (usage) => `📝 | ***Command Usage***\n\`${usage}\`\n`,
			COMMAND_HELP_EXTENDED: (extendedHelp) => `🔍 | ***Extended Help***\n${extendedHelp}`,

			/**
			 * ##############
			 * FUN COMMANDS
			 */

			COMMAND_8BALL_OUTPUT: (author, question, response) => `🎱 Question by ${author}: *${question}*\n${response}`,
			COMMAND_8BALL_NOT_QUESTION: 'That does not seem to be a question...',
			COMMAND_8BALL_QUESTIONS: {
				QUESTION: '?',
				WHEN: 'when',
				WHAT: 'what',
				HOW_MUCH: 'how much',
				HOW_MANY: 'how many',
				WHY: 'why',
				WHO: 'who'
			},
			COMMAND_CATFACT_TITLE: 'Cat Fact',
			COMMAND_CHOICE_OUTPUT: (user, word) => `🕺 *Eeny, meeny, miny, moe, catch a tiger by the toe...* ${user}, I choose:${codeBlock('', word)}`,
			COMMAND_CHOICE_MISSING: 'Please write at least two options separated by comma.',
			COMMAND_CHOICE_DUPLICATES: (words) => `Why would I accept duplicated words? '${words}'.`,
			COMMAND_DICE_OUTPUT: (sides, rolls, result) => `you rolled the **${sides}**-dice **${rolls}** times, you got: **${result}**`,
			COMMAND_DICE_ROLLS_ERROR: 'Amount of rolls must be a number between 1 and 1024.',
			COMMAND_DICE_SIDES_ERROR: 'Amount of sides must be a number between 4 and 1024.',
			// https://bulbapedia.bulbagarden.net/wiki/Escape_Rope
			COMMAND_ESCAPEROPE_OUTPUT: (user) => `**${user}** used **Escape Rope**`,
			COMMAND_LOVE_LESS45: 'Try again next time...',
			COMMAND_LOVE_LESS75: 'Good enough!',
			COMMAND_LOVE_LESS100: 'Good match!',
			COMMAND_LOVE_100: 'Perfect match!',
			COMMAND_LOVE_ITSELF: 'You are a special creature and you should love yourself more than anyone <3',
			COMMAND_LOVE_RESULT: 'Result',
			COMMAND_NORRIS_OUTPUT: 'Chuck Norris',
			COMMAND_RATE_OUTPUT: (user, rate, emoji) => `I would give **${user}** a **${rate}**/100 ${emoji}`,
			COMMAND_RATE_MYSELF: ['I love myself a lot 😊', 'myself'],
			COMMAND_XKCD_COMICS: (amount) => `There are only ${amount} comics.`,

			/**
			 * ###################
			 * MANAGEMENT COMMANDS
			 */

			COMMAND_NICK_SET: (nickname) => `Changed the nickname to **${nickname}**.`,
			COMMAND_NICK_CLEARED: 'Nickname cleared.',
			COMMAND_SERVERINFO_TITLE: (name, id) => `Statistiques pour **${name}** (ID: **${id}**)`,
			COMMAND_SERVERINFO_TITLES: {
				CHANNELS: 'Salons',
				MEMBERS: 'Membres',
				OTHER: 'Autre',
				USERS: 'Utilisateurs'
			},
			COMMAND_SERVERINFO_CHANNELS: (text, voice, categories, afkChannel, afkTime) => [
				`• **${text}** textuels, **${voice}** vocaux, **${categories}** catégories.`,
				`• AFK: ${afkChannel ? `**<#${afkChannel}>** après **${afkTime / 60}**min` : '**None.**'}`
			].join('\n'),
			COMMAND_SERVERINFO_MEMBERS: (count, owner) => [
				`• **${count}** membres`,
				`• Propriétaire: **${owner.tag}**`,
				`  (ID: **${owner.id}**)`
			].join('\n'),
			COMMAND_SERVERINFO_OTHER: (size, region, createdAt, verificationLevel) => [
				`• Rôles: **${size}**`,
				`• Région: **${region}**`,
				`• Créé le: **${timestamp.displayUTC(createdAt)}** (UTC - DD/MM/YYYY)`,
				`• Niveau de vérification: **${this.HUMAN_LEVELS[verificationLevel]}**`
			].join('\n'),
			COMMAND_SERVERINFO_USERS: (online, offline, percentage, newbies) => [
				`• Utilisateurs en ligne/hors ligne: **${online}**/**${offline}** (${percentage}% users online)`,
				`• **${newbies}** nouveaux utilisateurs durant ces dernières 24 heures.`
			].join('\n'),
			COMMAND_ROLEINFO_TITLES: { PERMISSIONS: 'Permissions' },
			COMMAND_ROLEINFO: (role) => [
				`ID: **${role.id}**`,
				`Name: **${role.name}**`,
				`Color: **${role.hexColor}**`,
				`Hoisted: **${role.hoist ? 'Yes' : 'No'}**`,
				`Position: **${role.rawPosition}**`,
				`Mentionable: **${role.mentionable ? 'Yes' : 'No'}**`,
				`Amount of members: **${role.members.size}**`
			].join('\n'),
			COMMAND_ROLEINFO_PERMISSIONS: (permissions) => permissions.length > 0 ? permissions.map(key => `+ **${PERMS[key]}**`) : 'Permissions not granted.',

			/**
			 * #################################
			 * MANAGEMENT/CONFIGURATION COMMANDS
			 */

			CONFIGURATION_TEXTCHANNEL_REQUIRED: 'The selected channel is not a valid text channel, try again with another.',
			CONFIGURATION_EQUALS: 'Successfully configured: no changes were made.',
			COMMAND_SETIGNORECHANNELS_SET: (channel) => `Ignoring all command input from ${channel} now.`,
			COMMAND_SETIGNORECHANNELS_REMOVED: (channel) => `Listening all command input from ${channel} now.`,
			COMMAND_SETMEMBERLOGS_SET: (channel) => `Successfully set the member logs channel to ${channel}.`,
			COMMAND_SETMESSAGELOGS_SET: (channel) => `Successfully set the message logs channel to ${channel}.`,
			COMMAND_SETMODLOGS_SET: (channel) => `Successfully set the mod logs channel to ${channel}.`,
			COMMAND_SETPREFIX_SET: (prefix) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

			/**
			 * #############
			 * MISC COMMANDS
			 */

			COMMAND_VAPORWAVE_OUTPUT: (string) => `Here is your converted message:\n${string}`,

			/**
			 * ##############################
			 * MODERATION/MANAGEMENT COMMANDS
			 */

			COMMAND_WARNINGS_EMPTY: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
			COMMAND_WARNINGS_AMOUNT: (amount) => `There are ${amount === 1 ? 'warning' : 'warnings'}.`,

			// Pending
			MODLOG_APPEALED: 'Le cas de modération sélectionné a déjà fait l\'objet d\'un appel.',
			MODLOG_TIMED: (remaining) => `Cette action est déjà programmée et se termine dans ${duration(remaining)}`,
			MODLOG_PENDING_REASON: (prefix, number) => `Utilisez ${prefix}raison ${number} pour réclamer cette affaire.`,

			/**
			 * #############################
			 * MODERATION/UTILITIES COMMANDS
			 */

			COMMAND_PERMISSIONS: (username, id) => `Permissions for ${username} (${id})`,
			COMMAND_PERMISSIONS_ALL: 'All Permissions',
			COMMAND_RAID_DISABLED: 'The Anti-RAID system is not enabled in this server.',
			COMMAND_RAID_MISSING_KICK: 'As I do not have the KICK MEMBERS permission, I keep the Anti-RAID unactivated.',
			COMMAND_RAID_LIST: 'List of users in the RAID queue',
			COMMAND_RAID_CLEAR: 'Successfully cleared the RAID list.',
			COMMAND_RAID_COOL: 'Successfully deactivated the RAID.',
			COMMAND_FLOW: (amount) => `${amount} messages have been sent within the last minute.`,
			COMMAND_TIME_TIMED: 'The selected moderation case has already been timed.',
			COMMAND_TIME_UNDEFINED_TIME: 'You must specify a time.',
			COMMAND_TIME_UNSUPPORTED_TIPE: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
			COMMAND_TIME_NOT_SCHEDULED: 'This task is not scheduled.',
			COMMAND_TIME_ABORTED: (title) => `Successfully aborted the schedule for ${title}`,
			COMMAND_TIME_SCHEDULED: (title, user, time) => `✅ Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${user.id}) with a duration of ${duration(time)}`,

			/**
			 * ###################
			 * MODERATION COMMANDS
			 */

			COMMAND_BAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **BANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_BAN_NOT_BANNABLE: 'The target is not bannable for me.',
			COMMAND_KICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_KICK_NOT_KICKABLE: 'The target is not kickable for me.',
			COMMAND_LOCKDOWN_LOCK: (channel) => `The channel ${channel} is now locked.`,
			COMMAND_LOCKDOWN_LOCKING: (channel) => `Locking the channel ${channel}...`,
			COMMAND_LOCKDOWN_OPEN: (channel) => `The lockdown for the channel ${channel} has been released.`,
			COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',
			COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
			COMMAND_MUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_MUTE_MUTED: 'The target user is already muted.',
			COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
			COMMAND_PRUNE: (amount, total) => `Successfully deleted ${amount} messages from ${total}.`,
			COMMAND_REASON_NOT_EXISTS: 'The selected modlog does not seem to exist.',
			COMMAND_SOFTBAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNBAN_MESSAGE: (user, reason, log, banReason) => `|\`🔨\`| [Case::${log}] **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}${banReason ? `\nReason for Ban: ${banReason}` : ''}`,
			COMMAND_UNBAN_MISSING_PERMISSION: `I will need the **${PERMS.BAN_MEMBERS}** permission to be able to unban.`,
			COMMAND_UNMUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MANAGE_ROLES}** permission to be able to unmute.`,
			COMMAND_VMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
			COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
			COMMAND_VOICEKICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **VOICE KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_WARN_DM: (moderator, guild, reason) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
			COMMAND_WARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
			COMMAND_FILTER_UNDEFINED_WORD: 'You must write what do you want me to filter.',
			COMMAND_FILTER_FILTERED: (filtered) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
			COMMAND_FILTER_ADDED: (word) => `| ✅ | Success! Added the word ${word} to the filter.`,
			COMMAND_FILTER_REMOVED: (word) => `| ✅ | Success! Removed the word ${word} from the filter.`,
			COMMAND_FILTER_RESET: '| ✅ | Success! The filter has been reset.',

			/**
			 * ###############
			 * SOCIAL COMMANDS
			 */

			COMMAND_AUTOROLE_POINTS_REQUIRED: 'You must input a valid amount of points.',
			COMMAND_AUTOROLE_UPDATE_UNCONFIGURED: 'This role is not configured as an autorole. Use the add type instead.',
			COMMAND_AUTOROLE_UPDATE: (role, points, before) => `Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
			COMMAND_AUTOROLE_REMOVE: (role, before) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
			COMMAND_AUTOROLE_ADD: (role, points) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
			COMMAND_AUTOROLE_LIST_EMPTY: 'There is no role configured as an autorole in this server.',
			COMMAND_AUTOROLE_UNKNOWN_ROLE: (role) => `Unknown role: ${role}`,

			COMMAND_BALANCE: (user, amount) => `The user ${user} has a total of ${amount}${SHINY}`,
			COMMAND_BALANCE_SELF: (amount) => `You have a total of ${amount}${SHINY}`,

			COMMAND_BANNER_LIST_EMPTY: (prefix) => `You do not have an available banner. Check \`${prefix}banner buylist\` for a list of banners you can buy.`,
			COMMAND_BANNER_SET_INPUT_NULL: 'You must specify a banner id to set.',
			COMMAND_BANNER_SET_NOT_BOUGHT: 'You do not have this banner.',
			COMMAND_BANNER_SET: (banner) => `|\`✅\`| **Success**. You have set your banner to: __${banner}__`,
			COMMAND_BANNER_BUY_INPUT_NULL: 'You must specify a banner id to buy.',
			COMMAND_BANNER_BUY_NOT_EXISTS: (prefix) => `This banner id does not exist. Please check \`${prefix}banner buylist\` for a list of banners you can buy.`,
			COMMAND_BANNER_BUY_BOUGHT: (prefix, banner) => `You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
			COMMAND_BANNER_BUY_MONEY: (money, cost) => `You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
			COMMAND_BANNER_BUY: (banner) => `|\`✅\`| **Success**. You have bought the banner: __${banner}__`,
			COMMAND_BANNER_BUY_PAYMENT_CANCELLED: '|`❌`| The payment has been cancelled.',
			COMMAND_BANNER_PROMPT: {
				AUTHOR: 'Author',
				TITLE: 'Title',
				PRICE: 'Price'
			},
			COMMAND_C4_SKYRA: 'Je suis désolée, je sais que vous voulez jouer avec moi mais, si je le fait, je ne pourais plus aider d’autres personnes! 💔',
			COMMAND_C4_BOT: 'Je suis désolée, mais je ne pense pas qu’il voudra arrêter se dont il fait et jouer avec un humain.',
			COMMAND_C4_SELF: 'Vous devez être très triste pour jouer contre vous-même. Réessayez avec un autre utilistateur.',
			COMMAND_C4_PROGRESS: 'Je suis désolée, mais mais une partie est déjà engagé dans ce salon, réessaye quand elle est terminée.',
			COMMAND_C4_PROMPT: (challenger, challengee) => `Cher ${challengee}, tu viens d’être défié par ${challenger} pour une partie de Puissance 4. Ecrit **yes** pour accepter!`,
			COMMAND_C4_PROMPT_TIMEOUT: 'Je suis désolée, mais la personne n’a pas répondu à temps.',
			COMMAND_C4_PROMPT_DENY: 'Je suis désolée, mais la personne a refusé de jouer.',
			COMMAND_C4_START: (player, table) => `Jouez! C’est au tour de: **${player}**.\n${table}`,
			COMMAND_C4_GAME_TIMEOUT: '**La partie est finie par un match nul car le joueur a mit trop de temps pour jouer (60 seconds)**',
			COMMAND_C4_GAME_COLUMN_FULL: 'Cette colonne est pleine. Merci d\'essayer une autre.',
			COMMAND_C4_GAME_WIN: (user, table) => `**${user}** gagne!\n${table}`,
			COMMAND_C4_GAME_DRAW: (table) => `Cette partie est finie par une **égalité**!\n${table}`,
			COMMAND_C4_GAME_NEXT: (player, table) => `Au tour de : **${player}**.\n${table}`,
			COMMAND_DAILY_TIME: (time) => `Les prochains crédits seront disponibles dans ${duration(time)}`,
			COMMAND_DAILY_TIME_SUCCESS: (amount) => `Yay! Tu empoches ${amount}${SHINY}! Prochains crédits dans: 12 heures.`,
			COMMAND_DAILY_GRACE: (remaining) => [
				`Veux-tu réclamer tes crédits maintenant? Le temps restant va être ajouté à l'attente normale de 12h.`,
				`Temps restant : ${duration(remaining)}`
			].join('\n'),
			COMMAND_DAILY_GRACE_ACCEPTED: (amount, remaining) => `Tu viens de récupérer ${amount}${SHINY}! Prochains crédits dans: ${duration(remaining)}`,
			COMMAND_DAILY_GRACE_DENIED: 'Ok! Reviens bientôt!',
			COMMAND_LEVEL: {
				LEVEL: 'Niveau',
				EXPERIENCE: 'Expérience',
				NEXT_IN: 'Prochain niveau dans'
			},
			COMMAND_MYLEVEL: (points, next) => `Vous avez un total de ${points} points.${next}`,
			COMMAND_MYLEVEL_NEXT: (remaining, next) => `\nPoints pour le prochain rang: **${remaining}** (at ${next} points).`,
			COMMAND_PAY_MISSING_MONEY: (needed, has, icon) => `Je suis désolée, mais tu as besoin de ${needed}${icon} et tu as ${has}${icon}`,
			COMMAND_PAY_PROMPT: (user, amount, icon) => `Vous allez payer ${user} ${amount}${icon}, êtes-vous sur de vouloir le faire?`,
			COMMAND_PAY_PROMPT_ACCEPT: (user, amount, icon) => `Paiment accepté, ${amount}${icon} a été envoyé au profil d'${user}`,
			COMMAND_PAY_PROMPT_DENY: 'Paiment refusé.',
			COMMAND_PAY_SELF: 'Si je fais ça, vous allez perdre de l\'argent, à ce titre, n\'essayez pas de vous poayer vous-même.',
			COMMAND_SOCIAL_PAY_BOT: 'Oh, désolée, mais l\'argent ne veut rien dire pour les robots, je suis sure qu\'un human aurait plus avantage à le prendre.',
			COMMAND_PROFILE: {
				GLOBAL_RANK: 'Rang global',
				CREDITS: 'Crédits',
				REPUTATION: 'Réputation',
				EXPERIENCE: 'Expérience',
				LEVEL: 'Niveau'
			},
			COMMAND_REMINDME_INPUT: 'Vous devez me dire ce dont je dois me souvenir et quand.',
			COMMAND_REMINDME_TIME: 'Votre mémorisateur doit durer une minute minimum.',
			COMMAND_REMINDME_CREATE: (id) => `Un mémorisateur avec l'identifiant \`${id}\` a été créé.`,
			COMMAND_REMINDME_INPUT_PROMPT: 'How long should your new reminder last?',
			COMMAND_REMINDME_SHORT_TIME: 'You did not give me a duration of at least one minute long. Cancelling prompt.',
			COMMAND_REMINDME_DELETE_PARAMS: ['delete', 'remove'],
			COMMAND_REMINDME_DELETE_INVALID_PARAMETERS: 'To delete a previously created reminder, you must type either \'delete\' or \'remove\' followed by the ID.',
			COMMAND_REMINDME_DELETE: task => `The reminder with ID \`${task.id}\` and with a remaining time of **${duration(task.timestamp - Date.now())}** has been successfully deleted.`,
			COMMAND_REMINDME_LIST_PARAMS: ['list', 'all'],
			COMMAND_REMINDME_LIST_EMPTY: 'You do not have any active reminder',
			COMMAND_REMINDME_INVALID_ID: 'I am sorry, but the ID provided does not seem to be valid.',
			COMMAND_REMINDME_NOTFOUND: 'I cannot find something here. The reminder either never existed or it ended.',

			COMMAND_REPUTATION_TIME: (remaining) => `Vous pouvez donner un point de réputation dans: ${duration(remaining)}`,
			COMMAND_REPUTATION_USABLE: 'Vous pouvez donner un point de réputation dès maintenant.',
			COMMAND_REPUTATION_USER_NOTFOUND: 'Vous devez mentionner un utilisateur pour donner un point de réputation.',
			COMMAND_REPUTATION_SELF: 'Vous ne pouvez pas donner un point de réputation à vous-même.',
			COMMAND_REPUTATION_BOTS: 'Vous ne pouvez pas donner un point de réputation à un robot.',
			COMMAND_REPUTATION_GIVE: (user) => `Vous avez donné un point de réputation à **${user}**!`,
			COMMAND_REPUTATIONS: (points) => `Vous avez un total de ${points} reputation points.`,
			COMMAND_SCOREBOARD_POSITION: (position) => `Votre position au classement est: ${position}`,
			COMMAND_SETCOLOR: (color) => `Couleur changée pour ${color}`,
			COMMAND_SLOTMACHINES_MONEY: (money) => `Je suis désolée, mais vous n'avez pas assez d'argent pour payer votre pari! Vous avez actuellement : ${money}${SHINY}`,
			COMMAND_SLOTMACHINES_WIN: (roll, winnings) => `**Tu as roulé:**\n${roll}\n**Félicitations!**\nVous avez gagné ${winnings}${SHINY}!`,
			COMMAND_SLOTMACHINES_LOSS: (roll) => `**Tu as roulé:**\n${roll}\n**Echec de la mission!**\nVous aurez plus de chance la prochaine fois!`,
			COMMAND_SOCIAL_PROFILE_NOTFOUND: 'Je suis désolée, mais ce profil d\'utilisateur n\'existe pas.',
			COMMAND_SOCIAL_PROFILE_BOT: 'Je suis désolée, mais les robots n\'ont pas de __Profil d\'utilisateur__.',
			COMMAND_SOCIAL_PROFILE_DELETE: (user, points) => `|\`✅\`| **Réussite**. Suppression de __Profil d'utilisateur__ pour **${user}**, qui avait ${points}`,
			COMMAND_SOCIAL_POINTS: 'Pouvez-vous me dire le nombre de points que vous voulez ajouter ou retirer?',
			COMMAND_SOCIAL_UPDATE: (action, amount, user, before, now) => `Vous venez de ${action === 'add' ? 'ajouter' : 'retirer'} ${amount} ${amount === 1 ? 'point' : 'points'} du __Profil d'utilisateur__ de ${user}. Avant: ${before}; Après: ${now}.`,

			/**
			 * ###############
			 * SYSTEM COMMANDS
			 */

			COMMAND_INVITE: (url) => [
				`Pour ajouter à votre guilde Discord: <${url}>`,
				'N/\'ayez pas peur de décocher certainnes permissions, Skyra vous tiendra au courant si vous essayez d\'utiliser une commande sans les permissions nécessaires.'
			],
			COMMAND_FEEDBACK: '|`✅`| Merci pour ton commentaire ❤! Tu vas recevoir un message de réponse le plus rapidement possible (surrement en anglais).',
			COMMAND_EVAL_TIMEOUT: (seconds) => `TIMEOUT: Took longer than ${seconds} seconds.`,
			COMMAND_EVAL_ERROR: (time, output, type) => `**Erreur**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT: (time, output, type) => `**Résultat**:${output}\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_FILE: (time, type) => `Le résultat état trop long... le résultat a été envoyé dans un fichier.\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_CONSOLE: (time, type) => `Le résultat était trop long... le résultat a été affiché dans la console.\n**Type**:${type}\n${time}`,
			COMMAND_EVAL_OUTPUT_HASTEBIN: (time, url, type) => `Sent the result to hastebin: ${url}\n**Type**:${type}\n${time}\n`,

			COMMAND_STATS: (STATS, UPTIME, USAGE) => [
				'= STATISTIQUES =',
				`• Utilisateurs  :: ${STATS.USERS}`,
				`• Serveurs      :: ${STATS.GUILDS}`,
				`• Salons        :: ${STATS.CHANNELS}`,
				`• Discord.js    :: ${STATS.VERSION}`,
				`• Node.js       :: ${STATS.NODE_JS}`,
				`• Klasa         :: ${version}`,
				'',
				'= UPTIME =',
				`• Hébergement   :: ${UPTIME.HOST}`,
				`• Total         :: ${UPTIME.TOTAL}`,
				`• Client        :: ${UPTIME.CLIENT}`,
				'',
				'= HOST USAGE =',
				`• CPU Load      :: ${USAGE.CPU_LOAD}`,
				`• RAM +Node     :: ${USAGE.RAM_TOTAL}`,
				`• RAM Usage     :: ${USAGE.RAM_USED}`
			].join('\n'),

			/**
			 * #############
			 * TAGS COMMANDS
			 */

			COMMAND_TAGS_NAME_REQUIRED: 'Vous devez spécifier un nom pour votre tag.',
			COMMAND_TAGS_ADD_EXISTS: (tag) => `Le tag '${tag}' existe déjà.`,
			COMMAND_TAGS_CONTENT_REQUIRED: 'Vous devez fournir du contenu à ce tag.',
			COMMAND_TAGS_ADD_ADDED: (name, content) => `Ajouté avec succès le nouveau tag: **${name}** avec le contenu **${content}**.`,
			COMMAND_TAGS_REMOVE_NOT_EXISTS: (tag) => `Le tag '${tag}' n'esxiste pas.`,
			COMMAND_TAGS_REMOVE_REMOVED: (name) => `Supprimé avec succès le tag **${name}**.`,
			COMMAND_TAGS_EDITED: (name, content, old) => `Edité avec succès le tag **${name}** qui contenait **${old}** et maintenant **${content}**.`,
			COMMAND_TAGS_LIST_EMPTY: 'La liste de tag de ce serveur est vide.',

			/**
			 * ##############
			 * TOOLS COMMANDS
			 */

			COMMAND_COLOR: (hex, rgb, hsl) => [
				`HEX: **${hex}**`,
				`RGB: **${rgb}**`,
				`HSL: **${hsl}**`
			].join('\n'),
			COMMAND_DEFINE_NOTFOUND: 'Je n\'ai pas pu trouver de définition pour ce mot.',
			COMMAND_DEFINE: (input, output) => `Résultats cherchés pour \`${input}\`:\n${output}`,
			COMMAND_EMOJI_CUSTOM: (emoji, id) => [
				`→ \`Emoji\` :: **${emoji}**`,
				'→ `Type` :: **Custom**',
				`→ \`ID\` :: **${id}**`
			].join('\n'),
			COMMAND_EMOJI_TWEMOJI: (emoji, id) => [
				`→ \`Emoji\` :: \\${emoji}`,
				'→ `Type` :: **Twemoji**',
				`→ \`ID\` :: **${id}**`
			].join('\n'),
			COMMAND_EMOJI_INVALID: (emoji) => `'${emoji}' n'est pas un emoji valide.`,
			COMMAND_GOOGL_LONG: (url) => `**Shortened URL: [${url}](${url})**`,
			COMMAND_GOOGL_SHORT: (url) => `**Expanded URL: [${url}](${url})**`,
			COMMAND_QUOTE_MESSAGE: 'C\'est vraiment bizarre, mais le message n\'a pas de contenu ou d\'image.',
			COMMAND_ROLES_LIST_EMPTY: 'Ce serveur n\'a pas de rôles listés comme un rôle public.',
			COMMAND_ROLES_LIST_TITLE: (guild) => `Liste des rôles public pour ${guild}`,
			COMMAND_ROLES_CLAIM_EXISTENT: (roles) => `Vous avez déjà ces rôles: \`${roles}\``,
			COMMAND_ROLES_ADDED: (roles) => `Ces rôles ont bien été ajoutés à votre profil: \`${roles}\``,
			COMMAND_ROLES_NOT_MANAGEABLE: (roles) => `The following roles cannot be given by me due to their hierarchy role position: \`${roles}\``,
			COMMAND_ROLES_UNCLAIM_UNEXISTENT: (roles) => `Vous n'avez pas ces rôles: \`${roles}\``,
			COMMAND_ROLES_REMOVED: (roles) => `Ces rôles ont bien été supprimés de votre profil: \`${roles}\``,
			COMMAND_ROLES_NOT_PUBLIC: (roles) => `Ces rôles suivants ne sont publics: \`${roles}\``,
			COMMAND_ROLES_NOT_FOUND: (roles) => `Rôles non trouvés: \`${roles}\``,
			COMMAND_URBAN_NOTFOUND: 'I am sorry, the word you are looking for does not seem to be defined in UrbanDictionary. Try another word?',
			COMMAND_URBAN_INDEX_NOTFOUND: 'You may want to try a lower page number.',
			SYSTEM_TEXT_TRUNCATED: (definition, url) => `${definition}... [continue reading](${url})`,
			COMMAND_URBAN_OUTPUT: (index, pages, definition, example, author) => [
				`→ \`Definition\` :: ${index}/${pages}\n_${definition}`,
				`→ \`Example\` :: ${example}`,
				`→ \`Author\` :: ${author}`
			].join('\n\n'),

			COMMAND_WHOIS_MEMBER: (member) => [
				`${member.nickname ? `alias **${member.nickname}**.\n` : ''}`,
				`Avec l'ID \`${member.user.id}\`,`,
				`cet utilistateur est **${member.user.presence.status}**${member.user.presence.game ? `, joue à: **${member.user.presence.game.name}**` : '.'}`,
				'\n',
				`\nA rejoint Discord le ${timestamp.displayUTC(member.user.createdAt)}`,
				`\nA rejoint ${member.guild.name} le ${timestamp.displayUTC(member.user.createdAt)}`
			].join(' '),
			COMMAND_WHOIS_MEMBER_ROLES: '→ `Rôles`',
			COMMAND_WHOIS_USER: (user) => [
				`Avec l'ID \`${user.id}\``,
				'\n',
				`A rejoint Discord le ${timestamp.displayUTC(user.createdAt)}`
			].join(' '),

			COMMAND_WIKIPEDIA_NOTFOUND: 'Je suis désolée, je n\'ai pas pu trouver quelque chose qui fonctionne avec votre demande dans Wikipedia.',
			COMMAND_YOUTUBE_NOTFOUND: 'Je suis désolée, je n\'ai pas pu trouver quelque chose qui fonctionne avec votre demande dans YouTube.',
			COMMAND_YOUTUBE_INDEX_NOTFOUND: 'Vous voulez peut-être essayer un numéro de page inférieur. Car je suis incapable de trouver quelque chose dans ce répertoire.',
			COMMAND_POLL_MISSING_TITLE: 'You must write a title.',
			COMMAND_POLL_TIME: 'When should the poll end? Duration and Date formats are allowed for this operation.',
			COMMAND_POLL_WANT_USERS: 'Do you want to include a users whitelist?',
			COMMAND_POLL_FIRSTUSER: 'Alright! Write a list of all users you want to whitelist from the poll separating their names or mentions by comma.',
			COMMAND_POLL_WANT_ROLES: 'Before creating the poll, do you want to whitelist roles?',
			COMMAND_POLL_FIRSTROLE: 'Alright! Write a list of all roles you want to whitelist from the poll separating their names or mentions by comma.',
			COMMAND_POLL_CREATE: (title, roles, users, options, time, id) => [
				`Successfully created a poll.`,
				`Title    : '${title}'`,
				`Roles    : ${roles ? roles.join(' | ') : 'None'}`,
				`Users    : ${users ? users.join(' | ') : 'None'}`,
				`Options  : ${options ? options.join(' | ') : 'None'}`,
				`Duration : ${duration(time)}`,
				`ID       : ${id}`
			],
			COMMAND_POLL_LIST_EMPTY: 'I could not find an active poll for this guild.',
			COMMAND_POLL_NOTEXISTS: 'The poll you want to retrieve either expired or does not exist.',
			COMMAND_POLL_NOTMANAGEABLE: 'This poll is protected and cannot be managed by anybody that is not the author nor a guild administrator.',
			COMMAND_POLL_REMOVE: 'Successfully removed the selected poll.',
			COMMAND_POLL_INVALID_OPTION: (options) => `Invalid option. Choose one of the following: ${options}.`,
			COMMAND_POLL_ALREADY_VOTED: 'You have already voted to this poll!',
			COMMAND_POLL_VOTE: 'Successfully voted! Selfdestructing this message in 10 seconds!',
			COMMAND_POLL_MISSING_ID: 'You need to provide me the poll\'s ID!',
			COMMAND_POLL_EMPTY_VOTES: 'Unfortunately, nobody has voted in this poll.',
			COMMAND_PRICE_CURRENCY: (from, to, amount) => `Current ${from} price is ${amount} ${to}`,
			COMMAND_PRICE_CURRENCY_NOT_FOUND: 'There was an error, please make sure you specified an appropriate coin and currency.',
			COMMAND_ROLES_AUDITLOG: 'Authorized: Public Role Management | \'Roles\' Command.',
			COMMAND_DUCKDUCKGO_NOTFOUND: 'I am sorry, but DuckDuckGo API returned a blank response. Try with another keywords.',
			COMMAND_DUCKDUCKGO_LOOKALSO: 'Related to this topic:',

			/**
			 * ################
			 * WEATHER COMMANDS
			 */

			COMMAND_WEATHER_ERROR_ZERO_RESULTS: 'Votre demande n\'a retourné aucun résultat.',
			COMMAND_WEATHER_ERROR_REQUEST_DENIED: 'Le GeoCode API Request a refusé.',
			COMMAND_WEATHER_ERROR_INVALID_REQUEST: 'Requête invalide.',
			COMMAND_WEATHER_ERROR_OVER_QUERY_LIMIT: 'Limite de questions atteint. Réessayez demain.',
			COMMAND_WEATHER_ERROR_UNKNOWN: 'Erreur indéterminée.',

			/**
			 * #################################
			 * #           INHIBITORS          #
			 * #################################
			 */

			INHIBITOR_SPAM: (channel) => `Can we move to ${channel} please? This command might be too spammy and can ruin other people's conversations.`,

			/**
			 * #################################
			 * #             UTILS             #
			 * #################################
			 */

			PREFIX_REMINDER: (prefix) => `The prefix in this guild is set to: \`${prefix}\``,

			COMMAND_DM_NOT_SENT: 'Je vous ai envoyé le message dans DMs.',
			COMMAND_DM_SENT: 'Je ne peux pas vous envoyer de messages dans DMs, m\'avez vous bloquée ? ',
			COMMAND_ROLE_HIGHER_SKYRA: 'The selected member has higher or equal role position than me.',
			COMMAND_ROLE_HIGHER: 'The selected member has higher or equal role position than you.',
			COMMAND_SUCCESS: 'Commande éxécutée avec succès.',
			COMMAND_TOSKYRA: 'Eww... I thought you loved me! 💔',
			COMMAND_USERSELF: 'Why would you do that to yourself?',

			SYSTEM_FETCHING: '`Récupération...`',
			SYSTEM_FETCHING_USERS: 'Some users are playing hide-and-seek, please wait a moment until I find them all...',
			SYSTEM_PROCESSING: '`Traitement...`',
			SYSTEM_HIGHEST_ROLE: 'Ce rôle a une position hiérarchique supérieure ou égale à moi, je ne suis pas capable de le donner à qui que ce soit.',
			SYSTEM_CHANNEL_NOT_POSTABLE: 'Je ne suis pas autorisée à envoyer des messages dans ce salon.',
			SYSTEM_FETCHBANS_FAIL: `Je n'ai pas réussi à récupérer les utilisateurs bannis. Est-ce que j'ai la permission ${PERMS.BAN_MEMBERS} ?`,
			SYSTEM_LOADING: '`Chargement... Veuillez patienter.`',
			SYSTEM_ERROR: 'Quelque chose est survenu!',
			SYSTEM_MESSAGE_NOT_FOUND: 'Je suis désolée, mais soit vous avez écrit l\'ID du message avec une erreur, soit il a été supprimé.',
			SYSTEM_NOTENOUGH_PARAMETERS: `I am sorry, but you did not provide enough parameters...`,

			LISTIFY_PAGE: (page, pageCount, results) => `Page ${page} / ${pageCount} | ${results} Total`,


			GUILD_SETTINGS_CHANNELS_MOD: 'Cette commande requiert un salon modlog pour fonctionner.',
			GUILD_SETTINGS_ROLES_MUTED: 'Cette commande requiert un rôle configuré pour les personnes en sourdine.',
			GUILD_BANS_EMPTY: 'Il n\'y a pas de bannissements enregistrés dans ce serveur.',
			GUILD_BANS_NOT_FOUND: 'Veuillez écrire un ID ou un tag valide.',
			GUILD_MUTE_NOT_FOUND: 'Cet utilisateur n\'est pas en sourdine.',
			CHANNEL_NOT_READABLE: `Je suis désolée, mais j'ai besoin de la permission **${PERMS.VIEW_CHANNEL}**`,

			USER_NOT_IN_GUILD: 'Cet utilisateur n\'est pas dans ce serveur.',

			EVENTS_GUILDMEMBERADD: 'Un utilisateur a rejoint',
			EVENTS_GUILDMEMBERADD_MUTE: 'Un utilisateur mit en sourdine a rejoint',
			EVENTS_GUILDMEMBERADD_RAID: 'Raid détecté',
			EVENTS_GUILDMEMBERREMOVE: 'Un utilisateur est parti',
			EVENTS_GUILDMEMBER_UPDATE_NICKNAME: (previous, current) => `Mis à jour le surnom **${previous}** pour **${current}**`,
			EVENTS_GUILDMEMBER_ADDED_NICKNAME: (previous, current) => `Nouveau surnom ajouté **${current}**`,
			EVENTS_GUILDMEMBER_REMOVED_NICKNAME: (previous) => `Surnom supprimé **${previous}**`,
			EVENTS_GUILDMEMBER_UPDATE_ROLES: (removed, added) => `${removed.length > 0 ? `Rôle supprimé${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}\n` : ''}${added.length > 0 ? `Rôle ajouté${added.length > 1 ? 's' : ''}: ${added.join(', ')}` : ''}`,
			EVENTS_MESSAGE_UPDATE: 'Message édité',
			EVENTS_MESSAGE_UPDATE_MSG: (old, msg) => `Avant: ${old.substring(0, 950)}\nNouveau: ${msg.substring(0, 950)}`,
			EVENTS_MESSAGE_DELETE: 'Message supprimé',
			EVENTS_COMMAND: (command) => `Commande utilisée: ${command}`,
			EVENTS_STREAM_START: (member) => `L'utilisateur **${member.user.tag}** est maintenant en live! **${member.presence.game.name}**\n${member.presence.game.url}`,
			EVENTS_STREAM_STOP: (member) => `L'utilisateur **${member.user.tag}** n'est plus en live!`,
			EVENTS_STARBOARD_SELF: (user) => `Dear ${user}, you cannot star your own messages.`,
			EVENTS_STARBOARD_BOT: (user) => `Dear ${user}, you cannot star bot messages.`,
			EVENTS_STARBOARD_EMPTY: (user) => `Dear ${user}, you cannot star empty messages.`,

			SETTINGS_DELETE_CHANNELS_DEFAULT: 'Paramètre Supprimé: `channels.default`',
			SETTINGS_DELETE_ROLES_INITIAL: 'Paramètre Supprimé: `roles.initial`',
			SETTINGS_DELETE_ROLES_MUTE: 'Paramètre Supprimé: `roles.mute`',

			GUILD_WARN_NOT_FOUND: 'I failed to fetch the modlog for appealing. Either it does not exist, is not type of warning, or it is appealed.',
			GUILD_MEMBER_NOT_VOICECHANNEL: 'I cannot execute this action in a member that is not connected to a voice channel.',

			PROMPTLIST_MULTIPLE_CHOICE: (list, amount) => `There are ${amount} ${amount === 1 ? 'result' : 'results'}. Please choose a number between 1 and ${amount}, or write **abort** to abort the prompt.\n${list}`,
			PROMPTLIST_ATTEMPT_FAILED: (list, attempt, maxAttempts) => `Invalid input. Attempt **${attempt}** out of **${maxAttempts}**\n${list}`,
			PROMPTLIST_ABORT: 'abort',
			PROMPTLIST_ABORTED: 'Successfully aborted the prompt.',

			EVENTS_ERROR_WTF: 'Quelle erreur terrible! Je suis vraiment désolée!',
			ERROR_STRING: (mention, message) => `Cher ${mention}, ${message}`,

			CONST_USERS: 'Users'
		};
	}

	isFeminine(type) {
		type = type.toString();
		return ['command', 'commands'].indexOf(type) !== -1;
	}

	piece(type) {
		type = type.toString();
		const plural = type.slice(-1) === 's';
		const tp = {
			command: 'commande',
			event: 'événement',
			extendable: 'extensible',
			finalizer: 'finaliseur',
			inhibitor: 'inhibiteur',
			language: 'langage',
			monitor: 'contrôleur',
			provider: 'fournisseur'
		}[(plural ? type.slice(0, -1) : type).toLowerCase()];
		return tp
			? `${tp}${plural ? 's' : ''}`
			: type;
	}

	async init() { } // eslint-disable-line no-empty-function

};
