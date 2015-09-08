app = angular.module 'thms.modules.events', ['thms.services', 'ui.router', 'LocalStorageModule']

#= services
#= controllers

app.config [
    '$stateProvider', ($stateProvider) ->
        $stateProvider

        .state 'authenticated.main.event.client',
            abstract: true,
            template: '<ui-view></ui-view>'

        .state 'authenticated.main.event.client.index',
            url: '/my/events'
            resolve:
                inventory: [
                    '$http', ($http) ->
                        $http.get('/api/v2/my/inventory')
                ],
                upcomingEvents: [
                    '$http', ($http) ->
                        $http.get('/api/v2/my/events/upcoming')
                ]
            views:
                'content@authenticated':
                    templateUrl: 'events/client_index'
                    controller: [
                        '$scope', 'inventory', 'upcomingEvents', '$humane', '$modal', '$http', '$state', 'Tickets',
                        ($scope, inventory, upcomingEvents, $humane, $modal, $http, $state, Tickets) ->
                            $scope.data = inventory.data
                            $scope.upcomingEvents = upcomingEvents.data

                            $scope.openFile = (file) ->
                                modal = $modal.open
                                    template: "<div class='panel'><iframe src='#{file}'></iframe></div>"
                                    windowClass: 'effect-4 xxlarge xxtall'

                            $scope.confirmAttendance = (inventory) ->
                                modal = $modal.open
                                    templateUrl: 'inventory/confirm_attendance'


                            $scope.releaseToTeam = ->
                                modal = $modal.open
                                    templateUrl: 'teasers/modal_release_to_team'

                            $scope.reconfirmOption = (event) ->
                                $http.delete "/api/v2/confirmations/#{event.confirmation_id}"
                                .success (result) ->
                                    Tickets.count = 0
                                    $state.go 'authenticated.main.inventory.confirmOptions', {id: event.id}


                            $scope.confirmGuests = (inventoryId) ->
                                modal = $modal.open
                                    templateUrl: 'inventory/_modal_guest_names',
                                    controller: [
                                        '$scope', 'confirmation', 'InventoryConfirmation',
                                        ($scope, confirmation, InventoryConfirmation) ->
                                            $scope.confirmation = confirmation.data

                                            if $scope.confirmation.guests.length is 0
                                            then $scope.guestList = [
                                                {name: ''}
                                            ]
                                            else $scope.guestList = $scope.confirmation.guests

                                            $scope.addNewGuestName = () ->
                                                $scope.guestList.push {name: ''}

                                            $scope.save = () ->
                                                $scope.confirmation.guests = $scope.guestList
                                                InventoryConfirmation.update $scope.confirmation
                                                .then (result) ->
                                                    $humane.stickySuccess 'Guest List Updated'
                                                    $scope.$close()
                                                .catch (error) ->
                                                    $humane.stickyError 'Error Saving Guest List'
                                                    $scope.$close()
                                    ]
                                    resolve:
                                        confirmation: [
                                            'InventoryConfirmation', (InventoryConfirmation) ->
                                                InventoryConfirmation.view(inventoryId)
                                        ]

                                    windowClass: 'effect-8'
                    ]

        .state 'authenticated.main.event',
            abstract: true
            template: '<ui-view></ui-view>'

        .state 'authenticated.main.event.index',
            url: '/events'
            resolve:
                events: [
                    'Events', (Events) ->
                        Events.sync()
                ],
                event_types: [
                  '$http', ($http) ->
                    $http.post('/api/v2/events/event_types')
                ]
            views:
                'content@authenticated':
                    templateUrl: 'events/main'
                    controller: 'EventsIndexCtrl'

        .state 'authenticated.main.event.view',
            url: '/events/:event_id'
            resolve:
                event: [
                    'Events', '$stateParams', (Events, $stateParams) ->
                        Events.view($stateParams.event_id)
                ],
                dates: [
                    'EventDates', '$stateParams', (EventDates, $stateParams) ->
                        EventDates.forEvent($stateParams.event_id)
                ]
            views:
                'content@authenticated':
                    templateUrl: 'events/view',
                    controller: 'EventShowCtrl'

        .state 'authenticated.main.event.view.release', {
            url: '/dates/:date_id/release',
            resolve:
                availableFacilities: [
                    'EventDates', '$stateParams', (EventDates, $stateParams) ->
                        EventDates.facilitiesForRelease($stateParams.event_id, $stateParams.date_id)
                ]
            views:
                'content@authenticated':
                    templateUrl: 'events/release'
                    controller: 'EventReleaseController'
        }
]