app = angular.module 'thms.modules.events'

class EventEditCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'event', '$state', '$humane'

    # initialize the controller
    initialize: ->
        @$scope.event = angular.copy(@event)

    save: (event) ->
        console.log 'foo'
        event.save(event.data)
        .then (result) =>
            @$humane.stickySuccess 'Event Saved'
            @$scope.$close(result)
        .catch (error) =>
            @$humane.stickyError 'Error Saving Event'