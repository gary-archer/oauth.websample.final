import {CallbackHandler} from './callbackHandler';
import {Configuration} from './configuration';
import {LoginRequiredView} from './loginRequiredView';

/*
 * The example shell app handles OpenID Connect callback and post logout redirect handling
 */
if (location.pathname.toLowerCase() === '/loggedout') {

    // Render a logged out view for all micro UIs on the site
    const view = new LoginRequiredView(new Configuration());
    view.render();

} else {

    // Invoke the callback handler otherwise
    const handler = new CallbackHandler(new Configuration());
    handler.execute();
}
