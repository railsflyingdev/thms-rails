angular.module('thms.controllers').controller('EventAddCtrl', ['$scope', 'Restangular', '$state', function($scope, Restangular, $state) {

  $scope.createEvent = function(model) {
    Restangular.one('company', $scope.$root.currentUser.company.id).all('events').post(model).then(function(result) {
        console.log(result);
        $state.transitionTo('authenticated.main.events.add.dates');
    })
  };

}]);