angular.module('thms.controllers').controller('EventReleaseController', ['$scope', 'EventService', '$state', 'availableFacilities', function($scope, Event, $state, facilities) {
  $scope.data = facilities.data;
  console.log(facilities);
  $scope.data.forEach(function(item) {
      item.selected = false
  });

  $scope.toggleSelectAll = function() {
    $scope.data.forEach(function(item) {
      item.selected = $scope.allSelected;
    });
  };


  $scope.releaseToInventory = function() {
    var selectedFacilities = [];
//    var data = Lazy(Restangular.stripRestangular($scope.data));
    data = Lazy($scope.data);
    data.filter(function(item) {
      return item.selected && item
    }).each(function(item, index) {
      selectedFacilities.push(Lazy(item).pick(['client_id', 'company_id', 'facility_id', 'total', 'remaining', 'event_period', 'event_date_id']).toObject())
    });

    Event.bulkReleaseToInventory($state.params.date_id, {data:selectedFacilities}).success(function(results) {
        $state.go('authenticated.main.event.view', {event_id: $state.params.event_id});
    }).error(function(error) {
        console.log(error);
    })

  };

}]);