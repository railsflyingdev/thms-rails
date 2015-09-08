angular.module('thms.controllers').controller('EmployeesIndexCtrl', ['$scope', 'Restangular', 'data', function($scope, Restangular, data) {
  $scope.data = data;
}]);