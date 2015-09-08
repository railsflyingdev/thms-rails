app = angular.module 'thms.modules.events'

class NewEventDateCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$modal', '$injector', '$humane','$stateParams', 'EventDate', 'EventDates'

    # initialize the controller
    initialize: ->
        @$scope.date = new @EventDate({event_id: @$stateParams.event_id}, false, "/api/v2/events/#{@$stateParams.event_id}/dates/")
    save: ->
        @$scope.date.save()
        .then (result) =>
            @EventDates.addElement result
            @$humane.stickySuccess "New Date Created"
            @$scope.$close(result)

        .catch (error) =>
            @$humane.stickyError "Error Creating Date"