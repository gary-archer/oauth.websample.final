import React from 'react';

/*
 * Render the simple login required view
 */
export class LoginRequiredView extends React.Component<any, any> {

    public constructor(props: any) {
        super(props);
    }

    /*
     * Render the simple logout view
     */
    public render(): React.ReactNode {

        return  (
            <div className='row'>
                <div className='col-12 text-center mx-auto'>
                    <h6>
                        You are logged out - click HOME to sign in ...
                    </h6>
                </div>
            </div>
        );
    }
}
