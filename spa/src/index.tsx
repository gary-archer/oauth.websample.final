import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';
import { ErrorBoundary } from './views/errors/errorBoundary';

var viewModel = new AppViewModel();
const appProps = {
    viewModel,
};
const errorProps = {
    eventBus: viewModel.eventBus,
};

render (
    <ErrorBoundary {...errorProps}>
        <BrowserRouter>
            <App {...appProps} />
        </BrowserRouter>
    </ErrorBoundary>,
    document.getElementById('root'),
);
