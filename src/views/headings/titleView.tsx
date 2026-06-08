import {JSX} from 'react';
import {UserInfoView} from '../userInfo/userInfoView';
import {HeadingView} from './headingView';
import {TitleViewProps} from './titleViewProps';

/*
 * Render the title area, which contains a heading and user info
 */
export function TitleView(props: TitleViewProps): JSX.Element {

    return (
        <div className='flex ml-2 mr-2 mt-2 my-auto'>
            <div className='w-2/3 self-center'>
                <HeadingView />
            </div>
            {props.userInfo &&
                <div className='w-1/3 self-center'>
                    <UserInfoView {...props.userInfo} />
                </div>
            }
        </div>
    );
}
