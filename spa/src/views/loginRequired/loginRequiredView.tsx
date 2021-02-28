import React from 'react';
import {LoginRequiredViewProps} from './loginRequiredViewProps';

/*
 * Render the simple login required view
 */
export class LoginRequiredView extends React.Component<LoginRequiredViewProps> {

    public constructor(props: LoginRequiredViewProps) {
        super(props);
        props.onLoading();
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
