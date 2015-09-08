app = angular.module 'thms.modules.events'

class EventShowCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'event', 'dates', '$state', '$modal'

    # initialize the controller
    initialize: ->
        @$scope.event = @event
        @$scope.dates = @dates
#        @$scope.leases = @leases

    editEvent: ->
        @modal = @$modal.open
            templateUrl: 'events/edit',
            windowClass: 'effect-8'
            resolve:
                event: [
                    'Events', '$stateParams', (Events, $stateParams) ->
                        Events.view($stateParams.event_id)
                ]
            controller: 'EventEditCtrl'

        # Modal Closed Handler
        @modal.result
        .then (result) =>
            @$scope.event.data = result.data
        .catch (error) ->
            console.log error

    newEventDate: ->
        @modal = @$modal.open
            templateUrl: 'events/add_date'
            windowClass: 'effect-8'
#            resolve:
#                companies: [
#                    'Companies', (Companies) ->
#                        Companies.sync()
#                ],
#                facilities:
#                # Injecting undefined as same controller is used in more than one place
#                # and we only need to choose facilities here, as we already have a company
#                    () -> undefined

            controller: 'NewEventDateCtrl'
        # Modal Closed Handler
        @modal.result
        .then (result) ->
            console.log result

    editDate: (date) ->
        modal = @$modal.open
            templateUrl: 'events/edit_date'
            windowClass: 'effect-8'
            controller: [
                '$scope', '$humane', ($scope, $humane) ->
                    $scope.date = angular.copy date;

                    $scope.save = ->
                        date.save($scope.date.data)
                        .then (result) =>
                            $humane.stickySuccess "Changes Saved"
                            $scope.$close(result)
                        .catch (error) =>
                            $humane.stickyError "Error Saving Changes"
            ]

    releaseDate: (date) ->
        @$state.go 'authenticated.main.event.view.release', {date_id: date.data.id}