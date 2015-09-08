app = angular.module 'thms.modules.tickets', ['thms.services', 'restangular', 'ui.router', 'LocalStorageModule']

#= services
#= controllers

app.config [
  '$stateProvider', ($stateProvider) ->
    $stateProvider

    .state 'authenticated.main.tickets',
        abstract: true
        template: '<ui-view></ui-view>'

    .state 'authenticated.main.tickets.index',
        url: '/tickets'
        resolve:
            tickets: [
              'Tickets', (Tickets) ->
                Tickets.sync()
            ]
        views:
            'content@authenticated':
                templateUrl: 'tickets/index'
                controller: 'TicketsIndexCtrl'
            'header@authenticated':
                template: '<h1>Tickets</h1>'

]