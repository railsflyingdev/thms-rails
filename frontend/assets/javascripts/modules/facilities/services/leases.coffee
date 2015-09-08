app = angular.module 'thms.services'

app.factory 'Leases', ['$http', '$q', '$angularCacheFactory', 'Lease', ($http, $q, $angularCacheFactory, Lease) ->
    BASE_URL = '/api/v2/leases/'

    new class Leases
        $angularCacheFactory 'LeasesCache', {
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
                __collection.push new Lease(data, false) for data in results.data
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
                    defferred.resolve new Lease(result.data, false)
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

        forFacility: (id) ->
            forRelation 'facilities', id

        forCompany: (id) ->
            forRelation 'companies', id

        forRelation = (name, id) ->
            defferred = $q.defer()
            elements = _.filter __collection, (item) ->
                item.facility_id is id

            if _.size(elements) > 0
                defferred.resolve elements
            else
                $http.get("/api/v2/#{name}/#{id}/leases")
                .then (result) ->
#                    TODO dont empty __collection, just upsert the new stuff in
                    __collection = []
                    __collection.push new Lease(data, false) for data in result.data
                    defferred.resolve __collection
                .catch (error) ->
                    console.log error
                    defferred.reject error

            defferred.promise

]

