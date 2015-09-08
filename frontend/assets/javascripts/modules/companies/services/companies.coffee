app = angular.module 'thms.services'

app.factory 'Companies', ['$http', '$q', '$angularCacheFactory', 'Company', ($http, $q, $angularCacheFactory, Company) ->
    BASE_URL = '/api/v2/companies/'

    new class Companies
        window.foo = @
        $angularCacheFactory 'CompaniesCache', {
            capacity: 100
            maxAge: 900000
            storageMode: 'localStorage'
        }

        __collection = []
        __selected = ''

        constructor: ->

    ## Retreive all companies
        sync: ->
            deffered = $q.defer()
            __collection = []
            $http.get(BASE_URL)
            .then (results) =>
                __collection.push new Company(data, false) for data in results.data
                deffered.resolve __collection

            .catch (error) ->
                deffered.reject error

            deffered.promise

    # Use a company from the cache, if we have it
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
                    defferred.resolve new Company(result.data, false)
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

