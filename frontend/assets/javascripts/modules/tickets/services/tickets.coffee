app = angular.module 'thms.services'

app.factory 'Tickets', ['$http', '$q', '$angularCacheFactory', 'Ticket', '$humane', ($http, $q, $angularCacheFactory, Ticket, $humane) ->
    BASE_URL = '/api/v2/my/tickets/'

    new class Tickets
        window.foo = @
        $angularCacheFactory 'TicketsCache', {
            capacity: 100
            maxAge: 900000
            storageMode: 'localStorage'
        }

        __collection = []
        __selected = ''

        constructor: ->

        # We sync the tickets the first thing when the page loads.
        count: 0
    ## Retreive all resources
        sync: ->
            deffered = $q.defer()
            __collection = []
            $http.get(BASE_URL)
            .then (results) =>
                __collection.push new Ticket(data.id, data, BASE_URL + data.id, false) for data in results.data
                @count = __collection.length
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
                    defferred.resolve result.data
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



        addMagicalTickets: () =>
            @sync()
            .then (result) =>
#                $humane.stickySuccess "#{@count} EzyTickets Available"


#    this.addMagicalTickets = function() {
#    console.log('tickets coming in 5');
#    var that = this;
#    $timeout(function() {
#        that.newCount = 18;
#        $humane.stickyError(that.newCount +' New Tickets Available')
#
#    }, 7000);
#    }
]


