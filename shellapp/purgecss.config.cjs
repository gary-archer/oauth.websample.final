/*
 * Produce the final bootstrap.min.css
 * This produces a CSS solution without adding too much technical noise to the project
 * It also avoids needing to add style-src 'unsafe-inline' to the content security policy
 */
module.exports = {
    content: ['dist/index.mjs'],
    css: ['bootstrap.min.css'],
    
    // This prevents some required elements from being removed
    // https://github.com/FullHuman/purgecss/issues/491
    safelist: [ 'body', 'container' ],
}
