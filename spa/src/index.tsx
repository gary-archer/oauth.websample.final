import React from 'react';
import {render} from 'react-dom';
import {App} from './app/app';

/*
 * The application entry point renders the main app
 */
render
    (<App />,
    document.getElementById('root'),
);