app = angular.module 'thms.services'

app.factory 'InventoryReleases', ['$http', '$q', '$angularCacheFactory', 'InventoryRelease', ($http, $q, $angularCacheFactory, InventoryRelease) ->
  BASE_URL = '/api/v2/inventory_releases/'

  new class InventoryReleases
    window.foo = @
    $angularCacheFactory 'InventoryReleasesCache', {
      capacity: 100
      maxAge: 900000
      storageMode: 'localStorage'
    }

    __collection = []
    __selected = ''

    constructor: ->

      ## Retreive all resources
    sync: ->
      defered = $q.defer()
      __collection = []
      $http.get(BASE_URL)
      .then (results) =>
        __collection.push new InventoryRelease(data, false) for data in results.data
        defered.resolve __collection

      .catch (error) ->
        defered.reject error

      defered.promise
]