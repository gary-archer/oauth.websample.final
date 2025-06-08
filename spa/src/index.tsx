import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {BasePath} from './plumbing/utilities/basePath';
import {ErrorBoundary} from './views/errors/errorBoundary';

// Create the view model to hold permanent data
const props = {
    viewModel: new AppViewModel(),
};

// Create the React router with the base value
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render (
    <StrictMode>
        <ErrorBoundary>
            <BrowserRouter basename={BasePath.get()}>
                <App {...props} />
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>
);
