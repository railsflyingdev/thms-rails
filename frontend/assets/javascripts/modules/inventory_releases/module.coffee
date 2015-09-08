app = angular.module 'thms.modules.inventory_releases', ['thms.services', 'ui.router', 'LocalStorageModule']

#= services
#= controllers

app.config [
  '$stateProvider', ($stateProvider) ->
    $stateProvider
    .state 'authenticated.main.inventory_release',
      abstract: true
      template: '<ui-view></ui-view>'

    .state 'authenticated.main.inventory_release.index',
      url: '/inventory_releases'
      resolve:
        inventory_releases: [
          'InventoryReleases', (InventoryReleases) ->
            InventoryReleases.sync()
        ]
      views:
        'content@authenticated':
          templateUrl: 'inventory_releases/main'
          controller: 'InventoryReleasesIndexCtrl'

#    .state 'authenticated.main.inventory_release.view',
#      url: '/inventory_releases/:inventory_release_id'
#      resolve:
#        inventory_release: [
#          'InventoryReleases', '$stateParams', (InventoryReleases, $stateParams) ->
#            InventoryReleases.view($stateParams.inventory_release_id)
#        ],
#        dates: [
#          'EventDates', '$stateParams', (EventDates, $stateParams) ->
#            EventDates.forEvent($stateParams.event_id)
#        ]
#      views:
#        'content@authenticated':
#          templateUrl: 'inventory_releases/view',
#          controller: 'InventoryReleaseShowCtrl'
]