import React, {useEffect} from 'react';
import {DefaultProps} from './defaultProps';

/*
 * The default handler calls back the page load logic
 */
export function DefaultHandler(props: DefaultProps): JSX.Element {

    useEffect(() => {
        startup();
    }, []);

    async function startup(): Promise<void> {
        await props.onPageLoad();
    }

    return  (
        <>
        </>
    );
}
