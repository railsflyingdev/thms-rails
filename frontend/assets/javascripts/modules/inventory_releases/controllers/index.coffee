app = angular.module 'thms.modules.inventory_releases'

class InventoryReleasesIndexCtrl extends BaseCtrl
  @register app

  @inject '$scope', 'inventory_releases', '$state', '$modal'

  # initialize the controller
  initialize: ->
    @$scope.data = @inventory_releases