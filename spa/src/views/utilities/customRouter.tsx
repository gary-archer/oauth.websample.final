import React, {useLayoutEffect, useState} from 'react';
import {Router} from 'react-router-dom';
import {CustomRouterProps} from './customRouterProps';

/*
 * A custom router to avoid needing to enclose the entire app within the router
 * https://stackoverflow.com/questions/69871987/react-router-v6-navigate-outside-of-components
 */
/* eslint-disable react/no-children-prop */
export function CustomRouter(props: CustomRouterProps): JSX.Element {

    const {basename, children, history} = props;

    const [state, setState] = useState({
        action: history.action,
        location: history.location,
    });

    useLayoutEffect(() => history.listen(setState), [history]);

    return (
        <Router
            location={state.location}
            navigationType={state.action}
            navigator={history}
            children={children}
            basename={basename} />
    );
}
