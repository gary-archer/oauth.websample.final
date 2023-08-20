/*
 * The shell is a trivial app that renders a logged out view or redirects to the main SPA
 */

function renderLoggedOutView() {

    const root = document.querySelector('#root');

    const title = document.createElement('div');
    title.id = 'title';
    title.innerHTML =
        `<div class='row'>
            <div class='col-8 my-auto'>
                <h2>OAuth Demo App</h2>
            </div>
        </div>`;
    root.appendChild(title);

    const main = document.createElement('div');
    main.id = 'main';
    main.innerHTML =
        `<div>
            <div class='row'>
                <div class='col-12 text-center mx-auto'>
                    <h6>You are logged out</h6>
                </div>
            </div>
            <div class='row'>
                <div class='col col-one-fifth d-flex p-1'></div>
                <div class='col col-one-fifth d-flex p-1'></div>
                <div class='col col-one-fifth d-flex p-1'>
                    <button
                        id='btnLogin' 
                        type='button'
                        class='btn btn-primary w-100 p-1'
                        click=>Login</button>
                </div>
                <div class='col col-one-fifth d-flex p-1'></div>
                <div class='col col-one-fifth d-flex p-1'></div>
            </div>
        </div>`
    root.appendChild(main);

    document.querySelector('#btnLogin')?.addEventListener(
        'click',
        () => location.href = `${location.origin}/spa/`);
}

if (location.pathname.toLowerCase() === '/loggedout') {
    renderLoggedOutView();
} else {
    location.href = `${location.origin}/spa/`;
}
