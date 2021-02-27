/*
 * Handle older browsers such as Internet Explorer gracefully
 */
var root = document.getElementById('root');
var html = '<div style="align-items: center; padding: 20px; font-family: sans-serif; font-size: 20px;">';
html += '<ul>';
html += '<li style="list-style:none"><strong>This browser is not supported, please use one of the following:</strong></li>';
html += '<li style="margin: 10px; list-style-position: inside"">Firefox</li>';
html += '<li style="margin: 10px; list-style-position: inside"">Edge</li>';
html += '<li style="margin: 10px; list-style-position: inside"">Chrome</li>';
html += '<li style="margin: 10px; list-style-position: inside"">Safari</li>';
html += '</ul>';
html += '</div>';
root.innerHTML = html;