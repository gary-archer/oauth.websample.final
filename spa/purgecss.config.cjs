
/*
 * Produce the final bootstrap.min.css from the classes referenced in app.bundle.js
 * This produces a CSS solution without adding too much technical noise to the project
 * It also avoids needing to add style-src 'unsafe-inline' to the content security policy
 */
module.exports = {
    content: ['dist/spa/app.bundle.js'],
    css: ['bootstrap.min.css'],
    
    // This prevents some required elements from being removed
    // https://github.com/FullHuman/purgecss/issues/491
    safelist: [ 'body', 'container' ],
}
