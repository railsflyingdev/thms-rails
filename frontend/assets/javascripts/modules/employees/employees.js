angular.module('thms.modules.employees', ['restangular', 'thms.services', 'thms.directives', 'thms.controllers', 'templates-main', 'ui.bootstrap', 'ui.router', 'LocalStorageModule', 'ngAnimate', 'ngDragDrop', 'ui.directives', 'angularMoment']);

angular.module('thms.modules.employees').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
    $stateProvider
        .state('authenticated.main.employee', {
            abstract: true,
            template: '<ui-view></ui-view>'
        })

        .state('authenticated.main.employee.index', {
            url: '/employees',
            resolve: {
                data: function (Auth, Restangular) {
                    return Restangular.one('companies', Auth.currentUser.company.id).getList('employees');
                }
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'employees/main',
                    controller: 'EmployeesIndexCtrl'
                },
                "header@authenticated": {
                    templateUrl: 'employees/_header_main'
                }
            }
        })

        .state('authenticated.main.employee.add', {
            url: '/employee/add',
            views: {
                "content@authenticated": {
                    templateUrl: 'employees/add'
                },
                "header@authenticated": {
                    templateUrl: 'employees/_header_add'
                }
            }
        })

        .state('authenticated.main.employee.add.new', {
            url: '/new',
            views: {
                "step": {
                    templateUrl: 'employees/_add_employee',
                    controller: ['$scope', 'Restangular', 'Auth', '$state', function ($scope, Restangular, Auth, $state) {
                        $scope.createEmployee = function (model) {
                            Restangular.one('companies', Auth.currentUser.company.id).all('employees').post(model).then(function (result) {
                                console.log(result)
                            })
                        }
                    }]
                }
            }
        })
}]);