/* eslint-disable @typescript-eslint/unified-signatures */
import { exec as childProcessExec, ExecOptions, PromiseWithChild } from 'child_process';
import { promisify } from 'util';

interface PromisifiedExec {
	(command: string): PromiseWithChild<{ stdout: string; stderr: string }>;
	(command: string, options: { encoding: 'buffer' | null } & ExecOptions): PromiseWithChild<{ stdout: Buffer; stderr: Buffer }>;
	(command: string, options: { encoding: BufferEncoding } & ExecOptions): PromiseWithChild<{ stdout: string; stderr: string }>;
	(command: string, options: ExecOptions): PromiseWithChild<{ stdout: string; stderr: string }>;
	(command: string, options?: ({ encoding?: string | null } & ExecOptions) | null): PromiseWithChild<{
		stdout: string | Buffer;
		stderr: string | Buffer;
	}>;
}

/**
 * Promisified version of child_process.exec for use with await
 * @param command The command to run
 * @param options The options to pass to exec
 */
export const exec: PromisifiedExec = promisify(childProcessExec);
