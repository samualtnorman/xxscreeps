import { process } from './runtime';
declare const processInfo: any;

export const { arch, platform, version } = processInfo;
export const cwd = () => '.';
export const cpuUsage = () => process.cpuUsage();
export const hrtime = { bigint: () => process.hrtime.bigint() };
