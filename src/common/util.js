import config from "common/const";

export const consoleLog = msg => {
    const now = new Date();
    const nowStr = now.toString();
    if (config.debug) {
        console.debug(`[${nowStr}] ${msg}`);
    }
};
