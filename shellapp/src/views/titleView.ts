import {DomUtils} from './domUtils';

/*
 * Render the simple title view whenever the shell app loads
 */
export class TitleView {

    public load(): void {

        DomUtils.createDiv('#root', 'title');
        const html =
            `<div class='row'>
                <div class='col-8 my-auto'>
                    <h2>OAuth Demo App</h2>
                </div>
            </div>`;
        DomUtils.html('#title', html);
    }
}
