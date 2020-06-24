import React from 'react';
import {UserInfoView} from '../userInfo/userInfoView';
import {HeadingView} from './headingView';
import {TitleViewProps} from './titleViewProps';

/*
 * Render the title area, which contains a heading and user info
 */
export class TitleView extends React.Component<TitleViewProps> {

    public constructor(props: TitleViewProps) {
        super(props);
    }

    /*
     * Output child views
     */
    public render(): React.ReactNode {

        // If there are no user info props yet, just display the title
        if (!this.props.userInfo) {

            return  (
                <div className='row'>
                    <div className='col-8 my-auto'>
                        <HeadingView />
                    </div>
                </div>
            );
        }

        // Otherwise render user info also
        return  (
                <div className='row'>
                    <div className='col-8 my-auto'>
                        <HeadingView />
                    </div>
                    <div className='col-4 my-auto'>
                        <UserInfoView {...this.props.userInfo!}/>
                    </div>
                </div>
        );
    }
}
