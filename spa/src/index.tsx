import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import {ErrorBoundary} from './views/errors/errorBoundary';

const viewModel = new AppViewModel();
const props = {
    viewModel,
};

render (
    <ErrorBoundary>
        <BrowserRouter>
            <App {...props} />
        </BrowserRouter>
    </ErrorBoundary>,
    document.getElementById('root'),
);
