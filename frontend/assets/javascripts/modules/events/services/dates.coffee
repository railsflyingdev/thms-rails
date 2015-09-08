app = angular.module 'thms.services'

app.factory 'EventDates', ['$http', '$q', '$angularCacheFactory', 'EventDate', ($http, $q, $angularCacheFactory, EventDate) ->
    BASE_URL = '/api/v2/dates/'

    new class EventDates
        $angularCacheFactory 'EventDatesCache', {
            capacity: 100
            maxAge: 900000
            storageMode: 'localStorage'
        }

        __collection = []
        __selected = ''

        constructor: ->

            ## Retreive all resources
        sync: ->
            deffered = $q.defer()
            __collection = []
            $http.get(BASE_URL)
            .then (results) =>
                __collection.push new EventDate(data, false) for data in results.data
                deffered.resolve __collection

            .catch (error) ->
                deffered.reject error

            deffered.promise

        # Use a resource from the cache, if we have it
        # Otherwise retrieve it from the api
        view: (id) ->
            defferred = $q.defer()
            element = _.find __collection, (item) ->
                item.id is id

            # resolve the promise if our cache hit
            if element
                defferred.resolve element
            else if id
                # grab the resource from the api if our cache missed
                $http.get(BASE_URL + id)
                .then (result) ->
                    eventDate = new EventDate(result.data, false)

                    __collection.push eventDate

                    defferred.resolve eventDate
                .catch (error) ->
                    defferred.reject error
                # return false if something else didnt happen, i.e: undefined id passed
            else defferred.reject false

            defferred.promise


        addElement: (element) ->
            __collection.push element

        forEvent: (id) ->
            forRelation 'events', id


        forRelation = (name, id) ->
            defferred = $q.defer()
            elements = _.filter __collection, (item) ->
                item.event_id is id

            if _.size(elements) > 0
                defferred.resolve elements
            else
                relationUrl = "/api/v2/#{name}/#{id}/dates/"
                $http.get(relationUrl)
                .then (result) ->
#                    TODO dont empty __collection, just upsert the new stuff in
                    __collection = []
                    __collection.push new EventDate(data, false, relationUrl) for data in result.data
                    defferred.resolve __collection
                .catch (error) ->
                    console.log error
                    defferred.reject error

            defferred.promise

        facilitiesForRelease: (eventId, eventDateId) ->
            defferred = $q.defer()

            Url = "/api/v2/events/#{eventId}/dates/#{eventDateId}/release"

            $http.get(Url)
            .then (result) ->
                defferred.resolve result
            .catch (error) ->
                defferred.reject error

            defferred.promise
]

