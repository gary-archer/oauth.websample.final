import React, {useEffect} from 'react';
import {LogoutProps} from './logoutProps';

/*
 * The login required handler simply displays a user message and provides a login button
 */
export function LogoutHandler(props: LogoutProps): JSX.Element {

    // Startup runs only once
    useEffect(() => {
        props.onLogout();
    }, []);

    /*
     * Default rendering
     */
    return  (
        <>
        </>
    );
}
