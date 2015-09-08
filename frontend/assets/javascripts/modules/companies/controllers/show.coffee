app = angular.module 'thms.modules.companies'

class CompanyShowCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'company', '$modal', '$humane', '$timeout', 'leases'

    # initialize the controller
    initialize: ->
        @$scope.company = @company
        @$scope.leases = @leases

    editCompany: ->
        @modal = @$modal.open
            templateUrl: 'companies/edit'
            windowClass: 'effect-8'
#            backdrop: 'static'
            resolve:
                company: [
                    'Companies', '$stateParams', (Companies, $stateParams) ->
                        Companies.view($stateParams.company_id)
                ]
            controller: 'CompanyEditCtrl'

        # Modal Closed Handler
        @modal.result
        .then (result) =>
            @$scope.company.data = result.data
        .catch (error) ->
            console.log error

    editLease: (lease) ->
        @modal = @$modal.open
            templateUrl: 'facilities/edit_lease'
            windowClass: 'effect-8'
            resolve:
                facilities: [
                    'Facilities', (Facilities) ->
                        Facilities.sync()
                ],
                companies:
                    # Injecting undefined as same controller is used in more than one place
                    # and we only need to choose facilities here, as we already have a company
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
                facilities: [
                    'Facilities', (Facilities) ->
                        Facilities.sync()
                ],
                companies:
                # Injecting undefined as same controller is used in more than one place
                # and we only need to choose facilities here, as we already have a company
                    () -> undefined

            controller: 'NewFacilityLeaseCtrl'
        # Modal Closed Handler
        @modal.result
        .then (result) ->
            console.log result