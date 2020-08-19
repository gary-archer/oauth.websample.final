import url from 'url';

/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 */
export class HttpProxy {

    /*
     * Activate debugging if required
     */
    public static async initialize(useProxy: boolean, proxyUrl: string): Promise<void> {

        if (useProxy) {

            // Use a dynamic import so that this dependency is only used on a developer PC
            await import('tunnel-agent').then((agent) => {

                const opts = url.parse(proxyUrl);
                HttpProxy._agent = agent.httpsOverHttp({
                    proxy: opts,
                });
            });
        }
    }

    /*
     * Return the configured agent
     */
    public static get(): any {
        return HttpProxy._agent;
    }

    // The global agent instance
    private static _agent: any = null;
}
