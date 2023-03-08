function renderLoggedOut() {

    const parent = document.querySelector('#root');
    if (parent) {

        const element = document.querySelector(`#info`);
        if (!element) {

            const child = document.createElement('div');
            child.id = 'info';
            child.innerHTML = 'You are logged out'
            parent.appendChild(child);
        }
    }
}

if (location.pathname === '/loggedout') {
    renderLoggedOut();
} else {
    location.pathname = 'https://web.authsamples-dev.com/demoapp';
}
