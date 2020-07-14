import {InMemoryWebStorage} from 'oidc-client';

/*
 * Customise memory token storage
 */
export class MemoryTokenStorage extends InMemoryWebStorage {

    /*
     * When tokens are saved to memory, also persist a dummy refresh token
     * This makes the OIDC client library send refresh token grant messages
     */
    public setItem(key: string, value: any): any {

        const deserialized = JSON.parse(value);
        deserialized.refresh_token = 'x';
        super.setItem(key, JSON.stringify(deserialized));
    }
}
