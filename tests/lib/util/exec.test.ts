import { exec } from '@utils/exec';
import { platform } from 'os';

const windows = platform() === 'win32';
const lineEndings = windows ? '\r\n' : '\n';

test('exec(basic)', async () => {
	const pending = exec('echo 1');

	const result = await pending;
	expect(result.stdout).toBe(`1${lineEndings}`);
	expect(result.stderr).toBe('');
});

test('exec(buffer)', async () => {
	const pending = exec('echo 1', { encoding: 'buffer' });

	const result = await pending;
	expect(result.stdout).toEqual(Buffer.from(`1${lineEndings}`));
	expect(result.stderr).toEqual(Buffer.from(''));
});
