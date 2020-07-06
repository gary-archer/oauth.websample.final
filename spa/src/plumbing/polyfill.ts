/*
 * I have found this to be the simplest option to polyfill for Internet Explorer
 * Solutions such as Babel add too much noise to the project for my liking
 * https://github.com/damienbod/angular-auth-oidc-client/issues/345
 */

/* tslint:disable:no-submodule-imports */
import 'core-js/features/array';
import 'core-js/features/date';
import 'core-js/features/function';
import 'core-js/features/map';
import 'core-js/features/number';
import 'core-js/features/object';
import 'core-js/features/promise';
import 'core-js/features/regexp';
import 'core-js/features/string';
import 'core-js/features/symbol';
