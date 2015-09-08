angular.module('thms', [
  'restangular',
  'thms.services',
  'thms.directives',
  'thms.modules.employees',
  'thms.modules.companies',
  'thms.modules.notifications',
  'thms.modules.facilities',
  'thms.modules.tickets',
  'thms.modules.clients',
  'thms.modules.events',
  'thms.modules.catering',
  'thms.modules.audit',
  'thms.modules.reporting',
  'thms.modules.inventory_releases',
  'thms.controllers',
  'templates-main',
  'ui.bootstrap',
  'ui.router',
  'LocalStorageModule',
  'ngAnimate',
  'ngDragDrop',
  'ui.directives',
  'angularMoment',
  'newrelic-timing'
]).run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
        $rootScope.Auth = Auth;

        $rootScope.$on('event:auth-loginRequired', function () {
            $state.transitionTo('guest.login');
        });

        $rootScope.$on('event:redirect-home', function() {
          $state.go('authenticated.main.home');
        });

        $rootScope.$on('event:auth-logged-in', function (event, data) {
            $state.transitionTo('authenticated.main.home');
        });

        $rootScope.$on('event:auth-logged-out', function () {
            $state.transitionTo('guest.login');
        });

        $rootScope.$on('event:auth-already-logged-in', function (event, data) {
            console.warn("User Already Logged In");
        });


        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.currentState = toState.name;
            $rootScope.currentStateCss = toState.name.replace(/\./g, ' ');
            NProgress.done();
        });

        $rootScope.$on('$stateChangeError', function () {
            NProgress.done();
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            NProgress.start(30);
        });

        NProgress.configure({ showSpinner: true });
    }]);

angular.module('thms').constant('angularMomentConfig', {
  preprocess: 'unix',
  timezone: 'Etc/UTC'
});

angular.module('thms').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('/api/v1');
//    RestangularProvider.setDefaultHttpFields({cache: true});


    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('guest', {
            abstract: true,
            templateUrl: 'layouts/guest',
            resolve: {
              currentUser: [
                'Auth', '$state', function (Auth, $state) {
                  Auth.`checkLoggedIn`().then(function() {
                      $state.go('authenticated.main.home');
                  })
                }
              ]
            }
        })
        .state('guest.login', {
            url: '/',
            views: {
                "content": {
                    templateUrl: 'login',
                    controller: 'LoginWindowCtrl'
                }
            }
        })
        .state('guest.password_reset_request', {
            url: '/reset/password',
            views: {
                "content": {
                    templateUrl: 'resetPasswordRequest',
                    controller: ['$scope', '$http', '$state', '$humane', function($scope, $http, $state, $humane) {
                        $scope.data = {
                            email: ''
                        };

                        $scope.sendRequest = function(data) {
                            $http.post('/api/v1/security/request_password_reset', data).success(function(result) {
                                $state.go('guest.login');
                                $humane.stickyError("Request Sent - Check your Email")
                            }).error(function(error, statusCode) {
                                console.log(statusCode)
                            })
                        }
                    }]
                }
            }
        })
        .state('guest.reset_password', {
            url: '/reset/password/:token',
            views: {
                "content": {
                    templateUrl: 'resetPassword',
                    controller: 'ResetPasswordCtrl'
                }
            }
        })

        .state('authenticated', {
            abstract: true,
            templateUrl: 'layouts/authenticated',
            resolve: {
                currentUser: function (Auth, $rootScope, $state) {
                 Auth.checkLoggedIn().catch(function(error) {
                     $state.go('guest.login')
                 })
                }
            }
        })

        .state('authenticated.main', {
          views: {
              "user-menu@authenticated": {
                  templateUrl: 'navigation/user_header_menu'
              },
              "main-navigation@authenticated": {
                  templateUrl: 'navigation/main',
                  controller: ['$scope', 'Tickets', function($scope, Tickets) {
                      $scope.Tickets = Tickets;
                      $scope.Tickets.sync();
                  }]
              }
          }
        })

        .state('authenticated.main.home', {
            url: '/dashboard',
            views: {
                "content@authenticated": {
                    templateUrl: 'dashboard/main',
                    controller: 'MainDashboardCtrl'
                },
                "header@authenticated": {
                    templateUrl: 'dashboard/_header_main'
                }


            }
        })

        .state('authenticated.main.home.debug', {
            url: '/debug',
            views: {
                "content@authenticated": {
                    templateUrl: 'dashboard/debug',
                    controller: [
                      '$scope', '$http', '$modal', '$humane',  function($scope, $http, $modal, $humane) {
                          $scope.reloadData = function() {
                            $http.get('/api/v2/tickets/manual').success(function(data) {
                              $scope.inventory = data
                            });
                          };

                        $scope.reloadData();


                          $scope.createTickets = function(inventory) {
                              console.log(inventory);

                              var modal = $modal.open({
                                templateUrl: 'dashboard/_modal_manual_ticket_create',
                                windowClass: 'effect-8',
                                controller: [
                                  '$scope', '$http','$humane', function($scope, $http, $humane) {
                                    $scope.inventory = inventory;

                                    $scope.requestManual = function(ticketekEventCode) {
                                      $scope.inProgress = true;

                                      $http.post('/api/v2/tickets/request', {event_code: ticketekEventCode, inventory_id: inventory.id})
                                        .success(function(results) {
                                          $humane.stickySuccess(results['total_requested'] + " Tickets Requested");
                                          $scope.$close();
                                        })
                                        .error(function(error) {
                                            $scope.inProgress = false;
                                            $humane.stickyError(error);
                                        })
                                    };


                                    $scope.createManual = function(ticketPrefix) {
                                      $scope.inProgress = true;

                                      $http.post('/api/v2/tickets/manual', {prefix: ticketPrefix, inventory_id: inventory.id}).success(function(results) {
                                        $scope.inProgress = false;
                                        $humane.stickySuccess(results['total_created'] + " Tickets Created");
                                        $scope.$close();
                                      }).error(function(error) {
                                        $scope.inProgress = false;
                                        $humane.stickyError(error);
                                      })
                                    }
                                  }
                                ]
                              });

                              modal.result.then(function(results) {
                                  console.log(results);
                                  $scope.reloadData();
                              })
                          }
                      }
                    ]
                }
            }
        })

        // Catering
        .state('authenticated.main.catering', {
            abstract: true,
            template: '<ui-view></ui-view>'
        })

        .state('authenticated.main.catering.index', {
            url: '/catering',
            views: {
                "content@authenticated": {
                    templateUrl: 'catering/main'
                    //          controller: ['$scope', 'companies', function($scope, companies) {
                    //            $scope.data = companies
                    //          }]
                },
                "header@authenticated": {
                    templateUrl: 'catering/_header_main'
                }
            }
        })

        .state('authenticated.main.catering.menu', {
            abstract: true,
            template: '<ui-view></ui-view>'
        })

        .state('authenticated.main.catering.menu.category', {
            abstract: true,
            template: '<ui-view></ui-view>'
        })

        .state('authenticated.main.catering.menu.category.index', {
            url: '/catering/menu/items',
            resolve: {
                //        menuItems: function(Auth, Restangular) {
                //          return Restangular.one('companies', Auth.currentUser.company.id).all('catering').all('menu').all('items').getList();
                //        },
                menuCategories: function (Auth, Restangular) {
                    return Restangular.one('companies', Auth.currentUser.company.id).all('catering').all('menu').all('categories').getList();
                }
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'catering/items/index',
                    controller: ['$scope', 'Restangular', 'menuCategories', '$state', function ($scope, Restangular, categories, $state) {
                        //              $scope.items = menuItems;
                        $scope.categories = categories;
                    }]
                },
                "header@authenticated": {
                    templateUrl: 'catering/items/_header_index'
                }
            }
        })

        .state('authenticated.main.catering.menu.category.view', {
            url: '/catering/menu/category/:id',
            resolve: {
                //        menuItems: function(Auth, Restangular) {
                //          return Restangular.one('companies', Auth.currentUser.company.id).all('catering').all('menu').all('items').getList();
                //        },
                category: function (Auth, Restangular, $stateParams) {
                    return Restangular.one('companies', Auth.currentUser.company.id).all('catering').all('menu').one('categories', $stateParams.id).get()
                }
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'catering/categories/view',
                    controller: ['$scope', 'Restangular', 'category', '$state', function ($scope, Restangular, category, $state) {
                        //              $scope.items = menuItems;
                        $scope.category = category;
                    }]
                },
                "header@authenticated": {
                    templateUrl: 'catering/items/_header_index'
                }
            }
        })

        .state('authenticated.main.catering.menu.category.new', {
            url: 'category/new'
        })

        .state('authenticated.main.catering.menu.item', {
            abstract: true
        })

        .state('authenticated.main.catering.menu.item.new', {
            url: '/catering/menu/category/:category_id/items/new',
            views: {
                "content@authenticated": {
                    templateUrl: 'catering/items/new',
                    controller: ['$scope', 'Restangular', '$state', 'Auth', function ($scope, Restangular, $state, Auth) {
                        $scope.item = {
                            category_id: $state.params.category_id
                        };

                        $scope.createItem = function (item) {
                            console.log(item);
                            Restangular.one('companies', Auth.currentUser.company.id).all('catering').one('menu').post('items', item).then(function (result) {
                                console.log(result);
                                $state.go('authenticated.main.catering.menu.category.view', {id: result.category_id})

                            }).catch(function (error) {
                                console.log(error);
                            })
                        }
                    }]
                },
                "header@authenticated": {
                    template: "<h1>New Menu Item</h1>"
                }
            }

        })

        .state('authenticated.main.catering.menu.categories', {
            url: '/catering/menu/item/categories',
            views: {
                "content@authenticated": {
                    template: '<h1>Menu Item Categories</h1>'
                },
                "header@authenticated": {
                    templateUrl: 'catering/_header_main'
                }
            }
        })

        .state('authenticated.main.catering.menu.new', {
            url: '/catering/menus/new',
            resolve: {
                menuCategories: function (Auth, Restangular) {
                    return Restangular.one('companies', Auth.currentUser.company.id).all('catering').all('menu').all('categories').getList();
                }
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'catering/menus/new',
                    controller: 'CateringCreateMenu'
                },
                "header@authenticated": {
                    templateUrl: 'catering/_header_main'
                }
            }

        })


        // Inventory
        .state('authenticated.main.inventory', {
            abstract: true,
            template: "<ui-view></ui-view>"
        })

        .state('authenticated.main.inventory.confirmOptions.snacks', {
            url: '/snacks',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_snacks'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.details', {
            url: '/details',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_host_details'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.attendance', {
            url: '/attendance',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_attendance'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.parking', {
            url: '/parking',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_parking'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.review', {
            url: '/review',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_review'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.drinks', {
            url: '/drinks',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_drinks'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions.menu', {
            url: '/menus',
            views: {
                "step": {
                    templateUrl: 'inventory/confirm_menu'
                }
            }
        })

        .state('authenticated.main.inventory.confirmOptions', {
            url: '/my/options/:id/confirm',
            resolve: {
                details: ['$stateParams', 'Auth', 'Restangular', function ($stateParams, Auth, Restangular) {
                    return Restangular.one('companies', Auth.currentUser.company.id).one('inventory', $stateParams.id).get();
                }]
                //        inventoryOptions: ['$stateParams','Auth', 'Restangular', function($stateParams, Auth, Restangular) {
                //          return Restangular.one('companies', Auth.currentUser.company.id).one('inventory', $stateParams.id).getList('options');
                //        }]
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'inventory/confirm_options',
                    controller: 'ConfirmOptionsController'
                },
                "header@authenticated": {
                    template: "<h1>Confirm Options</h1>"
                }
            }
        })

        .state('authenticated.main.inventory.add', {
            url: '/inventory/add',
            resolve: {
                data: ['$http', 'Auth', '$stateParams', function ($http, Restangular, $stateParams) {
                    return $http.get('/api/v1/my/events/dates/' + $stateParams['id'] + '/release');
                }]
            },
            views: {
                "content@authenticated": {
                    templateUrl: 'inventory/add',
                    controller: ['$scope', 'data', function ($scope, data) {
                        console.log(data)
                    }]

                    //            $scope.categories = categories;
                    //            $scope.menu = {
                    //              sections: []
                    //            };
                    //            console.log($scope.categories);
                    //
                    //            $scope.addMenuSection = function() {
                    //              $scope.menu.sections.push({items:[]});
                    //            };
                    //
                    //            $scope.addItemToSection = function(section, event, data) {
                    //              console.log(section);
                    //              console.log(data);
                    //              section.items.push(data)
                    //            }
                    //
                    //          }]
                },
                "header@authenticated": {
                    template: "<h1>Release Event</h1>"
                }
            }
        })

        .state('authenticated.main.audit', {
            abstract: true,
            template: '<ui-view></ui-view>'
        })

        .state('authenticated.main.audit.inventory', {
            url: '/audit/inventory',
            resolve: {},
            views: {
                "content@authenticated": {
                    templateUrl: 'auditing/events'
//                    controller:
                },
                "header@authenticated": {
                    template: "<h1>Release Event</h1>"
                }
            }
        })

      .state('authenticated.main.inventory.release', {
        url: '/inventory/:id/release',
        abstract: 'true',
        template: '<ui-view></ui-view>'
      })

      .state('authenticated.main.inventory.release.identifyClass', {
        url: '/class',
        views: {
          "content@authenticated" : {
            templateUrl: 'client-module/release_to_team_class'
          }
        }
      })

      .state('authenticated.main.inventory.release.allocateBusinessUnits', {
        url: '/allocate',
        views: {
          "content@authenticated" : {
            templateUrl: 'client-module/release_to_team_business_unit'
          }
        }
      })

      .state('authenticated.main.inventory.release.releaseExpiry', {
        url: '/expiry',
        views: {
          "content@authenticated" : {
            templateUrl: 'client-module/release_to_team_release_expiry'
          }
        }
      })

      .state('authenticated.main.inventory.release.automateInvitations', {
        url: '/invitations',
        views: {
          "content@authenticated" : {
            templateUrl: 'client-module/release_to_team_automate_invitations'
          }
        }
      })


}]);