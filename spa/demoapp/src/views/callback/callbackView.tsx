import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {HtmlStorageHelper} from '../../plumbing/utilities/htmlStorageHelper';
import {CurrentLocation} from '../utilities/currentLocation';
import {CallbackViewProps} from './callbackViewProps';

/*
 * Handle requests to the callback path, which handles the return from login in the shell application
 */
export function CallbackView(props: CallbackViewProps): JSX.Element {

    useEffect(() => {
        startup();
    }, []);

    CurrentLocation.path = useLocation().pathname;

    /*
     * Upon return from login, restore the pre-login path
     */
    function startup(): void {

        const pathToRestore = HtmlStorageHelper.postLoginRestore() || '/';
        props.navigate(pathToRestore);
    }

    return  (
        <>
            <p>in callback view</p>
        </>
    );
}
