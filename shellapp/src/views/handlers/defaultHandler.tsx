import React, {useEffect} from 'react';
import {DefaultProps} from './defaultProps';

/*
 * The default handler runs page load logic
 */
export function DefaultHandler(props: DefaultProps): JSX.Element {

    // Startup runs only once
    useEffect(() => {
        startup();
    }, []);

    /*
     * Take action depending on the current URL
     */
    async function startup(): Promise<void> {

        // Run the page load handler, which may handle a login response and redirect back to the calling app
        const pageLoadResult = await props.authenticator.handlePageLoad();
        if (!pageLoadResult.handled) {

            if (pageLoadResult.isLoggedIn) {
                
                // If there are valid cookies then navigate to the default app
                location.href = `${location.origin}${props.defaultAppBasePath}`;

            } else {

                // Otherwise move to a view that renders a login button
                props.navigate('/login');
            }
        }
    }
    
    /*
     * Default rendering
     */
    return  (
        <>
        </>
    );
}
