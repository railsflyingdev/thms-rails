angular.module('thms.directives').filter('filterNumeric', function() {
    return function(input) {
     return input.replace(/[0-9]/g, '');
    }
});