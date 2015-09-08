app = angular.module 'thms.modules.tickets'

class TicketsIndexCtrl extends BaseCtrl
    @register app

    @inject '$scope', '$state', 'tickets', '$modal', '$window', '$http'

    # initialize the controller
    initialize: ->
        @$scope.data = @tickets

    viewTicket: (ticket) ->
        file = "/tickets/#{ticket.storage['file_name']}"
        modal = @$modal.open
            template: "<div class='panel'><iframe src='#{file}'></iframe></div>"
            windowClass: 'effect-0 xxlarge xxtall'

    downloadAllTickets: (event) ->
        @$window.open "/api/v2/my/inventory/#{event.data.inventory_id}/tickets/zip", "_blank"
