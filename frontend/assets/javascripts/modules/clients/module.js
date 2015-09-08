//angular.module("thms.modules.clients", ["thms.services", "thms.directives", "ui.router", "LocalStorageModule", 'restangular']);
////= controllers
////= services
//angular.module("thms.modules.clients").config([
//  "$stateProvider", "$urlRouterProvider", "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
//    $stateProvider
//      // Clients
//      .state('authenticated.main.clients', {
//        abstract: true,
//        template: "<ui-view></ui-view>"
//      })
//
//      .state('authenticated.main.clients.view', {
//        url: '/clients/:id',
//        resolve: {
//          client: ['Auth', 'Restangular', '$stateParams', function (Auth, Restangular, $stateParams) {
//            return Restangular.one('companies', Auth.currentUser.company.id).one('clients', $stateParams.id).get($stateParams.id);
//          }]
//        },
//        views: {
//          "content@authenticated": {
//            templateUrl: 'clients/view',
//            controller: ['$scope', '$state', 'client', function ($scope, $state, client) {
//              $scope.client = client;
//            }]
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add', {
//        url: '/clients/new',
//        views: {
//          "content@authenticated": {
//            templateUrl: 'clients/new',
//            controller: 'AddCompanyClient'
//          },
//          "header@authenticated": {
//            template: "<h1>Client Management</h1>"
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add.name', {
//        url: '/name',
//        views: {
//          "steps": {
//            templateUrl: 'clients/_new_name'
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add.address', {
//        url: '/address',
//        views: {
//          "steps": {
//            templateUrl: 'clients/_new_address'
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add.admin', {
//        url: '/administrator',
//        views: {
//          "steps": {
//            templateUrl: 'clients/_new_admin'
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add.config', {
//        url: '/config',
//        views: {
//          "steps": {
//            templateUrl: 'clients/_new_config'
//          }
//        }
//      })
//
//      .state('authenticated.main.clients.add.facility', {
//        url: '/lease/facility',
//        resolve: {
//          clients: ['Auth', 'Restangular', function (Auth, Restangular) {
//            return Restangular.one('companies', Auth.currentUser.company.id).all('clients').getList();
//          }],
//          facilities: ['Auth', 'Restangular', function (Auth, Restangular) {
//            return Restangular.one('companies', Auth.currentUser.company.id).all('facilities').getList();
//          }]
//        },
//        views: {
//          "steps": {
//            templateUrl: 'clients/_new_facility_lease',
//            controller: 'VenueFacilityLeaseCreate'
//          }
//        }
//      })
//  }
//]);
