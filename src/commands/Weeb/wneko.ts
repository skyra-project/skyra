import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWnekoDescription'),
	extendedHelp: (language) => language.get('commandWnekoExtended'),
	queryType: 'neko',
	responseName: 'commandWneko'
})
export default class extends WeebCommand {}
