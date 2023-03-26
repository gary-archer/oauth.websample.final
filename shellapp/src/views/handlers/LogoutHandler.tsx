import React, {useEffect} from 'react';
import {LogoutProps} from './logoutProps';

/*
 * The logout handler calls back an onLogout method
 */
export function LogoutHandler(props: LogoutProps): JSX.Element {

    useEffect(() => {
        props.onLogout();
    }, []);

    return  (
        <>
        </>
    );
}
