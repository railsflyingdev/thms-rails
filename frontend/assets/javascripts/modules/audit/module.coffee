app = angular.module 'thms.modules.audit', []

app.config [
    '$stateProvider', ($stateProvider) ->
        $stateProvider
        .state 'authenticated.main.audit.client',
            abstract: true,
            template: '<ui-view></ui-view>'

        .state 'authenticated.main.audit.venue',
            abstract: true,
            template: '<ui-view></ui-view>'

        .state 'authenticated.main.audit.client.index',
            url: '/my/confirmations'
            resolve:
                events: [
                    '$http', ($http) ->
                        $http.get('/api/v2/my/confirmations')
                ]
            views:
                'header@authenticated':
                    template: '<h1>My Confirmations</h1>'
                'content@authenticated':
                    templateUrl: 'auditing/events'
                    controller: [
                        '$scope', 'events', '$humane', '$modal', '$http', '$state', ($scope, events, $humane, $modal, $http, $state) ->
                            $scope.data = events.data
                            $scope.filterModel =
                                event_date: ''
                            $scope.viewDetails = (event) ->
                                modal = $modal.open
                                    templateUrl: 'auditing/_modal_view_confirmation_detail'
                                    controller: [
                                        '$scope', ($scope) ->
                                            $scope.Options =
                                                selectedOptions: event
                                    ]
                    ]

        .state 'authenticated.main.audit.venue.index',
            url: '/reporting/confirmations'
            resolve:
                events: [
                    '$http', ($http) ->
                        $http.get('/api/v2/confirmations')
                ]
            views:
                'header@authenticated':
                    template: '<h1>Event Confirmations</h1>'
                'content@authenticated':
                    templateUrl: 'auditing/events'
                    controller: [
                        '$scope', 'events', '$humane', '$modal', '$http', '$state', ($scope, events, $humane, $modal, $http, $state) ->
                            $scope.data = events.data
                            $scope.filterModel =
                                event_date: ''

                            $scope.updateOption = (option) ->
                                url = "/api/v2/confirmations/#{option.id}"
                                $http.put(url, option)
                                .then (result) =>
                                    console.log result
                                .catch (error) =>
                                    console.log error

                            $scope.filterValue = ''

                            $scope.updateFilter = () ->
#                                if $scope.filterHardTickets then hardTicketFilter = 'hard' else hardTicketFilter = ''
#                                console.log hardTicketFilter
#
#                                if $scope.filterWithParking then parkingFilter = '> 0'

                                $scope.filterModel =
                                    event_date:
                                        event_name: $scope.filterValue
                                    company:
                                        name: $scope.filterValue

                            $scope.viewDetails = (event) ->
                                modal = $modal.open
                                    templateUrl: 'auditing/_modal_view_confirmation_detail'
                                    controller: [
                                        '$scope', ($scope) ->
                                            $scope.Options =
                                                selectedOptions: event
                                    ]
                    ]
]


#app = angular.module 'thms.modules.audit', []
#app.config [
#    '$stateProvider', ($stateProvider) ->
#        $stateProvider
#        .state 'authenticated.main.audit',
#            abstract: true
#            template: "<ui-view></ui-view>"
##        $stateProvider
##        .state 'authenticated.main.audit',
##            abstract: true
##            template: '<ui-view></ui-view>'
#
##        .state 'authenticated.main.audit.client',
##            abstract: true
##            template: '<ui-view></ui-view>
#]
##        .state 'authenticated.main.audit.client.index',
##            url: '/my/confirmations'
##            resolve:
##                events: [
##                    '$http', ($http) ->
##                        $http.get('/api/v2/my/confirmations')
##                ]
##            views:
##                'content@authenticated':
##                    templateUrl: 'events/client_index'
##                    controller: [
##                        '$scope', 'events', '$humane', '$modal', '$http', '$state', ($scope, events, $humane, $modal, $http, $state) ->
##                            $scope.data = events.data
##
##                            $scope.openFile = (file) ->
##                                modal = $modal.open
##                                    template: "<div class='panel'><iframe src='#{file}'></iframe></div>"
##                                    windowClass: 'effect-4 xxlarge xxtall'
##                    ]
##]