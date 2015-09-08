app = angular.module 'thms.modules.notifications', ['thms.services', 'thms.modules.facilities','thms.directives', 'ui.router','jmdobry.angular-cache', 'ui.bootstrap']

#= controllers

app.config [
  '$stateProvider', ($stateProvider) ->
    $stateProvider
    .state 'authenticated.main.notification',
      abstract: true
      template: '<ui-view></ui-view>'

    .state 'authenticated.main.notification.index',
      url: '/notifications'
      resolve:
        data: [
          'Companies', (Companies) ->
            Companies.sync()
        ]
      views:
        'content@authenticated':
          templateUrl: 'notifications/index'
          controller: 'NotificationIndexCtrl'
        'header@authenticated':
          template: '<h1>Notification</h1>'
]