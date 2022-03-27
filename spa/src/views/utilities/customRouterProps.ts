import {BrowserHistory} from 'history';
import {BrowserRouterProps} from 'react-router-dom';

export interface CustomRouterProps extends BrowserRouterProps {
    history: BrowserHistory;
}
