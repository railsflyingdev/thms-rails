app = angular.module 'thms.modules.companies'

class CompanyEditCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$modal', 'company', '$humane'

    # initialize the controller
    initialize: ->
        @$scope.company = angular.copy(@company)

    save: ->
        # modified data is in $scope.company, pass it as an option to the save func
        @company.save(@$scope.company.data)
        .then (result) =>
            @$humane.successShort 'Company Updated'
            @$scope.$close(result)
        .catch (error) =>
            @$humane.stickyError 'Error Updating Company'