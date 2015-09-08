angular.module('thms.controllers').controller('ConfirmOptionsController', ['$scope', '$state', 'Options', 'IceHockeyOptions', '$modal', 'details', '$humane', 'Tickets', function ($scope, $state, Options, IceHockeyOptions, $modal, details, $humane, Tickets) {
  $scope.confirmButtonDisabled = false;
  $scope.confirmButtonText = "Confirm";

  if (details.event_name == 'WWE') {
    $scope.Options = Options;
  } else if (details.event_name == 'INTERNATIONAL ICE HOCKEY') {
    $scope.Options = IceHockeyOptions;
  } else {
    console.log('bang, something went wrong')
  }

  $scope.details = details;

  $state.go('authenticated.main.inventory.confirmOptions.attendance');

  $scope.confirmDrink = function(item) {
    console.log(item.name + " requested");
    item.count = 1;
    item.requested = true;
  };

  $scope.unConfirmDrink = function(item) {
    console.log(item.name + " de-requested");
    item.count = 0;
    item.requested = false;
  };

  $scope.increment = function (snack) {
    if (snack.count == undefined) {
      snack.count = 0
    }
    snack.count = snack.count + 1;
  };

  $scope.decrement = function (snack) {
    if (snack.count == undefined) {
      snack.count = 0
    }
    if (snack.count >= 0) {
      snack.count = snack.count - 1;
    }
  };

  $scope.goToSnackSelection = function() {
    var modal = $modal.open({
      templateUrl: 'inventory/_modal_snack_conditions',
      windowClass: 'effect-10'
    });

    modal.result.then(function(result) {
        $state.go('authenticated.main.inventory.confirmOptions.snacks')
    })
  };


  $scope.selectMenu = function (menu) {
    $scope.Options.selectedOptions.selection.menu = menu;

    if (menu.doesntHaveDrinksPackage == true) {
      $state.go('authenticated.main.inventory.confirmOptions.drinks');
      return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'inventory/_modal_drinksChoices',
      controller: ['$scope', 'Options', 'IceHockeyOptions', function ($scope, Options, IceHockeyOptions) {

        if (details.event_name == 'WWE') {
          $scope.Options = Options;
        } else if (details.event_name == 'INTERNATIONAL ICE HOCKEY') {
          $scope.Options = IceHockeyOptions;
        } else {
          console.log('bang, something went wrong')
        }

        $scope.next = function () {
          $scope.$close();
          $state.go('authenticated.main.inventory.confirmOptions.drinks')
        }

      }]
    });

  };

  $scope.openModalForItemImage = function(item) {
    var modal = $modal.open({
      template: '"<div class="panel" style="display: flex"><img style="width: auto; max-height: 800px; margin: 0 auto;" src="'+ item.data.image.file_name +'"/></div>',
      windowClass: "effect-8 narrow"
    })
  };

  $scope.notComing = function () {
    $scope.Options.buildSelections();
    $scope.Options.selectedOptions.selection.notComing = true;
    $scope.Options.selectedOptions.inventory_id = $state.params['id'];
    $scope.Options.submitSelections();
  };

  $scope.createNewParkingReservation = function () {
    $scope.Options.parking.push({});
  };

  $scope.buildOptions = function () {
    $scope.Options.buildSelections();
    $state.go('authenticated.main.inventory.confirmOptions.review');
  };

  $scope.wantStandardDrinksMenu = function() {
    $scope.Options.selectedOptions.selection.standardDrinkList = true;
    $state.go('authenticated.main.inventory.confirmOptions.snacks');
  };

  $scope.confirmChoices = function () {
    $scope.confirmButtonDisabled = true;
    $scope.confirmButtonText = "Please Wait...";

    // important
    $scope.Options.selectedOptions.is_attending = true;

    $scope.Options.selectedOptions.inventory_id = $state.params['id'];
    $scope.Options.submitSelections();
  };

  $scope.$root.$on('options:selections:saved', function (event, data) {

    if ($scope.Options.selectedOptions.is_attending) {
      var modal = $modal.open({
        templateUrl: 'inventory/_modal_guest_names',
        windowClass: 'effect-0',
//        backdrop: 'static',
        resolve: {
          confirmation: [
            'InventoryConfirmation', function(InventoryConfirmation) {
              return InventoryConfirmation.view(data.inventory_id)
            }
          ]
        },
        controller: [
          '$scope', 'confirmation', 'InventoryConfirmation', function($scope, confirmation, InventoryConfirmation) {
            $scope.confirmation = confirmation.data;
            if ($scope.confirmation.guests.length === 0) {
              $scope.guestList = [
                {
                  name: ''
                }
              ];
            } else {
              $scope.guestList = $scope.confirmation.guests;
            }
            $scope.addNewGuestName = function() {
              return $scope.guestList.push({
                name: ''
              });
            };

            $scope.save = function() {
              $scope.confirmation.guests = $scope.guestList;
              InventoryConfirmation.update($scope.confirmation).then(function(result) {
                $scope.$close();
              }).catch(function(error) {
                return $scope.$close();
              });
            };
          }
        ]
      });

      modal.result.then(function(result) {
        $state.go('authenticated.main.event.client.index');
        $humane.stickySuccess('Options Confirmed Successfully');
        // they have confirmed guests or something
        Tickets.addMagicalTickets();
      });
    } else {

      // they arent coming
      $state.go('authenticated.main.event.client.index');
      $humane.stickySuccess('Options Confirmed Successfully');
    }

  })

}]);