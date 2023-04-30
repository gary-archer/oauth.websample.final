import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {ErrorBoundary} from './views/errors/errorBoundary';

// Create the main view model
const props = {
    viewModel: new AppViewModel(),
};

// Create the React router
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render (
    <ErrorBoundary>
        <BrowserRouter>
            <App {...props} />
        </BrowserRouter>
    </ErrorBoundary>
);
