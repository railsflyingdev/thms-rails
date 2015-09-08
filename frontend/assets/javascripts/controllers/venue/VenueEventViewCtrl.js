angular.module('thms.controllers').controller('VenueViewEventController', ['$scope', 'EventService', 'resolvedEvent', '$modal', function($scope, Event, event, $modal) {
    console.log("VenueViewEventController Loaded");
    console.log(event);
    $scope.event = event;
    var openedModal;

    $scope.newEventDate = function() {
        openedModal = $modal.open({
            templateUrl: 'events/_modal_add_event_date',
            controller: ['$scope', 'Options', function ($scope, Options) {
                $scope.Options = Options;

                $scope.next = function () {
                    $scope.$close();
                    $state.go('authenticated.main.inventory.confirmOptions.drinks')
                }

            }]
        });
    };

    $scope.editEventDate = function(date) {
      openedModal = $modal.open({
          templateUrl: 'events/_modal_add_event_date',
          controller: ['$scope', function ($scope) {
              $scope.date = date;
          }]
      })
    }

}]);