angular.module('thms.services').service('EventService', ['$http', '$rootScope', function($http, $rootScope) {
//  console.group("Event Service Initialized");

  this.bulkReleaseToInventory = function(id, facilities) {
    return $http.post('/api/v1/my/events/dates/'+id+'/release', facilities);
  };

  this.releaseToInventory = function() {

  };

}]);