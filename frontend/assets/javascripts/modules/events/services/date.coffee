app = angular.module 'thms.services'

app.factory 'EventDate', ['$http', '$q', ($http, $q) ->
    BASE_URL = '/api/v2/dates/'

    class EventDate
        constructor: (@data, @edited= false, @url = BASE_URL, @relation = false) ->
            @data = {} if not @data

            if @relation
                @url = @relation.url

            @url = if @data.id then @url + @data.id else @url

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