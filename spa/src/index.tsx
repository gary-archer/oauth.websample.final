import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {ErrorBoundary} from './views/errors/errorBoundary';

// Create the view model to hold permanent data
const props = {
    viewModel: new AppViewModel(),
};

// Get the <base> value from index.html
const baseElement = document.querySelector('base') as HTMLElement;
const base = baseElement?.getAttribute('href') || '/';

// Create the React router with the base value
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render (
    <ErrorBoundary>
        <BrowserRouter basename={base}>
            <App {...props} />
        </BrowserRouter>
    </ErrorBoundary>
);
