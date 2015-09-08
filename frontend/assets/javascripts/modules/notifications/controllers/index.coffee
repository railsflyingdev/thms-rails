app = angular.module 'thms.modules.notifications'

class NotificationIndexCtrl extends BaseCtrl
  @register app
  # list of dependencies to be injected
  # each will be glued to the instance of the controller as a property
  @inject '$scope', 'Companies', 'data', '$q', '$http'

  # initialize the controller
  initialize: ->
    @$scope.message = ''
    @$scope.data = @data

  send_notification: ->
    @url = '/api/v2/notifications'
    method = 'POST'
    uuids = []
    @$scope.data.map (company) =>
      uuids.push company.data.id

    @data = { companies: uuids, message: @$scope.message}

    defferred = @$q.defer()

    @$http
      method: method
      url: @url
      data: @data
    .then (result) =>
      defferred.resolve result
    .catch (error) =>
      defferred.reject error

    defferred.promise

  # send notification
  notify: ->
    this.send_notification().then (result) =>
      alert 'Sent'
    .catch (error) =>
      alert 'Error'