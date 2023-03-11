import {CallbackHandler} from './callbackHandler';
import {Configuration} from './configuration';
import {InvalidRouteHandler} from './invalidRouteHandler';
import {LoginRequiredView} from './loginRequiredView';

/*
 * The simple shell app deals with some default routes
 */
if (location.pathname.toLowerCase() === '/loggedout') {

    // Render a logged out view for all micro UIs on the site
    const view = new LoginRequiredView(new Configuration());
    view.render();

} else if (location.pathname.toLowerCase() === '/callback') {

    // Invoke the callback handler if this is a login response
    const handler = new CallbackHandler(new Configuration());
    handler.execute();

} else {

    // Invoke the invalid route handler otherwise
    const handler = new InvalidRouteHandler(new Configuration());
    handler.execute();
}
