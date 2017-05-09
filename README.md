# Skyra 1.7

Skyra is a standalone bot created on 24th November 2016, it's designed to avoid the
'bot hell' by wrapping the functions of most popular bots into an unified and complex
system in which includes FailSafe systems and designed to be very reliable. As well as
its availability is 24/7.

## Changelog from 1.6 to 1.7

The time Skyra takes from when Skyra gets a message, until it gets processed and runs the command is
about 10 times faster now. The startup time is now thrice shorter, cache system has been optimized.

This version ensures much higher code quality, with a classbased backend, uses
[Komada](https://github.com/dirigeants/komada) **0.20.0** as framework. This version is a
complete refactor from **0.19.0** that made all bots greatly faster than before, this
speedboost is even noticeable in Skyra.

Oh, and Skyra 1.7 has internal ratelimits, if a command has extremely high ratelimit, it's
because it's not meant to be used whenever you want, specially in Canvas commands. Please
consider that Cairo Canvas uses OpenGL, and since hosts from Internet don't have a GPU, it
has to be processed from CPU, which is slow.

### Commands

- **Anime**: The whole code has been tweaked internally, reducing code redundancy.
- **Manga**: The whole code has been tweaked internally, reducing code redundancy.

- **8ball**: I made it more object oriented... and a bit smarter.
- **xkcd**: Should work better now.

- **Overwatch**: Has been fully tweaked, rewritten from scratch, it has several improvements
such as much higher processing speed.
- **Deletthis**: [CANVAS Improvement] Is now twice faster.
- **f**: [CANVAS Improvement] Is now slightly faster.
- **rate**: I modified it, what the hell, I was running redundant code!
- **triggered**: [CANVAS Improvement] I made it at least twice-thrice faster.

- **Assets**: Now it uses an unified function, so it's perfectly usable my Skyra from anywhere.
- **Ban**: Now it doesn't require a modlog channel. Implements FailSafe.
- **Kick**: Now it doesn't require a modlog channel. Implements FailSafe.
- **Prune**: I fixed several bugs (and some code redundancy), should be working fine now.
- **Reason**: It's new, it allows you to modify ModLogs' reasons.
- **Softban**: Now it doesn't require a modlog channel. Implements FailSafe.
- **Track**: I made it slightly better, nuked redundancy code.
- **Unban**: Now it doesn't require a modlog channel. Implements FailSafe.
- **Warn**: Now it doesn't require a modlog channel. Implements FailSafe.

- **Balance**: The code has been simplified.
- **Daily**: Tweaked the message, the code has been simplified. Implements FailSafe.
- **Pay**: Added prompts, the code has been simplified. Implements FailSafe.
- **Profile**: [CANVAS Improvement] Is now twice faster, the code has been simplified. Implements FailSafe.
- **Rep**: The code has been simplified. Implements FailSafe.
- **Reps**: The code has been simplified.
- **SetColor**: The code has been simplified, added support for HEX, RGB, HSL and Base10. Implements FailSafe.
- **Slotmachine**: The code has been simplified. Implements FailSafe.
- **Social**: It's a special command that give you full tools to manage **local** leaderboards.

- **Config**: Has been tweaked, it's much safer now. Implements full FailSafe system.
- **Donate**: Want to support me? Use this command to get full details.
- **Feedback**: This command has been *slightly* modified.

- **Claim**: More object oriented, simplified code, greater performance.
- **Color**: Added support for HEX, RGB, HSL and Base10.
- **Content**: Allows you to get the raw content from a message, keeping the whole markdown.
- **Google**: Has been tweaked a bit, shows 4 results instead of 5.
- **Quote**: Allows you to quote a message. It keeps the whole markdown.
- **Settings**: [WIP] It's designed for some stuff that **Config** can't handle for simplicity.
- **Sts**: Beautified the way Skyra shows the stats.
- **Unclaim**: More object oriented, simplified code, greater performance.
- **Urban**: Fixed several bugs, keep code consistency.
- **Whois**: Use a ID and I'll fetch into the deeps of Discord.
- **WikiPedia**: Tweaked some bugs from the output.
- **YouTube**: Instead of sending an embed object, now I just send the link.

### Events

- **guildBanAdd**: Has been simplified. **Creates Anonymous ModLog**.
- **guildBanRemove**: Has been simplified. **Creates Anonymous ModLog**.
- **guildMemberAdd**: Has been simplified, tweaked for maximum performance.
- **guildMemberUpdate**: Fixed some newbie errors. Now it's much more accurate.
- **modLogProtection**: Has been added, moderators won't be able to send messages into the
modlog channel. Neither run commands but moderation ones.

- **Greeting**: If **guildMemberAdd** is enabled, I'll send a message into the channel assigned as
**defaultChannel** by the configuration.
- **Farewell**: If **guildMemberRemove** is enabled, I'll send a message into the channel assigned as
**defaultChannel** by the configuration.
- **GreetingMessage**: Set your custom greetings. Events **Greeting** and **guildMemberAdd** must be enabled.
- **FarewellMessage**: Set your custom greetings. Events **Farewell** and **guildMemberRemove** must be enabled.

### Functions

They are totally backend, but...

- **assets**: Unified system for **assets** command and accessible from anywhere.
- **configuration**: Now allows defaults. So you can reset keys.
- **moderation**: Implements FailSafe and unified Moderation system.
- **resolveColor**: A 271 loc function that can convert HEX, RGB, HSL and Base10 into any other.
- **RethinkDB**: I have swapped from **SQLite**.
- **Search**: Unified search. Provides more accuracy, reliability, and code simplicity.
- **wrappers**: Unified class that allows maximum code simplicity along all pieces with readable error catching.

### Inhibitors

- **disabledCommands**: This inhibitor prevents certain commands to be run in the entire guild.
- **disabledCmdChannels**: This inhibitors prevents all commands to be run in certain channels.
- **mode**: `Free`, `Lite` or `Strict`. If it's not set in `free`, you'll prevent a whole subset of commands
to be run. `Free` allows all commands, `lite` allows moderation and utilities, as well as the social module remains
enabled, and `strict` only allows moderation and a limited set of utilities.
- **spam**: If Config/channels/**spam** is set, most 'spammy' commands will be locked to that channel. Please use this
as a fast and effective solution for **disabledCmdChannels**, unless you want these commands to be fully ignored.

### Monitors

- **ModLog**: If Config/event/**modLogProtection** is enabled, this monitor will keep modlogs clean.
- **NoInvite**: If Config/selfmod/**invitelinks** is enabled, this monitor will keep all channels clean
from invite links. This monitor ignores moderators.
- **Social**: Simplified the way Skyra gives you points. Seriously. Implements FailSafe system and full error tracing.
- **Tracker**: It's used for the **track** command. Has been optimized.

### Utils

Added unified functions with FailSafe systems. The whole system relies on them. Allows maximum code simplicity aswell.
