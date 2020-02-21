import React from 'react';
import {LogoutViewProps} from './logoutViewProps';

/*
 * Render the simple logout view
 */
export class LogoutView extends React.Component<LogoutViewProps> {

    public constructor(props: any) {
        super(props);
    }

    /*
     * Render the simple logout view
     */
    public render(): React.ReactNode {

        return  (
            <div className='card border-0'>
                <h5>
                    You are logged out - click <a onClick={this.props.onLoginClick} href='#'>here</a> to log back in ...
                </h5>
            </div>
        );
    }
}
