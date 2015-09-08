app = angular.module 'thms.modules.events'

class EventsIndexCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'events', 'event_types', '$state', '$modal'

    # initialize the controller
    initialize: ->
        @$scope.data = @events
        @$scope.event_types = @event_types.data

    newEvent: ->
        @modal = @$modal.open
            templateUrl: 'events/add',
            windowClass: 'effect-8'
            resolve:
                event: [
                    'Event', '$q', (Event, $q) ->
                        new Event()
                ]
            controller: 'EventEditCtrl'

        # Modal Closed Handler
        @modal.result
        .then (result) =>
#            @events.addElement result
            @$state.go 'authenticated.main.event.view', {event_id: result.data.id}
        .catch (error) ->
            console.log error
