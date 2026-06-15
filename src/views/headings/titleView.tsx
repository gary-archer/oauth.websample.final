import {JSX} from 'react';
import {UserInfoView} from '../userInfo/userInfoView';
import {HeadingView} from './headingView';
import {TitleViewProps} from './titleViewProps';

/*
 * Render the title area, which contains a heading and user info
 */
export function TitleView(props: TitleViewProps): JSX.Element {

    return (
        <div className='flex px-2 mt-2 items-center'>
            <div className='w-2/3'>
                <HeadingView />
            </div>
            {props.userInfo &&
                <div className='w-1/3'>
                    <UserInfoView {...props.userInfo} />
                </div>
            }
        </div>
    );
}
