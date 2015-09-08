app = angular.module 'thms.services'

app.service 'InventoryConfirmation',  [
    '$http', '$rootScope', '$q', ($http, $rootScope, $q) ->

        view: (inventoryId) ->
            defferred = $q.defer()
            $http.get "/api/v2/inventory/#{inventoryId}/confirmations"
            .then (result) ->
                defferred.resolve result
            .catch (error) ->
                defferred.reject error

            defferred.promise

        update: (data) ->
            defferred = $q.defer()
            $http.put "/api/v2/inventory/#{data.inventory_id}/confirmations/#{data.id}", data
            .then (result) ->
                defferred.resolve result
            .catch (error) ->
                defferred.reject error

            defferred.promise
]