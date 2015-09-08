angular.module('thms.directives').directive('timeTransform', function() {
  return {

    restrict: 'AE',
    template: '<h1>{{time.start}}</h1><input type="datetime-local" value="2014-05-09T14:00"/>',
    link: function(scope, element, attr) {
//        console.log(scope);
//        console.log(element);
    }

//    restrict: 'AE',
//    require: 'ngModel',
//    link: function (scope, element, attr, ngModel) {
//      ngModel.$setViewValue = "2014-05-09T14:00";
//      element.on('blur', function() {
//          console.log('changed');
//          console.log(element.val())
//      })
//
//    },
//    template: '<h1>foo</h1>'
  }
});