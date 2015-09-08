#app = angular.module 'thms.modules.facilities'
#
#class NewFacilityLeaseCtrl extends BaseCtrl
#    @register app
#
#    @inject '$scope', '$modal', 'data', '$humane'
#
#    # initialize the controller
#    initialize: ->
##        @$scope.company = angular.copy(@company.data)
#
#    save: ->
#        # modified data is in $scope.company, pass it as an option to the save func
##        @company.save(@$scope.company)
##        .then (result) =>
##            @$humane.successShort 'Company Updated'
##            @$scope.$close()
##        .catch (error) =>
##            @$humane.stickyError 'Error Updating Company'