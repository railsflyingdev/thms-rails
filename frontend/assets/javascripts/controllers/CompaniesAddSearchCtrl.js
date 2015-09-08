angular.module('thms.controllers').controller('ClientsAddSearchCtrl', ['$scope', 'Restangular','Auth', function($scope, Restangular, Auth) {
    $scope.search = function(email) {
        Restangular.all('employees').getList({'email': email}).then(function(users) {
          $scope.results = users
        })
    }
}]);