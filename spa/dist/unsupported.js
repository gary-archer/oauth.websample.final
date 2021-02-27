/*
 * Provide an unsupported message if Internet Explorer is used
 */
var html = '<div style="font-size: 20px; align-items: center; padding: 20px">';
html += '<ul>';
html += '<li style="list-style: none; font-weight: bold">This browser is not supported, please use one of the following:</li>';
html += '<li style="list-style: inside; padding: 5px">Firefox</li>';
html += '<li style="list-style: inside; padding: 5px">Edge</li>';
html += '<li style="list-style: inside; padding: 5px">Chrome</li>';
html += '<li style="list-style: inside; padding: 5px">Safari</li>';
html += '</ul>';
html += '</div>';
document.getElementById('root').innerHTML = html;