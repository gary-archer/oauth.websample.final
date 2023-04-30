import React from 'react';

/*
 * Render the title area, which contains a heading
 */
export function TitleView(): JSX.Element {

    return  (
        <div className='row'>
            <div className='col-8 my-auto'>
                <h2>OAuth Demo App</h2>
            </div>
        </div>
    );
}
