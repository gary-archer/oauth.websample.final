import React, {JSX} from 'react';
import {UserInfoView} from '../userInfo/userInfoView';
import {HeadingView} from './headingView';
import {TitleViewProps} from './titleViewProps';

/*
 * Render the title area, which contains a heading and user info
 */
export function TitleView(props: TitleViewProps): JSX.Element {

    return (
        <div className='row'>
            <div className='col-8 my-auto'>
                <HeadingView />
            </div>
            {props.userInfo &&
                <div className='col-4 my-auto'>
                    <UserInfoView {...props.userInfo} />
                </div>
            }
        </div>
    );
}
