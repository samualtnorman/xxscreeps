import { formatWithOptions, inspect } from 'util';

export function setupConsole(
	write: (fd: number, payload: string) => void,
) {
	const format = (args: any[]) =>
		formatWithOptions({ colors: true }, ...(args as [any]));

	Object.assign(console, {
		log(...args: any[]) {
			write(1, format(args));
		},

		warn(...args: any[]) {
			write(2, format(args));
		},

		error(...args: any[]) {
			this.warn(...args);
		},

		dir(object: any, options: any) {
			write(1, inspect(object, {
				customInspect: false,
				color: true,
				...options,
			}));
		},

		trace: function trace(...args: any[]) {
			const err = {
				name: 'Trace',
				message: format(args),
			};
			Error.captureStackTrace(err, trace);
			this.error((err as any).stack);
		},

		assert(expression: boolean, ...args: any[]) {
			if (!expression) {
				args[0] = `Assertion failed${args.length === 0 ? '' : `: ${args[0]}`}`;
				this.warn(...args);
			}
		},
	});
}
