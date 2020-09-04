import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWsleepyDescription'),
	extendedHelp: (language) => language.get('commandWsleepyExtended'),
	queryType: 'sleepy',
	responseName: 'commandWsleepy'
})
export default class extends WeebCommand {}
