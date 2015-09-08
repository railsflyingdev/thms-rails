app = angular.module 'thms.services'

app.factory 'InventoryRelease', ['$http', '$q', ($http, $q) ->
  BASE_URL = '/api/v2/inventory_releases/'
  class InventoryRelease
    constructor: (@data, @edited = false) ->
      @data = {} if not @data
      @url = if @data.id then BASE_URL + @data.id  else BASE_URL
]