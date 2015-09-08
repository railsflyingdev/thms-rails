app = angular.module 'thms.modules.facilities', ['thms.services', 'restangular', 'ui.router', 'LocalStorageModule']

#= services
#= controllers

app.config [
    '$stateProvider', ($stateProvider) ->
        $stateProvider

        .state 'authenticated.main.facility',
            abstract: true
            template: '<ui-view></ui-view>'

        .state 'authenticated.main.facility.index',
            url: '/facilities'
            resolve:
                facilities: [
                    'Facilities', (Facilities) ->
                        Facilities.sync()
                ]
            views:
                'content@authenticated':
                    templateUrl: 'facilities/main'
                    controller: 'FacilitiesIndexCtrl'

        .state 'authenticated.main.facility.view',
            url: '/facilities/:facility_id'
            resolve:
                facility: [
                    'Facilities', '$stateParams', (Facilities, $stateParams) ->
                        Facilities.view($stateParams.facility_id)
                ],
                leases: [
                    'Leases', '$stateParams', (Leases, $stateParams) ->
                        Leases.forFacility($stateParams.facility_id)
                ]
            views:
                'content@authenticated':
                    templateUrl: 'facilities/view',
                    controller: 'FacilityShowCtrl'
]
#.state('authenticated.main.facility', {
#
#        abstract: true,
#        template: '<ui-view></ui-view>'
#    })
#
#.state('authenticated.main.facility.index', {
#        url: '/facilities',
#        resolve: {
#            facilities: ['Auth', 'Restangular', function (Auth, Restangular) {
#return Restangular.one('companies', Auth.currentUser.company.id).getList('facilities');
#}]
#},
#views: {
#    "content@authenticated": {
#        templateUrl: 'facilities/main',
#        controller: 'FacilitiesIndexCtrl'
#    },
#    "header@authenticated": {
#        templateUrl: 'facilities/_header_main'
#    }
#
#}
#})
#
#.state('authenticated.main.facility.view', {
#    url: '/facilites/:id',
#    resolve: {
#        facility: ['Auth', 'Restangular', '$stateParams', function (Auth, Restangular, $stateParams) {
#return Restangular.one('companies', Auth.currentUser.company.id).one('facilities', $stateParams.id).get();
#}],
#clients: ['Auth', 'Restangular', function (Auth, Restangular) {
#return Restangular.one('companies', Auth.currentUser.company.id).all('clients').getList();
#}]
#},
#views: {
#    "content@authenticated": {
#        templateUrl: 'facilities/view',
#        controller: ['$scope', 'facility', 'clients', function ($scope, facility, clients) {
#$scope.facility = facility;
#$scope.clients = clients;
#
#$scope.createNewFacilityLease = function () {
#$scope.facility.leasees.push({})
#};
#
#$scope.saveFacilityLease = function (lease) {
#console.log(lease)
#}
#}]
#},
#"header@authenticated": {
#    templateUrl: 'facilities/_header_view',
#    controller: ['$scope', 'facility', function ($scope, facility) {
#$scope.facility = facility
#}]
#}
#}
#})