import * as $ from 'jquery';

/*
 * Logic related to the simple logout view
 */
export class LogoutView {

    /*
     * Show logout details when the view loads
     */
    public async execute(): Promise<void> {

        // Hide session related button controls
        $('.hideWhenLoggedOut').addClass('hide');

        // Show sign in controls
        $('#loggedOut').removeClass('hide');
    }

    /*
     * Hide logout details when the view unloads
     */
    public unload(): void {

        // Make session related controls visible
        $('.hideWhenLoggedOut').removeClass('hide');

        // Hide sign in controls
        $('#loggedOut').addClass('hide');
    }
}
