app = angular.module 'thms.modules.facilities'

class FacilityShowCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'facility', 'leases', '$state', '$modal'

    # initialize the controller
    initialize: ->
        @$scope.facility = @facility
        @$scope.leases = @leases

    editFacility: ->
        @modal = @$modal.open
            templateUrl: 'facilities/edit',
            windowClass: 'effect-8'
            resolve:
                facility: [
                    'Facilities', '$stateParams', (Facilities, $stateParams) ->
                        Facilities.view($stateParams.facility_id)
                ]
            controller: 'FacilityEditCtrl'

        # Modal Closed Handler
        @modal.result
        .then (result) =>
            @$scope.facility.data = result.data
        .catch (error) ->
            console.log error

    editLease: (lease) ->
        @modal = @$modal.open
            templateUrl: 'facilities/edit_lease'
            windowClass: 'effect-8'
            resolve:
                companies: [
                    'Companies', (Companies) ->
                        Companies.sync()
                ],
                facilities:
                    () -> undefined
                lease: [
                    'Leases', (Leases) ->
                        Leases.view(lease.id)
                ]

            controller: 'EditFacilityLeaseCtrl'
        @modal.result
        .then (result) ->
            console.log result

    newLease: ->
        @modal = @$modal.open
            templateUrl: 'facilities/new_lease'
            windowClass: 'effect-8'
            resolve:
                companies: [
                    'Companies', (Companies) ->
                        Companies.sync()
                ],
                facilities:
                # Injecting undefined as same controller is used in more than one place
                # and we only need to choose facilities here, as we already have a company
                    () -> undefined

            controller: 'NewFacilityLeaseCtrl'
        # Modal Closed Handler
        @modal.result
        .then (result) ->
            console.log result