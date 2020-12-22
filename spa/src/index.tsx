import React from 'react';
import {render} from 'react-dom';
import {App} from './app/app';

/*
 * The application entry point renders the main app
 */
if (window.top === window.self) {
    render (
        <App />,
        document.getElementById('root'),
    );
}
