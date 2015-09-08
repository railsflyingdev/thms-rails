app = angular.module 'thms.services'

app.factory 'Facility', ['$http', '$q', ($http, $q) ->
    BASE_URL = '/api/v2/facilities/'
    class Facility
        constructor: (@data, @edited = false) ->
            @data = {} if not @data
            @url = if @data.id then BASE_URL + @data.id  else BASE_URL

        save: (data = @data) ->
            defferred = $q.defer()

            method = if @data.id then 'PUT' else 'POST'

            $http
                method: method
                url: @url
                data: data
            .then (result) =>
                @data = result.data
                defferred.resolve result
            .catch (error) =>
                # get the errors from the response and merge them in eventually...
                defferred.reject error

            defferred.promise

#
]