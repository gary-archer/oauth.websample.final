import React from 'react';
import {render} from 'react-dom';
import {App} from './app/app';
import {IFrameApp} from './app/iframeApp';

/*
 * The application entry point
 */
if (window.top === window.self) {

    // Run the main ReactJS app
    render (
        <App />,
        document.getElementById('root'),
    );
} else {

    // If our SPA is running on an iframe, handle token renewal responses
    const app = new IFrameApp();
    app.execute();
}
