'use strict';

/* Directives */

angular.module('simpleRTC.directives', [])
    .directive('appVersion', appVersion);

appVersion.$inject = ['version'];

function appVersion(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
}