import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {BasePath} from './plumbing/utilities/basePath';
import {ErrorBoundary} from './plumbing/errors/lib';

// Create the view model to hold permanent data
const props = {
    viewModel: new AppViewModel(),
};

// Create the React router with the base value
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render (
    <ErrorBoundary>
        <BrowserRouter basename={BasePath.get()}>
            <App {...props} />
        </BrowserRouter>
    </ErrorBoundary>
);
