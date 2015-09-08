app = angular.module 'thms.modules.facilities'

class EditFacilityLeaseCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$modal', '$injector', '$humane', 'facilities', 'companies', '$stateParams', 'lease', 'Lease'

    # initialize the controller
    initialize: ->
        @$scope.lease = angular.copy @lease

        # changes depending on which context we are in
        if @facilities
            @$scope.facilities = @facilities
            @$scope.lease.data.company_id =  @$stateParams.company_id

        # changes depending on which context we are in
        if @companies
            @$scope.companies = @companies
            @$scope.lease.data.facility_id =  @$stateParams.facility_id


    save: ->
        @$scope.lease.save()
        .then (result) =>
#            @Leases.addElement result
            @lease.data = result.data
            @$humane.stickySuccess "Lease Updated"
            @$scope.$close(result)

        .catch (error) =>
            @$humane.stickyError "Error Updating Lease"