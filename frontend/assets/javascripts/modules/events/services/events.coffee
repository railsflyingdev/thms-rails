app = angular.module 'thms.services'

app.factory 'Events', ['$http', '$q', '$angularCacheFactory', 'Event', ($http, $q, $angularCacheFactory, Event) ->
    BASE_URL = '/api/v2/events/'

    new class Events
        window.foo = @
        $angularCacheFactory 'EventsCache', {
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
                __collection.push new Event(data, false) for data in results.data
                defered.resolve __collection

            .catch (error) ->
                defered.reject error

            defered.promise

    # Use a resource from the cache, if we have it
    # Otherwise retrieve it from the api
        view: (id) ->
            defferred = $q.defer()
            element = _.find __collection, (item) ->
                item.data.id is id

                # resolve the promise if our cache hit
            if element
                defferred.resolve element
            else if id
                # grab the resource from the api if our cache missed
                $http.get(BASE_URL + id)
                .then (result) ->
                    event = new Event(result.data, false)
                    __collection.push event
                    console.log result.data
                    defferred.resolve event
                .catch (error) ->
                    defferred.reject error
                # return false if something else didnt happen, i.e: undefined id passed
            else defferred.reject false

            defferred.promise

    # Mark an element as selected, so we keep track of it while we transition routes
        selected: (id) ->
            __selected = id if id
            console.log "Selected #{__selected}" if id
            __selected

        addElement: (element) ->
            __collection.push element
]

