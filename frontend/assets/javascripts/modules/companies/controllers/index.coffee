app = angular.module 'thms.modules.companies'

class CompanyIndexCtrl extends BaseCtrl
    @register app
    # list of dependencies to be injected
    # each will be glued to the instance of the controller as a property
    # e.g. @$scope, @Book
    @inject '$scope', 'Companies', 'data', '$state'

    # initialize the controller
    initialize: ->
        @$scope.data = @data

    viewCompany: (id) ->
#        @Companies.selected(id)
        @$state.go 'authenticated.main.company.view', {company_id: id}

    updateFilter: ->
        @$scope.filterModel =
            data:
                name: @$scope.filterValue
                friendly_name: @$scope.filterValue
                manager:
                    email: @$scope.filterValue