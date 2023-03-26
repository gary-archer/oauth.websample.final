import {NavigateFunction} from 'react-router-dom';
import {Authenticator} from '../../plumbing/oauth/authenticator';

/*
 * Input to the default handler
 */
export interface DefaultProps {

    // The authenticator is used to run page load logic
    authenticator: Authenticator;

    // The base path of the default micro-UI
    defaultAppBasePath: string;

    // A navigate function for use within the shell micro-UI
    navigate: NavigateFunction
}
