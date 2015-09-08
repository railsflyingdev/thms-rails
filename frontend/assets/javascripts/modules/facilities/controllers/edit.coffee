app = angular.module 'thms.modules.facilities'

class FacilityEditCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'facility', '$state', '$humane'

    # initialize the controller
    initialize: ->
        @$scope.facility = angular.copy(@facility)

    save: (facility) ->
        facility.save(facility.data)
        .then (result) =>
            @$humane.stickySuccess 'Facility Saved'
            @$scope.$close(result)
        .catch (error) =>
            @$humane.stickyError 'Error Saving Facility'