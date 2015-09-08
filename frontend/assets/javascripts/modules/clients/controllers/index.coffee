app = angular.module 'thms.modules.clients'

class IndexCtrl extends BaseCtrl
  @register app

  @inject '$scope', 'clients', '$state'

  # initialize the controller
  initialize: ->
    @$scope.data = @clients