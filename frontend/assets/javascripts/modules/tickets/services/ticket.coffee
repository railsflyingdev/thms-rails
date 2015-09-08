app = angular.module 'thms.services'

app.factory 'Ticket', ['$http', '$q', ($http, $q) ->
    class Ticket
        constructor: (@id, @data, @url, @edited = false) ->
#            console.log @url

        save: (data = @data) ->
            defferred = $q.defer()

            $http.put @url, data
            .then (result) =>
                # it worked, so lets copy the data we sent into our current dataset..
                # possibly we even respond with the full data set, to make sure we have an updated version?
                @data = angular.copy data

                defferred.resolve result
            .catch (error) =>
                # get the errors from the response and merge them in eventually...
                defferred.reject error

            defferred.promise

#
]