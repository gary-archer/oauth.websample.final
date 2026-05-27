/*
 * Adds support for live reload in development mode
 */

export const ws = new WebSocket(`wss://${location.host}/reload`);
ws.onmessage = (event: MessageEvent<string>) => {
    if (event.data === 'reload') {
        location.reload();
    }
};
