export {
	checkAppUpdate,
	compareSemver,
	fetchVersionInfo,
	getDeviceCpuArch,
	resolveDownloadUrl,
} from "../core/update-checker";

export * as updateService from "../core/update-checker";

export const appUpdateService = {
	checkAppUpdate: async () => {
		const { checkAppUpdate } = await import("../core/update-checker");
		return checkAppUpdate();
	},
	fetchVersionInfo: async () => {
		const { fetchVersionInfo } = await import("../core/update-checker");
		return fetchVersionInfo();
	},
};
