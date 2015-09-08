app = angular.module 'thms.modules.reporting'

class SuiteOrderReporting extends BaseCtrl
    @register app

    @inject '$scope', 'events', '$state'

    # initialize the controller
    initialize: ->
        console.log 'foo'
        @$scope.events = @events