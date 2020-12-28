/*
 * We would like Congito to return us to a hash location after logout but this is not supported
 * Therefore do a redirect upon return in code instead
 */
location.href = '#loggedout';
