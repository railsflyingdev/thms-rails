app = angular.module 'thms.modules.facilities'

class NewFacilityLeaseCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$modal', '$injector', '$humane', 'facilities', 'companies', '$stateParams', 'Leases', 'Lease'

    # initialize the controller
    initialize: ->
        # changes depending on which context we are in
        if @facilities
            @$scope.facilities = @facilities
            @$scope.lease = new @Lease({company_id: @$stateParams.company_id})
        # changes depending on which context we are in
        if @companies
            @$scope.companies = @companies
            @$scope.lease = new @Lease({facility_id: @$stateParams.facility_id})

    save: ->
        @$scope.lease.save()
        .then (result) =>
            @Leases.addElement result
            @$humane.stickySuccess "New Lease Created"
            @$scope.$close(result)

        .catch (error) =>
            @$humane.stickyError "Error Creating Lease"