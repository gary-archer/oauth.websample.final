import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './app/app';
import {AppViewModel} from './app/appViewModel';

const props = {
    viewModel: new AppViewModel(),
};
render (
    <BrowserRouter>
        <App {...props} />
    </BrowserRouter>,
    document.getElementById('root'),
);
