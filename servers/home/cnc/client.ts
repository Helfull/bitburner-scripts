import { config } from "../config";

export async function trySend(ns: NS, message: string, repeat = 10): Promise<boolean> {
    const handle = ns.getPortHandle(config.cncPort);
    for (let i = 0; i < repeat; i++) {
        if (handle.tryWrite(message)) {
            return true;
        }
        await ns.sleep(100);
    }
    return false;
}
