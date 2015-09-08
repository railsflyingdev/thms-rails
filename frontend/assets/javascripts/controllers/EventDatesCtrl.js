angular.module('thms.controllers').controller('EventDatesCtrl', ['$scope', 'Restangular', function($scope, Restangular) {

  $scope.addDate = function() {
    console.log('add date pushed');
  }

}]);