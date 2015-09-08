app = angular.module 'thms.modules.clients'

class NewClientCtrl extends BaseCtrl
    @register app

    @inject '$scope', 'Company', '$state', '$humane'

    initialize: ->
        @$scope.company = new @Company()
        @$state.go 'authenticated.main.clients.add.name'

    save: ->
        @$scope.company.save()
        .then (result) =>
            console.log result.data
#            companyManager = new Employee({email: @$scope.admin.email}, "/api/v2/companies/#{result.data.id}/managers")

            @$state.go 'authenticated.main.company.view', {company_id: result.data.id}
            @$humane.stickySuccess 'Company Created'

        .catch (error) =>
            console.warn error