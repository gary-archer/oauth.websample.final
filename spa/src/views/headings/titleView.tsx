import React from 'react';
import {UserInfoView} from '../userInfo/userInfoView';
import {HeadingView} from './headingView';
import {TitleViewProps} from './titleViewProps';

/*
 * Render the title area, which contains a heading and user info
 */
export function TitleView(props: TitleViewProps): JSX.Element {

    // If there are no user info props yet, just display the title
    if (!props.userInfo) {

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
                <UserInfoView {...props.userInfo}/>
            </div>
        </div>
    );
}
