angular.module('thms.services').service('Company', ['Auth', '$http', '$rootScope', function(Auth, $http, $rootScope  ) {
  this.create = function(data) {
      $http.post('/api/v1/my/clients', data).success(function(results) {
        $rootScope.$broadcast('company:create:success', results);
      }).error(function(error) {
        $rootScope.$broadcast('company:create:failure', error);
      })
  }
}]);
