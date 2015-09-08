app = angular.module 'thms.modules.facilities'

class FacilitiesIndexCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'facilities', '$state', '$modal'

    # initialize the controller
    initialize: ->
        @$scope.data = @facilities

    newFacility: ->
        @modal = @$modal.open
            templateUrl: 'facilities/new',
            windowClass: 'effect-8'
            resolve:
                facility: [
                    'Facility', '$q', (Facility, $q) ->
                        new Facility()
                ]
            controller: 'FacilityEditCtrl'

        # Modal Closed Handler
        @modal.result
        .then (result) =>
            @facilities.addElement result
        .catch (error) ->
            console.log error

    # filter on facility name, type, and company name
    updateFilter: ->
        @$scope.filterModel =
            data:
                name: @$scope.filterValue
                facility_type: @$scope.filterValue
                current_leasee_name: @$scope.filterValue