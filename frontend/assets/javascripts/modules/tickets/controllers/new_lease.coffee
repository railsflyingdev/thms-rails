app = angular.module 'thms.controllers'

class NewFacilityLeaseCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$modal', '$injector', '$humane'

    # initialize the controller
    initialize: ->

        # Optionally inject some dependencies
        @facilities = @$injector.get 'facilities' if @$injector.has 'facilities'
        @facilities = @$injector.get 'companies' if @$injector.has 'companies'

        @$scope.facilities = @facilities if @facilities
        @$scope.companies = @companies if @companies

#        @$scope.company = angular.copy(@company.data)

    save: ->
        # modified data is in $scope.company, pass it as an option to the save func
#        @company.save(@$scope.company)
#        .then (result) =>
#            @$humane.successShort 'Company Updated'
#            @$scope.$close()
#        .catch (error) =>
#            @$humane.stickyError 'Error Updating Company'