app = angular.module 'thms.services'

app.factory 'Employee', ['$http', '$q', ($http, $q) ->
    BASE_URL = '/api/v2/employees/'

    class Employee
        constructor: (@data, @url = BASE_URL) ->
            @data = {} if not @data

            @url = if @data.id then @url + @data.id

        save: (data = @data) ->
            defferred = $q.defer()

            method = if @data.id then 'PUT' else 'POST'

            $http
                method: method
                url: @url
                data: data
            .then (result) =>
                @data = result.data
                defferred.resolve @
            .catch (error) =>
                defferred.reject error

            defferred.promise
]