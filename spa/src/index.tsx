import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {ErrorBoundary} from './views/errors/errorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const props = {
    viewModel: new AppViewModel(),
};

root.render (
    <ErrorBoundary>
        <BrowserRouter>
            <App {...props} />
        </BrowserRouter>
    </ErrorBoundary>
);
