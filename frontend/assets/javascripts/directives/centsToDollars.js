angular.module('thms.directives')
.directive('dollarCents', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      var toDollars = function(text) {
        var text = (text || "0");
        return (parseFloat(text) / 100);
      };

      var toCents = function(text) {
        var text = (text || "0");
        return (parseFloat(text) * 100);
      };

      ngModel.$parsers.push(toDollars);
      ngModel.$formatters.push(toCents);
    }
  }
});