angular.module('thms.controllers',[]);
angular.module('thms.services', [ 'jmdobry.angular-cache' ]);
angular.module('thms.directives',[]);

(function() {
  var __slice = [].slice;

  this.BaseCtrl = (function() {
    BaseCtrl.register = function(app, name) {
      var _ref;
      if (name == null) {
        name = this.name || ((_ref = this.toString().match(/function\s*(.*?)\(/)) != null ? _ref[1] : void 0);
      }
      return app.controller(name, this);
    };

    BaseCtrl.inject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.$inject = args;
    };

    function BaseCtrl() {
      var args, fn, index, key, _i, _len, _ref, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.constructor.$inject;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        key = _ref[index];
        this[key] = args[index];
      }
      _ref1 = this.constructor.prototype;
      for (key in _ref1) {
        fn = _ref1[key];
        if (typeof fn !== 'function') {
          continue;
        }
        if ((key === 'constructor' || key === 'initialize') || key[0] === '_') {
          continue;
        }
        this.$scope[key] = (typeof fn.bind === "function" ? fn.bind(this) : void 0) || _.bind(fn, this);
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return BaseCtrl;

  })();

}).call(this);
(function() {
  var app;

  app = angular.module('thms.services');

  app.factory('Auth', [
    '$rootScope', '$http', 'localStorageService', '$q', function($rootScope, $http, ls, $q) {
      var Auth;
      return new (Auth = (function() {
        function Auth() {
          this.setAccessToken(ls.get('access-token'));
          this.setCurrentUser(ls.get('current-user'));
        }

        Auth.prototype.setCurrentUser = function(user) {
          if (!user) {
            return;
          }
          ls.set('current-user', user);
          return this.currentUser = user;
        };

        Auth.prototype.setAccessToken = function(token) {
          if (!token) {
            return;
          }
          ls.set('access-token', token);
          this.accessToken = token;
          return $http.defaults.headers.common['Authorization'] = "Bearer " + this.accessToken;
        };

        Auth.prototype.wipeData = function() {
          this.currentUser = void 0;
          this.accessToken = void 0;
          this.currentlyMasquerading = false;
          ls.set('access-token', null);
          ls.set('current-user', null);
          delete $http.defaults.headers.common['Authorization'];
          return delete $http.defaults.headers.common['EH-Masquerading-As'];
        };

        Auth.prototype.login = function(details) {
          if (details == null) {
            details = {};
          }
          return $http.post('/api/v2/sessions', details).success((function(_this) {
            return function(result, status, headers) {
              _this.setAccessToken(headers('x-set-auth-token'));
              _this.setCurrentUser(result.data);
              return $rootScope.$broadcast('event:auth-logged-in', result.data);
            };
          })(this)).error((function(_this) {
            return function(response) {
              return $rootScope.$broadcast('event:auth-login-invalid', response);
            };
          })(this));
        };

        Auth.prototype.logout = function() {
          return $http["delete"]('/api/v2/sessions').then((function(_this) {
            return function(response) {
              _this.wipeData();
              return $rootScope.$broadcast('event:auth-logged-out');
            };
          })(this));
        };

        Auth.prototype.checkLoggedIn = function() {
          var deferred;
          deferred = $q.defer();
          if (!this.currentUser) {
            deferred.reject;
          }
          $http.get('/api/v2/auth/check').then((function(_this) {
            return function(response, status) {
              _this.setCurrentUser(response.data);
              return deferred.resolve(response.data);
            };
          })(this))["catch"](function(response) {
            return deferred.reject(response);
          });
          return deferred.promise;
        };

        Auth.prototype.startMasquerading = function(id) {
          var deferred;
          deferred = $q.defer();
          $http.defaults.headers.common['EH-Masquerading-As'] = id;
          $http.get('/api/v2/masquerading/current').then((function(_this) {
            return function(response) {
              _this.setCurrentUser(response.data);
              _this.currentlyMasquerading = true;
              console.warn("Masquerading As " + response.data.email);
              return deferred.resolve(response.data);
            };
          })(this))["catch"]((function(_this) {
            return function(response) {
              deferred.reject(response);
              return _this.stopMasquerading();
            };
          })(this));
          return deferred.promise;
        };

        Auth.prototype.stopMasquerading = function() {
          delete $http.defaults.headers.common['EH-Masquerading-As'];
          this.currentlyMasquerading = false;
          this.checkLoggedIn();
          return $rootScope.$broadcast('event:redirect-home');
        };

        return Auth;

      })());
    }
  ]);

}).call(this);
//angular.module('thms.services').service('Client', ['Auth', '$http', '$rootScope', function(Auth, $http, $rootScope  ) {
//    console.log('Client Api Starting')
//}]);
angular.module('thms.services').service('Company', ['Auth', '$http', '$rootScope', function(Auth, $http, $rootScope  ) {
  this.create = function(data) {
      $http.post('/api/v1/my/clients', data).success(function(results) {
        $rootScope.$broadcast('company:create:success', results);
      }).error(function(error) {
        $rootScope.$broadcast('company:create:failure', error);
      })
  }
}]);
angular.module('thms.services').service('EventService', ['$http', '$rootScope', function($http, $rootScope) {
//  console.group("Event Service Initialized");

  this.bulkReleaseToInventory = function(id, facilities) {
    return $http.post('/api/v1/my/events/dates/'+id+'/release', facilities);
  };

  this.releaseToInventory = function() {

  };

}]);
(function() {


}).call(this);
angular.module('thms.services').service('Facility', ['$rootScope','$http', function($rootScope, $http) {

}]);
angular.module('thms.services').service('$humane', ['$rootScope', function() {
    var humane = new Humane({container: document.body});

    this.spawn = humane.spawn();

    this.error = humane.spawn({
        addnCls: "humane-libnotify-error",
        timeout: 4e3
    });

    this.errorShort = humane.spawn({
        addnCls: "humane-libnotify-error"
    });

    this.stickyError = humane.spawn({
        waitForMove: true,
        addnCls: "humane-libnotify-error",
        timeout: 4e3
    });

    this.stickySuccess = humane.spawn({
      waitForMove: true,
      addnCls: "humane-libnotify-success",
      timeout: 4e3
    });

    this.successShort = humane.spawn({
      addnCls: "humane-libnotify-success"
    });

    this.sticky = humane.spawn({
        waitForMove: true,
        timeout: 4e3
    });
}]);
angular.module('thms.services').service('IceHockeyOptions', ['$rootScope', 'Restangular', 'Auth', '$stateParams', function($rootScope, Restangular, Auth, $stateParams) {

  this.iceHockey = true;

  this.shouldShowCoke = function() {
    var cateringSelected = false;
    if (!_.isEmpty(this.selectedOptions.selection.drinks)) {
      cateringSelected = true;
    }
    if (!_.isEmpty(this.selectedOptions.selection.snacks)) {
      cateringSelected = true;
    }
    if (!_.isEmpty(this.selectedOptions.selection.menu)) {
      cateringSelected = true;
    }

    if (this.selectedOptions.selection.standardDrinkList) {
      cateringSelected = true;
    }

    return cateringSelected;
  };

  this.menus = [
    {
      name: "Menu One",
      type: 'food',
      price_cents: "6500",
      sections: [
        {
          name: "On Arrival",
          items: [
            {name: "Dukkah toasted Turkish bread with aged balsamic & extra virgin olive oil"},
            {name: "Squealing Pig Saubignon Blanc", drink: true},
            {name: "Matilda Bay Beez Neez", drink: true}
          ]
        },
        {
          name: "Main Course",
          items: [
            {name: "Seared tournedos of beef with roasted mushrooms, asparagus & thyme"},
            {name: "Saltram 1859 Shiraz", drink: true},
            {name: "Matilda Bay Fat Yak Pale Ale", drink: true},
            {name: "Barbeque glazed chicken maryland with smoked paprika & roasted desiree potatoes"},
            {name: "Rosemount Estate District Release Chardonnay", drink: true},
            {name: "Greek salad"},
            {name: "Mixed garden salad"},
            {name: "Fresh bread selection"}
          ]
        },
        {
          name: "Dessert",
          items: [
            {name: "Baileys of Glenrowan Fortified Founder Series Muscat", drink: true},
            {name: "Baileys of Glenrowan Fortified Founder Series Topaque", drink: true},
            {name: "Streets Magnum ice creams"},
            {name: "Trio of Australian cheeses with dried fruit, nuts, crisp bread & lavosh"},
            {name: "Freshly brewed coffee & tea selection with chocolates"}
          ]
        }
      ]
    },
    {
      name: "Menu Two",
      type: 'food',
      price_cents: "5500",
      doesntHaveDrinksPackage: true,
      sections: [
        {
          name: "On Arrival",
          items: [
            {name: "Antipasto platters"}
          ]
        },
        {
          name: "Pre Game",
          items: [
            {name: "Wagyu beef slider with cheese & relish"},
            {name: "Fried chicken with ranch dipping sauce"},
            {name: "Bourbon & cola pork spare ribs"}
          ]
        },
        {
          name: "First Interval",
          items: [
            {name: "Chilli kransky roll with onion & condiments"}
          ]
        },
        {
          name: "Second Interval",
          items: [
            {name: "Mini beef pies with tomato sauce"}
          ]
        },
        {
          name: "DURING THE THIRD PERIOD",
          items: [
            {name: "Streets Magnum ice creams"}
          ]
        }
      ]
    }
  ];

  this.drinks = {
    name: "Drinks Menu",
    canChooseQuantity: true,

    sections: [
      {
        name:"White Wine",
        items:[
          {
            name: "Wolf Blass Bilyara Chardonnay",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/wolf_blass_bilyara_chardonnay.jpg'
              }
            }
          },
          {
            name: "Angel Cove Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/angel_cove_sauvignon_blanc.jpg'
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Pinot Grigio ",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_pinot_grigio.jpg"
              }
            }
          },
          {
            name: "Rosemount Estate District Release Chardonnay",
            description: "Robe| SA",
            price_cents: 4600,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/rosemount_estate_district_release_chardonnay.jpg'
              }
            }

          },
          {
            name: "Squealing Pig Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/squealing_pig_sauvignon_blanc.jpg"
              }
            }
          },
          {
            name: "Annie’s Lane Moscato",
            description: "South Eastern Australia",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_moscato.jpg"
              }
            }
          },
          {
            name: "Devil’s Lair The Hidden Cave Chardonnay",
            description: "Margaret River | WA",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/devils_lair_the_hidden_cave_chardonnay.jpg"
              }
            }
          },
          {
            name: "T’Gallant Grace Pinot Grigio",
            description: "Mornington Peninsula | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_grace_pinot_grigio.jpg"
              }
            }
          },
          {
            name: "Annies Lane Quelltaler Watervale Riesling",
            description: "Clare Valley | South Australia",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_quelltaler_watervale_riesling.jpg"
              }
            }
          },
          {
            name: "St Huberts Roussanne",
            description: "Yarra Valley | SA",
            price_cents: 5400,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/st_huberts_roussanne.jpg"
              }
            }
          },
          {
            name: "T’Gallant Tribute Pinot Gris",
            description: "Mornington Peninsula | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_tribute_pinot_gris.jpg"
              }
            }
          },
          {
            name: "Matua Estate Series Paretei Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/matua_estate_series_paratei_sauvignon_blanc.jpg"
              }
            }
          },
          {
            name: "Coldstream Hills Yarra Valley Range Chardonnay",
            description: "Yarra Valley | VIC",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/coldstream_hills_yarra_valley_range_chardonnay.jpg"
              }
            }
          },
          {
            name: "Leo Buring Premium Regional Leopold Riesling",
            description: "Tamar Valley| TAS",
            price_cents: 6500,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/leo_buring_premium_regional_leopold_riesling.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Rosé",
        items: [
          {
            name: "Annie’s Lane Rosé",
            description: "Clare Valley | South Australia",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_rose.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Red Wine",
        items: [
          {
            name: "Wolf Blass Bilyara Shiraz",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/wolf_blass_bilyara_shiraz.jpg"
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Shiraz",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_shiraz.jpg"
              }
            }
          },
          {
            name: "T’Gallant Cape Schanck Pinot Noir",
            description: "Mornington Peninsula | VIC",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_cape_schanck_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Penfolds Koonunga Hill Seventy‐Six Shiraz Cabernet Sauvignon",
            description: "South Australia",
            price_cents: 4600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/penfolds_koonunga_hill_76_shiraz_cabernet.jpg"
              }
            }
          },
          {
            name: "Saltram 1859 Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_1859_shiraz.jpg"
              }
            }
          },
          {
            name: "Squealing Pig Pinot Noir ",
            description: "Central Otago | NZ",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/squealing_pig_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Shiraz",
            description: "Glenrowan | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_shiraz.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Cabernet Sauvignon",
            description: "Glenrowan | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_cab_sauv.jpg"
              }
            }
          },
          {
            name: "Wolf Blass Gold Label Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 5400,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/wolf_blass_gold_label_shiraz.jpg"
              }
            }
          },
          {
            name: "Pepperjack Shiraz",
            description: "Barossa Valley & McLaren Vale | SA",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/pepperjack_shiraz.jpg"
              }
            }
          },
          {
            name: "Abel’s Tempest Pinot Noir",
            description: "Tasmania",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/abel's_tempest_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Saltram Mamre Brook Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_mamre_brook_shiraz.jpg"
              }
            }
          },
          {
            name: "Saltram Mamre Brook Cabernet Sauvignon",
            description: "Barossa Valley | SA",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_mamre_brook_cab_sauv.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Sparkling Wine",
        items: [
          {
            name: "Stony Peak Brut",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/stony_peak.jpg"
              }
            }
          },
          {
            name: "Seppelt Fleur de Lys Chardonnay Pinot Noir",
            description: "South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/seppelt_fleur_de_lys.jpg"
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Moscato",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_moscato.jpg"
              }
            }
          },
          {
            name: "Coldstream Hills Yarra Valley Range Chardonnay Pinot Noir",
            description: "Yarra Valley | VIC",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/coldstream_hills_chardonnay_pinot_noir.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Deluxe Wines",
        description: "Price on application",
        items: [
          {
            name: "Penfolds Grange 1997",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_1997.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 1999",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 2002",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Magill Estate Shiraz 2003",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_magill_estate_shiraz.jpg'
              }
            }
          },
          {
            name: "Penfolds Grange 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_2001.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Magill Estate Shiraz 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_1997.jpg'
              }
            }
          },
          {
            name: "Penfolds St Henri Shiraz 2002",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_st_henri_shiraz.jpg'
              }
            }
          }
        ]
      },
      {
        name: "French Champagne",
        //
        items: [
          {
            name: "Moet & Chandon Brut Imperial",
            description: "Epernay | France",
            price_cents: 17500
          },
          {
            name: "Veuve Clicquo",
            description: "Riems | France",
            price_cents: 18500
          }
        ]
      },
      {
        name: "Fortified Wines",
        items: [
          {
            name: "Annie’s Lane Botrytis Riesling",
            description: "500ml | Clare Valley | South Australia",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_botrytis_riesling.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Fortified Founder Series Muscat",
            description: "Glenrowan | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_fortified_founder_series_muscat.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Fortified Founder Series Topaque",
            description: "Glenrowan | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_fortified_founder_series_topaque.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Spirits",
        notes: "Unused portions of spirits remaining at the end of the event night (the purchase date) will be held for use in your Corporate Suite during following events for a maximum of 3 months from the date of purchase.",
        items: [
          {
            name: "Bacardi Rum",
            price_cents: 8000
          },
          {
            name: "Bundaberg Rum",
            price_cents: 8000
          },
          {
            name: "Canadian Club",
            price_cents: 8000
          },
          {
            name: "Gordons Gin",
            price_cents: 8000
          },
          {
            name: "Jim Beam White Label Bourbon",
            price_cents: 8000
          },
          {
            name: "Smirnoff Vodka",
            price_cents: 8000
          },
          {
            name: "Southern Comfort",
            price_cents: 8000
          },
          {
            name: "Johnnie Walker Red Label Scotch",
            price_cents: 8000
          },
          {
            name: "Jack Daniels",
            price_cents: 9000
          },
          {
            name: "Jim Beam Black Label Bourbon",
            price_cents: 11000
          },
          {
            name: "Johnnie Walker Black Label Scotch",
            price_cents: 11000
          }
        ]
      },
      {
        name: "Beer + Cider",
        items: [
          {
            name: "Cascade Premium Light",
            price_cents: 600
          },
          {
            name: "Carlton Dry",
            price_cents: 750
          },
          {
            name: "Pure Blonde",
            price_cents: 700
          },
          {
            name: "Peroni Leggera",
            price_cents: 750
          },
          {
            name: "Crown Lager",
            price_cents: 850
          },
          {
            name: "Peroni Nastro Azzurro",
            price_cents: 900
          },
          {
            name: "Matilda Bay Beez Neez",
            price_cents: 850
          },
          {
            name: "Matilda Bay Fat Yak Pale Ale",
            price_cents: 850
          },
          {
            name: "Matilda Bay Redback Original",
            price_cents: 850
          },
          {
            name: "Bulmers Original Apple Cider",
            price_cents: 800
          }
        ]
      },
      {
        name: "Soft Drinks",
        description: "A range of Coca‐Cola Varieties will be served when Food and Beverage items are selected",
        items: [
          {
            name: "Red Bull",
            price_cents: 500
          },
          {
            name: "Kirks Mixers",
            description: 'Dry Ginger Ale | Soda Water | Tonic Water | 300ml',
            price_cents: 400
          }
        ]
      }
    ]
  };

  this.snacks = {
    name: "Snacks Menu",
    canChooseQuantity: true,
    sections: [
      {
        name: "On Arrival",
        items:[
          {
            name: "Kettle Sea Salt",
            price_cents: 450
          },
          {
            name: "Kettle Sea Salt & Vinegar",
            price_cents: 450
          },
          {
            name: "Kettle Chilli",
            price_cents: 450
          },
          {
            name: "Cheezels",
            price_cents: 450
          },
          {
            name: "Dipping Plate",
            price_cents: 7000,
            description: "Dukkah toasted Turkish bread with aged balsamic & extra virgin olive oil"
          },
          {
            name: "Mezze dip platter",
            price_cents: 7000,
            description: "Spiced pumpkin, mint yoghurt, beetroot hommus with flat breads"
          },
          {
            name: "Assorted mini gourmet wrap platter",
            price_cents: 17000,
            description: "2pp"
          },
          {
            name: "Assorted California roll & sushi platter",
            price_cents: 17000,
            description: "2pp"
          },
          {
            name: "Gourmet deli platter",
            price_cents: 30000,
            description: "Wagyu bresaola, Vincentina sopresa, prosciutto cotto & Lonza"
          },
          {
            name: "Seafood platter",
            price_cents: 30000,
            description: "Tarator of ocean trout with tahina yoghurt, walnut & pomegranate, slow braised baby octopus"
          },
          {
            name: "Freshly brewed coffee & tea service",
            price_cents: 6500,
            description: "Tarator of ocean trout with tahina yoghurt, walnut & pomegranate, slow braised baby octopus"
          }
        ]
      },
      {
        name: "Hot Platters",
        description: "Served as your guests arrive",
        items: [
          {
            name: "Butter chicken & rice boxes",
            description: "18 per platter",
            price_cents: 10000
          },
          {
            name: "Mini beef pies with tomato sauce ",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini sausage rolls with tomato sauce",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini quiches including vegetarian",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini pizzas",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Beetroot arancini with grated grana padano",
            description: "24 per platter",
            price_cents: 6000
          }
        ]
      },
      {
        name: "Dessert",
        description: "Served at interval or the completion of the event, depending on event schedule",
        items: [
          {
            name: "Assorted mini desserts",
            description: "18 per platter",
            price_cents: 8000
          },
          {
            name: "Australian cheese platter",
            price_cents: 8000
          },
          {
            name: "Freshly sliced seasonal fruit platter",
            price_cents: 5500
          },
          {
            name: "Streets Magnum Original ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum White ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum Peppermint ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum Chocolate Truffle ice cream",
            price_cents: 470
          },
          {
            name: "Vanilla cupcakes",
            description: "minimum order of 6",
            price_cents: 450
          },
          {
            name: "Birthday Cake",
            description: "18 Portions",
            price_cents: 7000
          }
        ]
      }
    ]
  };

  this.selectedOptions = {
    inventory_id: $stateParams.id,
    notes: '',
    hostDetails: '',
    selection: {
      snacks: [],
      menu: [],
      drinks: []
    }
  };

  this.hostCanOrderMore = false;

  this.buildSelections = function() {
    this.selectedOptions.selection.snacks = [];
    this.selectedOptions.selection.drinks = [];
    __extractSelectedOptions(this.snacks.sections, this.selectedOptions.selection.snacks);
    __extractSelectedOptions(this.drinks.sections, this.selectedOptions.selection.drinks);
  };

  this.submitSelections = function() {
    NProgress.start();
    console.log(this.selectedOptions);
    var that = this;

    Restangular.one('companies', Auth.currentUser.company.id).post('options',this.selectedOptions).then(function(result) {
        NProgress.done();
        $rootScope.$broadcast('options:selections:saved', result);
        that.selectedOptions = {
            inventory_id: $stateParams.id,
            notes: '',
            host_details: '',
            selection: {
                snacks: [],
                menu: [],
                drinks: []
            }
        };
    }).catch(function(error) {
        $rootScope.$broadcast('options:selections:failure', error)
    })
  };

  var __extractSelectedOptions = function(list, output) {
    Lazy(list).each(function(section) {
        Lazy(section.items).each(function(item) {
          if (item.count > 0) output.push(item);

        })
    });
  }

}]);
(function() {
  var app;

  app = angular.module('thms.services');

  app.service('InventoryConfirmation', [
    '$http', '$rootScope', '$q', function($http, $rootScope, $q) {
      return {
        view: function(inventoryId) {
          var defferred;
          defferred = $q.defer();
          $http.get("/api/v2/inventory/" + inventoryId + "/confirmations").then(function(result) {
            return defferred.resolve(result);
          })["catch"](function(error) {
            return defferred.reject(error);
          });
          return defferred.promise;
        },
        update: function(data) {
          var defferred;
          defferred = $q.defer();
          $http.put("/api/v2/inventory/" + data.inventory_id + "/confirmations/" + data.id, data).then(function(result) {
            return defferred.resolve(result);
          })["catch"](function(error) {
            return defferred.reject(error);
          });
          return defferred.promise;
        }
      };
    }
  ]);

}).call(this);
angular.module('thms.services').service('Options', ['$rootScope', 'Restangular', 'Auth', '$stateParams', function($rootScope, Restangular, Auth, $stateParams) {

  this.shouldShowCoke = function() {
    var cateringSelected = false;
    if (!_.isEmpty(this.selectedOptions.selection.drinks)) {
      cateringSelected = true;
    }
    if (!_.isEmpty(this.selectedOptions.selection.snacks)) {
      cateringSelected = true;
    }
    if (!_.isEmpty(this.selectedOptions.selection.menu)) {
      cateringSelected = true;
    }

    if (this.selectedOptions.selection.standardDrinkList) {
      cateringSelected = true;
    }

    return cateringSelected;
  };


  this.menus = [
    {
      name: "Menu One",
      type: 'food',
      price_cents: "7500",
      sections: [
        {
          name: "On Arrival",
          items: [
            {name: "Spiced pumpkin, mint yoghurt, beetroot hommus with flat breads"},
            {name: "Devil’s Lair The Hidden Cave Chardonnay", drink: true},
            {name: "Matilda Bay Redback Original", drink: true}
          ]
        },
        {
          name: "Main Course",
          items: [
            {name: "Cajun spiced chicken tulip legs with tomato ragout & sauté rosemary potatoes"},
            {name: "Devil’s Lair The Hidden Cave Chardonnay", drink: true},
            {name: "Veal medallions, sautéed spinach & minted heirloom carrots"},
            {name: "Matilda Bay Fat Yak Pale Ale", drink: true},
            {name: "Marinated bocconcini, baby octopus, smoked salmon & prosciutto platter"},
            {name: "Lemon, garlic & chickpea salad with tomato lemon dressing"},
            {name: "Mixed garden salad"},
            {name: "Fresh bread selection"}
          ]
        },
        {
          name: "Dessert",
          items: [
            {name: "Baileys of Glenrowan Fortified Founder Series Muscat", drink: true},
            {name: "Baileys of Glenrowan Fortified Founder Series Topaque", drink: true},
            {name: "Orange chocolate mousse with caramel fudge"},
            {name: "Glazed fruit custard with swiss roll"},
            {name: "Trio of Australian cheeses with dried fruit, nuts, crisp bread & lavosh"},
            {name: "Freshly brewed coffee & tea selection with chocolates"}
          ]
        }
      ]
    },
    {
      name: "Menu Two",
      type: 'food',
      price_cents: "6500",
      sections: [
        {
          name: "On Arrival",
          items: [
            {name: "Dukkah toasted Turkish bread with aged balsamic & extra virgin olive oil"},
            {name: "Matilda Bay Beez Neez", drink: true}
          ]
        },
        {
          name: "Main Course",
          items: [
            {name: "Slow roasted lamb shoulder with rosemary & garlic, lemon scented cous cous with fresh herbs, mint yoghurt dressing"},
            {name: "Matilda Bay Fat Yak Pale Ale", drink: true},
            {name: "Grilled chicken breast, roast pumpkin, red pepper & asparagus with a chive & corn nage"},
            {name: "Rosemount Estate District Release Chardonnay", drink: true},
            {name: "Creamy pasta salad with baby corn, peppers & herbs"},
            {name: "Mixed garden salad"},
            {name: "Fresh bread selection"}
          ]
        },
        {
          name: "Dessert",
          items: [
            {name: "Baileys of Glenrowan Fortified Founder Series Muscat", drink: true},
            {name: "Baileys of Glenrowan Fortified Founder Series Topaque", drink: true},
            {name: "Streets Magnun ice creams"},
            {name: "Trio of Australian cheeses with dried fruit, nuts, crisp bread & lavosh"},
            {name: "Freshly brewed coffee & tea selection with chocolates"}
          ]
        }
      ]
    }
  ];

  this.drinks = {
    name: "Drinks Menu",
    sections: [
      {
        name:"White Wine",
        items:[
          {
            name: "Wolf Blass Bilyara Chardonnay",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/wolf_blass_bilyara_chardonnay.jpg'
              }
            }
          },
          {
            name: "Angel Cove Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/angel_cove_sauvignon_blanc.jpg'
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Pinot Grigio ",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_pinot_grigio.jpg"
              }
            }
          },
          {
            name: "Rosemount Estate District Release Chardonnay",
            description: "Robe | SA",
            price_cents: 4600,
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/rosemount_estate_district_release_chardonnay.jpg'
              }
            }

          },
          {
            name: "Squealing Pig Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/squealing_pig_sauvignon_blanc.jpg"
              }
            }
          },
          {
            name: "Annie’s Lane Moscato",
            description: "South Eastern Australia",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_moscato.jpg"
              }
            }
          },
          {
            name: "Devil’s Lair The Hidden Cave Chardonnay",
            description: "Margaret River | WA",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/devils_lair_the_hidden_cave_chardonnay.jpg"
              }
            }
          },
          {
            name: "T’Gallant Grace Pinot Grigio",
            description: "Mornington Peninsula | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_grace_pinot_grigio.jpg"
              }
            }
          },
//          {
//            name: "Annies Lane Quelltaler Watervale Riesling",
//            description: "Clare Valley | South Australia",
//            price_cents: 5200,
//            data: {
//              image: {
//                storage: 'local',
//                file_name: "/wine-images/annies_lane_quelltaler_watervale_riesling.jpg"
//              }
//            }
//          },
          {
            name: "St Huberts Roussanne",
            description: "Yarra Valley | SA",
            price_cents: 5400,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/st_huberts_roussanne.jpg"
              }
            }
          },
          {
            name: "T’Gallant Tribute Pinot Gris",
            description: "Mornington Peninsula | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_tribute_pinot_gris.jpg"
              }
            }
          },
          {
            name: "Matua Estate Series Paretei Sauvignon Blanc",
            description: "Marlborough | NZ",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/matua_estate_series_paratei_sauvignon_blanc.jpg"
              }
            }
          },
          {
            name: "Coldstream Hills Yarra Valley Range Chardonnay",
            description: "Yarra Valley | VIC",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/coldstream_hills_yarra_valley_range_chardonnay.jpg"
              }
            }
          },
          {
            name: "Leo Buring Premium Regional Leopold Riesling",
            description: "Tamar Valley| TAS",
            price_cents: 6500,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/leo_buring_premium_regional_leopold_riesling.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Rosé",
        items: [
          {
            name: "Annie’s Lane Rosé",
            description: "Clare Valley | South Australia",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_rose.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Red Wine",
        items: [
          {
            name: "Wolf Blass Bilyara Shiraz",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/wolf_blass_bilyara_shiraz.jpg"
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Shiraz",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_shiraz.jpg"
              }
            }
          },
          {
            name: "T’Gallant Cape Schanck Pinot Noir",
            description: "Mornington Peninsula | VIC",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/t'gallant_cape_schanck_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Penfolds Koonunga Hill Seventy‐Six Shiraz Cabernet Sauvignon",
            description: "South Australia",
            price_cents: 4600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/penfolds_koonunga_hill_76_shiraz_cabernet.jpg"
              }
            }
          },
          {
            name: "Saltram 1859 Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 4800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_1859_shiraz.jpg"
              }
            }
          },
          {
            name: "Squealing Pig Pinot Noir ",
            description: "Central Otago | NZ",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/squealing_pig_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Shiraz",
            description: "Glenrowan | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_shiraz.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Cabernet Sauvignon",
            description: "Glenrowan | VIC",
            price_cents: 5200,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_cab_sauv.jpg"
              }
            }
          },
          {
            name: "Wolf Blass Gold Label Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 5400,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/wolf_blass_gold_label_shiraz.jpg"
              }
            }
          },
          {
            name: "Pepperjack Shiraz",
            description: "Barossa Valley & McLaren Vale | SA",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/pepperjack_shiraz.jpg"
              }
            }
          },
          {
            name: "Abel’s Tempest Pinot Noir",
            description: "Tasmania",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/abel's_tempest_pinot_noir.jpg"
              }
            }
          },
          {
            name: "Saltram Mamre Brook Shiraz",
            description: "Barossa Valley | SA",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_mamre_brook_shiraz.jpg"
              }
            }
          },
          {
            name: "Saltram Mamre Brook Cabernet Sauvignon",
            description: "Barossa Valley | SA",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/saltram_mamre_brook_cab_sauv.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Sparkling Wine",
        items: [
          {
            name: "Stony Peak Brut",
            description: "South Eastern Australia",
            price_cents: 3800,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/stony_peak.jpg"
              }
            }
          },
          {
            name: "Seppelt Fleur de Lys Chardonnay Pinot Noir",
            description: "South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/seppelt_fleur_de_lys.jpg"
              }
            }
          },
          {
            name: "Lindeman’s Early Harvest Moscato",
            description: "25% lighter in alcohol & calories* | South Eastern Australia",
            price_cents: 4000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/lindemans_early_harvest_moscato.jpg"
              }
            }
          },
          {
            name: "Coldstream Hills Yarra Valley Range Chardonnay Pinot Noir",
            description: "Yarra Valley | VIC",
            price_cents: 6000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/coldstream_hills_chardonnay_pinot_noir.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Deluxe Wines",
        description: "Price on application",
        items: [
          {
            name: "Penfolds Grange 1997",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_1997.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 1999",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 2002",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Magill Estate Shiraz 2003",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_magill_estate_shiraz.jpg'
              }
            }
          },
          {
            name: "Penfolds Grange 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_2001.jpg'
              }
            }
          },
          {
            name: "Penfolds Bin 707 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_bin_707.jpg'
              }
            }
          },
          {
            name: "Penfolds Magill Estate Shiraz 2001",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_grange_1997.jpg'
              }
            }
          },
          {
            name: "Penfolds St Henri Shiraz 2002",
            data: {
              image: {
                storage: 'local',
                file_name: '/wine-images/penfolds_st_henri_shiraz.jpg'
              }
            }
          }
        ]
      },
      {
        name: "French Champagne",
        //
        items: [
          {
            name: "Moet & Chandon Brut Imperial",
            description: "Epernay | France",
            price_cents: 17500
          },
          {
            name: "Veuve Clicquo",
            description: "Riems | France",
            price_cents: 18500
          }
        ]
      },
      {
        name: "Fortified Wines",
        items: [
          {
            name: "Annie’s Lane Botrytis Riesling",
            description: "500ml | Clare Valley | South Australia",
            price_cents: 5000,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/annies_lane_botrytis_riesling.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Fortified Founder Series Muscat",
            description: "Glenrowan | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_fortified_founder_series_muscat.jpg"
              }
            }
          },
          {
            name: "Baileys of Glenrowan Fortified Founder Series Topaque",
            description: "Glenrowan | VIC",
            price_cents: 5600,
            data: {
              image: {
                storage: 'local',
                file_name: "/wine-images/baileys_of_glenrowan_fortified_founder_series_topaque.jpg"
              }
            }
          }
        ]
      },
      {
        name: "Spirits",
        notes: "Unused portions of spirits remaining at the end of the event night (the purchase date) will be held for use in your Corporate Suite during following events for a maximum of 3 months from the date of purchase.",
        items: [
          {
            name: "Bacardi Rum",
            price_cents: 8000
          },
          {
            name: "Bundaberg Rum",
            price_cents: 8000
          },
          {
            name: "Canadian Club",
            price_cents: 8000
          },
          {
            name: "Gordons Gin",
            price_cents: 8000
          },
          {
            name: "Jim Beam White Label Bourbon",
            price_cents: 8000
          },
          {
            name: "Smirnoff Vodka",
            price_cents: 8000
          },
          {
            name: "Southern Comfort",
            price_cents: 8000
          },
          {
            name: "Johnnie Walker Red Label Scotch",
            price_cents: 8000
          },
          {
            name: "Jack Daniels",
            price_cents: 9000
          },
          {
            name: "Jim Beam Black Label Bourbon",
            price_cents: 11000
          },
          {
            name: "Johnnie Walker Black Label Scotch",
            price_cents: 11000
          }
        ]
      },
      {
        name: "Beer + Cider",
        items: [
          {
            name: "Cascade Premium Light",
            price_cents: 650
          },
          {
            name: "Carlton Dry",
            price_cents: 800
          },
          {
            name: "Pure Blonde",
            price_cents: 800
          },
          {
            name: "Peroni Leggera",
            price_cents: 800
          },
          {
            name: "Crown Lager",
            price_cents: 900
          },
          {
            name: "Peroni Nastro Azzurro",
            price_cents: 950
          },
          {
            name: "Matilda Bay Beez Neez",
            price_cents: 900
          },
          {
            name: "Matilda Bay Fat Yak Pale Ale",
            price_cents: 900
          },
          {
            name: "Matilda Bay Redback Original",
            price_cents: 900
          },
          {
            name: "Bulmers Original Apple Cider",
            price_cents: 800
          }
        ]
      },
      {
        name: "Soft Drinks",
        description: "A range of Coca‐Cola Varieties will be served when Food and Beverage items are selected",
        items: [
          {
            name: "Red Bull",
            price_cents: 500
          },
          {
            name: "Kirks Mixers",
            description: 'Dry Ginger Ale | Soda Water | Tonic Water | 300ml',
            price_cents: 400
          }
        ]
      }
    ]
  };

  this.snacks = {
    name: "Snacks Menu",
    canChooseQuantity: true,
    sections: [
      {
        name: "On Arrival",
        items:[
          {
            name: "Kettle Sea Salt",
            price_cents: 450
          },
          {
            name: "Kettle Sea Salt & Vinegar",
            price_cents: 450
          },
          {
            name: "Kettle Chilli",
            price_cents: 450
          },
          {
            name: "Cheezels",
            price_cents: 450
          },
          {
            name: "Dipping Plate",
            price_cents: 7000,
            description: "Dukkah toasted Turkish bread with aged balsamic & extra virgin olive oil"
          },
          {
            name: "Mezze dip platter",
            price_cents: 7000,
            description: "Spiced pumpkin, mint yoghurt, beetroot hommus with flat breads"
          },
          {
            name: "Assorted mini gourmet wrap platter",
            price_cents: 17000,
            description: "2pp"
          },
          {
            name: "Assorted California roll & sushi platter",
            price_cents: 17000,
            description: "2pp"
          },
          {
            name: "Gourmet deli platter",
            price_cents: 30000,
            description: "Wagyu bresaola, Vincentina sopresa, prosciutto cotto & Lonza"
          },
          {
            name: "Seafood platter",
            price_cents: 30000,
            description: "Tarator of ocean trout with tahina yoghurt, walnut & pomegranate, slow braised baby octopus"
          },
          {
            name: "Freshly brewed coffee & tea service",
            price_cents: 6500,
            description: "Tarator of ocean trout with tahina yoghurt, walnut & pomegranate, slow braised baby octopus"
          }
        ]
      },
      {
        name: "Hot Platters",
        description: "Served as your guests arrive",
        items: [
          {
            name: "Butter chicken & rice boxes",
            description: "18 per platter",
            price_cents: 10000
          },
          {
            name: "Mini beef pies with tomato sauce ",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini sausage rolls with tomato sauce",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini quiches including vegetarian",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Mini pizzas",
            description: "24 per platter",
            price_cents: 6000
          },
          {
            name: "Beetroot arancini with grated grana padano",
            description: "24 per platter",
            price_cents: 6000
          }
        ]
      },
      {
        name: "Dessert",
        description: "Served at interval or the completion of the event, depending on event schedule",
        items: [
          {
            name: "Assorted mini desserts",
            description: "18 per platter",
            price_cents: 8000
          },
          {
            name: "Australian cheese platter",
            price_cents: 8000
          },
          {
            name: "Freshly sliced seasonal fruit platter",
            price_cents: 5500
          },
          {
            name: "Streets Magnum Original ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum White ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum Almond ice cream",
            price_cents: 470
          },
          {
            name: "Streets Magnum Chocolate Truffle ice cream",
            price_cents: 470
          },
          {
            name: "Vanilla cupcakes",
            description: "minimum order of 6",
            price_cents: 450
          },
          {
            name: "Birthday Cake",
            description: "18 Portions",
            price_cents: 7000
          }
        ]
      }
    ]
  };

  this.selectedOptions = {
    inventory_id: $stateParams.id,
    notes: '',
    hostDetails: '',
    selection: {
      snacks: [],
      menu: [],
      drinks: [],
      parking: []
    }
  };

  this.parkingSpaces = 0;
  this.hostCanOrderMore = false;

  this.buildSelections = function() {
    this.selectedOptions.selection.snacks = [];
    this.selectedOptions.selection.drinks = [];
    __extractSelectedOptions(this.snacks.sections, this.selectedOptions.selection.snacks);
    __extractSelectedOptions(this.drinks.sections, this.selectedOptions.selection.drinks);
  };

  this.submitSelections = function() {
    NProgress.start();
//    console.log(this.selectedOptions)
    var that = this;
    Restangular.one('companies', Auth.currentUser.company.id).post('options',this.selectedOptions).then(function(result) {
        NProgress.done();
        $rootScope.$broadcast('options:selections:saved', result);
        that.selectedOptions = {
            inventory_id: $stateParams.id,
            notes: '',
            host_details: '',
            selection: {
                snacks: [],
                menu: [],
                drinks: [],
                parking: []
            }
        };
    }).catch(function(error) {
        $rootScope.$broadcast('options:selections:failure', error)
    })
  };

  var __extractSelectedOptions = function(list, output) {
    Lazy(list).each(function(section) {
        Lazy(section.items).each(function(item) {
          if (item.count > 0) output.push(item);

        })
    });
  }

}]);
angular.module('thms.controllers').controller('AddCompanyClient', ['$scope', 'Company', '$state', '$humane', function($scope, Company, $state, $humane) {

    $state.go('authenticated.main.clients.add.name');
  $scope.CompanyService = Company;

  $scope.company = {};

  $scope.createCompany = function(company) {
    $scope.CompanyService.create(company)
  };

  $scope.$root.$on('company:create:success', function(event, data) {
      $scope.company = data;
      $humane.stickyError('Company Created');
      $state.go('authenticated.main.clients.add.facility');
  });

  $scope.$root.$on('company:create:failure', function(event, data) {
      $humane.stickyError('Error Creating Company');
  });

}]);
angular.module('thms.controllers').controller('CateringCreateMenu', ['$scope', 'Auth', 'menuCategories', 'Restangular', function($scope, Auth,  menuCategories, Restangular) {
  $scope.categories = menuCategories;

  $scope.itemFilter = '';

  $scope.menu = {
    name: '',
    sections: []
  };


  $scope.addMenuSection = function() {
    $scope.menu.sections.push({items:[]});
  };

  $scope.saveMenu = function() {
    window.foo = $scope.menu;

    Restangular.one('company', Auth.currentUser.company.id).one('catering').post('menus', $scope.menu).then(function(result) {
      console.log(result);
    });

    console.log($scope.menu)
  };

  $scope.addItemToSection = function(section, event, data) {
    section.items.push(Lazy(data).pick(['id', 'name']).toObject());
  };

}]);
angular.module('thms.controllers').controller('ClientsAddSearchCtrl', ['$scope', 'Restangular','Auth', function($scope, Restangular, Auth) {
    $scope.search = function(email) {
        Restangular.all('employees').getList({'email': email}).then(function(users) {
          $scope.results = users
        })
    }
}]);
angular.module('thms.controllers').controller('ConfirmOptionsController', ['$scope', '$state', 'Options', 'IceHockeyOptions', '$modal', 'details', '$humane', 'Tickets', function ($scope, $state, Options, IceHockeyOptions, $modal, details, $humane, Tickets) {
  $scope.confirmButtonDisabled = false;
  $scope.confirmButtonText = "Confirm";

  if (details.event_name == 'WWE') {
    $scope.Options = Options;
  } else if (details.event_name == 'INTERNATIONAL ICE HOCKEY') {
    $scope.Options = IceHockeyOptions;
  } else {
    console.log('bang, something went wrong')
  }

  $scope.details = details;

  $state.go('authenticated.main.inventory.confirmOptions.attendance');

  $scope.confirmDrink = function(item) {
    console.log(item.name + " requested");
    item.count = 1;
    item.requested = true;
  };

  $scope.unConfirmDrink = function(item) {
    console.log(item.name + " de-requested");
    item.count = 0;
    item.requested = false;
  };

  $scope.increment = function (snack) {
    if (snack.count == undefined) {
      snack.count = 0
    }
    snack.count = snack.count + 1;
  };

  $scope.decrement = function (snack) {
    if (snack.count == undefined) {
      snack.count = 0
    }
    if (snack.count >= 0) {
      snack.count = snack.count - 1;
    }
  };

  $scope.goToSnackSelection = function() {
    var modal = $modal.open({
      templateUrl: 'inventory/_modal_snack_conditions',
      windowClass: 'effect-10'
    });

    modal.result.then(function(result) {
        $state.go('authenticated.main.inventory.confirmOptions.snacks')
    })
  };


  $scope.selectMenu = function (menu) {
    $scope.Options.selectedOptions.selection.menu = menu;

    if (menu.doesntHaveDrinksPackage == true) {
      $state.go('authenticated.main.inventory.confirmOptions.drinks');
      return;
    }

    var modalInstance = $modal.open({
      templateUrl: 'inventory/_modal_drinksChoices',
      controller: ['$scope', 'Options', 'IceHockeyOptions', function ($scope, Options, IceHockeyOptions) {

        if (details.event_name == 'WWE') {
          $scope.Options = Options;
        } else if (details.event_name == 'INTERNATIONAL ICE HOCKEY') {
          $scope.Options = IceHockeyOptions;
        } else {
          console.log('bang, something went wrong')
        }

        $scope.next = function () {
          $scope.$close();
          $state.go('authenticated.main.inventory.confirmOptions.drinks')
        }

      }]
    });

  };

  $scope.openModalForItemImage = function(item) {
    var modal = $modal.open({
      template: '"<div class="panel" style="display: flex"><img style="width: auto; max-height: 800px; margin: 0 auto;" src="'+ item.data.image.file_name +'"/></div>',
      windowClass: "effect-8 narrow"
    })
  };

  $scope.notComing = function () {
    $scope.Options.buildSelections();
    $scope.Options.selectedOptions.selection.notComing = true;
    $scope.Options.selectedOptions.inventory_id = $state.params['id'];
    $scope.Options.submitSelections();
  };

  $scope.createNewParkingReservation = function () {
    $scope.Options.parking.push({});
  };

  $scope.buildOptions = function () {
    $scope.Options.buildSelections();
    $state.go('authenticated.main.inventory.confirmOptions.review');
  };

  $scope.wantStandardDrinksMenu = function() {
    $scope.Options.selectedOptions.selection.standardDrinkList = true;
    $state.go('authenticated.main.inventory.confirmOptions.snacks');
  };

  $scope.confirmChoices = function () {
    $scope.confirmButtonDisabled = true;
    $scope.confirmButtonText = "Please Wait...";

    // important
    $scope.Options.selectedOptions.is_attending = true;

    $scope.Options.selectedOptions.inventory_id = $state.params['id'];
    $scope.Options.submitSelections();
  };

  $scope.$root.$on('options:selections:saved', function (event, data) {

    if ($scope.Options.selectedOptions.is_attending) {
      var modal = $modal.open({
        templateUrl: 'inventory/_modal_guest_names',
        windowClass: 'effect-0',
//        backdrop: 'static',
        resolve: {
          confirmation: [
            'InventoryConfirmation', function(InventoryConfirmation) {
              return InventoryConfirmation.view(data.inventory_id)
            }
          ]
        },
        controller: [
          '$scope', 'confirmation', 'InventoryConfirmation', function($scope, confirmation, InventoryConfirmation) {
            $scope.confirmation = confirmation.data;
            if ($scope.confirmation.guests.length === 0) {
              $scope.guestList = [
                {
                  name: ''
                }
              ];
            } else {
              $scope.guestList = $scope.confirmation.guests;
            }
            $scope.addNewGuestName = function() {
              return $scope.guestList.push({
                name: ''
              });
            };

            $scope.save = function() {
              $scope.confirmation.guests = $scope.guestList;
              InventoryConfirmation.update($scope.confirmation).then(function(result) {
                $scope.$close();
              }).catch(function(error) {
                return $scope.$close();
              });
            };
          }
        ]
      });

      modal.result.then(function(result) {
        $state.go('authenticated.main.event.client.index');
        $humane.stickySuccess('Options Confirmed Successfully');
        // they have confirmed guests or something
        Tickets.addMagicalTickets();
      });
    } else {

      // they arent coming
      $state.go('authenticated.main.event.client.index');
      $humane.stickySuccess('Options Confirmed Successfully');
    }

  })

}]);
angular.module('thms.controllers').controller('EmployeesIndexCtrl', ['$scope', 'Restangular', 'data', function($scope, Restangular, data) {
  $scope.data = data;
}]);
angular.module('thms.controllers').controller('EventAddCtrl', ['$scope', 'Restangular', '$state', function($scope, Restangular, $state) {

  $scope.createEvent = function(model) {
    Restangular.one('company', $scope.$root.currentUser.company.id).all('events').post(model).then(function(result) {
        console.log(result);
        $state.transitionTo('authenticated.main.events.add.dates');
    })
  };

}]);
angular.module('thms.controllers').controller('EventDatesCtrl', ['$scope', 'Restangular', function($scope, Restangular) {

  $scope.addDate = function() {
    console.log('add date pushed');
  }

}]);
angular.module('thms.controllers').controller('EventReleaseController', ['$scope', 'EventService', '$state', 'availableFacilities', function($scope, Event, $state, facilities) {
  $scope.data = facilities.data;
  console.log(facilities);
  $scope.data.forEach(function(item) {
      item.selected = false
  });

  $scope.toggleSelectAll = function() {
    $scope.data.forEach(function(item) {
      item.selected = $scope.allSelected;
    });
  };


  $scope.releaseToInventory = function() {
    var selectedFacilities = [];
//    var data = Lazy(Restangular.stripRestangular($scope.data));
    data = Lazy($scope.data);
    data.filter(function(item) {
      return item.selected && item
    }).each(function(item, index) {
      selectedFacilities.push(Lazy(item).pick(['client_id', 'company_id', 'facility_id', 'total', 'remaining', 'event_period', 'event_date_id']).toObject())
    });

    Event.bulkReleaseToInventory($state.params.date_id, {data:selectedFacilities}).success(function(results) {
        $state.go('authenticated.main.event.view', {event_id: $state.params.event_id});
    }).error(function(error) {
        console.log(error);
    })

  };

}]);
angular.module('thms.controllers').controller('LoginWindowCtrl', ['$scope', 'Auth', function($scope, Auth) {

  var setDefaultState = function () {
    $scope.loginBtnText = "Login";
    $scope.details = {};
    $scope.inProgress = false;
    $scope.showErrors = false;
  };

  /**
   * Event Listeners
   */
  $scope.$root.$on('event:auth-login-invalid', function (event, data) {
    $scope.invalidLogin = true;
    $scope.errorMessage = data.error;
    setDefaultState();
    NProgress.done();
  });

  $scope.$root.$on('event:auth-logged-in', function(result) {
      NProgress.done();
  });

  /**
   * Functions
   *
   */
  $scope.login = function () {

    if ($scope.form.$invalid) {
      $scope.showErrors = true;
      return false;
    }

      NProgress.start();

    $scope.loginBtnText = "Logging In...", $scope.inProgress = true;

    Auth.login($scope.details);
  };

  setDefaultState();
}]);
angular.module('thms.controllers').controller('MainDashboardCtrl', ['$rootScope', function($rootScope) {

}]);
angular.module('thms.controllers').controller('ResetPasswordCtrl', ['$scope', '$state', '$http', function($scope, $state, $http) {
    $scope.data = {
        password: '',
        password_confirmation: '',
        token: $state.params['token']
    };
    $scope.buttonText = 'Reset Password';
    $scope.buttonDisabled = true;

    $scope.resetPassword = function(data) {
        $scope.buttonText = 'Please Wait..';
        NProgress.start();
        $http.post('/api/v1/security/reset_password', data).success(function(results) {
            NProgress.done();
            $state.go('guest.login');
        }).error(function(error) {
            $scope.buttonText = 'Reset Password';
            $scope.buttonDisabled = false;
            NProgress.stop();
        })
    }
}]);
(function() {
  var UserHeaderController, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.controllers');

  UserHeaderController = (function(_super) {
    __extends(UserHeaderController, _super);

    function UserHeaderController() {
      return UserHeaderController.__super__.constructor.apply(this, arguments);
    }

    UserHeaderController.register(app);

    UserHeaderController.inject('$scope', '$modal', 'Auth');

    UserHeaderController.prototype.initialize = function() {
      return this.$scope.userMenu = {
        isOpen: false
      };
    };

    UserHeaderController.prototype.toggleUserMenu = function() {
      return this.$scope.userMenu.isOpen = !this.$scope.userMenu.isOpen;
    };

    UserHeaderController.prototype.help = function() {
      var modal;
      return modal = this.$modal.open({
        templateUrl: 'teasers/modal_help',
        windowClass: 'effect-10'
      });
    };

    UserHeaderController.prototype.logout = function() {
      return this.Auth.logout();
    };

    UserHeaderController.prototype.showMasqueradeUserList = function() {
      var modal;
      return modal = this.$modal.open({
        templateUrl: 'admin/masquerading/_modal_list_avail',
        resolve: {
          users: [
            '$http', function($http) {
              return $http.get('/api/v2/masquerading/available');
            }
          ]
        },
        windowClass: 'effect-10 masquerade',
        controller: [
          '$scope', '$humane', '$state', 'users', 'Auth', function($scope, $humane, $state, users, Auth) {
            $scope.users = users.data;
            return $scope.masqueradeAs = function(user) {
              return Auth.startMasquerading(user.id).then(function(user) {
                $state.go('authenticated.main.home');
                return $scope.$close();
              })["catch"](function(error) {
                $scope.$close();
                return $humane.stickyError(error);
              });
            };
          }
        ]
      });
    };

    return UserHeaderController;

  })(BaseCtrl);

}).call(this);
//angular.module('thms.controllers').controller('UserHeaderController', ['$scope', '$modal', 'Auth', function($scope, $modal, Auth) {
//
//    $scope.userMenu = {
//      isOpen: false
//    };
//
//    $scope.toggleUserMenu = function() {
//        $scope.userMenu.isOpen = !$scope.userMenu.isOpen;
//    };
//
//    $scope.help = function() {
//        var Modal = $modal.open({
//            templateUrl: 'teasers/modal_help',
//            windowClass: 'effect-10'
//        })
//    };
//
//    $scope.logout = function() {
//        Auth.logout();
//    }
//}]);
(function() {
  var __slice = [].slice;

  this.BaseCtrl = (function() {
    BaseCtrl.register = function(app, name) {
      var _ref;
      if (name == null) {
        name = this.name || ((_ref = this.toString().match(/function\s*(.*?)\(/)) != null ? _ref[1] : void 0);
      }
      return app.controller(name, this);
    };

    BaseCtrl.inject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.$inject = args;
    };

    function BaseCtrl() {
      var args, fn, index, key, _i, _len, _ref, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.constructor.$inject;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        key = _ref[index];
        this[key] = args[index];
      }
      _ref1 = this.constructor.prototype;
      for (key in _ref1) {
        fn = _ref1[key];
        if (typeof fn !== 'function') {
          continue;
        }
        if ((key === 'constructor' || key === 'initialize') || key[0] === '_') {
          continue;
        }
        this.$scope[key] = (typeof fn.bind === "function" ? fn.bind(this) : void 0) || _.bind(fn, this);
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return BaseCtrl;

  })();

}).call(this);
angular.module('thms.controllers').controller('VenueViewEventController', ['$scope', 'EventService', 'resolvedEvent', '$modal', function($scope, Event, event, $modal) {
    console.log("VenueViewEventController Loaded");
    console.log(event);
    $scope.event = event;
    var openedModal;

    $scope.newEventDate = function() {
        openedModal = $modal.open({
            templateUrl: 'events/_modal_add_event_date',
            controller: ['$scope', 'Options', function ($scope, Options) {
                $scope.Options = Options;

                $scope.next = function () {
                    $scope.$close();
                    $state.go('authenticated.main.inventory.confirmOptions.drinks')
                }

            }]
        });
    };

    $scope.editEventDate = function(date) {
      openedModal = $modal.open({
          templateUrl: 'events/_modal_add_event_date',
          controller: ['$scope', function ($scope) {
              $scope.date = date;
          }]
      })
    }

}]);
angular.module('thms.controllers').controller('VenueFacilityLeaseCreate', ['$scope', '$http', '$state', '$humane', 'Facility', 'clients', 'facilities', 'Auth', function($scope, $http, $state, $humane, Facility, clients, facilities, Auth) {
    console.log($scope.$parent.company.id);
    $scope.clients = clients;
    $scope.facilities = facilities;

    $scope.save = function(lease) {
        lease.company_id = $scope.$parent.company.id;
        $http.post('/api/v1/companies/'+Auth.currentUser.company.id+'/facilities/'+lease.facility_id+'/leases', lease).success(function(results) {
            $humane.stickyError('Facility Lease Created');
            $state.go('authenticated.main.company.index');
        }).error(function(error) {
            console.log(error)
        })
    }



}]);
(function() {
  var app;

  app = angular.module('thms.directives');

  app.directive('activeClassOn', [
    '$state', function($state) {
      return {
        restrict: 'A',
        controller: [
          '$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            var isMatch, routesToMatch;
            routesToMatch = $attrs['activeClassOn'].split(' ');
            isMatch = function() {
              return _.any(routesToMatch, function(route) {
                return $state.includes(route);
              });
            };
            $scope.$on('$stateChangeSuccess', function() {
              if (isMatch()) {
                return $element.addClass('active');
              } else {
                return $element.removeClass('active');
              }
            });
            if (isMatch()) {
              return $element.addClass('active');
            } else {
              return $element.removeClass('active');
            }
          }
        ]
      };
    }
  ]);

}).call(this);
angular.module('thms.directives')
.directive('dollarCents', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      var toDollars = function(text) {
        var text = (text || "0");
        return (parseFloat(text) / 100);
      };

      var toCents = function(text) {
        var text = (text || "0");
        return (parseFloat(text) * 100);
      };

      ngModel.$parsers.push(toDollars);
      ngModel.$formatters.push(toCents);
    }
  }
});
angular.module('thms.directives').directive('dateFix', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attr, ngModel) {
      element.on('change', function() {
        scope.$apply(function () {
          ngModel.$setViewValue(element.val());
        });
      });
    }
  };
});
angular.module('thms.directives').filter('filterMultiple', ['$filter', function ($filter) {
  return function (items, keyObj) {

    var filterObj = {
      data: items,
      filteredData: [],
      applyFilter: function (obj, key) {

        var fData = [];
        if (this.filteredData.length == 0)
          this.filteredData = this.data;
        if (obj) {
          var fObj = {};
          if (!angular.isArray(obj)) {
            fObj[key] = obj;
            fData = fData.concat($filter('filter')(this.filteredData, fObj));
          } else if (angular.isArray(obj)) {
            if (obj.length > 0) {
              for (var i = 0; i < obj.length; i++) {
                if (angular.isDefined(obj[i])) {
                  fObj[key] = obj[i];
                  fData = fData.concat($filter('filter')(this.filteredData, fObj));
                }
              }
            }
          }
          if (fData.length > 0) {
            this.filteredData = fData;
          }
        }
      }
    };

    if (keyObj) {
      angular.forEach(keyObj, function (obj, key) {
        filterObj.applyFilter(obj, key);
      });
    }
    return filterObj.filteredData;
  }
}]);
angular.module('thms.directives')
  .directive('money', function () {

    var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

    function link(scope, el, attrs, ngModelCtrl) {
      var min = parseFloat(attrs.min || 0);
      var precision = parseFloat(attrs.precision || 2);
      var lastValidValue;

      function round(num) {
        var d = Math.pow(10, precision);
        return Math.round(num * d) / d;
      }

      function formatPrecision(value) {
        return parseFloat(value).toFixed(precision);
      }

      function formatViewValue(value) {
        return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
      }


      ngModelCtrl.$parsers.push(function (value) {
        // Handle leading decimal point, like ".5"
        if (value.indexOf('.') === 0) {
          value = '0' + value;
        }

        // Allow "-" inputs only when min < 0
        if (value.indexOf('-') === 0) {
          if (min >= 0) {
            value = null;
            ngModelCtrl.$setViewValue('');
            ngModelCtrl.$render();
          } else if (value === '-') {
            value = '';
          }
        }

        var empty = ngModelCtrl.$isEmpty(value);
        if (empty || NUMBER_REGEXP.test(value)) {
          lastValidValue = (value === '')
            ? null
            : (empty ? value : parseFloat(value));
        } else {
          // Render the last valid input in the field
          ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
          ngModelCtrl.$render();
        }

        ngModelCtrl.$setValidity('number', true);
        return lastValidValue;
      });
      ngModelCtrl.$formatters.push(formatViewValue);

      var minValidator = function (value) {
        if (!ngModelCtrl.$isEmpty(value) && value < min) {
          ngModelCtrl.$setValidity('min', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('min', true);
          return value;
        }
      };
      ngModelCtrl.$parsers.push(minValidator);
      ngModelCtrl.$formatters.push(minValidator);

      if (attrs.max) {
        var max = parseFloat(attrs.max);
        var maxValidator = function (value) {
          if (!ngModelCtrl.$isEmpty(value) && value > max) {
            ngModelCtrl.$setValidity('max', false);
            return undefined;
          } else {
            ngModelCtrl.$setValidity('max', true);
            return value;
          }
        };

        ngModelCtrl.$parsers.push(maxValidator);
        ngModelCtrl.$formatters.push(maxValidator);
      }

      // Round off
      if (precision > -1) {
        ngModelCtrl.$parsers.push(function (value) {
          return value ? round(value) : value;
        });
        ngModelCtrl.$formatters.push(function (value) {
          return value ? formatPrecision(value) : value;
        });
      }
//
      el.bind('blur', function () {
        var value = ngModelCtrl.$modelValue;
        if (value) {
          ngModelCtrl.$viewValue = formatPrecision(value);
          ngModelCtrl.$render();
        }
      });
    }

    return {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };
});
angular.module("ngDragDrop",[])
  .directive("uiDraggable", [
    '$parse',
    '$rootScope',
    function ($parse, $rootScope) {
      return function (scope, element, attrs) {
        if (window.jQuery && !window.jQuery.event.props.dataTransfer) {
          window.jQuery.event.props.push('dataTransfer');
        }
        element.attr("draggable", false);
        attrs.$observe("uiDraggable", function (newValue) {
          element.attr("draggable", newValue);
        });
        var dragData = "";
        scope.$watch(attrs.drag, function (newValue) {
          dragData = newValue;
        });
        element.bind("dragstart", function (e) {
          var sendData = angular.toJson(dragData);
          var sendChannel = attrs.dragChannel || "defaultchannel";
          var dragImage = attrs.dragImage || null;
          if (dragImage) {
            var dragImageFn = $parse(attrs.dragImage);
            scope.$apply(function() {
              var dragImageParameters = dragImageFn(scope, {$event: e});
              if (dragImageParameters && dragImageParameters.image) {
                var xOffset = dragImageParameters.xOffset || 0,
                  yOffset = dragImageParameters.yOffset || 0;
                e.dataTransfer.setDragImage(dragImageParameters.image, xOffset, yOffset);
              }
            });
          }

          e.dataTransfer.setData("Text", sendData);
          $rootScope.$broadcast("ANGULAR_DRAG_START", sendChannel);

        });

        element.bind("dragend", function (e) {
          var sendChannel = attrs.dragChannel || "defaultchannel";
          $rootScope.$broadcast("ANGULAR_DRAG_END", sendChannel);
          if (e.dataTransfer && e.dataTransfer.dropEffect !== "none") {
            if (attrs.onDropSuccess) {
              var fn = $parse(attrs.onDropSuccess);
              scope.$apply(function () {
                fn(scope, {$event: e});
              });
            }
          }
        });


      };
    }
  ])
  .directive("uiOnDrop", [
    '$parse',
    '$rootScope',
    function ($parse, $rootScope) {
      return function (scope, element, attr) {
        var dragging = 0; //Ref. http://stackoverflow.com/a/10906204
        var dropChannel = "defaultchannel";
        var dragChannel = "";
        var dragEnterClass = attr.dragEnterClass || "on-drag-enter";
        var dragHoverClass = attr.dragHoverClass || "on-drag-hover";

        function onDragOver(e) {

          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }

          if (e.stopPropagation) {
            e.stopPropagation();
          }
          e.dataTransfer.dropEffect = 'move';
          return false;
        }

        function onDragLeave(e) {
          dragging--;
          if (dragging == 0) {
            element.removeClass(dragHoverClass);
          }
        }

        function onDragEnter(e) {
          dragging++;
          $rootScope.$broadcast("ANGULAR_HOVER", dropChannel);
          element.addClass(dragHoverClass);
        }

        function onDrop(e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }
          if (e.stopPropagation) {
            e.stopPropagation(); // Necessary. Allows us to drop.
          }
          var data = e.dataTransfer.getData("Text");
          data = angular.fromJson(data);
          var fn = $parse(attr.uiOnDrop);
          scope.$apply(function () {
            fn(scope, {$data: data, $event: e});
          });
          element.removeClass(dragEnterClass);
        }


        $rootScope.$on("ANGULAR_DRAG_START", function (event, channel) {
          dragChannel = channel;
          if (dropChannel === channel) {

            element.bind("dragover", onDragOver);
            element.bind("dragenter", onDragEnter);
            element.bind("dragleave", onDragLeave);

            element.bind("drop", onDrop);
            element.addClass(dragEnterClass);
          }

        });



        $rootScope.$on("ANGULAR_DRAG_END", function (e, channel) {
          dragChannel = "";
          if (dropChannel === channel) {

            element.unbind("dragover", onDragOver);
            element.unbind("dragenter", onDragEnter);
            element.unbind("dragleave", onDragLeave);

            element.unbind("drop", onDrop);
            element.removeClass(dragHoverClass);
            element.removeClass(dragEnterClass);
          }
        });


        $rootScope.$on("ANGULAR_HOVER", function (e, channel) {
          if (dropChannel === channel) {
            element.removeClass(dragHoverClass);
          }
        });


        attr.$observe('dropChannel', function (value) {
          if (value) {
            dropChannel = value;
          }
        });


      };
    }
  ]);
angular.module('thms.directives').filter('filterNumeric', function() {
    return function(input) {
     return input.replace(/[0-9]/g, '');
    }
});
(function() {
  var app;

  app = angular.module('thms.directives');

  app.filter('timeFromNow', [
    'angularMomentConfig', 'amMoment', function(angularMomentConfig, amMoment) {
      return function(time) {
        return moment.unix(time).fromNow();
      };
    }
  ]);

}).call(this);
(function() {
  var app;

  app = angular.module('thms.directives');

  app.filter('timerange', [
    'angularMomentConfig', 'amMoment', function(angularMomentConfig, amMoment) {
      return function(input) {
        var start, timeRange;
        timeRange = input.split('..');
        start = moment(timeRange[0]);
        if (angularMomentConfig.timezone) {
          start = amMoment.applyTimezone(start);
        }
        return start.format('MMM Do h:mm a');
      };
    }
  ]);

}).call(this);
angular.module('thms.directives').directive('timeTransform', function() {
  return {

    restrict: 'AE',
    template: '<h1>{{time.start}}</h1><input type="datetime-local" value="2014-05-09T14:00"/>',
    link: function(scope, element, attr) {
//        console.log(scope);
//        console.log(element);
    }

//    restrict: 'AE',
//    require: 'ngModel',
//    link: function (scope, element, attr, ngModel) {
//      ngModel.$setViewValue = "2014-05-09T14:00";
//      element.on('blur', function() {
//          console.log('changed');
//          console.log(element.val())
//      })
//
//    },
//    template: '<h1>foo</h1>'
  }
});
(function() {
  var app;

  app = angular.module('thms.directives');

  app.directive('toUnix', [
    'angularMomentConfig', 'amMoment', function(angularMomentConfig, amMoment) {
      return {
        require: 'ngModel',
        link: function(scope, el, attr, ngModel) {
          ngModel.$parsers.push(function(val) {
            return new Date(val).getTime() / 1000;
          });
          return ngModel.$formatters.push(function(originalVal) {
            var value;
            value = amMoment.preprocessDate(originalVal);
            if (angularMomentConfig.timezone) {
              value = amMoment.applyTimezone(value);
            }
            return value.format('YYYY-MM-DDTHH:mm');
          });
        }
      };
    }
  ]);

}).call(this);

/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-13
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdownToggle","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/datepicker/datepicker.html","template/datepicker/popup.html","template/modal/backdrop.html","template/modal/window.html","template/pagination/pager.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/progressbar/progressbar.html","template/rating/rating.html","template/tabs/tab.html","template/tabs/tabset.html","template/timepicker/timepicker.html","template/typeahead/typeahead-match.html","template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
  .factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

    var $transition = function(element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

      var transitionEndHandler = function(event) {
        $rootScope.$apply(function() {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };

      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }

      // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
      $timeout(function() {
        if ( angular.isString(trigger) ) {
          element.addClass(trigger);
        } else if ( angular.isFunction(trigger) ) {
          trigger(element);
        } else if ( angular.isObject(trigger) ) {
          element.css(trigger);
        }
        //If browser does not support transitions, instantly resolve
        if ( !endEventName ) {
          deferred.resolve(element);
        }
      });

      // Add our custom cancel function to the promise that is returned
      // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
      // i.e. it will therefore never raise a transitionEnd event for that transition
      deferred.promise.cancel = function() {
        if ( endEventName ) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };

      return deferred.promise;
    };

    // Work out the name of the transitionEnd event
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'transition': 'transitionend'
    };
    var animationEndEventNames = {
      'WebkitTransition': 'webkitAnimationEnd',
      'MozTransition': 'animationend',
      'OTransition': 'oAnimationEnd',
      'transition': 'animationend'
    };
    function findEndEventName(endEventNames) {
      for (var name in endEventNames){
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }]);

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition, $timeout) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({height: 'auto'});
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({height: 0});
          } else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

  .constant('accordionConfig', {
    closeOthers: true
  })

  .controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

    // This array keeps track of the accordion groups
    this.groups = [];

    // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
    this.closeOthers = function(openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if ( closeOthers ) {
        angular.forEach(this.groups, function (group) {
          if ( group !== openGroup ) {
            group.isOpen = false;
          }
        });
      }
    };

    // This is called from the accordion-group directive to add itself to the accordion
    this.addGroup = function(groupScope) {
      var that = this;
      this.groups.push(groupScope);

      groupScope.$on('$destroy', function (event) {
        that.removeGroup(groupScope);
      });
    };

    // This is called from the accordion-group directive when to remove itself
    this.removeGroup = function(group) {
      var index = this.groups.indexOf(group);
      if ( index !== -1 ) {
        this.groups.splice(this.groups.indexOf(group), 1);
      }
    };

  }])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
  .directive('accordion', function () {
    return {
      restrict:'EA',
      controller:'AccordionController',
      transclude: true,
      replace: false,
      templateUrl: 'template/accordion/accordion.html'
    };
  })

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
  .directive('accordionGroup', ['$parse', function($parse) {
    return {
      require:'^accordion',         // We need this directive to be inside an accordion
      restrict:'EA',
      transclude:true,              // It transcludes the contents of the directive into the template
      replace: true,                // The element containing the directive will be replaced with the template
      templateUrl:'template/accordion/accordion-group.html',
      scope:{ heading:'@' },        // Create an isolated scope and interpolate the heading attribute onto this scope
      controller: function() {
        this.setHeading = function(element) {
          this.heading = element;
        };
      },
      link: function(scope, element, attrs, accordionCtrl) {
        var getIsOpen, setIsOpen;

        accordionCtrl.addGroup(scope);

        scope.isOpen = false;

        if ( attrs.isOpen ) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;

          scope.$parent.$watch(getIsOpen, function(value) {
            scope.isOpen = !!value;
          });
        }

        scope.$watch('isOpen', function(value) {
          if ( value ) {
            accordionCtrl.closeOthers(scope);
          }
          if ( setIsOpen ) {
            setIsOpen(scope.$parent, value);
          }
        });
      }
    };
  }])

// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
  .directive('accordionHeading', function() {
    return {
      restrict: 'EA',
      transclude: true,   // Grab the contents to be used as the heading
      template: '',       // In effect remove this element!
      replace: true,
      require: '^accordionGroup',
      compile: function(element, attr, transclude) {
        return function link(scope, element, attr, accordionGroupCtrl) {
          // Pass the heading to the accordion-group controller
          // so that it can be transcluded into the right place in the template
          // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
          accordionGroupCtrl.setHeading(transclude(scope, function() {}));
        };
      }
    };
  })

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
  .directive('accordionTransclude', function() {
    return {
      require: '^accordionGroup',
      link: function(scope, element, attr, controller) {
        scope.$watch(function() { return controller[attr.accordionTransclude]; }, function(heading) {
          if ( heading ) {
            element.html('');
            element.append(heading);
          }
        });
      }
    };
  });

angular.module("ui.bootstrap.alert", [])

  .controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
  }])

  .directive('alert', function () {
    return {
      restrict:'EA',
      controller:'AlertController',
      templateUrl:'template/alert/alert.html',
      transclude:true,
      replace:true,
      scope: {
        type: '=',
        close: '&'
      }
    };
  });

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])

  .constant('buttonConfig', {
    activeClass: 'active',
    toggleEvent: 'click'
  })

  .controller('ButtonsController', ['buttonConfig', function(buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
  }])

  .directive('btnRadio', function () {
    return {
      require: ['btnRadio', 'ngModel'],
      controller: 'ButtonsController',
      link: function (scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

        //model -> UI
        ngModelCtrl.$render = function () {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };

        //ui->model
        element.bind(buttonsCtrl.toggleEvent, function () {
          if (!element.hasClass(buttonsCtrl.activeClass)) {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  })

  .directive('btnCheckbox', function () {
    return {
      require: ['btnCheckbox', 'ngModel'],
      controller: 'ButtonsController',
      link: function (scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

        function getTrueValue() {
          return getCheckboxValue(attrs.btnCheckboxTrue, true);
        }

        function getFalseValue() {
          return getCheckboxValue(attrs.btnCheckboxFalse, false);
        }

        function getCheckboxValue(attributeValue, defaultValue) {
          var val = scope.$eval(attributeValue);
          return angular.isDefined(val) ? val : defaultValue;
        }

        //model -> UI
        ngModelCtrl.$render = function () {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };

        //ui->model
        element.bind(buttonsCtrl.toggleEvent, function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  });

/**
 * @ngdoc overview
 * @name ui.bootstrap.carousel
 *
 * @description
 * AngularJS version of an image carousel.
 *
 */
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
  .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    var self = this,
      slides = self.slides = [],
      currentIndex = -1,
      currentTimeout, isPlaying;
    self.currentSlide = null;

    var destroyed = false;
    /* direction: "prev" or "next" */
    self.select = function(nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      //Decide direction if it's not given
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? "next" : "prev";
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          //Timeout so ng-class in template has time to fix classes for finished slide
          $timeout(goNext);
        } else {
          goNext();
        }
      }
      function goNext() {
        // Scope has been destroyed, stop here.
        if (destroyed) { return; }
        //If we have a slide to transition from and we have a transition type and we're allowed, go
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
          nextSlide.$element.addClass(direction);
          var reflow = nextSlide.$element[0].offsetWidth; //force reflow

          //Set all other slides to stop doing their stuff for the new transition
          angular.forEach(slides, function(slide) {
            angular.extend(slide, {direction: '', entering: false, leaving: false, active: false});
          });
          angular.extend(nextSlide, {direction: direction, active: true, entering: true});
          angular.extend(self.currentSlide||{}, {direction: direction, leaving: true});

          $scope.$currentTransition = $transition(nextSlide.$element, {});
          //We have to create new pointers inside a closure since next & current will change
          (function(next,current) {
            $scope.$currentTransition.then(
              function(){ transitionDone(next, current); },
              function(){ transitionDone(next, current); }
            );
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        //every time you change slides, reset the timer
        restartTimer();
      }
      function transitionDone(next, current) {
        angular.extend(next, {direction: '', active: true, leaving: false, entering: false});
        angular.extend(current||{}, {direction: '', active: false, leaving: false, entering: false});
        $scope.$currentTransition = null;
      }
    };
    $scope.$on('$destroy', function () {
      destroyed = true;
    });

    /* Allow outside people to call indexOf on slides array */
    self.indexOfSlide = function(slide) {
      return slides.indexOf(slide);
    };

    $scope.next = function() {
      var newIndex = (currentIndex + 1) % slides.length;

      //Prevent this user-triggered transition from occurring if there is already one in progress
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };

    $scope.prev = function() {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

      //Prevent this user-triggered transition from occurring if there is already one in progress
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };

    $scope.select = function(slide) {
      self.select(slide);
    };

    $scope.isActive = function(slide) {
      return self.currentSlide === slide;
    };

    $scope.slides = function() {
      return slides;
    };

    $scope.$watch('interval', restartTimer);
    $scope.$on('$destroy', resetTimer);

    function restartTimer() {
      resetTimer();
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval>=0) {
        currentTimeout = $timeout(timerFn, interval);
      }
    }

    function resetTimer() {
      if (currentTimeout) {
        $timeout.cancel(currentTimeout);
        currentTimeout = null;
      }
    }

    function timerFn() {
      if (isPlaying) {
        $scope.next();
        restartTimer();
      } else {
        $scope.pause();
      }
    }

    $scope.play = function() {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function() {
      if (!$scope.noPause) {
        isPlaying = false;
        resetTimer();
      }
    };

    self.addSlide = function(slide, element) {
      slide.$element = element;
      slides.push(slide);
      //if this is the first slide or the slide is set to active, select it
      if(slides.length === 1 || slide.active) {
        self.select(slides[slides.length-1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };

    self.removeSlide = function(slide) {
      //get the index of the slide inside the carousel
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index-1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };

  }])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
 <example module="ui.bootstrap">
 <file name="index.html">
 <carousel>
 <slide>
 <img src="http://placekitten.com/150/150" style="margin:auto;">
 <div class="carousel-caption">
 <p>Beautiful!</p>
 </div>
 </slide>
 <slide>
 <img src="http://placekitten.com/100/150" style="margin:auto;">
 <div class="carousel-caption">
 <p>D'aww!</p>
 </div>
 </slide>
 </carousel>
 </file>
 <file name="demo.css">
 .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
 </file>
 </example>
 */
  .directive('carousel', [function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
 <example module="ui.bootstrap">
 <file name="index.html">
 <div ng-controller="CarouselDemoCtrl">
 <carousel>
 <slide ng-repeat="slide in slides" active="slide.active">
 <img ng-src="{{slide.image}}" style="margin:auto;">
 <div class="carousel-caption">
 <h4>Slide {{$index}}</h4>
 <p>{{slide.text}}</p>
 </div>
 </slide>
 </carousel>
 <div class="row-fluid">
 <div class="span6">
 <ul>
 <li ng-repeat="slide in slides">
 <button class="btn btn-mini" ng-class="{'btn-info': !slide.active, 'btn-success': slide.active}" ng-disabled="slide.active" ng-click="slide.active = true">select</button>
 {{$index}}: {{slide.text}}
 </li>
 </ul>
 <a class="btn" ng-click="addSlide()">Add Slide</a>
 </div>
 <div class="span6">
 Interval, in milliseconds: <input type="number" ng-model="myInterval">
 <br />Enter a negative number to stop the interval.
 </div>
 </div>
 </div>
 </file>
 <file name="script.js">
 function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
    slides.push({
      image: 'http://placekitten.com/' + newWidth + '/200',
      text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' '
        ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
    });
  };
  for (var i=0; i<4; i++) $scope.addSlide();
}
 </file>
 <file name="demo.css">
 .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
 </file>
 </example>
 */

  .directive('slide', ['$parse', function($parse) {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {
      },
      link: function (scope, element, attrs, carouselCtrl) {
        //Set up optional 'active' = binding
        if (attrs.active) {
          var getActive = $parse(attrs.active);
          var setActive = getActive.assign;
          var lastValue = scope.active = getActive(scope.$parent);
          scope.$watch(function parentActiveWatch() {
            var parentActive = getActive(scope.$parent);

            if (parentActive !== scope.active) {
              // we are out of sync and need to copy
              if (parentActive !== lastValue) {
                // parent changed and it has precedence
                lastValue = scope.active = parentActive;
              } else {
                // if the parent can be assigned then do so
                setActive(scope.$parent, parentActive = lastValue = scope.active);
              }
            }
            return parentActive;
          });
        }

        carouselCtrl.addSlide(scope, element);
        //when the scope is destroyed then remove the slide from the current slides array
        scope.$on('$destroy', function() {
          carouselCtrl.removeSlide(scope);
        });

        scope.$watch('active', function(active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position'])

  .constant('datepickerConfig', {
    dayFormat: 'dd',
    monthFormat: 'MMMM',
    yearFormat: 'yyyy',
    dayHeaderFormat: 'EEE',
    dayTitleFormat: 'MMMM yyyy',
    monthTitleFormat: 'yyyy',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
  })

  .controller('DatepickerController', ['$scope', '$attrs', 'dateFilter', 'datepickerConfig', function($scope, $attrs, dateFilter, dtConfig) {
    var format = {
        day:        getValue($attrs.dayFormat,        dtConfig.dayFormat),
        month:      getValue($attrs.monthFormat,      dtConfig.monthFormat),
        year:       getValue($attrs.yearFormat,       dtConfig.yearFormat),
        dayHeader:  getValue($attrs.dayHeaderFormat,  dtConfig.dayHeaderFormat),
        dayTitle:   getValue($attrs.dayTitleFormat,   dtConfig.dayTitleFormat),
        monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
      },
      startingDay = getValue($attrs.startingDay,      dtConfig.startingDay),
      yearRange =   getValue($attrs.yearRange,        dtConfig.yearRange);

    this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
    this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;

    function getValue(value, defaultValue) {
      return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
    }

    function getDaysInMonth( year, month ) {
      return new Date(year, month, 0).getDate();
    }

    function getDates(startDate, n) {
      var dates = new Array(n);
      var current = startDate, i = 0;
      while (i < n) {
        dates[i++] = new Date(current);
        current.setDate( current.getDate() + 1 );
      }
      return dates;
    }

    function makeDate(date, format, isSelected, isSecondary) {
      return { date: date, label: dateFilter(date, format), selected: !!isSelected, secondary: !!isSecondary };
    }

    this.modes = [
      {
        name: 'day',
        getVisibleDates: function(date, selected) {
          var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1);
          var difference = startingDay - firstDayOfMonth.getDay(),
            numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
            firstDate = new Date(firstDayOfMonth), numDates = 0;

          if ( numDisplayedFromPreviousMonth > 0 ) {
            firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
            numDates += numDisplayedFromPreviousMonth; // Previous
          }
          numDates += getDaysInMonth(year, month + 1); // Current
          numDates += (7 - numDates % 7) % 7; // Next

          var days = getDates(firstDate, numDates), labels = new Array(7);
          for (var i = 0; i < numDates; i ++) {
            var dt = new Date(days[i]);
            days[i] = makeDate(dt, format.day, (selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()), dt.getMonth() !== month);
          }
          for (var j = 0; j < 7; j++) {
            labels[j] = dateFilter(days[j].date, format.dayHeader);
          }
          return { objects: days, title: dateFilter(date, format.dayTitle), labels: labels };
        },
        compare: function(date1, date2) {
          return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
        },
        split: 7,
        step: { months: 1 }
      },
      {
        name: 'month',
        getVisibleDates: function(date, selected) {
          var months = new Array(12), year = date.getFullYear();
          for ( var i = 0; i < 12; i++ ) {
            var dt = new Date(year, i, 1);
            months[i] = makeDate(dt, format.month, (selected && selected.getMonth() === i && selected.getFullYear() === year));
          }
          return { objects: months, title: dateFilter(date, format.monthTitle) };
        },
        compare: function(date1, date2) {
          return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
        },
        split: 3,
        step: { years: 1 }
      },
      {
        name: 'year',
        getVisibleDates: function(date, selected) {
          var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
          for ( var i = 0; i < yearRange; i++ ) {
            var dt = new Date(startYear + i, 0, 1);
            years[i] = makeDate(dt, format.year, (selected && selected.getFullYear() === dt.getFullYear()));
          }
          return { objects: years, title: [years[0].label, years[yearRange - 1].label].join(' - ') };
        },
        compare: function(date1, date2) {
          return date1.getFullYear() - date2.getFullYear();
        },
        split: 5,
        step: { years: yearRange }
      }
    ];

    this.isDisabled = function(date, mode) {
      var currentMode = this.modes[mode || 0];
      return ((this.minDate && currentMode.compare(date, this.minDate) < 0) || (this.maxDate && currentMode.compare(date, this.maxDate) > 0) || ($scope.dateDisabled && $scope.dateDisabled({date: date, mode: currentMode.name})));
    };
  }])

  .directive( 'datepicker', ['dateFilter', '$parse', 'datepickerConfig', '$log', function (dateFilter, $parse, datepickerConfig, $log) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/datepicker.html',
      scope: {
        dateDisabled: '&'
      },
      require: ['datepicker', '?^ngModel'],
      controller: 'DatepickerController',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0], ngModel = ctrls[1];

        if (!ngModel) {
          return; // do nothing if no ng-model
        }

        // Configuration parameters
        var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;

        if (attrs.showWeeks) {
          scope.$parent.$watch($parse(attrs.showWeeks), function(value) {
            showWeeks = !! value;
            updateShowWeekNumbers();
          });
        } else {
          updateShowWeekNumbers();
        }

        if (attrs.min) {
          scope.$parent.$watch($parse(attrs.min), function(value) {
            datepickerCtrl.minDate = value ? new Date(value) : null;
            refill();
          });
        }
        if (attrs.max) {
          scope.$parent.$watch($parse(attrs.max), function(value) {
            datepickerCtrl.maxDate = value ? new Date(value) : null;
            refill();
          });
        }

        function updateShowWeekNumbers() {
          scope.showWeekNumbers = mode === 0 && showWeeks;
        }

        // Split array into smaller arrays
        function split(arr, size) {
          var arrays = [];
          while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
          }
          return arrays;
        }

        function refill( updateSelected ) {
          var date = null, valid = true;

          if ( ngModel.$modelValue ) {
            date = new Date( ngModel.$modelValue );

            if ( isNaN(date) ) {
              valid = false;
              $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else if ( updateSelected ) {
              selected = date;
            }
          }
          ngModel.$setValidity('date', valid);

          var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
          angular.forEach(data.objects, function(obj) {
            obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
          });

          ngModel.$setValidity('date-disabled', (!date || !datepickerCtrl.isDisabled(date)));

          scope.rows = split(data.objects, currentMode.split);
          scope.labels = data.labels || [];
          scope.title = data.title;
        }

        function setMode(value) {
          mode = value;
          updateShowWeekNumbers();
          refill();
        }

        ngModel.$render = function() {
          refill( true );
        };

        scope.select = function( date ) {
          if ( mode === 0 ) {
            var dt = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
            dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
            ngModel.$setViewValue( dt );
            refill( true );
          } else {
            selected = date;
            setMode( mode - 1 );
          }
        };
        scope.move = function(direction) {
          var step = datepickerCtrl.modes[mode].step;
          selected.setMonth( selected.getMonth() + direction * (step.months || 0) );
          selected.setFullYear( selected.getFullYear() + direction * (step.years || 0) );
          refill();
        };
        scope.toggleMode = function() {
          setMode( (mode + 1) % datepickerCtrl.modes.length );
        };
        scope.getWeekNumber = function(row) {
          return ( mode === 0 && scope.showWeekNumbers && row.length === 7 ) ? getISO8601WeekNumber(row[0].date) : null;
        };

        function getISO8601WeekNumber(date) {
          var checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
          var time = checkDate.getTime();
          checkDate.setMonth(0); // Compare with Jan 1
          checkDate.setDate(1);
          return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }
      }
    };
  }])

  .constant('datepickerPopupConfig', {
    dateFormat: 'yyyy-MM-dd',
    currentText: 'Today',
    toggleWeeksText: 'Weeks',
    clearText: 'Clear',
    closeText: 'Done',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
  })

  .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'datepickerPopupConfig', 'datepickerConfig',
    function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig, datepickerConfig) {
      return {
        restrict: 'EA',
        require: 'ngModel',
        link: function(originalScope, element, attrs, ngModel) {
          var scope = originalScope.$new(), // create a child scope so we are not polluting original one
            dateFormat,
            closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? originalScope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
            appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? originalScope.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

          attrs.$observe('datepickerPopup', function(value) {
            dateFormat = value || datepickerPopupConfig.dateFormat;
            ngModel.$render();
          });

          scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? originalScope.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

          originalScope.$on('$destroy', function() {
            $popup.remove();
            scope.$destroy();
          });

          attrs.$observe('currentText', function(text) {
            scope.currentText = angular.isDefined(text) ? text : datepickerPopupConfig.currentText;
          });
          attrs.$observe('toggleWeeksText', function(text) {
            scope.toggleWeeksText = angular.isDefined(text) ? text : datepickerPopupConfig.toggleWeeksText;
          });
          attrs.$observe('clearText', function(text) {
            scope.clearText = angular.isDefined(text) ? text : datepickerPopupConfig.clearText;
          });
          attrs.$observe('closeText', function(text) {
            scope.closeText = angular.isDefined(text) ? text : datepickerPopupConfig.closeText;
          });

          var getIsOpen, setIsOpen;
          if ( attrs.isOpen ) {
            getIsOpen = $parse(attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            originalScope.$watch(getIsOpen, function updateOpen(value) {
              scope.isOpen = !! value;
            });
          }
          scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false; // Initial state

          function setOpen( value ) {
            if (setIsOpen) {
              setIsOpen(originalScope, !!value);
            } else {
              scope.isOpen = !!value;
            }
          }

          var documentClickBind = function(event) {
            if (scope.isOpen && event.target !== element[0]) {
              scope.$apply(function() {
                setOpen(false);
              });
            }
          };

          var elementFocusBind = function() {
            scope.$apply(function() {
              setOpen( true );
            });
          };

          // popup element used to display calendar
          var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
          popupEl.attr({
            'ng-model': 'date',
            'ng-change': 'dateSelection()'
          });
          var datepickerEl = angular.element(popupEl.children()[0]),
            datepickerOptions = {};
          if (attrs.datepickerOptions) {
            datepickerOptions = originalScope.$eval(attrs.datepickerOptions);
            datepickerEl.attr(angular.extend({}, datepickerOptions));
          }

          // TODO: reverse from dateFilter string to Date object
          function parseDate(viewValue) {
            if (!viewValue) {
              ngModel.$setValidity('date', true);
              return null;
            } else if (angular.isDate(viewValue)) {
              ngModel.$setValidity('date', true);
              return viewValue;
            } else if (angular.isString(viewValue)) {
              var date = new Date(viewValue);
              if (isNaN(date)) {
                ngModel.$setValidity('date', false);
                return undefined;
              } else {
                ngModel.$setValidity('date', true);
                return date;
              }
            } else {
              ngModel.$setValidity('date', false);
              return undefined;
            }
          }
          ngModel.$parsers.unshift(parseDate);

          // Inner change
          scope.dateSelection = function(dt) {
            if (angular.isDefined(dt)) {
              scope.date = dt;
            }
            ngModel.$setViewValue(scope.date);
            ngModel.$render();

            if (closeOnDateSelection) {
              setOpen( false );
            }
          };

          element.bind('input change keyup', function() {
            scope.$apply(function() {
              scope.date = ngModel.$modelValue;
            });
          });

          // Outter change
          ngModel.$render = function() {
            var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
            element.val(date);
            scope.date = ngModel.$modelValue;
          };

          function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
            if (attribute) {
              originalScope.$watch($parse(attribute), function(value){
                scope[scopeProperty] = value;
              });
              datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
            }
          }
          addWatchableAttribute(attrs.min, 'min');
          addWatchableAttribute(attrs.max, 'max');
          if (attrs.showWeeks) {
            addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
          } else {
            scope.showWeeks = 'show-weeks' in datepickerOptions ? datepickerOptions['show-weeks'] : datepickerConfig.showWeeks;
            datepickerEl.attr('show-weeks', 'showWeeks');
          }
          if (attrs.dateDisabled) {
            datepickerEl.attr('date-disabled', attrs.dateDisabled);
          }

          function updatePosition() {
            scope.position = appendToBody ? $position.offset(element) : $position.position(element);
            scope.position.top = scope.position.top + element.prop('offsetHeight');
          }

          var documentBindingInitialized = false, elementFocusInitialized = false;
          scope.$watch('isOpen', function(value) {
            if (value) {
              updatePosition();
              $document.bind('click', documentClickBind);
              if(elementFocusInitialized) {
                element.unbind('focus', elementFocusBind);
              }
              element[0].focus();
              documentBindingInitialized = true;
            } else {
              if(documentBindingInitialized) {
                $document.unbind('click', documentClickBind);
              }
              element.bind('focus', elementFocusBind);
              elementFocusInitialized = true;
            }

            if ( setIsOpen ) {
              setIsOpen(originalScope, value);
            }
          });

          scope.today = function() {
            scope.dateSelection(new Date());
          };
          scope.clear = function() {
            scope.dateSelection(null);
          };

          var $popup = $compile(popupEl)(scope);
          if ( appendToBody ) {
            $document.find('body').append($popup);
          } else {
            element.after($popup);
          }
        }
      };
    }])

  .directive('datepickerPopupWrap', function() {
    return {
      restrict:'EA',
      replace: true,
      transclude: true,
      templateUrl: 'template/datepicker/popup.html',
      link:function (scope, element, attrs) {
        element.bind('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }
    };
  });

/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
 <li class="dropdown">
 <a class="dropdown-toggle">My Dropdown Menu</a>
 <ul class="dropdown-menu">
 <li ng-repeat="choice in dropChoices">
 <a ng-href="{{choice.href}}">{{choice.text}}</a>
 </li>
 </ul>
 </li>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
    closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      element.bind('click', function (event) {

        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          element.parent().addClass('open');
          openElement = element;
          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            $document.unbind('click', closeMenu);
            element.parent().removeClass('open');
            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click', closeMenu);
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
    return {
      createNew: function () {
        var stack = [];

        return {
          add: function (key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function (key) {
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function () {
            return stack[stack.length - 1];
          },
          remove: function (key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function () {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function () {
            return stack.length;
          }
        };
      }
    };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function (scope) {

        scope.animate = false;

        //trigger CSS transitions
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: true,
      transclude: true,
      templateUrl: 'template/modal/window.html',
      link: function (scope, element, attrs) {
        scope.windowClass = attrs.windowClass || '';

        $timeout(function () {
          // trigger CSS transitions
          scope.animate = true;
          // focus a freshly-opened modal
          element[0].focus();
        });

        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }])

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var $modalStack = {};

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex){
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance) {

        var body = $document.find('body').eq(0);
        var modalWindow = openedWindows.get(modalInstance).value;

        //clean up the stack
        openedWindows.remove(modalInstance);

        //remove window DOM element
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, checkRemoveBackdrop);
        body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
      }

      function checkRemoveBackdrop() {
        //remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() == -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
            backdropScopeRef.$destroy();
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, emulateTime, done) {
        // Closing animation
        scope.animate = false;

        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
          // transition out
          var timeout = $timeout(afterAnimating, emulateTime);

          domEl.bind(transitionEndEventName, function () {
            $timeout.cancel(timeout);
            afterAnimating();
            scope.$apply();
          });
        } else {
          // Ensure this call is async
          $timeout(afterAnimating, 0);
        }

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          domEl.remove();
          if (done) {
            done();
          }
        }
      }

      $document.bind('keydown', function (evt) {
        var modal;

        if (evt.which === 27) {
          modal = openedWindows.top();
          if (modal && modal.value.keyboard) {
            $rootScope.$apply(function () {
              $modalStack.dismiss(modal.key);
            });
          }
        }
      });

      $modalStack.open = function (modalInstance, modal) {

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard
        });

        var body = $document.find('body').eq(0),
          currBackdropIndex = backdropIndex();

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.index = currBackdropIndex;
          backdropDomEl = $compile('<div modal-backdrop></div>')(backdropScope);
          body.prepend(backdropDomEl);
        }

        var angularDomEl = angular.element('<div modal-window></div>');
        angularDomEl.attr('window-class', modal.windowClass);
        angularDomEl.attr('index', openedWindows.length() - 1);
        angularDomEl.attr('animate', 'animate');
        angularDomEl.html(modal.content);

        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl;
        body.prepend(modalDomEl);
        body.addClass(OPENED_MODAL_CLASS);


      };

      $modalStack.close = function (modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance).value;
        if (modalWindow) {
          modalWindow.deferred.resolve(result);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismiss = function (modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance).value;
        if (modalWindow) {
          modalWindow.deferred.reject(reason);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismissAll = function (reason) {
        var topModal = this.getTop();
        while (topModal) {
          this.dismiss(topModal.key, reason);
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function () {
        return openedWindows.top();
      };

      return $modalStack;
    }])

  .provider('$modal', function () {

    var $modalProvider = {
      options: {
        backdrop: true, //can be also false or 'static'
        keyboard: true
      },
      $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                return result.data;
              });
          }

          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value, key) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }

          $modal.open = function (modalOptions) {

            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;

              //controllers
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });

                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
              }

              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                windowClass: modalOptions.windowClass
              });

            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });

            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });

            return modalInstance;
          };

          return $modal;
        }]
    };

    return $modalProvider;
  });

angular.module('ui.bootstrap.pagination', [])

  .controller('PaginationController', ['$scope', '$attrs', '$parse', '$interpolate', function ($scope, $attrs, $parse, $interpolate) {
    var self = this,
      setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;

    this.init = function(defaultItemsPerPage) {
      if ($attrs.itemsPerPage) {
        $scope.$parent.$watch($parse($attrs.itemsPerPage), function(value) {
          self.itemsPerPage = parseInt(value, 10);
          $scope.totalPages = self.calculateTotalPages();
        });
      } else {
        this.itemsPerPage = defaultItemsPerPage;
      }
    };

    this.noPrevious = function() {
      return this.page === 1;
    };
    this.noNext = function() {
      return this.page === $scope.totalPages;
    };

    this.isActive = function(page) {
      return this.page === page;
    };

    this.calculateTotalPages = function() {
      var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
      return Math.max(totalPages || 0, 1);
    };

    this.getAttributeValue = function(attribute, defaultValue, interpolate) {
      return angular.isDefined(attribute) ? (interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute)) : defaultValue;
    };

    this.render = function() {
      this.page = parseInt($scope.page, 10) || 1;
      if (this.page > 0 && this.page <= $scope.totalPages) {
        $scope.pages = this.getPages(this.page, $scope.totalPages);
      }
    };

    $scope.selectPage = function(page) {
      if ( ! self.isActive(page) && page > 0 && page <= $scope.totalPages) {
        $scope.page = page;
        $scope.onSelectPage({ page: page });
      }
    };

    $scope.$watch('page', function() {
      self.render();
    });

    $scope.$watch('totalItems', function() {
      $scope.totalPages = self.calculateTotalPages();
    });

    $scope.$watch('totalPages', function(value) {
      setNumPages($scope.$parent, value); // Readonly variable

      if ( self.page > value ) {
        $scope.selectPage(value);
      } else {
        self.render();
      }
    });
  }])

  .constant('paginationConfig', {
    itemsPerPage: 10,
    boundaryLinks: false,
    directionLinks: true,
    firstText: 'First',
    previousText: 'Previous',
    nextText: 'Next',
    lastText: 'Last',
    rotate: true
  })

  .directive('pagination', ['$parse', 'paginationConfig', function($parse, config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage:' &'
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: true,
      link: function(scope, element, attrs, paginationCtrl) {

        // Setup configuration parameters
        var maxSize,
          boundaryLinks  = paginationCtrl.getAttributeValue(attrs.boundaryLinks,  config.boundaryLinks      ),
          directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks     ),
          firstText      = paginationCtrl.getAttributeValue(attrs.firstText,      config.firstText,     true),
          previousText   = paginationCtrl.getAttributeValue(attrs.previousText,   config.previousText,  true),
          nextText       = paginationCtrl.getAttributeValue(attrs.nextText,       config.nextText,      true),
          lastText       = paginationCtrl.getAttributeValue(attrs.lastText,       config.lastText,      true),
          rotate         = paginationCtrl.getAttributeValue(attrs.rotate,         config.rotate);

        paginationCtrl.init(config.itemsPerPage);

        if (attrs.maxSize) {
          scope.$parent.$watch($parse(attrs.maxSize), function(value) {
            maxSize = parseInt(value, 10);
            paginationCtrl.render();
          });
        }

        // Create page object used in template
        function makePage(number, text, isActive, isDisabled) {
          return {
            number: number,
            text: text,
            active: isActive,
            disabled: isDisabled
          };
        }

        paginationCtrl.getPages = function(currentPage, totalPages) {
          var pages = [];

          // Default page limits
          var startPage = 1, endPage = totalPages;
          var isMaxSized = ( angular.isDefined(maxSize) && maxSize < totalPages );

          // recompute if maxSize
          if ( isMaxSized ) {
            if ( rotate ) {
              // Current page is displayed in the middle of the visible ones
              startPage = Math.max(currentPage - Math.floor(maxSize/2), 1);
              endPage   = startPage + maxSize - 1;

              // Adjust if limit is exceeded
              if (endPage > totalPages) {
                endPage   = totalPages;
                startPage = endPage - maxSize + 1;
              }
            } else {
              // Visible pages are paginated with maxSize
              startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

              // Adjust last page if limit is exceeded
              endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
          }

          // Add page number links
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, paginationCtrl.isActive(number), false);
            pages.push(page);
          }

          // Add links to move between page sets
          if ( isMaxSized && ! rotate ) {
            if ( startPage > 1 ) {
              var previousPageSet = makePage(startPage - 1, '...', false, false);
              pages.unshift(previousPageSet);
            }

            if ( endPage < totalPages ) {
              var nextPageSet = makePage(endPage + 1, '...', false, false);
              pages.push(nextPageSet);
            }
          }

          // Add previous & next links
          if (directionLinks) {
            var previousPage = makePage(currentPage - 1, previousText, false, paginationCtrl.noPrevious());
            pages.unshift(previousPage);

            var nextPage = makePage(currentPage + 1, nextText, false, paginationCtrl.noNext());
            pages.push(nextPage);
          }

          // Add first & last links
          if (boundaryLinks) {
            var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
            pages.unshift(firstPage);

            var lastPage = makePage(totalPages, lastText, false, paginationCtrl.noNext());
            pages.push(lastPage);
          }

          return pages;
        };
      }
    };
  }])

  .constant('pagerConfig', {
    itemsPerPage: 10,
    previousText: 'Â« Previous',
    nextText: 'Next Â»',
    align: true
  })

  .directive('pager', ['pagerConfig', function(config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage:' &'
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: true,
      link: function(scope, element, attrs, paginationCtrl) {

        // Setup configuration parameters
        var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true),
          nextText         = paginationCtrl.getAttributeValue(attrs.nextText,     config.nextText,     true),
          align            = paginationCtrl.getAttributeValue(attrs.align,        config.align);

        paginationCtrl.init(config.itemsPerPage);

        // Create page object used in template
        function makePage(number, text, isDisabled, isPrevious, isNext) {
          return {
            number: number,
            text: text,
            disabled: isDisabled,
            previous: ( align && isPrevious ),
            next: ( align && isNext )
          };
        }

        paginationCtrl.getPages = function(currentPage) {
          return [
            makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false),
            makePage(currentPage + 1, nextText, paginationCtrl.noNext(), false, true)
          ];
        };
      }
    };
  }]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module( 'ui.bootstrap.tooltip', [ 'ui.bootstrap.position', 'ui.bootstrap.bindHtml' ] )

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
  .provider( '$tooltip', function () {
    // The default options tooltip and popover.
    var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };

    // Default hide triggers for each show trigger
    var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };

    // The options specified to the provider globally.
    var globalOptions = {};

    /**
     * `options({})` allows global configuration of all tooltips in the
     * application.
     *
     *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
     */
    this.options = function( value ) {
      angular.extend( globalOptions, value );
    };

    /**
     * This allows you to extend the set of trigger mappings available. E.g.:
     *
     *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
     */
    this.setTriggers = function setTriggers ( triggers ) {
      angular.extend( triggerMap, triggers );
    };

    /**
     * This is a helper function for translating camel-case to snake-case.
     */
    function snake_case(name){
      var regexp = /[A-Z]/g;
      var separator = '-';
      return name.replace(regexp, function(letter, pos) {
        return (pos ? separator : '') + letter.toLowerCase();
      });
    }

    /**
     * Returns the actual instance of the $tooltip service.
     * TODO support multiple triggers
     */
    this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate ) {
      return function $tooltip ( type, prefix, defaultTriggerShow ) {
        var options = angular.extend( {}, defaultOptions, globalOptions );

        /**
         * Returns an object of show and hide triggers.
         *
         * If a trigger is supplied,
         * it is used to show the tooltip; otherwise, it will use the `trigger`
         * option passed to the `$tooltipProvider.options` method; else it will
         * default to the trigger supplied to this directive factory.
         *
         * The hide trigger is based on the show trigger. If the `trigger` option
         * was passed to the `$tooltipProvider.options` method, it will use the
         * mapped trigger from `triggerMap` or the passed trigger if the map is
         * undefined; otherwise, it uses the `triggerMap` value of the show
         * trigger; else it will just use the show trigger.
         */
        function getTriggers ( trigger ) {
          var show = trigger || options.trigger || defaultTriggerShow;
          var hide = triggerMap[show] || show;
          return {
            show: show,
            hide: hide
          };
        }

        var directiveName = snake_case( type );

        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        var template =
          '<div '+ directiveName +'-popup '+
          'title="'+startSym+'tt_title'+endSym+'" '+
          'content="'+startSym+'tt_content'+endSym+'" '+
          'placement="'+startSym+'tt_placement'+endSym+'" '+
          'animation="tt_animation" '+
          'is-open="tt_isOpen"'+
          '>'+
          '</div>';

        return {
          restrict: 'EA',
          scope: true,
          compile: function (tElem, tAttrs) {
            var tooltipLinker = $compile( template );

            return function link ( scope, element, attrs ) {
              var tooltip;
              var transitionTimeout;
              var popupTimeout;
              var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
              var triggers = getTriggers( undefined );
              var hasRegisteredTriggers = false;
              var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);

              var positionTooltip = function (){
                var position,
                  ttWidth,
                  ttHeight,
                  ttPosition;
                // Get the position of the directive element.
                position = appendToBody ? $position.offset( element ) : $position.position( element );

                // Get the height and width of the tooltip so we can center it.
                ttWidth = tooltip.prop( 'offsetWidth' );
                ttHeight = tooltip.prop( 'offsetHeight' );

                // Calculate the tooltip's top and left coordinates to center it with
                // this directive.
                switch ( scope.tt_placement ) {
                  case 'right':
                    ttPosition = {
                      top: position.top + position.height / 2 - ttHeight / 2,
                      left: position.left + position.width
                    };
                    break;
                  case 'bottom':
                    ttPosition = {
                      top: position.top + position.height,
                      left: position.left + position.width / 2 - ttWidth / 2
                    };
                    break;
                  case 'left':
                    ttPosition = {
                      top: position.top + position.height / 2 - ttHeight / 2,
                      left: position.left - ttWidth
                    };
                    break;
                  default:
                    ttPosition = {
                      top: position.top - ttHeight,
                      left: position.left + position.width / 2 - ttWidth / 2
                    };
                    break;
                }

                ttPosition.top += 'px';
                ttPosition.left += 'px';

                // Now set the calculated positioning.
                tooltip.css( ttPosition );

              };

              // By default, the tooltip is not open.
              // TODO add ability to start tooltip opened
              scope.tt_isOpen = false;

              function toggleTooltipBind () {
                if ( ! scope.tt_isOpen ) {
                  showTooltipBind();
                } else {
                  hideTooltipBind();
                }
              }

              // Show the tooltip with delay if specified, otherwise show it immediately
              function showTooltipBind() {
                if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                  return;
                }
                if ( scope.tt_popupDelay ) {
                  popupTimeout = $timeout( show, scope.tt_popupDelay, false );
                  popupTimeout.then(function(reposition){reposition();});
                } else {
                  show()();
                }
              }

              function hideTooltipBind () {
                scope.$apply(function () {
                  hide();
                });
              }

              // Show the tooltip popup element.
              function show() {


                // Don't show empty tooltips.
                if ( ! scope.tt_content ) {
                  return angular.noop;
                }

                createTooltip();

                // If there is a pending remove transition, we must cancel it, lest the
                // tooltip be mysteriously removed.
                if ( transitionTimeout ) {
                  $timeout.cancel( transitionTimeout );
                }

                // Set the initial positioning.
                tooltip.css({ top: 0, left: 0, display: 'block' });

                // Now we add it to the DOM because need some info about it. But it's not
                // visible yet anyway.
                if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
                } else {
                  element.after( tooltip );
                }

                positionTooltip();

                // And show the tooltip.
                scope.tt_isOpen = true;
                scope.$digest(); // digest required as $apply is not called

                // Return positioning function as promise callback for correct
                // positioning after draw.
                return positionTooltip;
              }

              // Hide the tooltip popup element.
              function hide() {
                // First things first: we don't show it anymore.
                scope.tt_isOpen = false;

                //if tooltip is going to be shown after delay, we must cancel this
                $timeout.cancel( popupTimeout );

                // And now we remove it from the DOM. However, if we have animation, we
                // need to wait for it to expire beforehand.
                // FIXME: this is a placeholder for a port of the transitions library.
                if ( scope.tt_animation ) {
                  transitionTimeout = $timeout(removeTooltip, 500);
                } else {
                  removeTooltip();
                }
              }

              function createTooltip() {
                // There can only be one tooltip element per directive shown at once.
                if (tooltip) {
                  removeTooltip();
                }
                tooltip = tooltipLinker(scope, function () {});

                // Get contents rendered into the tooltip
                scope.$digest();
              }

              function removeTooltip() {
                if (tooltip) {
                  tooltip.remove();
                  tooltip = null;
                }
              }

              /**
               * Observe the relevant attributes.
               */
              attrs.$observe( type, function ( val ) {
                scope.tt_content = val;

                if (!val && scope.tt_isOpen ) {
                  hide();
                }
              });

              attrs.$observe( prefix+'Title', function ( val ) {
                scope.tt_title = val;
              });

              attrs.$observe( prefix+'Placement', function ( val ) {
                scope.tt_placement = angular.isDefined( val ) ? val : options.placement;
              });

              attrs.$observe( prefix+'PopupDelay', function ( val ) {
                var delay = parseInt( val, 10 );
                scope.tt_popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
              });

              var unregisterTriggers = function() {
                if (hasRegisteredTriggers) {
                  element.unbind( triggers.show, showTooltipBind );
                  element.unbind( triggers.hide, hideTooltipBind );
                }
              };

              attrs.$observe( prefix+'Trigger', function ( val ) {
                unregisterTriggers();

                triggers = getTriggers( val );

                if ( triggers.show === triggers.hide ) {
                  element.bind( triggers.show, toggleTooltipBind );
                } else {
                  element.bind( triggers.show, showTooltipBind );
                  element.bind( triggers.hide, hideTooltipBind );
                }

                hasRegisteredTriggers = true;
              });

              var animation = scope.$eval(attrs[prefix + 'Animation']);
              scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

              attrs.$observe( prefix+'AppendToBody', function ( val ) {
                appendToBody = angular.isDefined( val ) ? $parse( val )( scope ) : appendToBody;
              });

              // if a tooltip is attached to <body> we need to remove it on
              // location change as its parent scope will probably not be destroyed
              // by the change.
              if ( appendToBody ) {
                scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
                  if ( scope.tt_isOpen ) {
                    hide();
                  }
                });
              }

              // Make sure tooltip is destroyed and removed.
              scope.$on('$destroy', function onDestroyTooltip() {
                $timeout.cancel( transitionTimeout );
                $timeout.cancel( popupTimeout );
                unregisterTriggers();
                removeTooltip();
              });
            };
          }
        };
      };
    }];
  })

  .directive( 'tooltipPopup', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
      templateUrl: 'template/tooltip/tooltip-popup.html'
    };
  })

  .directive( 'tooltip', [ '$tooltip', function ( $tooltip ) {
    return $tooltip( 'tooltip', 'tooltip', 'mouseenter' );
  }])

  .directive( 'tooltipHtmlUnsafePopup', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
      templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
    };
  })

  .directive( 'tooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
    return $tooltip( 'tooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
  }]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )

  .directive( 'popoverPopup', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
      templateUrl: 'template/popover/popover.html'
    };
  })

  .directive( 'popover', [ '$tooltip', function ( $tooltip ) {
    return $tooltip( 'popover', 'popover', 'click' );
  }]);

angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition'])

  .constant('progressConfig', {
    animate: true,
    max: 100
  })

  .controller('ProgressController', ['$scope', '$attrs', 'progressConfig', '$transition', function($scope, $attrs, progressConfig, $transition) {
    var self = this,
      bars = [],
      max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max,
      animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.addBar = function(bar, element) {
      var oldValue = 0, index = bar.$parent.$index;
      if ( angular.isDefined(index) &&  bars[index] ) {
        oldValue = bars[index].value;
      }
      bars.push(bar);

      this.update(element, bar.value, oldValue);

      bar.$watch('value', function(value, oldValue) {
        if (value !== oldValue) {
          self.update(element, value, oldValue);
        }
      });

      bar.$on('$destroy', function() {
        self.removeBar(bar);
      });
    };

    // Update bar element width
    this.update = function(element, newValue, oldValue) {
      var percent = this.getPercentage(newValue);

      if (animate) {
        element.css('width', this.getPercentage(oldValue) + '%');
        $transition(element, {width: percent + '%'});
      } else {
        element.css({'transition': 'none', 'width': percent + '%'});
      }
    };

    this.removeBar = function(bar) {
      bars.splice(bars.indexOf(bar), 1);
    };

    this.getPercentage = function(value) {
      return Math.round(100 * value / max);
    };
  }])

  .directive('progress', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: 'ProgressController',
      require: 'progress',
      scope: {},
      template: '<div class="progress" ng-transclude></div>'
      //templateUrl: 'template/progressbar/progress.html' // Works in AngularJS 1.2
    };
  })

  .directive('bar', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      require: '^progress',
      scope: {
        value: '=',
        type: '@'
      },
      templateUrl: 'template/progressbar/bar.html',
      link: function(scope, element, attrs, progressCtrl) {
        progressCtrl.addBar(scope, element);
      }
    };
  })

  .directive('progressbar', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: 'ProgressController',
      scope: {
        value: '=',
        type: '@'
      },
      templateUrl: 'template/progressbar/progressbar.html',
      link: function(scope, element, attrs, progressCtrl) {
        progressCtrl.addBar(scope, angular.element(element.children()[0]));
      }
    };
  });
angular.module('ui.bootstrap.rating', [])

  .constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
  })

  .controller('RatingController', ['$scope', '$attrs', '$parse', 'ratingConfig', function($scope, $attrs, $parse, ratingConfig) {

    this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;

    this.createRateObjects = function(states) {
      var defaultOptions = {
        stateOn: this.stateOn,
        stateOff: this.stateOff
      };

      for (var i = 0, n = states.length; i < n; i++) {
        states[i] = angular.extend({ index: i }, defaultOptions, states[i]);
      }
      return states;
    };

    // Get objects used in template
    $scope.range = angular.isDefined($attrs.ratingStates) ?  this.createRateObjects(angular.copy($scope.$parent.$eval($attrs.ratingStates))): this.createRateObjects(new Array(this.maxRange));

    $scope.rate = function(value) {
      if ( $scope.value !== value && !$scope.readonly ) {
        $scope.value = value;
      }
    };

    $scope.enter = function(value) {
      if ( ! $scope.readonly ) {
        $scope.val = value;
      }
      $scope.onHover({value: value});
    };

    $scope.reset = function() {
      $scope.val = angular.copy($scope.value);
      $scope.onLeave();
    };

    $scope.$watch('value', function(value) {
      $scope.val = value;
    });

    $scope.readonly = false;
    if ($attrs.readonly) {
      $scope.$parent.$watch($parse($attrs.readonly), function(value) {
        $scope.readonly = !!value;
      });
    }
  }])

  .directive('rating', function() {
    return {
      restrict: 'EA',
      scope: {
        value: '=',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      templateUrl: 'template/rating/rating.html',
      replace: true
    };
  });

/**
 * @ngdoc overview
 * @name ui.bootstrap.tabs
 *
 * @description
 * AngularJS version of the tabs directive.
 */

angular.module('ui.bootstrap.tabs', [])

  .controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
    var ctrl = this,
      tabs = ctrl.tabs = $scope.tabs = [];

    ctrl.select = function(tab) {
      angular.forEach(tabs, function(tab) {
        tab.active = false;
      });
      tab.active = true;
    };

    ctrl.addTab = function addTab(tab) {
      tabs.push(tab);
      if (tabs.length === 1 || tab.active) {
        ctrl.select(tab);
      }
    };

    ctrl.removeTab = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      //Select a new tab if the tab to be removed is selected
      if (tab.active && tabs.length > 1) {
        //If this is the last tab, select the previous tab. else, the next tab.
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
  }])

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabset
 * @restrict EA
 *
 * @description
 * Tabset is the outer container for the tabs directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the tabs.
 * @param {boolean=} justified Whether or not to use justified styling for the tabs.
 *
 * @example
 <example module="ui.bootstrap">
 <file name="index.html">
 <tabset>
 <tab heading="Tab 1"><b>First</b> Content!</tab>
 <tab heading="Tab 2"><i>Second</i> Content!</tab>
 </tabset>
 <hr />
 <tabset vertical="true">
 <tab heading="Vertical Tab 1"><b>First</b> Vertical Content!</tab>
 <tab heading="Vertical Tab 2"><i>Second</i> Vertical Content!</tab>
 </tabset>
 <tabset justified="true">
 <tab heading="Justified Tab 1"><b>First</b> Justified Content!</tab>
 <tab heading="Justified Tab 2"><i>Second</i> Justified Content!</tab>
 </tabset>
 </file>
 </example>
 */
  .directive('tabset', function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {},
      controller: 'TabsetController',
      templateUrl: 'template/tabs/tabset.html',
      link: function(scope, element, attrs) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
        scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
      }
    };
  })

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tab
 * @restrict EA
 *
 * @param {string=} heading The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 * @param {string=} select An expression to evaluate when the tab is selected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 *
 * @description
 * Creates a tab with a heading and content. Must be placed within a {@link ui.bootstrap.tabs.directive:tabset tabset}.
 *
 * @example
 <example module="ui.bootstrap">
 <file name="index.html">
 <div ng-controller="TabsDemoCtrl">
 <button class="btn btn-small" ng-click="items[0].active = true">
 Select item 1, using active binding
 </button>
 <button class="btn btn-small" ng-click="items[1].disabled = !items[1].disabled">
 Enable/disable item 2, using disabled binding
 </button>
 <br />
 <tabset>
 <tab heading="Tab 1">First Tab</tab>
 <tab select="alertMe()">
 <tab-heading><i class="icon-bell"></i> Alert me!</tab-heading>
 Second Tab, with alert callback and html heading!
 </tab>
 <tab ng-repeat="item in items"
 heading="{{item.title}}"
 disabled="item.disabled"
 active="item.active">
 {{item.content}}
 </tab>
 </tabset>
 </div>
 </file>
 <file name="script.js">
 function TabsDemoCtrl($scope) {
      $scope.items = [
        { title:"Dynamic Title 1", content:"Dynamic Item 0" },
        { title:"Dynamic Title 2", content:"Dynamic Item 1", disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert("You've selected the alert tab!");
        });
      };
    };
 </file>
 </example>
 */

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabHeading
 * @restrict EA
 *
 * @description
 * Creates an HTML heading for a {@link ui.bootstrap.tabs.directive:tab tab}. Must be placed as a child of a tab element.
 *
 * @example
 <example module="ui.bootstrap">
 <file name="index.html">
 <tabset>
 <tab>
 <tab-heading><b>HTML</b> in my titles?!</tab-heading>
 And some content, too!
 </tab>
 <tab>
 <tab-heading><i class="icon-heart"></i> Icon heading?!?</tab-heading>
 That's right.
 </tab>
 </tabset>
 </file>
 </example>
 */
  .directive('tab', ['$parse', function($parse) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/tabs/tab.html',
      transclude: true,
      scope: {
        heading: '@',
        onSelect: '&select', //This callback is called in contentHeadingTransclude
        //once it inserts the tab's content into the dom
        onDeselect: '&deselect'
      },
      controller: function() {
        //Empty controller so other directives can require being 'under' a tab
      },
      compile: function(elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          var getActive, setActive;
          if (attrs.active) {
            getActive = $parse(attrs.active);
            setActive = getActive.assign;
            scope.$parent.$watch(getActive, function updateActive(value, oldVal) {
              // Avoid re-initializing scope.active as it is already initialized
              // below. (watcher is called async during init with value ===
              // oldVal)
              if (value !== oldVal) {
                scope.active = !!value;
              }
            });
            scope.active = getActive(scope.$parent);
          } else {
            setActive = getActive = angular.noop;
          }

          scope.$watch('active', function(active) {
            // Note this watcher also initializes and assigns scope.active to the
            // attrs.active expression.
            setActive(scope.$parent, active);
            if (active) {
              tabsetCtrl.select(scope);
              scope.onSelect();
            } else {
              scope.onDeselect();
            }
          });

          scope.disabled = false;
          if ( attrs.disabled ) {
            scope.$parent.$watch($parse(attrs.disabled), function(value) {
              scope.disabled = !! value;
            });
          }

          scope.select = function() {
            if ( ! scope.disabled ) {
              scope.active = true;
            }
          };

          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function() {
            tabsetCtrl.removeTab(scope);
          });


          //We need to transclude later, once the content container is ready.
          //when this link happens, we're inside a tab heading.
          scope.$transcludeFn = transclude;
        };
      }
    };
  }])

  .directive('tabHeadingTransclude', [function() {
    return {
      restrict: 'A',
      require: '^tab',
      link: function(scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function updateHeadingElement(heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }
    };
  }])

  .directive('tabContentTransclude', function() {
    return {
      restrict: 'A',
      require: '^tabset',
      link: function(scope, elm, attrs) {
        var tab = scope.$eval(attrs.tabContentTransclude);

        //Now our tab is ready to be transcluded: both the tab heading area
        //and the tab content area are loaded.  Transclude 'em both.
        tab.$transcludeFn(tab.$parent, function(contents) {
          angular.forEach(contents, function(node) {
            if (isTabHeading(node)) {
              //Let tabHeadingTransclude know.
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }
    };
    function isTabHeading(node) {
      return node.tagName &&  (
        node.hasAttribute('tab-heading') ||
        node.hasAttribute('data-tab-heading') ||
        node.tagName.toLowerCase() === 'tab-heading' ||
        node.tagName.toLowerCase() === 'data-tab-heading'
        );
    }
  })

;

angular.module('ui.bootstrap.timepicker', [])

  .constant('timepickerConfig', {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: true,
    meridians: null,
    readonlyInput: false,
    mousewheel: true
  })

  .directive('timepicker', ['$parse', '$log', 'timepickerConfig', '$locale', function ($parse, $log, timepickerConfig, $locale) {
    return {
      restrict: 'EA',
      require:'?^ngModel',
      replace: true,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function(scope, element, attrs, ngModel) {
        if ( !ngModel ) {
          return; // do nothing if no ng-model
        }

        var selected = new Date(),
          meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

        var hourStep = timepickerConfig.hourStep;
        if (attrs.hourStep) {
          scope.$parent.$watch($parse(attrs.hourStep), function(value) {
            hourStep = parseInt(value, 10);
          });
        }

        var minuteStep = timepickerConfig.minuteStep;
        if (attrs.minuteStep) {
          scope.$parent.$watch($parse(attrs.minuteStep), function(value) {
            minuteStep = parseInt(value, 10);
          });
        }

        // 12H / 24H mode
        scope.showMeridian = timepickerConfig.showMeridian;
        if (attrs.showMeridian) {
          scope.$parent.$watch($parse(attrs.showMeridian), function(value) {
            scope.showMeridian = !!value;

            if ( ngModel.$error.time ) {
              // Evaluate from template
              var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
              if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
                selected.setHours( hours );
                refresh();
              }
            } else {
              updateTemplate();
            }
          });
        }

        // Get scope.hours in 24H mode if valid
        function getHoursFromTemplate ( ) {
          var hours = parseInt( scope.hours, 10 );
          var valid = ( scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
          if ( !valid ) {
            return undefined;
          }

          if ( scope.showMeridian ) {
            if ( hours === 12 ) {
              hours = 0;
            }
            if ( scope.meridian === meridians[1] ) {
              hours = hours + 12;
            }
          }
          return hours;
        }

        function getMinutesFromTemplate() {
          var minutes = parseInt(scope.minutes, 10);
          return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
        }

        function pad( value ) {
          return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
        }

        // Input elements
        var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);

        // Respond on mousewheel spin
        var mousewheel = (angular.isDefined(attrs.mousewheel)) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
        if ( mousewheel ) {

          var isScrollingUp = function(e) {
            if (e.originalEvent) {
              e = e.originalEvent;
            }
            //pick correct delta variable depending on event
            var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
            return (e.detail || delta > 0);
          };

          hoursInputEl.bind('mousewheel wheel', function(e) {
            scope.$apply( (isScrollingUp(e)) ? scope.incrementHours() : scope.decrementHours() );
            e.preventDefault();
          });

          minutesInputEl.bind('mousewheel wheel', function(e) {
            scope.$apply( (isScrollingUp(e)) ? scope.incrementMinutes() : scope.decrementMinutes() );
            e.preventDefault();
          });
        }

        scope.readonlyInput = (angular.isDefined(attrs.readonlyInput)) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
        if ( ! scope.readonlyInput ) {

          var invalidate = function(invalidHours, invalidMinutes) {
            ngModel.$setViewValue( null );
            ngModel.$setValidity('time', false);
            if (angular.isDefined(invalidHours)) {
              scope.invalidHours = invalidHours;
            }
            if (angular.isDefined(invalidMinutes)) {
              scope.invalidMinutes = invalidMinutes;
            }
          };

          scope.updateHours = function() {
            var hours = getHoursFromTemplate();

            if ( angular.isDefined(hours) ) {
              selected.setHours( hours );
              refresh( 'h' );
            } else {
              invalidate(true);
            }
          };

          hoursInputEl.bind('blur', function(e) {
            if ( !scope.validHours && scope.hours < 10) {
              scope.$apply( function() {
                scope.hours = pad( scope.hours );
              });
            }
          });

          scope.updateMinutes = function() {
            var minutes = getMinutesFromTemplate();

            if ( angular.isDefined(minutes) ) {
              selected.setMinutes( minutes );
              refresh( 'm' );
            } else {
              invalidate(undefined, true);
            }
          };

          minutesInputEl.bind('blur', function(e) {
            if ( !scope.invalidMinutes && scope.minutes < 10 ) {
              scope.$apply( function() {
                scope.minutes = pad( scope.minutes );
              });
            }
          });
        } else {
          scope.updateHours = angular.noop;
          scope.updateMinutes = angular.noop;
        }

        ngModel.$render = function() {
          var date = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : null;

          if ( isNaN(date) ) {
            ngModel.$setValidity('time', false);
            $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          } else {
            if ( date ) {
              selected = date;
            }
            makeValid();
            updateTemplate();
          }
        };

        // Call internally when we know that model is valid.
        function refresh( keyboardChange ) {
          makeValid();
          ngModel.$setViewValue( new Date(selected) );
          updateTemplate( keyboardChange );
        }

        function makeValid() {
          ngModel.$setValidity('time', true);
          scope.invalidHours = false;
          scope.invalidMinutes = false;
        }

        function updateTemplate( keyboardChange ) {
          var hours = selected.getHours(), minutes = selected.getMinutes();

          if ( scope.showMeridian ) {
            hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
          }
          scope.hours =  keyboardChange === 'h' ? hours : pad(hours);
          scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
          scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
        }

        function addMinutes( minutes ) {
          var dt = new Date( selected.getTime() + minutes * 60000 );
          selected.setHours( dt.getHours(), dt.getMinutes() );
          refresh();
        }

        scope.incrementHours = function() {
          addMinutes( hourStep * 60 );
        };
        scope.decrementHours = function() {
          addMinutes( - hourStep * 60 );
        };
        scope.incrementMinutes = function() {
          addMinutes( minuteStep );
        };
        scope.decrementMinutes = function() {
          addMinutes( - minuteStep );
        };
        scope.toggleMeridian = function() {
          addMinutes( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) );
        };
      }
    };
  }]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('typeaheadParser', ['$parse', function ($parse) {

    //                      00000111000000000000022200000000000000003333333333333330000000000044000
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    return {
      parse:function (input) {

        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error(
              "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
              " but got '" + input + "'.");
        }

        return {
          itemName:match[3],
          source:$parse(match[4]),
          viewMapper:$parse(match[2] || match[1]),
          modelMapper:$parse(match[1])
        };
      }
    };
  }])

  .directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', 'typeaheadParser',
    function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {

      var HOT_KEYS = [9, 13, 27, 38, 40];

      return {
        require:'ngModel',
        link:function (originalScope, element, attrs, modelCtrl) {

          //SUPPORTED ATTRIBUTES (OPTIONS)

          //minimal no of characters that needs to be entered before typeahead kicks-in
          var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;

          //minimal wait time after last character typed before typehead kicks-in
          var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

          //should it restrict model values to the ones selected from the popup only?
          var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;

          //binding to a variable that indicates if matches are being retrieved asynchronously
          var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

          //a callback executed when a match is selected
          var onSelectCallback = $parse(attrs.typeaheadOnSelect);

          var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

          var appendToBody =  attrs.typeaheadAppendToBody ? $parse(attrs.typeaheadAppendToBody) : false;

          //INTERNAL VARIABLES

          //model setter executed upon match selection
          var $setModelValue = $parse(attrs.ngModel).assign;

          //expressions used by typeahead
          var parserResult = typeaheadParser.parse(attrs.typeahead);

          var hasFocus;

          //pop-up element used to display matches
          var popUpEl = angular.element('<div typeahead-popup></div>');
          popUpEl.attr({
            matches: 'matches',
            active: 'activeIdx',
            select: 'select(activeIdx)',
            query: 'query',
            position: 'position'
          });
          //custom item template
          if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
            popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
          }

          //create a child scope for the typeahead directive so we are not polluting original scope
          //with typeahead-specific data (matches, query etc.)
          var scope = originalScope.$new();
          originalScope.$on('$destroy', function(){
            scope.$destroy();
          });

          var resetMatches = function() {
            scope.matches = [];
            scope.activeIdx = -1;
          };

          var getMatchesAsync = function(inputValue) {

            var locals = {$viewValue: inputValue};
            isLoadingSetter(originalScope, true);
            $q.when(parserResult.source(originalScope, locals)).then(function(matches) {

              //it might happen that several async queries were in progress if a user were typing fast
              //but we are interested only in responses that correspond to the current view value
              if (inputValue === modelCtrl.$viewValue && hasFocus) {
                if (matches.length > 0) {

                  scope.activeIdx = 0;
                  scope.matches.length = 0;

                  //transform labels
                  for(var i=0; i<matches.length; i++) {
                    locals[parserResult.itemName] = matches[i];
                    scope.matches.push({
                      label: parserResult.viewMapper(scope, locals),
                      model: matches[i]
                    });
                  }

                  scope.query = inputValue;
                  //position pop-up with matches - we need to re-calculate its position each time we are opening a window
                  //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
                  //due to other elements being rendered
                  scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                  scope.position.top = scope.position.top + element.prop('offsetHeight');

                } else {
                  resetMatches();
                }
                isLoadingSetter(originalScope, false);
              }
            }, function(){
              resetMatches();
              isLoadingSetter(originalScope, false);
            });
          };

          resetMatches();

          //we need to propagate user's query so we can higlight matches
          scope.query = undefined;

          //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
          var timeoutPromise;

          //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
          //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
          modelCtrl.$parsers.unshift(function (inputValue) {

            hasFocus = true;

            if (inputValue && inputValue.length >= minSearch) {
              if (waitTime > 0) {
                if (timeoutPromise) {
                  $timeout.cancel(timeoutPromise);//cancel previous timeout
                }
                timeoutPromise = $timeout(function () {
                  getMatchesAsync(inputValue);
                }, waitTime);
              } else {
                getMatchesAsync(inputValue);
              }
            } else {
              isLoadingSetter(originalScope, false);
              resetMatches();
            }

            if (isEditable) {
              return inputValue;
            } else {
              if (!inputValue) {
                // Reset in case user had typed something previously.
                modelCtrl.$setValidity('editable', true);
                return inputValue;
              } else {
                modelCtrl.$setValidity('editable', false);
                return undefined;
              }
            }
          });

          modelCtrl.$formatters.push(function (modelValue) {

            var candidateViewValue, emptyViewValue;
            var locals = {};

            if (inputFormatter) {

              locals['$model'] = modelValue;
              return inputFormatter(originalScope, locals);

            } else {

              //it might happen that we don't have enough info to properly render input value
              //we need to check for this situation and simply return model value if we can't apply custom formatting
              locals[parserResult.itemName] = modelValue;
              candidateViewValue = parserResult.viewMapper(originalScope, locals);
              locals[parserResult.itemName] = undefined;
              emptyViewValue = parserResult.viewMapper(originalScope, locals);

              return candidateViewValue!== emptyViewValue ? candidateViewValue : modelValue;
            }
          });

          scope.select = function (activeIdx) {
            //called from within the $digest() cycle
            var locals = {};
            var model, item;

            locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
            model = parserResult.modelMapper(originalScope, locals);
            $setModelValue(originalScope, model);
            modelCtrl.$setValidity('editable', true);

            onSelectCallback(originalScope, {
              $item: item,
              $model: model,
              $label: parserResult.viewMapper(originalScope, locals)
            });

            resetMatches();

            //return focus to the input element if a mach was selected via a mouse click event
            element[0].focus();
          };

          //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
          element.bind('keydown', function (evt) {

            //typeahead is open and an "interesting" key was pressed
            if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
              return;
            }

            evt.preventDefault();

            if (evt.which === 40) {
              scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
              scope.$digest();

            } else if (evt.which === 38) {
              scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
              scope.$digest();

            } else if (evt.which === 13 || evt.which === 9) {
              scope.$apply(function () {
                scope.select(scope.activeIdx);
              });

            } else if (evt.which === 27) {
              evt.stopPropagation();

              resetMatches();
              scope.$digest();
            }
          });

          element.bind('blur', function (evt) {
            hasFocus = false;
          });

          // Keep reference to click handler to unbind it.
          var dismissClickHandler = function (evt) {
            if (element[0] !== evt.target) {
              resetMatches();
              scope.$digest();
            }
          };

          $document.bind('click', dismissClickHandler);

          originalScope.$on('$destroy', function(){
            $document.unbind('click', dismissClickHandler);
          });

          var $popup = $compile(popUpEl)(scope);
          if ( appendToBody ) {
            $document.find('body').append($popup);
          } else {
            element.after($popup);
          }
        }
      };

    }])

  .directive('typeaheadPopup', function () {
    return {
      restrict:'EA',
      scope:{
        matches:'=',
        query:'=',
        active:'=',
        position:'=',
        select:'&'
      },
      replace:true,
      templateUrl:'template/typeahead/typeahead-popup.html',
      link:function (scope, element, attrs) {

        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function () {
          return scope.matches.length > 0;
        };

        scope.isActive = function (matchIdx) {
          return scope.active == matchIdx;
        };

        scope.selectActive = function (matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function (activeIdx) {
          scope.select({activeIdx:activeIdx});
        };
      }
    };
  })

  .directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
    return {
      restrict:'EA',
      scope:{
        index:'=',
        match:'=',
        query:'='
      },
      link:function (scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, {cache: $templateCache}).success(function(tplContent){
          element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }])

  .filter('typeaheadHighlight', function() {

    function escapeRegexp(queryToEscape) {
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    return function(matchItem, query) {
      return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
    };
  });
angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion-group.html",
      "<div class=\"panel panel-default\">\n" +
      "  <div class=\"panel-heading\">\n" +
      "    <h4 class=\"panel-title\">\n" +
      "      <a class=\"accordion-toggle\" ng-click=\"isOpen = !isOpen\" accordion-transclude=\"heading\">{{heading}}</a>\n" +
      "    </h4>\n" +
      "  </div>\n" +
      "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
      "	  <div class=\"panel-body\" ng-transclude></div>\n" +
      "  </div>\n" +
      "</div>");
}]);

angular.module("template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion.html",
    "<div class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/alert/alert.html",
      "<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
      "    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n" +
      "    <div ng-transclude></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/carousel.html",
      "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\">\n" +
      "    <ol class=\"carousel-indicators\" ng-show=\"slides().length > 1\">\n" +
      "        <li ng-repeat=\"slide in slides()\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
      "    </ol>\n" +
      "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
      "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides().length > 1\"><span class=\"icon-prev\"></span></a>\n" +
      "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides().length > 1\"><span class=\"icon-next\"></span></a>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/slide.html",
      "<div ng-class=\"{\n" +
      "    'active': leaving || (active && !entering),\n" +
      "    'prev': (next || active) && direction=='prev',\n" +
      "    'next': (next || active) && direction=='next',\n" +
      "    'right': direction=='prev',\n" +
      "    'left': direction=='next'\n" +
      "  }\" class=\"item text-center\" ng-transclude></div>\n" +
      "");
}]);

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
      "<table>\n" +
      "  <thead>\n" +
      "    <tr>\n" +
      "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
      "      <th colspan=\"{{rows[0].length - 2 + showWeekNumbers}}\"><button type=\"button\" class=\"btn btn-default btn-sm btn-block\" ng-click=\"toggleMode()\"><strong>{{title}}</strong></button></th>\n" +
      "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
      "    </tr>\n" +
      "    <tr ng-show=\"labels.length > 0\" class=\"h6\">\n" +
      "      <th ng-show=\"showWeekNumbers\" class=\"text-center\">#</th>\n" +
      "      <th ng-repeat=\"label in labels\" class=\"text-center\">{{label}}</th>\n" +
      "    </tr>\n" +
      "  </thead>\n" +
      "  <tbody>\n" +
      "    <tr ng-repeat=\"row in rows\">\n" +
      "      <td ng-show=\"showWeekNumbers\" class=\"text-center\"><em>{{ getWeekNumber(row) }}</em></td>\n" +
      "      <td ng-repeat=\"dt in row\" class=\"text-center\">\n" +
      "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      "  </tbody>\n" +
      "</table>\n" +
      "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
      "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
      "	<li ng-transclude></li>\n" +
      "	<li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
      "		<span class=\"btn-group\">\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-default\" ng-click=\"showWeeks = ! showWeeks\" ng-class=\"{active: showWeeks}\">{{toggleWeeksText}}</button>\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
      "		</span>\n" +
      "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
      "	</li>\n" +
      "</ul>\n" +
      "");
}]);

angular.module("template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/backdrop.html",
    "<div class=\"modal-backdrop fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + index*10}\"></div>");
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/window.html",
      "<div tabindex=\"-1\" class=\"modal fade {{ windowClass }}\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
      "    <div class=\"modal-dialog\"><div class=\"modal-content\" ng-transclude></div></div>\n" +
      "</div>");
}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pager.html",
      "<ul class=\"pager\">\n" +
      "  <li ng-repeat=\"page in pages\" ng-class=\"{disabled: page.disabled, previous: page.previous, next: page.next}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
      "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
      "<ul class=\"pagination\">\n" +
      "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
      "</ul>");
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
      "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"tooltip-arrow\"></div>\n" +
      "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
      "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"tooltip-arrow\"></div>\n" +
      "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/popover/popover.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progressbar.html",
    "<div class=\"progress\"><div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div></div>");
}]);

angular.module("template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/rating/rating.html",
      "<span ng-mouseleave=\"reset()\">\n" +
      "    <i ng-repeat=\"r in range\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < val && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\"></i>\n" +
      "</span>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
      "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
      "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
      "</li>\n" +
      "");
}]);

angular.module("template/tabs/tabset-titles.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset-titles.html",
      "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
      "</ul>\n" +
      "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
      "\n" +
      "<div class=\"tabbable\">\n" +
      "  <ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\" \n" +
      "         ng-repeat=\"tab in tabs\" \n" +
      "         ng-class=\"{active: tab.active}\"\n" +
      "         tab-content-transclude=\"tab\">\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
      "<table>\n" +
      "	<tbody>\n" +
      "		<tr class=\"text-center\">\n" +
      "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
      "			<td>&nbsp;</td>\n" +
      "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
      "			<td ng-show=\"showMeridian\"></td>\n" +
      "		</tr>\n" +
      "		<tr>\n" +
      "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
      "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
      "			</td>\n" +
      "			<td>:</td>\n" +
      "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
      "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
      "			</td>\n" +
      "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
      "		</tr>\n" +
      "		<tr class=\"text-center\">\n" +
      "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
      "			<td>&nbsp;</td>\n" +
      "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
      "			<td ng-show=\"showMeridian\"></td>\n" +
      "		</tr>\n" +
      "	</tbody>\n" +
      "</table>\n" +
      "");
}]);

angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-match.html",
    "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-popup.html",
      "<ul class=\"dropdown-menu\" ng-style=\"{display: isOpen()&&'block' || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
      "    <li ng-repeat=\"match in matches\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\">\n" +
      "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
      "    </li>\n" +
      "</ul>");
}]);
/*
 * @name Lazy.js
 *
 * @fileOverview
 * Lazy.js is a lazy evaluation library for JavaScript.
 *
 * This has been done before. For examples see:
 *
 * - [wu.js](http://fitzgen.github.io/wu.js/)
 * - [Linq.js](http://linqjs.codeplex.com/)
 * - [from.js](https://github.com/suckgamoni/fromjs/)
 * - [IxJS](http://rx.codeplex.com/)
 * - [sloth.js](http://rfw.name/sloth.js/)
 *
 * However, at least at present, Lazy.js is faster (on average) than any of
 * those libraries. It is also more complete, with nearly all of the
 * functionality of [Underscore](http://underscorejs.org/) and
 * [Lo-Dash](http://lodash.com/).
 *
 * Finding your way around the code
 * --------------------------------
 *
 * At the heart of Lazy.js is the {@link Sequence} object. You create an initial
 * sequence using {@link Lazy}, which can accept an array, object, or string.
 * You can then "chain" together methods from this sequence, creating a new
 * sequence with each call.
 *
 * Here's an example:
 *
 *     var data = getReallyBigArray();
 *
 *     var statistics = Lazy(data)
 *       .map(transform)
 *       .filter(validate)
 *       .reduce(aggregate);
 *
 * {@link Sequence} is the foundation of other, more specific sequence types.
 *
 * An {@link ArrayLikeSequence} provides indexed access to its elements.
 *
 * An {@link ObjectLikeSequence} consists of key/value pairs.
 *
 * A {@link StringLikeSequence} is like a string (duh): actually, it is an
 * {@link ArrayLikeSequence} whose elements happen to be characters.
 *
 * An {@link AsyncSequence} is special: it iterates over its elements
 * asynchronously (so calling `each` generally begins an asynchronous loop and
 * returns immediately).
 *
 * For more information
 * --------------------
 *
 * I wrote a blog post that explains a little bit more about Lazy.js, which you
 * can read [here](http://philosopherdeveloper.com/posts/introducing-lazy-js.html).
 *
 * You can also [create an issue on GitHub](https://github.com/dtao/lazy.js/issues)
 * if you have any issues with the library. I work through them eventually.
 *
 * [@dtao](https://github.com/dtao)
 */

(function(context) {
  /**
   * Wraps an object and returns a {@link Sequence}. For `null` or `undefined`,
   * simply returns an empty sequence (see {@link Lazy.strict} for a stricter
   * implementation).
   *
   * - For **arrays**, Lazy will create a sequence comprising the elements in
   *   the array (an {@link ArrayLikeSequence}).
   * - For **objects**, Lazy will create a sequence of key/value pairs
   *   (an {@link ObjectLikeSequence}).
   * - For **strings**, Lazy will create a sequence of characters (a
   *   {@link StringLikeSequence}).
   *
   * @public
   * @param {Array|Object|string} source An array, object, or string to wrap.
   * @returns {Sequence} The wrapped lazy object.
   *
   * @exampleHelpers
   * // Utility functions to provide to all examples
   * function increment(x) { return x + 1; }
   * function isEven(x) { return x % 2 === 0; }
   * function isPositive(x) { return x > 0; }
   * function isNegative(x) { return x < 0; }
   *
   * @examples
   * Lazy([1, 2, 4])       // instanceof Lazy.ArrayLikeSequence
   * Lazy({ foo: "bar" })  // instanceof Lazy.ObjectLikeSequence
   * Lazy("hello, world!") // instanceof Lazy.StringLikeSequence
   * Lazy()                // sequence: []
   * Lazy(null)            // sequence: []
   */
  function Lazy(source) {
    if (source instanceof Array) {
      return new ArrayWrapper(source);

    } else if (typeof source === "string") {
      return new StringWrapper(source);

    } else if (source instanceof Sequence) {
      return source;
    }

    if (Lazy.extensions) {
      var extensions = Lazy.extensions, length = extensions.length, result;
      while (!result && length--) {
        result = extensions[length](source);
      }
      if (result) {
        return result;
      }
    }

    return new ObjectWrapper(source);
  }

  Lazy.VERSION = '0.3.2';

  /*** Utility methods of questionable value ***/

  Lazy.noop = function noop() {};
  Lazy.identity = function identity(x) { return x; };

  /**
   * Provides a stricter version of {@link Lazy} which throws an error when
   * attempting to wrap `null`, `undefined`, or numeric or boolean values as a
   * sequence.
   *
   * @public
   * @returns {Function} A stricter version of the {@link Lazy} helper function.
   *
   * @examples
   * var Strict = Lazy.strict();
   *
   * Strict()                  // throws
   * Strict(null)              // throws
   * Strict(true)              // throws
   * Strict(5)                 // throws
   * Strict([1, 2, 3])         // instanceof Lazy.ArrayLikeSequence
   * Strict({ foo: "bar" })    // instanceof Lazy.ObjectLikeSequence
   * Strict("hello, world!")   // instanceof Lazy.StringLikeSequence
   *
   * // Let's also ensure the static functions are still there.
   * Strict.range(3)           // sequence: [0, 1, 2]
   * Strict.generate(Date.now) // instanceof Lazy.GeneratedSequence
   */
  Lazy.strict = function strict() {
    function StrictLazy(source) {
      if (source == null) {
        throw new Error("You cannot wrap null or undefined using Lazy.");
      }

      if (typeof source === "number" || typeof source === "boolean") {
        throw new Error("You cannot wrap primitive values using Lazy.");
      }

      return Lazy(source);
    };

    Lazy(Lazy).each(function(property, name) {
      StrictLazy[name] = property;
    });

    return StrictLazy;
  };

  /**
   * The `Sequence` object provides a unified API encapsulating the notion of
   * zero or more consecutive elements in a collection, stream, etc.
   *
   * Lazy evaluation
   * ---------------
   *
   * Generally speaking, creating a sequence should not be an expensive operation,
   * and should not iterate over an underlying source or trigger any side effects.
   * This means that chaining together methods that return sequences incurs only
   * the cost of creating the `Sequence` objects themselves and not the cost of
   * iterating an underlying data source multiple times.
   *
   * The following code, for example, creates 4 sequences and does nothing with
   * `source`:
   *
   *     var seq = Lazy(source) // 1st sequence
   *       .map(func)           // 2nd
   *       .filter(pred)        // 3rd
   *       .reverse();          // 4th
   *
   * Lazy's convention is to hold off on iterating or otherwise *doing* anything
   * (aside from creating `Sequence` objects) until you call `each`:
   *
   *     seq.each(function(x) { console.log(x); });
   *
   * Defining custom sequences
   * -------------------------
   *
   * Defining your own type of sequence is relatively simple:
   *
   * 1. Pass a *method name* and an object containing *function overrides* to
   *    {@link Sequence.define}. If the object includes a function called `init`,
   *    this function will be called upon initialization.
   * 2. The object should include at least either a `getIterator` method or an
   *    `each` method. The former supports both asynchronous and synchronous
   *    iteration, but is slightly more cumbersome to implement. The latter
   *    supports synchronous iteration and can be automatically implemented in
   *    terms of the former. You can also implement both if you want, e.g. to
   *    optimize performance. For more info, see {@link Iterator} and
   *    {@link AsyncSequence}.
   *
   * As a trivial example, the following code defines a new method, `sample`,
   * which randomly may or may not include each element from its parent.
   *
   *     Lazy.Sequence.define("sample", {
   *       each: function(fn) {
   *         return this.parent.each(function(e) {
   *           // 50/50 chance of including this element.
   *           if (Math.random() > 0.5) {
   *             return fn(e);
   *           }
   *         });
   *       }
   *     });
   *
   * (Of course, the above could also easily have been implemented using
   * {@link #filter} instead of creating a custom sequence. But I *did* say this
   * was a trivial example, to be fair.)
   *
   * Now it will be possible to create this type of sequence from any parent
   * sequence by calling the method name you specified. In other words, you can
   * now do this:
   *
   *     Lazy(arr).sample();
   *     Lazy(arr).map(func).sample();
   *     Lazy(arr).map(func).filter(pred).sample();
   *
   * Etc., etc.
   *
   * @public
   * @constructor
   */
  function Sequence() {}

  /**
   * Create a new constructor function for a type inheriting from `Sequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `Sequence` prototype so that it can be chained with any other
   *     sequence methods, like {@link #map}, {@link #filter}, etc.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include either `getIterator` or `each` (or
   *     both). *May* include an `init` method as well. For these overrides,
   *     `this` will be the new sequence, and `this.parent` will be the base
   *     sequence from which the new sequence was constructed.
   * @returns {Function} A constructor for a new type inheriting from `Sequence`.
   *
   * @examples
   * // This sequence type logs every element to the specified logger as it
   * // iterates over it.
   * Lazy.Sequence.define("verbose", {
   *   init: function(logger) {
   *     this.logger = logger;
   *   },
   *
   *   each: function(fn) {
   *     var logger = this.logger;
   *     return this.parent.each(function(e, i) {
   *       logger(e);
   *       return fn(e, i);
   *     });
   *   }
   * });
   *
   * Lazy([1, 2, 3]).verbose(logger).each(Lazy.noop) // calls logger 3 times
   */
  Sequence.define = function define(methodName, overrides) {
    if (!overrides || (!overrides.getIterator && !overrides.each)) {
      throw new Error("A custom sequence must implement *at least* getIterator or each!");
    }

    return defineSequenceType(Sequence, methodName, overrides);
  };

  /**
   * Gets the number of elements in the sequence. In some cases, this may
   * require eagerly evaluating the sequence.
   *
   * @public
   * @returns {number} The number of elements in the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).size();                 // => 3
   * Lazy([1, 2]).map(Lazy.identity).size(); // => 2
   * Lazy([1, 2, 3]).reject(isEven).size();  // => 2
   * Lazy([1, 2, 3]).take(1).size();         // => 1
   * Lazy({ foo: 1, bar: 2 }).size();        // => 2
   * Lazy('hello').size();                   // => 5
   */
  Sequence.prototype.size = function size() {
    return this.getIndex().length();
  };

  /**
   * Creates an {@link Iterator} object with two methods, `moveNext` -- returning
   * true or false -- and `current` -- returning the current value.
   *
   * This method is used when asynchronously iterating over sequences. Any type
   * inheriting from `Sequence` must implement this method or it can't support
   * asynchronous iteration.
   *
   * Note that **this method is not intended to be used directly by application
   * code.** Rather, it is intended as a means for implementors to potentially
   * define custom sequence types that support either synchronous or
   * asynchronous iteration.
   *
   * @public
   * @returns {Iterator} An iterator object.
   *
   * @examples
   * var iterator = Lazy([1, 2]).getIterator();
   *
   * iterator.moveNext(); // => true
   * iterator.current();  // => 1
   * iterator.moveNext(); // => true
   * iterator.current();  // => 2
   * iterator.moveNext(); // => false
   */
  Sequence.prototype.getIterator = function getIterator() {
    return new Iterator(this);
  };

  /**
   * Gets the root sequence underlying the current chain of sequences.
   */
  Sequence.prototype.root = function root() {
    return this.parent.root();
  };

  /**
   * Whether or not the current sequence is an asynchronous one. This is more
   * accurate than checking `instanceof {@link AsyncSequence}` because, for
   * example, `Lazy([1, 2, 3]).async().map(Lazy.identity)` returns a sequence
   * that iterates asynchronously even though it's not an instance of
   * `AsyncSequence`.
   */
  Sequence.prototype.isAsync = function isAsync() {
    return this.parent ? this.parent.isAsync() : false;
  };

  /**
   * Evaluates the sequence and produces an appropriate value (an array in most
   * cases, an object for {@link ObjectLikeSequence}s or a string for
   * {@link StringLikeSequence}s).
   */
  Sequence.prototype.value = function value() {
    return this.toArray();
  };

  /**
   * Applies the current transformation chain to a given source.
   *
   * @examples
   * var sequence = Lazy([])
   *   .map(function(x) { return x * -1; })
   *   .filter(function(x) { return x % 2 === 0; });
   *
   * sequence.apply([1, 2, 3, 4]); // => [-2, -4]
   */
  Sequence.prototype.apply = function apply(source) {
    var root = this.root(),
        previousSource = root.source,
        result;

    try {
      root.source = source;
      result = this.value();
    } finally {
      root.source = previousSource;
    }

    return result;
  };

  /**
   * The Iterator object provides an API for iterating over a sequence.
   *
   * The purpose of the `Iterator` type is mainly to offer an agnostic way of
   * iterating over a sequence -- either synchronous (i.e. with a `while` loop)
   * or asynchronously (with recursive calls to either `setTimeout` or --- if
   * available --- `setImmediate`). It is not intended to be used directly by
   * application code.
   *
   * @public
   * @constructor
   * @param {Sequence} sequence The sequence to iterate over.
   */
  function Iterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  /**
   * Gets the current item this iterator is pointing to.
   *
   * @public
   * @returns {*} The current item.
   */
  Iterator.prototype.current = function current() {
    return this.cachedIndex && this.cachedIndex.get(this.index);
  };

  /**
   * Moves the iterator to the next item in a sequence, if possible.
   *
   * @public
   * @returns {boolean} True if the iterator is able to move to a new item, or else
   *     false.
   */
  Iterator.prototype.moveNext = function moveNext() {
    var cachedIndex = this.cachedIndex;

    if (!cachedIndex) {
      cachedIndex = this.cachedIndex = this.sequence.getIndex();
    }

    if (this.index >= cachedIndex.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * Creates an array snapshot of a sequence.
   *
   * Note that for indefinite sequences, this method may raise an exception or
   * (worse) cause the environment to hang.
   *
   * @public
   * @returns {Array} An array containing the current contents of the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).toArray() // => [1, 2, 3]
   */
  Sequence.prototype.toArray = function toArray() {
    return this.reduce(function(arr, element) {
      arr.push(element);
      return arr;
    }, []);
  };

  /**
   * Provides an indexed view into the sequence.
   *
   * For sequences that are already indexed, this will simply return the
   * sequence. For non-indexed sequences, this will eagerly evaluate the
   * sequence and cache the result (so subsequent calls will not create
   * additional arrays).
   *
   * @returns {ArrayLikeSequence} A sequence containing the current contents of
   *     the sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).filter(isEven)            // instanceof Lazy.Sequence
   * Lazy([1, 2, 3]).filter(isEven).getIndex() // instanceof Lazy.ArrayLikeSequence
   */
  Sequence.prototype.getIndex = function getIndex() {
    if (!this.cachedIndex) {
      this.cachedIndex = new ArrayWrapper(this.toArray());
    }
    return this.cachedIndex;
  };

  /**
   * Provides an indexed, memoized view into the sequence. This will cache the
   * result whenever the sequence is first iterated, so that subsequent
   * iterations will access the same element objects.
   *
   * @public
   * @returns {ArrayLikeSequence} An indexed, memoized sequence containing this
   *     sequence's elements, cached after the first iteration.
   *
   * @example
   * function createObject() { return new Object(); }
   *
   * var plain    = Lazy.generate(createObject, 10),
   *     memoized = Lazy.generate(createObject, 10).memoize();
   *
   * plain.toArray()[0] === plain.toArray()[0];       // => false
   * memoized.toArray()[0] === memoized.toArray()[0]; // => true
   */
  Sequence.prototype.memoize = function memoize() {
    return new MemoizedSequence(this);
  };

  /**
   * @constructor
   */
  function MemoizedSequence(parent) {
    this.parent = parent;
  }

  // MemoizedSequence needs to have its prototype set up after ArrayLikeSequence

  /**
   * Creates an object from a sequence of key/value pairs.
   *
   * @public
   * @returns {Object} An object with keys and values corresponding to the pairs
   *     of elements in the sequence.
   *
   * @examples
   * var details = [
   *   ["first", "Dan"],
   *   ["last", "Tao"],
   *   ["age", 29]
   * ];
   *
   * Lazy(details).toObject() // => { first: "Dan", last: "Tao", age: 29 }
   */
  Sequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, pair) {
      object[pair[0]] = pair[1];
      return object;
    }, {});
  };

  /**
   * Iterates over this sequence and executes a function for every element.
   *
   * @public
   * @aka forEach
   * @param {Function} fn The function to call on each element in the sequence.
   *     Return false from the function to end the iteration.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).each(fn) // calls fn 4 times
   */
  Sequence.prototype.each = function each(fn) {
    var iterator = this.getIterator(),
        i = -1;

    while (iterator.moveNext()) {
      if (fn(iterator.current(), ++i) === false) {
        return false;
      }
    }

    return true;
  };

  Sequence.prototype.forEach = function forEach(fn) {
    return this.each(fn);
  };

  /**
   * Creates a new sequence whose values are calculated by passing this sequence's
   * elements through some mapping function.
   *
   * @public
   * @aka collect
   * @param {Function} mapFn The mapping function used to project this sequence's
   *     elements onto a new sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([]).map(increment)        // sequence: []
   * Lazy([1, 2, 3]).map(increment) // sequence: [2, 3, 4]
   *
   * @benchmarks
   * function increment(x) { return x + 1; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).map(increment).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).map(increment).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.map(smArr, increment), _.noop)    // lodash - 10 elements
   * _.each(_.map(lgArr, increment), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.map = function map(mapFn) {
    return new MappedSequence(this, createCallback(mapFn));
  };

  Sequence.prototype.collect = function collect(mapFn) {
    return this.map(mapFn);
  };

  /**
   * @constructor
   */
  function MappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedSequence.prototype = new Sequence();

  MappedSequence.prototype.getIterator = function getIterator() {
    return new MappingIterator(this.parent, this.mapFn);
  };

  MappedSequence.prototype.each = function each(fn) {
    var mapFn = this.mapFn;
    return this.parent.each(function(e, i) {
      return fn(mapFn(e, i), i);
    });
  };

  /**
   * @constructor
   */
  function MappingIterator(sequence, mapFn) {
    this.iterator = sequence.getIterator();
    this.mapFn    = mapFn;
    this.index    = -1;
  }

  MappingIterator.prototype.current = function current() {
    return this.mapFn(this.iterator.current(), this.index);
  };

  MappingIterator.prototype.moveNext = function moveNext() {
    if (this.iterator.moveNext()) {
      ++this.index;
      return true;
    }

    return false;
  };

  /**
   * Creates a new sequence whose values are calculated by accessing the specified
   * property from each element in this sequence.
   *
   * @public
   * @param {string} propertyName The name of the property to access for every
   *     element in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).pluck("last") // sequence: ["Tao", "Smith"]
   */
  Sequence.prototype.pluck = function pluck(property) {
    return this.map(property);
  };

  /**
   * Creates a new sequence whose values are calculated by invoking the specified
   * function on each element in this sequence.
   *
   * @public
   * @param {string} methodName The name of the method to invoke for every element
   *     in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function Person(first, last) {
   *   this.fullName = function fullName() {
   *     return first + " " + last;
   *   };
   * }
   *
   * var people = [
   *   new Person("Dan", "Tao"),
   *   new Person("Bob", "Smith")
   * ];
   *
   * Lazy(people).invoke("fullName") // sequence: ["Dan Tao", "Bob Smith"]
   */
  Sequence.prototype.invoke = function invoke(methodName) {
    return this.map(function(e) {
      return e[methodName]();
    });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence which
   * satisfy the specified predicate.
   *
   * @public
   * @aka select
   * @param {Function} filterFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be included.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5, 6];
   *
   * Lazy(numbers).filter(isEven) // sequence: [2, 4, 6]
   *
   * @benchmarks
   * function isEven(x) { return x % 2 === 0; }
   *
   * var smArr = Lazy.range(10).toArray(),
   *     lgArr = Lazy.range(100).toArray();
   *
   * Lazy(smArr).filter(isEven).each(Lazy.noop) // lazy - 10 elements
   * Lazy(lgArr).filter(isEven).each(Lazy.noop) // lazy - 100 elements
   * _.each(_.filter(smArr, isEven), _.noop)    // lodash - 10 elements
   * _.each(_.filter(lgArr, isEven), _.noop)    // lodash - 100 elements
   */
  Sequence.prototype.filter = function filter(filterFn) {
    return new FilteredSequence(this, createCallback(filterFn));
  };

  Sequence.prototype.select = function select(filterFn) {
    return this.filter(filterFn);
  };

  /**
   * @constructor
   */
  function FilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredSequence.prototype = new Sequence();

  FilteredSequence.prototype.getIterator = function getIterator() {
    return new FilteringIterator(this.parent, this.filterFn);
  };

  FilteredSequence.prototype.each = function each(fn) {
    var filterFn = this.filterFn;

    // I'm not proud of this, but it'll get the job done for now.
    if (this.parent instanceof ObjectLikeSequence) {
      return this.parent.each(function(v, k) {
        if (filterFn(v, k)) {
          return fn(v, k);
        }
      });

    } else {
      var j = 0;
      return this.parent.each(function(e, i) {
        if (filterFn(e, i)) {
          return fn(e, j++);
        }
      });
    }
  };

  FilteredSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().filter(this.filterFn);
  };

  /**
   * @constructor
   */
  function FilteringIterator(sequence, filterFn) {
    this.iterator = sequence.getIterator();
    this.filterFn = filterFn;
    this.index    = 0;
  }

  FilteringIterator.prototype.current = function current() {
    return this.value;
  };

  FilteringIterator.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        filterFn = this.filterFn,
        value;

    while (iterator.moveNext()) {
      value = iterator.current();
      if (filterFn(value, this.index++)) {
        this.value = value;
        return true;
      }
    }

    this.value = undefined;
    return false;
  };

  /**
   * Creates a new sequence whose values exclude the elements of this sequence
   * identified by the specified predicate.
   *
   * @public
   * @param {Function} rejectFn The predicate to call on each element in this
   *     sequence, which returns true if the element should be omitted.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).reject(isEven)              // sequence: [1, 3, 5]
   * Lazy([{ foo: 1 }, { bar: 2 }]).reject('foo')      // sequence: [{ bar: 2 }]
   * Lazy([{ foo: 1 }, { foo: 2 }]).reject({ foo: 2 }) // sequence: [{ foo: 1 }]
   */
  Sequence.prototype.reject = function reject(rejectFn) {
    rejectFn = createCallback(rejectFn);
    return this.filter(function(e) { return !rejectFn(e); });
  };

  /**
   * Creates a new sequence whose values have the specified type, as determined
   * by the `typeof` operator.
   *
   * @public
   * @param {string} type The type of elements to include from the underlying
   *     sequence, i.e. where `typeof [element] === [type]`.
   * @returns {Sequence} The new sequence, comprising elements of the specified
   *     type.
   *
   * @examples
   * Lazy([1, 2, 'foo', 'bar']).ofType('number')  // sequence: [1, 2]
   * Lazy([1, 2, 'foo', 'bar']).ofType('string')  // sequence: ['foo', 'bar']
   * Lazy([1, 2, 'foo', 'bar']).ofType('boolean') // sequence: []
   */
  Sequence.prototype.ofType = function ofType(type) {
    return this.filter(function(e) { return typeof e === type; });
  };

  /**
   * Creates a new sequence whose values are the elements of this sequence with
   * property names and values matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on every
   *     element that is to be included in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { first: "Dan", last: "Tao" },
   *   { first: "Bob", last: "Smith" }
   * ];
   *
   * Lazy(people).where({ first: "Dan" }) // sequence: [{ first: "Dan", last: "Tao" }]
   *
   * @benchmarks
   * var animals = ["dog", "cat", "mouse", "horse", "pig", "snake"];
   *
   * Lazy(animals).where({ length: 3 }).each(Lazy.noop) // lazy
   * _.each(_.where(animals, { length: 3 }), _.noop)    // lodash
   */
  Sequence.prototype.where = function where(properties) {
    return this.filter(properties);
  };

  /**
   * Creates a new sequence with the same elements as this one, but to be iterated
   * in the opposite order.
   *
   * Note that in some (but not all) cases, the only way to create such a sequence
   * may require iterating the entire underlying source when `each` is called.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // sequence: [3, 2, 1]
   * Lazy([]).reverse()        // sequence: []
   */
  Sequence.prototype.reverse = function reverse() {
    return new ReversedSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedSequence(parent) {
    this.parent = parent;
  }

  ReversedSequence.prototype = new Sequence();

  ReversedSequence.prototype.getIterator = function getIterator() {
    return new ReversedIterator(this.parent);
  };

  /**
   * @constuctor
   */
  function ReversedIterator(sequence) {
    this.sequence = sequence;
  }

  ReversedIterator.prototype.current = function current() {
    return this.sequence.getIndex().get(this.index);
  };

  ReversedIterator.prototype.moveNext = function moveNext() {
    var indexed = this.sequence.getIndex(),
        length  = indexed.length();

    if (typeof this.index === "undefined") {
      this.index = length;
    }

    return (--this.index >= 0);
  };

  /**
   * Creates a new sequence with all of the elements of this one, plus those of
   * the given array(s).
   *
   * @public
   * @param {...*} var_args One or more values (or arrays of values) to use for
   *     additional items after this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var left  = [1, 2, 3];
   * var right = [4, 5, 6];
   *
   * Lazy(left).concat(right)         // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(Lazy(right))   // sequence: [1, 2, 3, 4, 5, 6]
   * Lazy(left).concat(right, [7, 8]) // sequence: [1, 2, 3, 4, 5, 6, 7, 8]
   */
  Sequence.prototype.concat = function concat(var_args) {
    return new ConcatenatedSequence(this, arraySlice.call(arguments, 0));
  };

  /**
   * @constructor
   */
  function ConcatenatedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ConcatenatedSequence.prototype = new Sequence();

  ConcatenatedSequence.prototype.each = function each(fn) {
    var done = false,
        i = 0;

    this.parent.each(function(e) {
      if (fn(e, i++) === false) {
        done = true;
        return false;
      }
    });

    if (!done) {
      Lazy(this.arrays).flatten().each(function(e) {
        if (fn(e, i++) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Creates a new sequence comprising the first N elements from this sequence, OR
   * (if N is `undefined`) simply returns the first element of this sequence.
   *
   * @public
   * @aka head, take
   * @param {number=} count The number of elements to take from this sequence. If
   *     this value exceeds the length of the sequence, the resulting sequence
   *     will be essentially the same as this one.
   * @returns {*} The new sequence (or the first element from this sequence if
   *     no count was given).
   *
   * @examples
   * function powerOfTwo(exp) {
   *   return Math.pow(2, exp);
   * }
   *
   * Lazy.generate(powerOfTwo).first()          // => 1
   * Lazy.generate(powerOfTwo).first(5)         // sequence: [1, 2, 4, 8, 16]
   * Lazy.generate(powerOfTwo).skip(2).first()  // => 4
   * Lazy.generate(powerOfTwo).skip(2).first(2) // sequence: [4, 8]
   */
  Sequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return getFirst(this);
    }
    return new TakeSequence(this, count);
  };

  Sequence.prototype.head =
  Sequence.prototype.take = function (count) {
    return this.first(count);
  };

  /**
   * @constructor
   */
  function TakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  TakeSequence.prototype = new Sequence();

  TakeSequence.prototype.getIterator = function getIterator() {
    return new TakeIterator(this.parent, this.count);
  };

  TakeSequence.prototype.each = function each(fn) {
    var count = this.count,
        i     = 0;

    var handle = this.parent.each(function(e) {
      var result;
      if (i < count) { result = fn(e, i++); }
      if (i >= count) { return false; }
      return result;
    });

    if (handle instanceof AsyncHandle) {
      return handle;
    }

    return i === count;
  };

  /**
   * @constructor
   */
  function TakeIterator(sequence, count) {
    this.iterator = sequence.getIterator();
    this.count    = count;
  }

  TakeIterator.prototype.current = function current() {
    return this.iterator.current();
  };

  TakeIterator.prototype.moveNext = function moveNext() {
    return ((--this.count >= 0) && this.iterator.moveNext());
  };

  /**
   * Creates a new sequence comprising the elements from the head of this sequence
   * that satisfy some predicate. Once an element is encountered that doesn't
   * satisfy the predicate, iteration will stop.
   *
   * @public
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   *
   * @examples
   * function lessThan(x) {
   *   return function(y) {
   *     return y < x;
   *   };
   * }
   *
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(3)) // sequence: [1, 2]
   * Lazy([1, 2, 3, 4]).takeWhile(lessThan(0)) // sequence: []
   */
  Sequence.prototype.takeWhile = function takeWhile(predicate) {
    return new TakeWhileSequence(this, predicate);
  };

  /**
   * @constructor
   */
  function TakeWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  TakeWhileSequence.prototype = new Sequence();

  TakeWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate,
        finished = false,
        j = 0;

    var result = this.parent.each(function(e, i) {
      if (!predicate(e, i)) {
        finished = true;
        return false;
      }

      return fn(e, j++);
    });

    if (result instanceof AsyncHandle) {
      return result;
    }

    return finished;
  };

  /**
   * Creates a new sequence comprising all but the last N elements of this
   * sequence.
   *
   * @public
   * @param {number=} count The number of items to omit from the end of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).initial()                    // sequence: [1, 2, 3]
   * Lazy([1, 2, 3, 4]).initial(2)                   // sequence: [1, 2]
   * Lazy([1, 2, 3]).filter(Lazy.identity).initial() // sequence: [1, 2]
   */
  Sequence.prototype.initial = function initial(count) {
    if (typeof count === "undefined") {
      count = 1;
    }
    return this.take(this.getIndex().length() - count);
  };

  /**
   * Creates a new sequence comprising the last N elements of this sequence, OR
   * (if N is `undefined`) simply returns the last element of this sequence.
   *
   * @public
   * @param {number=} count The number of items to take from the end of the
   *     sequence.
   * @returns {*} The new sequence (or the last element from this sequence
   *     if no count was given).
   *
   * @examples
   * Lazy([1, 2, 3]).last()                 // => 3
   * Lazy([1, 2, 3]).last(2)                // sequence: [2, 3]
   * Lazy([1, 2, 3]).filter(isEven).last(2) // sequence: [2]
   */
  Sequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.reverse().first();
    }
    return this.reverse().take(count).reverse();
  };

  /**
   * Returns the first element in this sequence with property names and values
   * matching those of the specified object.
   *
   * @public
   * @param {Object} properties The properties that should be found on some
   *     element in this sequence.
   * @returns {*} The found element, or `undefined` if none exists in this
   *     sequence.
   *
   * @examples
   * var words = ["foo", "bar"];
   *
   * Lazy(words).findWhere({ 0: "f" }); // => "foo"
   * Lazy(words).findWhere({ 0: "z" }); // => undefined
   */
  Sequence.prototype.findWhere = function findWhere(properties) {
    return this.where(properties).first();
  };

  /**
   * Creates a new sequence comprising all but the first N elements of this
   * sequence.
   *
   * @public
   * @aka skip, tail, rest
   * @param {number=} count The number of items to omit from the beginning of the
   *     sequence (defaults to 1).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4]).rest()  // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(0) // sequence: [1, 2, 3, 4]
   * Lazy([1, 2, 3, 4]).rest(2) // sequence: [3, 4]
   * Lazy([1, 2, 3, 4]).rest(5) // sequence: []
   */
  Sequence.prototype.rest = function rest(count) {
    return new DropSequence(this, count);
  };

  Sequence.prototype.skip =
  Sequence.prototype.tail =
  Sequence.prototype.drop = function drop(count) {
    return this.rest(count);
  };

  /**
   * @constructor
   */
  function DropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  DropSequence.prototype = new Sequence();

  DropSequence.prototype.each = function each(fn) {
    var count   = this.count,
        dropped = 0,
        i       = 0;

    return this.parent.each(function(e) {
      if (dropped++ < count) { return; }
      return fn(e, i++);
    });
  };

  /**
   * Creates a new sequence comprising the elements from this sequence *after*
   * those that satisfy some predicate. The sequence starts with the first
   * element that does not match the predicate.
   *
   * @public
   * @aka skipWhile
   * @param {Function} predicate
   * @returns {Sequence} The new sequence
   */
  Sequence.prototype.dropWhile = function dropWhile(predicate) {
    return new DropWhileSequence(this, predicate);
  };

  Sequence.prototype.skipWhile = function skipWhile(predicate) {
    return this.dropWhile(predicate);
  };

  /**
   * @constructor
   */
  function DropWhileSequence(parent, predicate) {
    this.parent    = parent;
    this.predicate = predicate;
  }

  DropWhileSequence.prototype = new Sequence();

  DropWhileSequence.prototype.each = function each(fn) {
    var predicate = this.predicate,
        done      = false;

    return this.parent.each(function(e) {
      if (!done) {
        if (predicate(e)) {
          return;
        }

        done = true;
      }

      return fn(e);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, but ordered
   * using the specified comparison function.
   *
   * This has essentially the same behavior as calling
   * [`Array#sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort),
   * but obviously instead of modifying the collection it returns a new
   * {@link Sequence} object.
   *
   * @public
   * @param {Function=} sortFn The function used to compare elements in the
   *     sequence. The function will be passed two elements and should return:
   *     - 1 if the first is greater
   *     - -1 if the second is greater
   *     - 0 if the two values are the same
   * @param {boolean} descending Whether or not the resulting sequence should be
   *     in descending order (defaults to `false`).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([5, 10, 1]).sort()                // sequence: [1, 5, 10]
   * Lazy(['foo', 'bar']).sort()            // sequence: ['bar', 'foo']
   * Lazy(['b', 'c', 'a']).sort(null, true) // sequence: ['c', 'b', 'a']
   * Lazy([5, 10, 1]).sort(null, true)      // sequence: [10, 5, 1]
   *
   * // Sorting w/ custom comparison function
   * Lazy(['a', 'ab', 'aa', 'ba', 'b', 'abc']).sort(function compare(x, y) {
   *   if (x.length && (x.length !== y.length)) { return compare(x.length, y.length); }
   *   if (x === y) { return 0; }
   *   return x > y ? 1 : -1;
   * });
   * // => sequence: ['a', 'b', 'aa', 'ab', 'ba', 'abc']
   */
  Sequence.prototype.sort = function sort(sortFn, descending) {
    sortFn || (sortFn = compare);
    if (descending) { sortFn = reverseArguments(sortFn); }
    return new SortedSequence(this, sortFn);
  };

  /**
   * Creates a new sequence with the same elements as this one, but ordered by
   * the results of the given function.
   *
   * You can pass:
   *
   * - a *string*, to sort by the named property
   * - a function, to sort by the result of calling the function on each element
   *
   * @public
   * @param {Function} sortFn The function to call on the elements in this
   *     sequence, in order to sort them.
   * @param {boolean} descending Whether or not the resulting sequence should be
   *     in descending order (defaults to `false`).
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function population(country) {
   *   return country.pop;
   * }
   *
   * function area(country) {
   *   return country.sqkm;
   * }
   *
   * var countries = [
   *   { name: "USA", pop: 320000000, sqkm: 9600000 },
   *   { name: "Brazil", pop: 194000000, sqkm: 8500000 },
   *   { name: "Nigeria", pop: 174000000, sqkm: 924000 },
   *   { name: "China", pop: 1350000000, sqkm: 9700000 },
   *   { name: "Russia", pop: 143000000, sqkm: 17000000 },
   *   { name: "Australia", pop: 23000000, sqkm: 7700000 }
   * ];
   *
   * Lazy(countries).sortBy(population).last(3).pluck('name') // sequence: ["Brazil", "USA", "China"]
   * Lazy(countries).sortBy(area).last(3).pluck('name')       // sequence: ["USA", "China", "Russia"]
   * Lazy(countries).sortBy(area, true).first(3).pluck('name') // sequence: ["Russia", "China", "USA"]
   *
   * @benchmarks
   * var randoms = Lazy.generate(Math.random).take(100).toArray();
   *
   * Lazy(randoms).sortBy(Lazy.identity).each(Lazy.noop) // lazy
   * _.each(_.sortBy(randoms, Lazy.identity), _.noop)    // lodash
   */
  Sequence.prototype.sortBy = function sortBy(sortFn, descending) {
    sortFn = createComparator(sortFn);
    if (descending) { sortFn = reverseArguments(sortFn); }
    return new SortedSequence(this, sortFn);
  };

  /**
   * @constructor
   */
  function SortedSequence(parent, sortFn) {
    this.parent = parent;
    this.sortFn = sortFn;
  }

  SortedSequence.prototype = new Sequence();

  SortedSequence.prototype.each = function each(fn) {
    var sortFn = this.sortFn,
        result = this.parent.toArray();

    result.sort(sortFn);

    return forEach(result, fn);
  };

  /**
   * @examples
   * var items = [{ a: 4 }, { a: 3 }, { a: 5 }];
   *
   * Lazy(items).sortBy('a').reverse();
   * // => sequence: [{ a: 5 }, { a: 4 }, { a: 3 }]
   *
   * Lazy(items).sortBy('a').reverse().reverse();
   * // => sequence: [{ a: 3 }, { a: 4 }, { a: 5 }]
   */
  SortedSequence.prototype.reverse = function reverse() {
    return new SortedSequence(this.parent, reverseArguments(this.sortFn));
  };

  /**
   * Creates a new {@link ObjectLikeSequence} comprising the elements in this
   * one, grouped together according to some key. The value associated with each
   * key in the resulting object-like sequence is an array containing all of
   * the elements in this sequence with that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to group them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).groupBy(oddOrEven)            // sequence: { odd: [1, 3, 5], even: [2, 4] }
   * Lazy(numbers).groupBy(oddOrEven).get("odd") // => [1, 3, 5]
   * Lazy(numbers).groupBy(oddOrEven).get("foo") // => undefined
   *
   * Lazy([
   *   { name: 'toString' },
   *   { name: 'toString' }
   * ]).groupBy('name');
   * // => sequence: {
   *   'toString': [
   *     { name: 'toString' },
   *     { name: 'toString' }
   *   ]
   * }
   */
  Sequence.prototype.groupBy = function groupBy(keyFn) {
    return new GroupedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function GroupedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // GroupedSequence must have its prototype set after ObjectLikeSequence has
  // been fully initialized.

  /**
   * Creates a new {@link ObjectLikeSequence} comprising the elements in this
   * one, indexed according to some key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to index them, or a string
   *     representing a property to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var people = [
   *   { name: 'Bob', age: 25 },
   *   { name: 'Fred', age: 34 }
   * ];
   *
   * var bob  = people[0],
   *     fred = people[1];
   *
   * Lazy(people).indexBy('name') // sequence: { 'Bob': bob, 'Fred': fred }
   */
  Sequence.prototype.indexBy = function(keyFn) {
    return new IndexedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function IndexedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // IndexedSequence must have its prototype set after ObjectLikeSequence has
  // been fully initialized.

  /**
   * Creates a new {@link ObjectLikeSequence} containing the unique keys of all
   * the elements in this sequence, each paired with the number of elements
   * in this sequence having that key.
   *
   * @public
   * @param {Function|string} keyFn The function to call on the elements in this
   *     sequence to obtain a key by which to count them, or a string representing
   *     a parameter to read from all the elements in this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * function oddOrEven(x) {
   *   return x % 2 === 0 ? 'even' : 'odd';
   * }
   *
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).countBy(oddOrEven)            // sequence: { odd: 3, even: 2 }
   * Lazy(numbers).countBy(oddOrEven).get("odd") // => 3
   * Lazy(numbers).countBy(oddOrEven).get("foo") // => undefined
   */
  Sequence.prototype.countBy = function countBy(keyFn) {
    return new CountedSequence(this, keyFn);
  };

  /**
   * @constructor
   */
  function CountedSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  // CountedSequence, like GroupedSequence, must have its prototype set after
  // ObjectLikeSequence has been fully initialized.

  /**
   * Creates a new sequence with every unique element from this one appearing
   * exactly once (i.e., with duplicates removed).
   *
   * @public
   * @aka unique
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 2, 3, 3, 3]).uniq() // sequence: [1, 2, 3]
   *
   * @benchmarks
   * function randomOf(array) {
   *   return function() {
   *     return array[Math.floor(Math.random() * array.length)];
   *   };
   * }
   *
   * var mostUnique = Lazy.generate(randomOf(_.range(100)), 100).toArray(),
   *     someUnique = Lazy.generate(randomOf(_.range(50)), 100).toArray(),
   *     mostDupes  = Lazy.generate(randomOf(_.range(5)), 100).toArray();
   *
   * Lazy(mostUnique).uniq().each(Lazy.noop) // lazy - mostly unique elements
   * Lazy(someUnique).uniq().each(Lazy.noop) // lazy - some unique elements
   * Lazy(mostDupes).uniq().each(Lazy.noop)  // lazy - mostly duplicate elements
   * _.each(_.uniq(mostUnique), _.noop)      // lodash - mostly unique elements
   * _.each(_.uniq(someUnique), _.noop)      // lodash - some unique elements
   * _.each(_.uniq(mostDupes), _.noop)       // lodash - mostly duplicate elements
   */
  Sequence.prototype.uniq = function uniq(keyFn) {
    return new UniqueSequence(this, keyFn);
  };

  Sequence.prototype.unique = function unique(keyFn) {
    return this.uniq(keyFn);
  };

  /**
   * @constructor
   */
  function UniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.keyFn  = keyFn;
  }

  UniqueSequence.prototype = new Sequence();

  UniqueSequence.prototype.each = function each(fn) {
    var cache = new Set(),
        keyFn = this.keyFn,
        i     = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      return this.parent.each(function(e) {
        if (cache.add(keyFn(e))) {
          return fn(e, i++);
        }
      });

    } else {
      return this.parent.each(function(e) {
        if (cache.add(e)) {
          return fn(e, i++);
        }
      });
    }
  };

  /**
   * Creates a new sequence by combining the elements from this sequence with
   * corresponding elements from the specified array(s).
   *
   * @public
   * @param {...Array} var_args One or more arrays of elements to combine with
   *     those of this sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2]).zip([3, 4]) // sequence: [[1, 3], [2, 4]]
   *
   * @benchmarks
   * var smArrL = Lazy.range(10).toArray(),
   *     smArrR = Lazy.range(10, 20).toArray(),
   *     lgArrL = Lazy.range(100).toArray(),
   *     lgArrR = Lazy.range(100, 200).toArray();
   *
   * Lazy(smArrL).zip(smArrR).each(Lazy.noop) // lazy - zipping 10-element arrays
   * Lazy(lgArrL).zip(lgArrR).each(Lazy.noop) // lazy - zipping 100-element arrays
   * _.each(_.zip(smArrL, smArrR), _.noop)    // lodash - zipping 10-element arrays
   * _.each(_.zip(lgArrL, lgArrR), _.noop)    // lodash - zipping 100-element arrays
   */
  Sequence.prototype.zip = function zip(var_args) {
    if (arguments.length === 1) {
      return new SimpleZippedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new ZippedSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function ZippedSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  ZippedSequence.prototype = new Sequence();

  ZippedSequence.prototype.each = function each(fn) {
    var arrays = this.arrays,
        i = 0;
    this.parent.each(function(e) {
      var group = [e];
      for (var j = 0; j < arrays.length; ++j) {
        if (arrays[j].length > i) {
          group.push(arrays[j][i]);
        }
      }
      return fn(group, i++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, in a randomized
   * order.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).shuffle().value() // =~ [1, 2, 3, 4, 5]
   */
  Sequence.prototype.shuffle = function shuffle() {
    return new ShuffledSequence(this);
  };

  /**
   * @constructor
   */
  function ShuffledSequence(parent) {
    this.parent = parent;
  }

  ShuffledSequence.prototype = new Sequence();

  ShuffledSequence.prototype.each = function each(fn) {
    var shuffled = this.parent.toArray(),
        floor = Math.floor,
        random = Math.random,
        j = 0;

    for (var i = shuffled.length - 1; i > 0; --i) {
      swap(shuffled, i, floor(random() * i) + 1);
      if (fn(shuffled[i], j++) === false) {
        return;
      }
    }
    fn(shuffled[0], j);
  };

  /**
   * Creates a new sequence with every element from this sequence, and with arrays
   * exploded so that a sequence of arrays (of arrays) becomes a flat sequence of
   * values.
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, [2, 3], [4, [5]]]).flatten() // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, Lazy([2, 3])]).flatten()     // sequence: [1, 2, 3]
   */
  Sequence.prototype.flatten = function flatten() {
    return new FlattenedSequence(this);
  };

  /**
   * @constructor
   */
  function FlattenedSequence(parent) {
    this.parent = parent;
  }

  FlattenedSequence.prototype = new Sequence();

  FlattenedSequence.prototype.each = function each(fn) {
    var index = 0;

    return this.parent.each(function recurseVisitor(e) {
      if (e instanceof Array) {
        return forEach(e, recurseVisitor);
      }

      if (e instanceof Sequence) {
        return e.each(recurseVisitor);
      }

      return fn(e, index++);
    });
  };

  /**
   * Creates a new sequence with the same elements as this one, except for all
   * falsy values (`false`, `0`, `""`, `null`, and `undefined`).
   *
   * @public
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", null, "bar", undefined]).compact() // sequence: ["foo", "bar"]
   */
  Sequence.prototype.compact = function compact() {
    return this.filter(function(e) { return !!e; });
  };

  /**
   * Creates a new sequence with all the elements of this sequence that are not
   * also among the specified arguments.
   *
   * @public
   * @aka difference
   * @param {...*} var_args The values, or array(s) of values, to be excluded from the
   *     resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).without(2, 3)   // sequence: [1, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).without([4, 5]) // sequence: [1, 2, 3]
   */
  Sequence.prototype.without = function without(var_args) {
    return new WithoutSequence(this, arraySlice.call(arguments, 0));
  };

  Sequence.prototype.difference = function difference(var_args) {
    return this.without.apply(this, arguments);
  };

  /**
   * @constructor
   */
  function WithoutSequence(parent, values) {
    this.parent = parent;
    this.values = values;
  }

  WithoutSequence.prototype = new Sequence();

  WithoutSequence.prototype.each = function each(fn) {
    var set = createSet(this.values),
        i = 0;
    return this.parent.each(function(e) {
      if (!set.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  /**
   * Creates a new sequence with all the unique elements either in this sequence
   * or among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, to be additionally
   *     included in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).union([])             // sequence: ["foo", "bar"]
   * Lazy(["foo", "bar"]).union(["bar", "baz"]) // sequence: ["foo", "bar", "baz"]
   */
  Sequence.prototype.union = function union(var_args) {
    return this.concat(var_args).uniq();
  };

  /**
   * Creates a new sequence with all the elements of this sequence that also
   * appear among the specified arguments.
   *
   * @public
   * @param {...*} var_args The values, or array(s) of values, in which elements
   *     from this sequence must also be included to end up in the resulting sequence.
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * Lazy(["foo", "bar"]).intersection([])             // sequence: []
   * Lazy(["foo", "bar"]).intersection(["bar", "baz"]) // sequence: ["bar"]
   */
  Sequence.prototype.intersection = function intersection(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new SimpleIntersectionSequence(this, (/** @type {Array} */ var_args));
    } else {
      return new IntersectionSequence(this, arraySlice.call(arguments, 0));
    }
  };

  /**
   * @constructor
   */
  function IntersectionSequence(parent, arrays) {
    this.parent = parent;
    this.arrays = arrays;
  }

  IntersectionSequence.prototype = new Sequence();

  IntersectionSequence.prototype.each = function each(fn) {
    var sets = Lazy(this.arrays).map(function(values) {
      return new UniqueMemoizer(Lazy(values).getIterator());
    });

    var setIterator = new UniqueMemoizer(sets.getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      var includedInAll = true;
      setIterator.each(function(set) {
        if (!set.contains(e)) {
          includedInAll = false;
          return false;
        }
      });

      if (includedInAll) {
        return fn(e, i++);
      }
    });
  };

  /**
   * @constructor
   */
  function UniqueMemoizer(iterator) {
    this.iterator     = iterator;
    this.set          = new Set();
    this.memo         = [];
    this.currentValue = undefined;
  }

  UniqueMemoizer.prototype.current = function current() {
    return this.currentValue;
  };

  UniqueMemoizer.prototype.moveNext = function moveNext() {
    var iterator = this.iterator,
        set = this.set,
        memo = this.memo,
        current;

    while (iterator.moveNext()) {
      current = iterator.current();
      if (set.add(current)) {
        memo.push(current);
        this.currentValue = current;
        return true;
      }
    }
    return false;
  };

  UniqueMemoizer.prototype.each = function each(fn) {
    var memo = this.memo,
        length = memo.length,
        i = -1;

    while (++i < length) {
      if (fn(memo[i], i) === false) {
        return false;
      }
    }

    while (this.moveNext()) {
      if (fn(this.currentValue, i++) === false) {
        break;
      }
    }
  };

  UniqueMemoizer.prototype.contains = function contains(e) {
    if (this.set.contains(e)) {
      return true;
    }

    while (this.moveNext()) {
      if (this.currentValue === e) {
        return true;
      }
    }

    return false;
  };

  /**
   * Checks whether every element in this sequence satisfies a given predicate.
   *
   * @public
   * @aka all
   * @param {Function} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for every element in the
   *     sequence (or the sequence is empty). False if `predicate` returns false
   *     for at least one element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * var objects = [{ foo: true }, { foo: false, bar: true }];
   *
   * Lazy(numbers).every(isEven)     // => false
   * Lazy(numbers).every(isPositive) // => true
   * Lazy(objects).all('foo')        // => false
   * Lazy(objects).all('bar')        // => false
   */
  Sequence.prototype.every = function every(predicate) {
    predicate = createCallback(predicate);

    return this.each(function(e, i) {
      return !!predicate(e, i);
    });
  };

  Sequence.prototype.all = function all(predicate) {
    return this.every(predicate);
  };

  /**
   * Checks whether at least one element in this sequence satisfies a given
   * predicate (or, if no predicate is specified, whether the sequence contains at
   * least one element).
   *
   * @public
   * @aka any
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` returns true for at least one element
   *     in the sequence. False if `predicate` returns false for every element (or
   *     the sequence is empty).
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).some()           // => true
   * Lazy(numbers).some(isEven)     // => true
   * Lazy(numbers).some(isNegative) // => false
   * Lazy([]).some()                // => false
   */
  Sequence.prototype.some = function some(predicate) {
    predicate = createCallback(predicate, true);

    var success = false;
    this.each(function(e) {
      if (predicate(e)) {
        success = true;
        return false;
      }
    });
    return success;
  };

  Sequence.prototype.any = function any(predicate) {
    return this.some(predicate);
  };

  /**
   * Checks whether NO elements in this sequence satisfy the given predicate
   * (the opposite of {@link Sequence#all}, basically).
   *
   * @public
   * @param {Function=} predicate A function to call on (potentially) every element
   *     in this sequence.
   * @returns {boolean} True if `predicate` does not return true for any element
   *     in the sequence. False if `predicate` returns true for at least one
   *     element.
   *
   * @examples
   * var numbers = [1, 2, 3, 4, 5];
   *
   * Lazy(numbers).none()           // => false
   * Lazy(numbers).none(isEven)     // => false
   * Lazy(numbers).none(isNegative) // => true
   * Lazy([]).none(isEven)          // => true
   * Lazy([]).none(isNegative)      // => true
   * Lazy([]).none()                // => true
   */
  Sequence.prototype.none = function none(predicate) {
    return !this.any(predicate);
  };

  /**
   * Checks whether the sequence has no elements.
   *
   * @public
   * @returns {boolean} True if the sequence is empty, false if it contains at
   *     least one element.
   *
   * @examples
   * Lazy([]).isEmpty()        // => true
   * Lazy([1, 2, 3]).isEmpty() // => false
   */
  Sequence.prototype.isEmpty = function isEmpty() {
    return !this.any();
  };

  /**
   * Performs (at worst) a linear search from the head of this sequence,
   * returning the first index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The index within this sequence where the given value is
   *     located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * function reciprocal(x) { return 1 / x; }
   *
   * Lazy(["foo", "bar", "baz"]).indexOf("bar")   // => 1
   * Lazy([1, 2, 3]).indexOf(4)                   // => -1
   * Lazy([1, 2, 3]).map(reciprocal).indexOf(0.5) // => 1
   */
  Sequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;
    this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });
    return foundIndex;
  };

  /**
   * Performs (at worst) a linear search from the tail of this sequence,
   * returning the last index at which the specified value is found.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} The last index within this sequence where the given value
   *     is located, or -1 if the sequence doesn't contain the value.
   *
   * @examples
   * Lazy(["a", "b", "c", "b", "a"]).lastIndexOf("b")    // => 3
   * Lazy([1, 2, 3]).lastIndexOf(0)                      // => -1
   * Lazy([2, 2, 1, 2, 4]).filter(isEven).lastIndexOf(2) // 2
   */
  Sequence.prototype.lastIndexOf = function lastIndexOf(value) {
    var index = this.reverse().indexOf(value);
    if (index !== -1) {
      index = this.getIndex().length() - index - 1;
    }
    return index;
  };

  /**
   * Performs a binary search of this sequence, returning the lowest index where
   * the given value is either found, or where it belongs (if it is not already
   * in the sequence).
   *
   * This method assumes the sequence is in sorted order and will fail otherwise.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {number} An index within this sequence where the given value is
   *     located, or where it belongs in sorted order.
   *
   * @examples
   * Lazy([1, 3, 6, 9]).sortedIndex(3)                    // => 1
   * Lazy([1, 3, 6, 9]).sortedIndex(7)                    // => 3
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(10) // => 0
   * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(12) // => 1
   */
  Sequence.prototype.sortedIndex = function sortedIndex(value) {
    var indexed = this.getIndex(),
        lower   = 0,
        upper   = indexed.length(),
        i;

    while (lower < upper) {
      i = (lower + upper) >>> 1;
      if (compare(indexed.get(i), value) === -1) {
        lower = i + 1;
      } else {
        upper = i;
      }
    }
    return lower;
  };

  /**
   * Checks whether the given value is in this sequence.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {boolean} True if the sequence contains the value, false if not.
   *
   * @examples
   * var numbers = [5, 10, 15, 20];
   *
   * Lazy(numbers).contains(15) // => true
   * Lazy(numbers).contains(13) // => false
   */
  Sequence.prototype.contains = function contains(value) {
    return this.indexOf(value) !== -1;
  };

  /**
   * Aggregates a sequence into a single value according to some accumulator
   * function.
   *
   * For an asynchronous sequence, instead of immediately returning a result
   * (which it can't, obviously), this method returns an {@link AsyncHandle}
   * whose `onComplete` method can be called to supply a callback to handle the
   * final result once iteration has completed.
   *
   * @public
   * @aka inject, foldl
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*=} memo The starting value to use for the aggregated result
   *     (defaults to the first element in the sequence).
   * @returns {*} The result of the aggregation, or, for asynchronous sequences,
   *     an {@link AsyncHandle} whose `onComplete` method accepts a callback to
   *     handle the final result.
   *
   * @examples
   * function multiply(x, y) { return x * y; }
   *
   * var numbers = [1, 2, 3, 4];
   *
   * Lazy(numbers).reduce(multiply)    // => 24
   * Lazy(numbers).reduce(multiply, 5) // => 120
   */
  Sequence.prototype.reduce = function reduce(aggregator, memo) {
    if (arguments.length < 2) {
      return this.tail().reduce(aggregator, this.head());
    }

    var eachResult = this.each(function(e, i) {
      memo = aggregator(memo, e, i);
    });

    // TODO: Think of a way more efficient solution to this problem.
    if (eachResult instanceof AsyncHandle) {
      return eachResult.then(function() { return memo; });
    }

    return memo;
  };

  Sequence.prototype.inject =
  Sequence.prototype.foldl = function foldl(aggregator, memo) {
    return this.reduce(aggregator, memo);
  };

  /**
   * Aggregates a sequence, from the tail, into a single value according to some
   * accumulator function.
   *
   * @public
   * @aka foldr
   * @param {Function} aggregator The function through which to pass every element
   *     in the sequence. For every element, the function will be passed the total
   *     aggregated result thus far and the element itself, and should return a
   *     new aggregated result.
   * @param {*} memo The starting value to use for the aggregated result.
   * @returns {*} The result of the aggregation.
   *
   * @examples
   * function append(s1, s2) {
   *   return s1 + s2;
   * }
   *
   * function isVowel(str) {
   *   return "aeiou".indexOf(str) !== -1;
   * }
   *
   * Lazy("abcde").reduceRight(append)                 // => "edcba"
   * Lazy("abcde").filter(isVowel).reduceRight(append) // => "ea"
   */
  Sequence.prototype.reduceRight = function reduceRight(aggregator, memo) {
    if (arguments.length < 2) {
      return this.initial(1).reduceRight(aggregator, this.last());
    }

    // This bothers me... but frankly, calling reverse().reduce() is potentially
    // going to eagerly evaluate the sequence anyway; so it's really not an issue.
    var i = this.getIndex().length() - 1;
    return this.reverse().reduce(function(m, e) {
      return aggregator(m, e, i--);
    }, memo);
  };

  Sequence.prototype.foldr = function foldr(aggregator, memo) {
    return this.reduceRight(aggregator, memo);
  };

  /**
   * Groups this sequence into consecutive (overlapping) segments of a specified
   * length. If the underlying sequence has fewer elements than the specfied
   * length, then this sequence will be empty.
   *
   * @public
   * @param {number} length The length of each consecutive segment.
   * @returns {Sequence} The resulting sequence of consecutive segments.
   *
   * @examples
   * Lazy([]).consecutive(2)        // => sequence: []
   * Lazy([1]).consecutive(2)       // => sequence: []
   * Lazy([1, 2]).consecutive(2)    // => sequence: [[1, 2]]
   * Lazy([1, 2, 3]).consecutive(2) // => sequence: [[1, 2], [2, 3]]
   * Lazy([1, 2, 3]).consecutive(0) // => sequence: [[]]
   * Lazy([1, 2, 3]).consecutive(1) // => sequence: [[1], [2], [3]]
   */
  Sequence.prototype.consecutive = function consecutive(count) {
    var queue    = new Queue(count);
    var segments = this.map(function(element) {
      if (queue.add(element).count === count) {
        return queue.toArray();
      }
    });
    return segments.compact();
  };

  /**
   * Breaks this sequence into chunks (arrays) of a specified length.
   *
   * @public
   * @param {number} size The size of each chunk.
   * @returns {Sequence} The resulting sequence of chunks.
   *
   * @examples
   * Lazy([]).chunk(2)        // sequence: []
   * Lazy([1, 2, 3]).chunk(2) // sequence: [[1, 2], [3]]
   * Lazy([1, 2, 3]).chunk(1) // sequence: [[1], [2], [3]]
   * Lazy([1, 2, 3]).chunk(4) // sequence: [[1, 2, 3]]
   * Lazy([1, 2, 3]).chunk(0) // throws
   */
  Sequence.prototype.chunk = function chunk(size) {
    if (size < 1) {
      throw new Error("You must specify a positive chunk size.");
    }

    return new ChunkedSequence(this, size);
  };

  /**
   * @constructor
   */
  function ChunkedSequence(parent, size) {
    this.parent    = parent;
    this.chunkSize = size;
  }

  ChunkedSequence.prototype = new Sequence();

  ChunkedSequence.prototype.getIterator = function getIterator() {
    return new ChunkedIterator(this.parent, this.chunkSize);
  };

  /**
   * @constructor
   */
  function ChunkedIterator(sequence, size) {
    this.iterator = sequence.getIterator();
    this.size     = size;
  }

  ChunkedIterator.prototype.current = function current() {
    return this.currentChunk;
  };

  ChunkedIterator.prototype.moveNext = function moveNext() {
    var iterator  = this.iterator,
        chunkSize = this.size,
        chunk     = [];

    while (chunk.length < chunkSize && iterator.moveNext()) {
      chunk.push(iterator.current());
    }

    if (chunk.length === 0) {
      return false;
    }

    this.currentChunk = chunk;
    return true;
  };

  /**
   * Passes each element in the sequence to the specified callback during
   * iteration. This is like {@link Sequence#each}, except that it can be
   * inserted anywhere in the middle of a chain of methods to "intercept" the
   * values in the sequence at that point.
   *
   * @public
   * @param {Function} callback A function to call on every element in the
   *     sequence during iteration. The return value of this function does not
   *     matter.
   * @returns {Sequence} A sequence comprising the same elements as this one.
   *
   * @examples
   * Lazy([1, 2, 3]).tap(fn).each(Lazy.noop); // calls fn 3 times
   */
  Sequence.prototype.tap = function tap(callback) {
    return new TappedSequence(this, callback);
  };

  /**
   * @constructor
   */
  function TappedSequence(parent, callback) {
    this.parent = parent;
    this.callback = callback;
  }

  TappedSequence.prototype = new Sequence();

  TappedSequence.prototype.each = function each(fn) {
    var callback = this.callback;
    return this.parent.each(function(e, i) {
      callback(e, i);
      return fn(e, i);
    });
  };

  /**
   * Seaches for the first element in the sequence satisfying a given predicate.
   *
   * @public
   * @aka detect
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {*} The first element in the sequence for which `predicate` returns
   *     `true`, or `undefined` if no such element is found.
   *
   * @examples
   * function divisibleBy3(x) {
   *   return x % 3 === 0;
   * }
   *
   * var numbers = [5, 6, 7, 8, 9, 10];
   *
   * Lazy(numbers).find(divisibleBy3) // => 6
   * Lazy(numbers).find(isNegative)   // => undefined
   */
  Sequence.prototype.find = function find(predicate) {
    return this.filter(predicate).first();
  };

  Sequence.prototype.detect = function detect(predicate) {
    return this.find(predicate);
  };

  /**
   * Gets the minimum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the lowest value in the sequence, or
   *     `Infinity` if the sequence is empty.
   *
   * @examples
   * function negate(x) { return x * -1; }
   *
   * Lazy([]).min()                       // => Infinity
   * Lazy([6, 18, 2, 49, 34]).min()       // => 2
   * Lazy([6, 18, 2, 49, 34]).min(negate) // => 49
   */
  Sequence.prototype.min = function min(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.minBy(valueFn);
    }

    return this.reduce(function(x, y) { return y < x ? y : x; }, Infinity);
  };

  Sequence.prototype.minBy = function minBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) < valueFn(x) ? y : x; });
  };

  /**
   * Gets the maximum value in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function by which the value for comparison is
   *     calculated for each element in the sequence.
   * @returns {*} The element with the highest value in the sequence, or
   *     `-Infinity` if the sequence is empty.
   *
   * @examples
   * function reverseDigits(x) {
   *   return Number(String(x).split('').reverse().join(''));
   * }
   *
   * Lazy([]).max()                              // => -Infinity
   * Lazy([6, 18, 2, 48, 29]).max()              // => 48
   * Lazy([6, 18, 2, 48, 29]).max(reverseDigits) // => 29
   */
  Sequence.prototype.max = function max(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.maxBy(valueFn);
    }

    return this.reduce(function(x, y) { return y > x ? y : x; }, -Infinity);
  };

  Sequence.prototype.maxBy = function maxBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return valueFn(y) > valueFn(x) ? y : x; });
  };

  /**
   * Gets the sum of the values in the sequence.
   *
   * @public
   * @param {Function=} valueFn The function used to select the values that will
   *     be summed up.
   * @returns {*} The sum.
   *
   * @examples
   * Lazy([]).sum()                     // => 0
   * Lazy([1, 2, 3, 4]).sum()           // => 10
   * Lazy([1.2, 3.4]).sum(Math.floor)   // => 4
   * Lazy(['foo', 'bar']).sum('length') // => 6
   */
  Sequence.prototype.sum = function sum(valueFn) {
    if (typeof valueFn !== "undefined") {
      return this.sumBy(valueFn);
    }

    return this.reduce(function(x, y) { return x + y; }, 0);
  };

  Sequence.prototype.sumBy = function sumBy(valueFn) {
    valueFn = createCallback(valueFn);
    return this.reduce(function(x, y) { return x + valueFn(y); }, 0);
  };

  /**
   * Creates a string from joining together all of the elements in this sequence,
   * separated by the given delimiter.
   *
   * @public
   * @aka toString
   * @param {string=} delimiter The separator to insert between every element from
   *     this sequence in the resulting string (defaults to `","`).
   * @returns {string} The delimited string.
   *
   * @examples
   * Lazy([6, 29, 1984]).join("/")  // => "6/29/1984"
   * Lazy(["a", "b", "c"]).join()   // => "a,b,c"
   * Lazy(["a", "b", "c"]).join("") // => "abc"
   * Lazy([1, 2, 3]).join()         // => "1,2,3"
   * Lazy([1, 2, 3]).join("")       // => "123"
   */
  Sequence.prototype.join = function join(delimiter) {
    delimiter = typeof delimiter === "string" ? delimiter : ",";

    return this.reduce(function(str, e) {
      if (str.length > 0) {
        str += delimiter;
      }
      return str + e;
    }, "");
  };

  Sequence.prototype.toString = function toString(delimiter) {
    return this.join(delimiter);
  };

  /**
   * Creates a sequence, with the same elements as this one, that will be iterated
   * over asynchronously when calling `each`.
   *
   * @public
   * @param {number=} interval The approximate period, in milliseconds, that
   *     should elapse between each element in the resulting sequence. Omitting
   *     this argument will result in the fastest possible asynchronous iteration.
   * @returns {AsyncSequence} The new asynchronous sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).async(100).each(fn) // calls fn 3 times asynchronously
   */
  Sequence.prototype.async = function async(interval) {
    return new AsyncSequence(this, interval);
  };

  /**
   * @constructor
   */
  function SimpleIntersectionSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
    this.each   = getEachForIntersection(array);
  }

  SimpleIntersectionSequence.prototype = new Sequence();

  SimpleIntersectionSequence.prototype.eachMemoizerCache = function eachMemoizerCache(fn) {
    var iterator = new UniqueMemoizer(Lazy(this.array).getIterator()),
        i = 0;

    return this.parent.each(function(e) {
      if (iterator.contains(e)) {
        return fn(e, i++);
      }
    });
  };

  SimpleIntersectionSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    var array = this.array,
        find  = arrayContains,
        i = 0;

    return this.parent.each(function(e) {
      if (find(array, e)) {
        return fn(e, i++);
      }
    });
  };

  function getEachForIntersection(source) {
    if (source.length < 40) {
      return SimpleIntersectionSequence.prototype.eachArrayCache;
    } else {
      return SimpleIntersectionSequence.prototype.eachMemoizerCache;
    }
  }

  /**
   * An optimized version of {@link ZippedSequence}, when zipping a sequence with
   * only one array.
   *
   * @param {Sequence} parent The underlying sequence.
   * @param {Array} array The array with which to zip the sequence.
   * @constructor
   */
  function SimpleZippedSequence(parent, array) {
    this.parent = parent;
    this.array  = array;
  }

  SimpleZippedSequence.prototype = new Sequence();

  SimpleZippedSequence.prototype.each = function each(fn) {
    var array = this.array;
    return this.parent.each(function(e, i) {
      return fn([e, array[i]], i);
    });
  };

  /**
   * An `ArrayLikeSequence` is a {@link Sequence} that provides random access to
   * its elements. This extends the API for iterating with the additional methods
   * {@link #get} and {@link #length}, allowing a sequence to act as a "view" into
   * a collection or other indexed data source.
   *
   * The initial sequence created by wrapping an array with `Lazy(array)` is an
   * `ArrayLikeSequence`.
   *
   * All methods of `ArrayLikeSequence` that conceptually should return
   * something like a array (with indexed access) return another
   * `ArrayLikeSequence`, for example:
   *
   * - {@link Sequence#map}
   * - {@link ArrayLikeSequence#slice}
   * - {@link Sequence#take} and {@link Sequence#drop}
   * - {@link Sequence#reverse}
   *
   * The above is not an exhaustive list. There are also certain other cases
   * where it might be possible to return an `ArrayLikeSequence` (e.g., calling
   * {@link Sequence#concat} with a single array argument), but this is not
   * guaranteed by the API.
   *
   * Note that in many cases, it is not possible to provide indexed access
   * without first performing at least a partial iteration of the underlying
   * sequence. In these cases an `ArrayLikeSequence` will not be returned:
   *
   * - {@link Sequence#filter}
   * - {@link Sequence#uniq}
   * - {@link Sequence#union}
   * - {@link Sequence#intersect}
   *
   * etc. The above methods only return ordinary {@link Sequence} objects.
   *
   * Defining custom array-like sequences
   * ------------------------------------
   *
   * Creating a custom `ArrayLikeSequence` is essentially the same as creating a
   * custom {@link Sequence}. You just have a couple more methods you need to
   * implement: `get` and (optionally) `length`.
   *
   * Here's an example. Let's define a sequence type called `OffsetSequence` that
   * offsets each of its parent's elements by a set distance, and circles back to
   * the beginning after reaching the end. **Remember**: the initialization
   * function you pass to {@link #define} should always accept a `parent` as its
   * first parameter.
   *
   *     ArrayLikeSequence.define("offset", {
   *       init: function(parent, offset) {
   *         this.offset = offset;
   *       },
   *
   *       get: function(i) {
   *         return this.parent.get((i + this.offset) % this.parent.length());
   *       }
   *     });
   *
   * It's worth noting a couple of things here.
   *
   * First, Lazy's default implementation of `length` simply returns the parent's
   * length. In this case, since an `OffsetSequence` will always have the same
   * number of elements as its parent, that implementation is fine; so we don't
   * need to override it.
   *
   * Second, the default implementation of `each` uses `get` and `length` to
   * essentially create a `for` loop, which is fine here. If you want to implement
   * `each` your own way, you can do that; but in most cases (as here), you can
   * probably just stick with the default.
   *
   * So we're already done, after only implementing `get`! Pretty easy, huh?
   *
   * Now the `offset` method will be chainable from any `ArrayLikeSequence`. So
   * for example:
   *
   *     Lazy([1, 2, 3]).map(mapFn).offset(3);
   *
   * ...will work, but:
   *
   *     Lazy([1, 2, 3]).filter(mapFn).offset(3);
   *
   * ...will not (because `filter` does not return an `ArrayLikeSequence`).
   *
   * (Also, as with the example provided for defining custom {@link Sequence}
   * types, this example really could have been implemented using a function
   * already available as part of Lazy.js: in this case, {@link Sequence#map}.)
   *
   * @public
   * @constructor
   *
   * @examples
   * Lazy([1, 2, 3])                    // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).take(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).drop(2)            // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).reverse()          // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2, 3]).slice(1, 2)        // instanceof Lazy.ArrayLikeSequence
   */
  function ArrayLikeSequence() {}

  ArrayLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ArrayLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ArrayLikeSequence` prototype so that it can be chained with any other
   *     methods that return array-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `get`. *May* include `init`,
   *     `length`, `getIterator`, and `each`. For each function, `this` will be
   *     the new sequence and `this.parent` will be the source sequence.
   * @returns {Function} A constructor for a new type inheriting from
   *     `ArrayLikeSequence`.
   *
   * @examples
   * Lazy.ArrayLikeSequence.define("offset", {
   *   init: function(offset) {
   *     this.offset = offset;
   *   },
   *
   *   get: function(i) {
   *     return this.parent.get((i + this.offset) % this.parent.length());
   *   }
   * });
   *
   * Lazy([1, 2, 3]).offset(1) // sequence: [2, 3, 1]
   */
  ArrayLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw new Error("A custom array-like sequence must implement *at least* get!");
    }

    return defineSequenceType(ArrayLikeSequence, methodName, overrides);
  };

  /**
   * Returns the element at the specified index.
   *
   * @public
   * @param {number} i The index to access.
   * @returns {*} The element.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([1, 2, 3]).get(1)                // => 2
   * Lazy([1, 2, 3]).get(-1)               // => undefined
   * Lazy([1, 2, 3]).map(increment).get(1) // => 3
   */
  ArrayLikeSequence.prototype.get = function get(i) {
    return this.parent.get(i);
  };

  /**
   * Returns the length of the sequence.
   *
   * @public
   * @returns {number} The length.
   *
   * @examples
   * function increment(x) { return x + 1; }
   *
   * Lazy([]).length()                       // => 0
   * Lazy([1, 2, 3]).length()                // => 3
   * Lazy([1, 2, 3]).map(increment).length() // => 3
   */
  ArrayLikeSequence.prototype.length = function length() {
    return this.parent.length();
  };

  /**
   * Returns the current sequence (since it is already indexed).
   */
  ArrayLikeSequence.prototype.getIndex = function getIndex() {
    return this;
  };

  /**
   * An optimized version of {@link Sequence#getIterator}.
   */
  ArrayLikeSequence.prototype.getIterator = function getIterator() {
    return new IndexedIterator(this);
  };

  /**
   * An optimized version of {@link Iterator} meant to work with already-indexed
   * sequences.
   *
   * @param {ArrayLikeSequence} sequence The sequence to iterate over.
   * @constructor
   */
  function IndexedIterator(sequence) {
    this.sequence = sequence;
    this.index    = -1;
  }

  IndexedIterator.prototype.current = function current() {
    return this.sequence.get(this.index);
  };

  IndexedIterator.prototype.moveNext = function moveNext() {
    if (this.index >= this.sequence.length() - 1) {
      return false;
    }

    ++this.index;
    return true;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayLikeSequence.prototype.each = function each(fn) {
    var length = this.length(),
        i = -1;

    while (++i < length) {
      if (fn(this.get(i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the last
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).pop() // sequence: [1, 2]
   * Lazy([]).pop()        // sequence: []
   */
  ArrayLikeSequence.prototype.pop = function pop() {
    return this.initial();
  };

  /**
   * Returns a new sequence with the same elements as this one, minus the first
   * element.
   *
   * @public
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3]).shift() // sequence: [2, 3]
   * Lazy([]).shift()        // sequence: []
   */
  ArrayLikeSequence.prototype.shift = function shift() {
    return this.drop();
  };

  /**
   * Returns a new sequence comprising the portion of this sequence starting
   * from the specified starting index and continuing until the specified ending
   * index or to the end of the sequence.
   *
   * @public
   * @param {number} begin The index at which the new sequence should start.
   * @param {number=} end The index at which the new sequence should end.
   * @returns {ArrayLikeSequence} The new array-like sequence.
   *
   * @examples
   * Lazy([1, 2, 3, 4, 5]).slice(0)     // sequence: [1, 2, 3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2)     // sequence: [3, 4, 5]
   * Lazy([1, 2, 3, 4, 5]).slice(2, 4)  // sequence: [3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(-1)    // sequence: [5]
   * Lazy([1, 2, 3, 4, 5]).slice(1, -1) // sequence: [2, 3, 4]
   * Lazy([1, 2, 3, 4, 5]).slice(0, 10) // sequence: [1, 2, 3, 4, 5]
   */
  ArrayLikeSequence.prototype.slice = function slice(begin, end) {
    var length = this.length();

    if (begin < 0) {
      begin = length + begin;
    }

    var result = this.drop(begin);

    if (typeof end === "number") {
      if (end < 0) {
        end = length + end;
      }
      result = result.take(end - begin);
    }

    return result;
  };

  /**
   * An optimized version of {@link Sequence#map}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.map = function map(mapFn) {
    return new IndexedMappedSequence(this, createCallback(mapFn));
  };

  /**
   * @constructor
   */
  function IndexedMappedSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  IndexedMappedSequence.prototype = new ArrayLikeSequence();

  IndexedMappedSequence.prototype.get = function get(i) {
    if (i < 0 || i >= this.parent.length()) {
      return undefined;
    }

    return this.mapFn(this.parent.get(i), i);
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayLikeSequence.prototype.filter = function filter(filterFn) {
    return new IndexedFilteredSequence(this, createCallback(filterFn));
  };

  /**
   * @constructor
   */
  function IndexedFilteredSequence(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  IndexedFilteredSequence.prototype = new FilteredSequence();

  IndexedFilteredSequence.prototype.each = function each(fn) {
    var parent = this.parent,
        filterFn = this.filterFn,
        length = this.parent.length(),
        i = -1,
        j = 0,
        e;

    while (++i < length) {
      e = parent.get(i);
      if (filterFn(e, i) && fn(e, j++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An optimized version of {@link Sequence#reverse}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).reverse() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.reverse = function reverse() {
    return new IndexedReversedSequence(this);
  };

  /**
   * @constructor
   */
  function IndexedReversedSequence(parent) {
    this.parent = parent;
  }

  IndexedReversedSequence.prototype = new ArrayLikeSequence();

  IndexedReversedSequence.prototype.get = function get(i) {
    return this.parent.get(this.length() - i - 1);
  };

  /**
   * An optimized version of {@link Sequence#first}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).first(2) // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.get(0);
    }

    return new IndexedTakeSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedTakeSequence(parent, count) {
    this.parent = parent;
    this.count  = count;
  }

  IndexedTakeSequence.prototype = new ArrayLikeSequence();

  IndexedTakeSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? this.count : parentLength;
  };

  /**
   * An optimized version of {@link Sequence#rest}, which creates an
   * {@link ArrayLikeSequence} so that the result still provides random access.
   *
   * @public
   *
   * @examples
   * Lazy([1, 2, 3]).rest() // instanceof Lazy.ArrayLikeSequence
   */
  ArrayLikeSequence.prototype.rest = function rest(count) {
    return new IndexedDropSequence(this, count);
  };

  /**
   * @constructor
   */
  function IndexedDropSequence(parent, count) {
    this.parent = parent;
    this.count  = typeof count === "number" ? count : 1;
  }

  IndexedDropSequence.prototype = new ArrayLikeSequence();

  IndexedDropSequence.prototype.get = function get(i) {
    return this.parent.get(this.count + i);
  };

  IndexedDropSequence.prototype.length = function length() {
    var parentLength = this.parent.length();
    return this.count <= parentLength ? parentLength - this.count : 0;
  };

  /**
   * An optimized version of {@link Sequence#concat} that returns another
   * {@link ArrayLikeSequence} *if* the argument is an array.
   *
   * @public
   * @param {...*} var_args
   *
   * @examples
   * Lazy([1, 2]).concat([3, 4]) // instanceof Lazy.ArrayLikeSequence
   * Lazy([1, 2]).concat([3, 4]) // sequence: [1, 2, 3, 4]
   */
  ArrayLikeSequence.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new IndexedConcatenatedSequence(this, (/** @type {Array} */ var_args));
    } else {
      return Sequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * @constructor
   */
  function IndexedConcatenatedSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  IndexedConcatenatedSequence.prototype = new ArrayLikeSequence();

  IndexedConcatenatedSequence.prototype.get = function get(i) {
    var parentLength = this.parent.length();
    if (i < parentLength) {
      return this.parent.get(i);
    } else {
      return this.other[i - parentLength];
    }
  };

  IndexedConcatenatedSequence.prototype.length = function length() {
    return this.parent.length() + this.other.length;
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayLikeSequence.prototype.uniq = function uniq(keyFn) {
    return new IndexedUniqueSequence(this, createCallback(keyFn));
  };

  /**
   * @param {ArrayLikeSequence} parent
   * @constructor
   */
  function IndexedUniqueSequence(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForParent(parent);
    this.keyFn  = keyFn;
  }

  IndexedUniqueSequence.prototype = new Sequence();

  IndexedUniqueSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var parent = this.parent,
        keyFn  = this.keyFn,
        length = parent.length(),
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    while (++i < length) {
      value = parent.get(i);
      key = keyFn(value);
      if (!find(cache, key)) {
        cache.push(key);
        if (fn(value, j++) === false) {
          return false;
        }
      }
    }
  };

  IndexedUniqueSequence.prototype.eachSetCache = UniqueSequence.prototype.each;

  function getEachForParent(parent) {
    if (parent.length() < 100) {
      return IndexedUniqueSequence.prototype.eachArrayCache;
    } else {
      return UniqueSequence.prototype.each;
    }
  }

  // Now that we've fully initialized the ArrayLikeSequence prototype, we can
  // set the prototype for MemoizedSequence.

  MemoizedSequence.prototype = new ArrayLikeSequence();

  MemoizedSequence.prototype.cache = function cache() {
    return this.cachedResult || (this.cachedResult = this.parent.toArray());
  };

  MemoizedSequence.prototype.get = function get(i) {
    return this.cache()[i];
  };

  MemoizedSequence.prototype.length = function length() {
    return this.cache().length;
  };

  MemoizedSequence.prototype.slice = function slice(begin, end) {
    return this.cache().slice(begin, end);
  };

  MemoizedSequence.prototype.toArray = function toArray() {
    return this.cache().slice(0);
  };

  /**
   * ArrayWrapper is the most basic {@link Sequence}. It directly wraps an array
   * and implements the same methods as {@link ArrayLikeSequence}, but more
   * efficiently.
   *
   * @constructor
   */
  function ArrayWrapper(source) {
    this.source = source;
  }

  ArrayWrapper.prototype = new ArrayLikeSequence();

  ArrayWrapper.prototype.root = function root() {
    return this;
  };

  ArrayWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  /**
   * Returns the element at the specified index in the source array.
   *
   * @param {number} i The index to access.
   * @returns {*} The element.
   */
  ArrayWrapper.prototype.get = function get(i) {
    return this.source[i];
  };

  /**
   * Returns the length of the source array.
   *
   * @returns {number} The length.
   */
  ArrayWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * An optimized version of {@link Sequence#each}.
   */
  ArrayWrapper.prototype.each = function each(fn) {
    return forEach(this.source, fn);
  };

  /**
   * An optimized version of {@link Sequence#map}.
   */
  ArrayWrapper.prototype.map = function map(mapFn) {
    return new MappedArrayWrapper(this, createCallback(mapFn));
  };

  /**
   * An optimized version of {@link Sequence#filter}.
   */
  ArrayWrapper.prototype.filter = function filter(filterFn) {
    return new FilteredArrayWrapper(this, createCallback(filterFn));
  };

  /**
   * An optimized version of {@link Sequence#uniq}.
   */
  ArrayWrapper.prototype.uniq = function uniq(keyFn) {
    return new UniqueArrayWrapper(this, keyFn);
  };

  /**
   * An optimized version of {@link ArrayLikeSequence#concat}.
   *
   * @param {...*} var_args
   */
  ArrayWrapper.prototype.concat = function concat(var_args) {
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      return new ConcatArrayWrapper(this, (/** @type {Array} */ var_args));
    } else {
      return ArrayLikeSequence.prototype.concat.apply(this, arguments);
    }
  };

  /**
   * An optimized version of {@link Sequence#toArray}.
   */
  ArrayWrapper.prototype.toArray = function toArray() {
    return this.source.slice(0);
  };

  /**
   * @constructor
   */
  function MappedArrayWrapper(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedArrayWrapper.prototype = new ArrayLikeSequence();

  MappedArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source;

    if (i < 0 || i >= source.length) {
      return undefined;
    }

    return this.mapFn(source[i]);
  };

  MappedArrayWrapper.prototype.length = function length() {
    return this.parent.source.length;
  };

  MappedArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        length = source.length,
        mapFn  = this.mapFn,
        i = -1;

    while (++i < length) {
      if (fn(mapFn(source[i], i), i) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function FilteredArrayWrapper(parent, filterFn) {
    this.parent   = parent;
    this.filterFn = filterFn;
  }

  FilteredArrayWrapper.prototype = new FilteredSequence();

  FilteredArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        filterFn = this.filterFn,
        length = source.length,
        i = -1,
        j = 0,
        e;

    while (++i < length) {
      e = source[i];
      if (filterFn(e, i) && fn(e, j++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * @constructor
   */
  function UniqueArrayWrapper(parent, keyFn) {
    this.parent = parent;
    this.each   = getEachForSource(parent.source);
    this.keyFn  = keyFn;
  }

  UniqueArrayWrapper.prototype = new Sequence();

  UniqueArrayWrapper.prototype.eachNoCache = function eachNoCache(fn) {
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        find   = arrayContainsBefore,
        value,

        // Yes, this is hideous.
        // Trying to get performance first, will refactor next!
        i = -1,
        k = 0;

    while (++i < length) {
      value = source[i];
      if (!find(source, value, i, keyFn) && fn(value, k++) === false) {
        return false;
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachArrayCache = function eachArrayCache(fn) {
    // Basically the same implementation as w/ the set, but using an array because
    // it's cheaper for smaller sequences.
    var source = this.parent.source,
        keyFn  = this.keyFn,
        length = source.length,
        cache  = [],
        find   = arrayContains,
        key, value,
        i = -1,
        j = 0;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < length) {
        value = source[i];
        key = keyFn(value);
        if (!find(cache, key)) {
          cache.push(key);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }

    } else {
      while (++i < length) {
        value = source[i];
        if (!find(cache, value)) {
          cache.push(value);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }
    }

    return true;
  };

  UniqueArrayWrapper.prototype.eachSetCache = UniqueSequence.prototype.each;

  /**
   * My latest findings here...
   *
   * So I hadn't really given the set-based approach enough credit. The main issue
   * was that my Set implementation was totally not optimized at all. After pretty
   * heavily optimizing it (just take a look; it's a monstrosity now!), it now
   * becomes the fastest option for much smaller values of N.
   */
  function getEachForSource(source) {
    if (source.length < 40) {
      return UniqueArrayWrapper.prototype.eachNoCache;
    } else if (source.length < 100) {
      return UniqueArrayWrapper.prototype.eachArrayCache;
    } else {
      return UniqueArrayWrapper.prototype.eachSetCache;
    }
  }

  /**
   * @constructor
   */
  function ConcatArrayWrapper(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  ConcatArrayWrapper.prototype = new ArrayLikeSequence();

  ConcatArrayWrapper.prototype.get = function get(i) {
    var source = this.parent.source,
        sourceLength = source.length;

    if (i < sourceLength) {
      return source[i];
    } else {
      return this.other[i - sourceLength];
    }
  };

  ConcatArrayWrapper.prototype.length = function length() {
    return this.parent.source.length + this.other.length;
  };

  ConcatArrayWrapper.prototype.each = function each(fn) {
    var source = this.parent.source,
        sourceLength = source.length,
        other = this.other,
        otherLength = other.length,
        i = 0,
        j = -1;

    while (++j < sourceLength) {
      if (fn(source[j], i++) === false) {
        return false;
      }
    }

    j = -1;
    while (++j < otherLength) {
      if (fn(other[j], i++) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * An `ObjectLikeSequence` object represents a sequence of key/value pairs.
   *
   * The initial sequence you get by wrapping an object with `Lazy(object)` is
   * an `ObjectLikeSequence`.
   *
   * All methods of `ObjectLikeSequence` that conceptually should return
   * something like an object return another `ObjectLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * var obj = { foo: 'bar' };
   *
   * Lazy(obj).assign({ bar: 'baz' })   // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).defaults({ bar: 'baz' }) // instanceof Lazy.ObjectLikeSequence
   * Lazy(obj).invert()                 // instanceof Lazy.ObjectLikeSequence
   */
  function ObjectLikeSequence() {}

  ObjectLikeSequence.prototype = new Sequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `ObjectLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `ObjectLikeSequence` prototype so that it can be chained with any other
   *     methods that return object-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. **Must** include `each`. *May* include `init` and
   *     `get` (for looking up an element by key).
   * @returns {Function} A constructor for a new type inheriting from
   *     `ObjectLikeSequence`.
   *
   * @examples
   * function downcaseKey(value, key) {
   *   return [key.toLowerCase(), value];
   * }
   *
   * Lazy.ObjectLikeSequence.define("caseInsensitive", {
   *   init: function() {
   *     var downcased = this.parent
   *       .map(downcaseKey)
   *       .toObject();
   *     this.downcased = Lazy(downcased);
   *   },
   *
   *   get: function(key) {
   *     return this.downcased.get(key.toLowerCase());
   *   },
   *
   *   each: function(fn) {
   *     return this.downcased.each(fn);
   *   }
   * });
   *
   * Lazy({ Foo: 'bar' }).caseInsensitive()            // sequence: { foo: 'bar' }
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('foo') // => 'bar'
   * Lazy({ FOO: 'bar' }).caseInsensitive().get('FOO') // => 'bar'
   */
  ObjectLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.each !== 'function') {
      throw new Error("A custom object-like sequence must implement *at least* each!");
    }

    return defineSequenceType(ObjectLikeSequence, methodName, overrides);
  };

  ObjectLikeSequence.prototype.value = function value() {
    return this.toObject();
  };

  /**
   * Gets the element at the specified key in this sequence.
   *
   * @public
   * @param {string} key The key.
   * @returns {*} The element.
   *
   * @examples
   * Lazy({ foo: "bar" }).get("foo")                          // => "bar"
   * Lazy({ foo: "bar" }).extend({ foo: "baz" }).get("foo")   // => "baz"
   * Lazy({ foo: "bar" }).defaults({ bar: "baz" }).get("bar") // => "baz"
   * Lazy({ foo: "bar" }).invert().get("bar")                 // => "foo"
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("foo")        // => 1
   * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("bar")        // => undefined
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("bar")        // => 2
   * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("foo")        // => undefined
   */
  ObjectLikeSequence.prototype.get = function get(key) {
    var pair = this.pairs().find(function(pair) {
      return pair[0] === key;
    });

    return pair ? pair[1] : undefined;
  };

  /**
   * Returns a {@link Sequence} whose elements are the keys of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's keys.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).keys() // sequence: ["hello", "goodbye"]
   */
  ObjectLikeSequence.prototype.keys = function keys() {
    return this.map(function(v, k) { return k; });
  };

  /**
   * Returns a {@link Sequence} whose elements are the values of this object-like
   * sequence.
   *
   * @public
   * @returns {Sequence} The sequence based on this sequence's values.
   *
   * @examples
   * Lazy({ hello: "hola", goodbye: "hasta luego" }).values() // sequence: ["hola", "hasta luego"]
   */
  ObjectLikeSequence.prototype.values = function values() {
    return this.map(function(v, k) { return v; });
  };

  /**
   * Throws an exception. Asynchronous iteration over object-like sequences is
   * not supported.
   *
   * @public
   * @examples
   * Lazy({ foo: 'bar' }).async() // throws
   */
  ObjectLikeSequence.prototype.async = function async() {
    throw new Error('An ObjectLikeSequence does not support asynchronous iteration.');
  };

  /**
   * Returns this same sequence. (Reversing an object-like sequence doesn't make
   * any sense.)
   */
  ObjectLikeSequence.prototype.reverse = function reverse() {
    return this;
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and another object. In the case of a key appearing in both this
   * sequence and the given object, the other object's value will override the
   * one in this sequence.
   *
   * @public
   * @aka extend
   * @param {Object} other The other object to assign to this sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence plus the contents of `other`.
   *
   * @examples
   * Lazy({ "uno": 1, "dos": 2 }).assign({ "tres": 3 }) // sequence: { uno: 1, dos: 2, tres: 3 }
   * Lazy({ foo: "bar" }).assign({ foo: "baz" });       // sequence: { foo: "baz" }
   */
  ObjectLikeSequence.prototype.assign = function assign(other) {
    return new AssignSequence(this, other);
  };

  ObjectLikeSequence.prototype.extend = function extend(other) {
    return this.assign(other);
  };

  /**
   * @constructor
   */
  function AssignSequence(parent, other) {
    this.parent = parent;
    this.other  = other;
  }

  AssignSequence.prototype = new ObjectLikeSequence();

  AssignSequence.prototype.get = function get(key) {
    return this.other[key] || this.parent.get(key);
  };

  AssignSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    Lazy(this.other).each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      merged.add(key);
    });

    if (!done) {
      return this.parent.each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose elements are the combination of
   * this sequence and a 'default' object. In the case of a key appearing in both
   * this sequence and the given object, this sequence's value will override the
   * default object's.
   *
   * @public
   * @param {Object} defaults The 'default' object to use for missing keys in this
   *     sequence.
   * @returns {ObjectLikeSequence} A new sequence comprising elements from this
   *     sequence supplemented by the contents of `defaults`.
   *
   * @examples
   * Lazy({ name: "Dan" }).defaults({ name: "User", password: "passw0rd" }) // sequence: { name: "Dan", password: "passw0rd" }
   */
  ObjectLikeSequence.prototype.defaults = function defaults(defaults) {
    return new DefaultsSequence(this, defaults);
  };

  /**
   * @constructor
   */
  function DefaultsSequence(parent, defaults) {
    this.parent   = parent;
    this.defaults = defaults;
  }

  DefaultsSequence.prototype = new ObjectLikeSequence();

  DefaultsSequence.prototype.get = function get(key) {
    return this.parent.get(key) || this.defaults[key];
  };

  DefaultsSequence.prototype.each = function each(fn) {
    var merged = new Set(),
        done   = false;

    this.parent.each(function(value, key) {
      if (fn(value, key) === false) {
        done = true;
        return false;
      }

      if (typeof value !== "undefined") {
        merged.add(key);
      }
    });

    if (!done) {
      Lazy(this.defaults).each(function(value, key) {
        if (!merged.contains(key) && fn(value, key) === false) {
          return false;
        }
      });
    }
  };

  /**
   * Returns an {@link ObjectLikeSequence} whose values are this sequence's keys,
   * and whose keys are this sequence's values.
   *
   * @public
   * @returns {ObjectLikeSequence} A new sequence comprising the inverted keys and
   *     values from this sequence.
   *
   * @examples
   * Lazy({ first: "Dan", last: "Tao" }).invert() // sequence: { Dan: "first", Tao: "last" }
   */
  ObjectLikeSequence.prototype.invert = function invert() {
    return new InvertedSequence(this);
  };

  /**
   * @constructor
   */
  function InvertedSequence(parent) {
    this.parent = parent;
  }

  InvertedSequence.prototype = new ObjectLikeSequence();

  InvertedSequence.prototype.each = function each(fn) {
    this.parent.each(function(value, key) {
      return fn(key, value);
    });
  };

  /**
   * Produces an {@link ObjectLikeSequence} consisting of all the recursively
   * merged values from this and the given object(s) or sequence(s).
   *
   * @public
   * @param {...Object|ObjectLikeSequence} others The other object(s) or
   *     sequence(s) whose values will be merged into this one.
   * @param {Function=} mergeFn An optional function used to customize merging
   *     behavior.
   * @returns {ObjectLikeSequence} The new sequence consisting of merged values.
   *
   * @examples
   * // These examples are completely stolen from Lo-Dash's documentation:
   * // lodash.com/docs#merge
   *
   * var names = {
   *   'characters': [
   *     { 'name': 'barney' },
   *     { 'name': 'fred' }
   *   ]
   * };
   *
   * var ages = {
   *   'characters': [
   *     { 'age': 36 },
   *     { 'age': 40 }
   *   ]
   * };
   *
   * var food = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var otherFood = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * function mergeArrays(a, b) {
   *   return Array.isArray(a) ? a.concat(b) : undefined;
   * }
   *
   * Lazy(names).merge(ages); // => sequence: { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
   * Lazy(food).merge(otherFood, mergeArrays); // => sequence: { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
   *
   * // ----- Now for my own tests: -----
   *
   * // merges objects
   * Lazy({ foo: 1 }).merge({ foo: 2 }); // => sequence: { foo: 2 }
   * Lazy({ foo: 1 }).merge({ bar: 2 }); // => sequence: { foo: 1, bar: 2 }
   *
   * // goes deep
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { bar: 2 } }); // => sequence: { foo: { bar: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
   *
   * // gives precedence to later sources
   * Lazy({ foo: 1 }).merge({ bar: 2 }, { bar: 3 }); // => sequence: { foo: 1, bar: 3 }
   *
   * // undefined gets passed over
   * Lazy({ foo: 1 }).merge({ foo: undefined }); // => sequence: { foo: 1 }
   *
   * // null doesn't get passed over
   * Lazy({ foo: 1 }).merge({ foo: null }); // => sequence: { foo: null }
   *
   * // array contents get merged as well
   * Lazy({ foo: [{ bar: 1 }] }).merge({ foo: [{ baz: 2 }] }); // => sequence: { foo: [{ bar: 1, baz: 2}] }
   */
  ObjectLikeSequence.prototype.merge = function merge(var_args) {
    var mergeFn = arguments.length > 1 && typeof arguments[arguments.length - 1] === "function" ?
      arrayPop.call(arguments) : null;
    return new MergedSequence(this, arraySlice.call(arguments, 0), mergeFn);
  };

  /**
   * @constructor
   */
  function MergedSequence(parent, others, mergeFn) {
    this.parent  = parent;
    this.others  = others;
    this.mergeFn = mergeFn;
  }

  MergedSequence.prototype = new ObjectLikeSequence();

  MergedSequence.prototype.each = function each(fn) {
    var others  = this.others,
        mergeFn = this.mergeFn || mergeObjects,
        keys    = {};

    var iteratedFullSource = this.parent.each(function(value, key) {
      var merged = value;

      forEach(others, function(other) {
        if (key in other) {
          merged = mergeFn(merged, other[key]);
        }
      });

      keys[key] = true;

      return fn(merged, key);
    });

    if (iteratedFullSource === false) {
      return false;
    }

    var remaining = {};

    forEach(others, function(other) {
      for (var k in other) {
        if (!keys[k]) {
          remaining[k] = mergeFn(remaining[k], other[k]);
        }
      }
    });

    return Lazy(remaining).each(fn);
  };

  /**
   * @private
   * @examples
   * mergeObjects({ foo: 1 }, { bar: 2 }); // => { foo: 1, bar: 2 }
   * mergeObjects({ foo: { bar: 1 } }, { foo: { baz: 2 } }); // => { foo: { bar: 1, baz: 2 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: undefined }); // => { foo: { bar: 1 } }
   * mergeObjects({ foo: { bar: 1 } }, { foo: null }); // => { foo: null }
   */
  function mergeObjects(a, b) {
    if (typeof b === 'undefined') {
      return a;
    }

    // Unless we're dealing with two objects, there's no merging to do --
    // just replace a w/ b.
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return b;
    }

    var merged = {}, prop;
    for (prop in a) {
      merged[prop] = mergeObjects(a[prop], b[prop]);
    }
    for (prop in b) {
      if (!merged[prop]) {
        merged[prop] = b[prop];
      }
    }
    return merged;
  }

  /**
   * Creates a {@link Sequence} consisting of the keys from this sequence whose
   *     values are functions.
   *
   * @public
   * @aka methods
   * @returns {Sequence} The new sequence.
   *
   * @examples
   * var dog = {
   *   name: "Fido",
   *   breed: "Golden Retriever",
   *   bark: function() { console.log("Woof!"); },
   *   wagTail: function() { console.log("TODO: implement robotic dog interface"); }
   * };
   *
   * Lazy(dog).functions() // sequence: ["bark", "wagTail"]
   */
  ObjectLikeSequence.prototype.functions = function functions() {
    return this
      .filter(function(v, k) { return typeof(v) === "function"; })
      .map(function(v, k) { return k; });
  };

  ObjectLikeSequence.prototype.methods = function methods() {
    return this.functions();
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence whose keys are included in the given array of property names.
   *
   * @public
   * @param {Array} properties An array of the properties to "pick" from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).pick(["who", "what"]) // sequence: { who: "first", what: "second" }
   */
  ObjectLikeSequence.prototype.pick = function pick(properties) {
    return new PickSequence(this, properties);
  };

  /**
   * @constructor
   */
  function PickSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  PickSequence.prototype = new ObjectLikeSequence();

  PickSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? this.parent.get(key) : undefined;
  };

  PickSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
   * this sequence excluding those with the specified keys.
   *
   * @public
   * @param {Array} properties An array of the properties to *omit* from this
   *     sequence.
   * @returns {ObjectLikeSequence} The new sequence.
   *
   * @examples
   * var players = {
   *   "who": "first",
   *   "what": "second",
   *   "i don't know": "third"
   * };
   *
   * Lazy(players).omit(["who", "what"]) // sequence: { "i don't know": "third" }
   */
  ObjectLikeSequence.prototype.omit = function omit(properties) {
    return new OmitSequence(this, properties);
  };

  /**
   * @constructor
   */
  function OmitSequence(parent, properties) {
    this.parent     = parent;
    this.properties = properties;
  }

  OmitSequence.prototype = new ObjectLikeSequence();

  OmitSequence.prototype.get = function get(key) {
    return arrayContains(this.properties, key) ? undefined : this.parent.get(key);
  };

  OmitSequence.prototype.each = function each(fn) {
    var inArray    = arrayContains,
        properties = this.properties;

    return this.parent.each(function(value, key) {
      if (!inArray(properties, key)) {
        return fn(value, key);
      }
    });
  };

  /**
   * Maps the key/value pairs in this sequence to arrays.
   *
   * @public
   * @aka toArray
   * @returns {Sequence} An sequence of `[key, value]` pairs.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).pairs() // sequence: [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.pairs = function pairs() {
    return this.map(function(v, k) { return [k, v]; });
  };

  /**
   * Creates an array from the key/value pairs in this sequence.
   *
   * @public
   * @returns {Array} An array of `[key, value]` elements.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toArray() // => [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
   */
  ObjectLikeSequence.prototype.toArray = function toArray() {
    return this.pairs().toArray();
  };

  /**
   * Creates an object with the key/value pairs from this sequence.
   *
   * @public
   * @returns {Object} An object with the same key/value pairs as this sequence.
   *
   * @examples
   * var colorCodes = {
   *   red: "#f00",
   *   green: "#0f0",
   *   blue: "#00f"
   * };
   *
   * Lazy(colorCodes).toObject() // => { red: "#f00", green: "#0f0", blue: "#00f" }
   */
  ObjectLikeSequence.prototype.toObject = function toObject() {
    return this.reduce(function(object, value, key) {
      object[key] = value;
      return object;
    }, {});
  };

  // Now that we've fully initialized the ObjectLikeSequence prototype, we can
  // actually set the prototypes for GroupedSequence, IndexedSequence, and
  // CountedSequence.

  GroupedSequence.prototype = new ObjectLikeSequence();

  GroupedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        result;

    result = this.parent.reduce(function(grouped,e) {
      var key = keyFn(e);
      if (!(grouped[key] instanceof Array)) {
        grouped[key] = [e];
      } else {
        grouped[key].push(e);
      }
      return grouped;
    },{});

    return transform(function(grouped) {
      for (var key in grouped) {
        if (fn(grouped[key], key) === false) {
          return false;
        }
      }
    }, result);
  };

  IndexedSequence.prototype = new ObjectLikeSequence();

  IndexedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        indexed = {};

    return this.parent.each(function(e) {
      var key = keyFn(e);
      if (!indexed[key]) {
        indexed[key] = e;
        return fn(e, key);
      }
    });
  };

  CountedSequence.prototype = new ObjectLikeSequence();

  CountedSequence.prototype.each = function each(fn) {
    var keyFn   = createCallback(this.keyFn),
        counted = {};

    this.parent.each(function(e) {
      var key = keyFn(e);
      if (!counted[key]) {
        counted[key] = 1;
      } else {
        counted[key] += 1;
      }
    });

    for (var key in counted) {
      if (fn(counted[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * Watches for all changes to a specified property (or properties) of an
   * object and produces a sequence whose elements have the properties
   * `{ property, value }` indicating which property changed and what it was
   * changed to.
   *
   * Note that this method **only works on directly wrapped objects**; it will
   * *not* work on any arbitrary {@link ObjectLikeSequence}.
   *
   * @public
   * @param {(string|Array)=} propertyNames A property name or array of property
   *     names to watch. If this parameter is `undefined`, all of the object's
   *     current (enumerable) properties will be watched.
   * @returns {Sequence} A sequence comprising `{ property, value }` objects
   *     describing each change to the specified property/properties.
   *
   * @examples
   * var obj = {},
   *     changes = [];
   *
   * Lazy(obj).watch('foo').each(function(change) {
   *   changes.push(change);
   * });
   *
   * obj.foo = 1;
   * obj.bar = 2;
   * obj.foo = 3;
   *
   * obj.foo; // => 3
   * changes; // => [{ property: 'foo', value: 1 }, { property: 'foo', value: 3 }]
   */
  ObjectLikeSequence.prototype.watch = function watch(propertyNames) {
    throw new Error('You can only call #watch on a directly wrapped object.');
  };

  /**
   * @constructor
   */
  function ObjectWrapper(source) {
    this.source = source;
  }

  ObjectWrapper.prototype = new ObjectLikeSequence();

  ObjectWrapper.prototype.root = function root() {
    return this;
  };

  ObjectWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  ObjectWrapper.prototype.get = function get(key) {
    return this.source[key];
  };

  ObjectWrapper.prototype.each = function each(fn) {
    var source = this.source,
        key;

    for (key in source) {
      if (fn(source[key], key) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   * A `StringLikeSequence` represents a sequence of characters.
   *
   * The initial sequence you get by wrapping a string with `Lazy(string)` is a
   * `StringLikeSequence`.
   *
   * All methods of `StringLikeSequence` that conceptually should return
   * something like a string return another `StringLikeSequence`.
   *
   * @public
   * @constructor
   *
   * @examples
   * function upcase(str) { return str.toUpperCase(); }
   *
   * Lazy('foo')               // instanceof Lazy.StringLikeSequence
   * Lazy('foo').toUpperCase() // instanceof Lazy.StringLikeSequence
   * Lazy('foo').reverse()     // instanceof Lazy.StringLikeSequence
   * Lazy('foo').take(2)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').drop(1)       // instanceof Lazy.StringLikeSequence
   * Lazy('foo').substring(1)  // instanceof Lazy.StringLikeSequence
   *
   * // Note that `map` does not create a `StringLikeSequence` because there's
   * // no guarantee the mapping function will return characters. In the event
   * // you do want to map a string onto a string-like sequence, use
   * // `mapString`:
   * Lazy('foo').map(Lazy.identity)       // instanceof Lazy.ArrayLikeSequence
   * Lazy('foo').mapString(Lazy.identity) // instanceof Lazy.StringLikeSequence
   */
  function StringLikeSequence() {}

  StringLikeSequence.prototype = new ArrayLikeSequence();

  /**
   * Create a new constructor function for a type inheriting from
   * `StringLikeSequence`.
   *
   * @public
   * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
   *     used for constructing the new sequence. The method will be attached to
   *     the `StringLikeSequence` prototype so that it can be chained with any other
   *     methods that return string-like sequences.
   * @param {Object} overrides An object containing function overrides for this
   *     new sequence type. Has the same requirements as
   *     {@link ArrayLikeSequence.define}.
   * @returns {Function} A constructor for a new type inheriting from
   *     `StringLikeSequence`.
   *
   * @examples
   * Lazy.StringLikeSequence.define("zomg", {
   *   length: function() {
   *     return this.parent.length() + "!!ZOMG!!!1".length;
   *   },
   *
   *   get: function(i) {
   *     if (i < this.parent.length()) {
   *       return this.parent.get(i);
   *     }
   *     return "!!ZOMG!!!1".charAt(i - this.parent.length());
   *   }
   * });
   *
   * Lazy('foo').zomg() // sequence: "foo!!ZOMG!!!1"
   */
  StringLikeSequence.define = function define(methodName, overrides) {
    if (!overrides || typeof overrides.get !== 'function') {
      throw new Error("A custom string-like sequence must implement *at least* get!");
    }

    return defineSequenceType(StringLikeSequence, methodName, overrides);
  };

  StringLikeSequence.prototype.value = function value() {
    return this.toString();
  };

  /**
   * Returns an {@link IndexedIterator} that will step over each character in this
   * sequence one by one.
   *
   * @returns {IndexedIterator} The iterator.
   */
  StringLikeSequence.prototype.getIterator = function getIterator() {
    return new CharIterator(this);
  };

  /**
   * @constructor
   */
  function CharIterator(source) {
    this.source = Lazy(source);
    this.index = -1;
  }

  CharIterator.prototype.current = function current() {
    return this.source.charAt(this.index);
  };

  CharIterator.prototype.moveNext = function moveNext() {
    return (++this.index < this.source.length());
  };

  /**
   * Returns the character at the given index of this sequence, or the empty
   * string if the specified index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of this sequence.
   * @returns {string} The character at the specified index.
   *
   * @examples
   * Lazy("foo").charAt(0)  // => "f"
   * Lazy("foo").charAt(-1) // => ""
   * Lazy("foo").charAt(10) // => ""
   */
  StringLikeSequence.prototype.charAt = function charAt(i) {
    return this.get(i);
  };

  /**
   * Returns the character code at the given index of this sequence, or `NaN` if
   * the index lies outside the bounds of the sequence.
   *
   * @public
   * @param {number} i The index of the character whose character code you want.
   * @returns {number} The character code.
   *
   * @examples
   * Lazy("abc").charCodeAt(0)  // => 97
   * Lazy("abc").charCodeAt(-1) // => NaN
   * Lazy("abc").charCodeAt(10) // => NaN
   */
  StringLikeSequence.prototype.charCodeAt = function charCodeAt(i) {
    var char = this.charAt(i);
    if (!char) { return NaN; }

    return char.charCodeAt(0);
  };

  /**
   * Returns a {@link StringLikeSequence} comprising the characters from *this*
   * sequence starting at `start` and ending at `stop` (exclusive), or---if
   * `stop` is `undefined`, including the rest of the sequence.
   *
   * @public
   * @param {number} start The index where this sequence should begin.
   * @param {number=} stop The index (exclusive) where this sequence should end.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * Lazy("foo").substring(1)      // sequence: "oo"
   * Lazy("foo").substring(-1)     // sequence: "foo"
   * Lazy("hello").substring(1, 3) // sequence: "el"
   * Lazy("hello").substring(1, 9) // sequence: "ello"
   */
  StringLikeSequence.prototype.substring = function substring(start, stop) {
    return new StringSegment(this, start, stop);
  };

  /**
   * @constructor
   */
  function StringSegment(parent, start, stop) {
    this.parent = parent;
    this.start  = Math.max(0, start);
    this.stop   = stop;
  }

  StringSegment.prototype = new StringLikeSequence();

  StringSegment.prototype.get = function get(i) {
    return this.parent.get(i + this.start);
  };

  StringSegment.prototype.length = function length() {
    return (typeof this.stop === "number" ? this.stop : this.parent.length()) - this.start;
  };

  /**
   * An optimized version of {@link Sequence#first} that returns another
   * {@link StringLikeSequence} (or just the first character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').first()                // => 'f'
   * Lazy('fo').first(2)                // sequence: 'fo'
   * Lazy('foo').first(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().first()  // => 'F'
   * Lazy('foo').toUpperCase().first(2) // sequence: 'FO'
   */
  StringLikeSequence.prototype.first = function first(count) {
    if (typeof count === "undefined") {
      return this.charAt(0);
    }

    return this.substring(0, count);
  };

  /**
   * An optimized version of {@link Sequence#last} that returns another
   * {@link StringLikeSequence} (or just the last character, if `count` is
   * undefined).
   *
   * @public
   * @examples
   * Lazy('foo').last()                // => 'o'
   * Lazy('foo').last(2)               // sequence: 'oo'
   * Lazy('foo').last(10)              // sequence: 'foo'
   * Lazy('foo').toUpperCase().last()  // => 'O'
   * Lazy('foo').toUpperCase().last(2) // sequence: 'OO'
   */
  StringLikeSequence.prototype.last = function last(count) {
    if (typeof count === "undefined") {
      return this.charAt(this.length() - 1);
    }

    return this.substring(this.length() - count);
  };

  StringLikeSequence.prototype.drop = function drop(count) {
    return this.substring(count);
  };

  /**
   * Finds the index of the first occurrence of the given substring within this
   * sequence, starting from the specified index (or the beginning of the
   * sequence).
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The first index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').indexOf('a')    // => 1
   * Lazy('canal').indexOf('a', 2) // => 3
   * Lazy('canal').indexOf('ana')  // => 1
   * Lazy('canal').indexOf('andy') // => -1
   * Lazy('canal').indexOf('x')    // => -1
   */
  StringLikeSequence.prototype.indexOf = function indexOf(substring, startIndex) {
    return this.toString().indexOf(substring, startIndex);
  };

  /**
   * Finds the index of the last occurrence of the given substring within this
   * sequence, starting from the specified index (or the end of the sequence)
   * and working backwards.
   *
   * @public
   * @param {string} substring The substring to search for.
   * @param {number=} startIndex The index from which to start the search.
   * @returns {number} The last index where the given substring is found, or
   *     -1 if it isn't in the sequence.
   *
   * @examples
   * Lazy('canal').lastIndexOf('a')    // => 3
   * Lazy('canal').lastIndexOf('a', 2) // => 1
   * Lazy('canal').lastIndexOf('ana')  // => 1
   * Lazy('canal').lastIndexOf('andy') // => -1
   * Lazy('canal').lastIndexOf('x')    // => -1
   */
  StringLikeSequence.prototype.lastIndexOf = function lastIndexOf(substring, startIndex) {
    return this.toString().lastIndexOf(substring, startIndex);
  };

  /**
   * Checks if this sequence contains a given substring.
   *
   * @public
   * @param {string} substring The substring to check for.
   * @returns {boolean} Whether or not this sequence contains `substring`.
   *
   * @examples
   * Lazy('hello').contains('ell') // => true
   * Lazy('hello').contains('')    // => true
   * Lazy('hello').contains('abc') // => false
   */
  StringLikeSequence.prototype.contains = function contains(substring) {
    return this.indexOf(substring) !== -1;
  };

  /**
   * Checks if this sequence ends with a given suffix.
   *
   * @public
   * @param {string} suffix The suffix to check for.
   * @returns {boolean} Whether or not this sequence ends with `suffix`.
   *
   * @examples
   * Lazy('foo').endsWith('oo')  // => true
   * Lazy('foo').endsWith('')    // => true
   * Lazy('foo').endsWith('abc') // => false
   */
  StringLikeSequence.prototype.endsWith = function endsWith(suffix) {
    return this.substring(this.length() - suffix.length).toString() === suffix;
  };

  /**
   * Checks if this sequence starts with a given prefix.
   *
   * @public
   * @param {string} prefix The prefix to check for.
   * @returns {boolean} Whether or not this sequence starts with `prefix`.
   *
   * @examples
   * Lazy('foo').startsWith('fo')  // => true
   * Lazy('foo').startsWith('')    // => true
   * Lazy('foo').startsWith('abc') // => false
   */
  StringLikeSequence.prototype.startsWith = function startsWith(prefix) {
    return this.substring(0, prefix.length).toString() === prefix;
  };

  /**
   * Converts all of the characters in this string to uppercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all uppercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('foo').toUpperCase()                       // sequence: 'FOO'
   * Lazy('foo').substring(1).toUpperCase()          // sequence: 'OO'
   * Lazy('abc').mapString(nextLetter).toUpperCase() // sequence: 'BCD'
   */
  StringLikeSequence.prototype.toUpperCase = function toUpperCase() {
    return this.mapString(function(char) { return char.toUpperCase(); });
  };

  /**
   * Converts all of the characters in this string to lowercase.
   *
   * @public
   * @returns {StringLikeSequence} A new sequence with the same characters as
   *     this sequence, all lowercase.
   *
   * @examples
   * function nextLetter(a) {
   *   return String.fromCharCode(a.charCodeAt(0) + 1);
   * }
   *
   * Lazy('FOO').toLowerCase()                       // sequence: 'foo'
   * Lazy('FOO').substring(1).toLowerCase()          // sequence: 'oo'
   * Lazy('ABC').mapString(nextLetter).toLowerCase() // sequence: 'bcd'
   */
  StringLikeSequence.prototype.toLowerCase = function toLowerCase() {
    return this.mapString(function(char) { return char.toLowerCase(); });
  };

  /**
   * Maps the characters of this sequence onto a new {@link StringLikeSequence}.
   *
   * @public
   * @param {Function} mapFn The function used to map characters from this
   *     sequence onto the new sequence.
   * @returns {StringLikeSequence} The new sequence.
   *
   * @examples
   * function upcase(char) { return char.toUpperCase(); }
   *
   * Lazy("foo").mapString(upcase)               // sequence: "FOO"
   * Lazy("foo").mapString(upcase).charAt(0)     // => "F"
   * Lazy("foo").mapString(upcase).charCodeAt(0) // => 70
   * Lazy("foo").mapString(upcase).substring(1)  // sequence: "OO"
   */
  StringLikeSequence.prototype.mapString = function mapString(mapFn) {
    return new MappedStringLikeSequence(this, mapFn);
  };

  /**
   * @constructor
   */
  function MappedStringLikeSequence(parent, mapFn) {
    this.parent = parent;
    this.mapFn  = mapFn;
  }

  MappedStringLikeSequence.prototype = new StringLikeSequence();
  MappedStringLikeSequence.prototype.get = IndexedMappedSequence.prototype.get;
  MappedStringLikeSequence.prototype.length = IndexedMappedSequence.prototype.length;

  /**
   * Returns a copy of this sequence that reads back to front.
   *
   * @public
   *
   * @examples
   * Lazy("abcdefg").reverse() // sequence: "gfedcba"
   */
  StringLikeSequence.prototype.reverse = function reverse() {
    return new ReversedStringLikeSequence(this);
  };

  /**
   * @constructor
   */
  function ReversedStringLikeSequence(parent) {
    this.parent = parent;
  }

  ReversedStringLikeSequence.prototype = new StringLikeSequence();
  ReversedStringLikeSequence.prototype.get = IndexedReversedSequence.prototype.get;
  ReversedStringLikeSequence.prototype.length = IndexedReversedSequence.prototype.length;

  StringLikeSequence.prototype.toString = function toString() {
    return this.join("");
  };

  /**
   * Creates a {@link Sequence} comprising all of the matches for the specified
   * pattern in the underlying string.
   *
   * @public
   * @param {RegExp} pattern The pattern to match.
   * @returns {Sequence} A sequence of all the matches.
   *
   * @examples
   * Lazy("abracadabra").match(/a[bcd]/) // sequence: ["ab", "ac", "ad", "ab"]
   * Lazy("fee fi fo fum").match(/\w+/)  // sequence: ["fee", "fi", "fo", "fum"]
   * Lazy("hello").match(/xyz/)          // sequence: []
   */
  StringLikeSequence.prototype.match = function match(pattern) {
    return new StringMatchSequence(this.source, pattern);
  };

  /**
   * @constructor
   */
  function StringMatchSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  StringMatchSequence.prototype = new Sequence();

  StringMatchSequence.prototype.getIterator = function getIterator() {
    return new StringMatchIterator(this.source, this.pattern);
  };

  /**
   * @constructor
   */
  function StringMatchIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  StringMatchIterator.prototype.current = function current() {
    return this.match[0];
  };

  StringMatchIterator.prototype.moveNext = function moveNext() {
    return !!(this.match = this.pattern.exec(this.source));
  };

  /**
   * Creates a {@link Sequence} comprising all of the substrings of this string
   * separated by the given delimiter, which can be either a string or a regular
   * expression.
   *
   * @public
   * @param {string|RegExp} delimiter The delimiter to use for recognizing
   *     substrings.
   * @returns {Sequence} A sequence of all the substrings separated by the given
   *     delimiter.
   *
   * @examples
   * Lazy("foo").split("")                      // sequence: ["f", "o", "o"]
   * Lazy("yo dawg").split(" ")                 // sequence: ["yo", "dawg"]
   * Lazy("bah bah\tblack  sheep").split(/\s+/) // sequence: ["bah", "bah", "black", "sheep"]
   */
  StringLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStringSequence(this.source, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStringSequence(source, pattern) {
    this.source = source;
    this.pattern = pattern;
  }

  SplitStringSequence.prototype = new Sequence();

  SplitStringSequence.prototype.getIterator = function getIterator() {
    if (this.pattern instanceof RegExp) {
      if (this.pattern.source === "" || this.pattern.source === "(?:)") {
        return new CharIterator(this.source);
      } else {
        return new SplitWithRegExpIterator(this.source, this.pattern);
      }
    } else if (this.pattern === "") {
      return new CharIterator(this.source);
    } else {
      return new SplitWithStringIterator(this.source, this.pattern);
    }
  };

  /**
   * @constructor
   */
  function SplitWithRegExpIterator(source, pattern) {
    this.source  = source;
    this.pattern = cloneRegex(pattern);
  }

  SplitWithRegExpIterator.prototype.current = function current() {
    return this.source.substring(this.start, this.end);
  };

  SplitWithRegExpIterator.prototype.moveNext = function moveNext() {
    if (!this.pattern) {
      return false;
    }

    var match = this.pattern.exec(this.source);

    if (match) {
      this.start = this.nextStart ? this.nextStart : 0;
      this.end = match.index;
      this.nextStart = match.index + match[0].length;
      return true;

    } else if (this.pattern) {
      this.start = this.nextStart;
      this.end = undefined;
      this.nextStart = undefined;
      this.pattern = undefined;
      return true;
    }

    return false;
  };

  /**
   * @constructor
   */
  function SplitWithStringIterator(source, delimiter) {
    this.source = source;
    this.delimiter = delimiter;
  }

  SplitWithStringIterator.prototype.current = function current() {
    return this.source.substring(this.leftIndex, this.rightIndex);
  };

  SplitWithStringIterator.prototype.moveNext = function moveNext() {
    if (!this.finished) {
      this.leftIndex = typeof this.leftIndex !== "undefined" ?
        this.rightIndex + this.delimiter.length :
        0;
      this.rightIndex = this.source.indexOf(this.delimiter, this.leftIndex);
    }

    if (this.rightIndex === -1) {
      this.finished = true;
      this.rightIndex = undefined;
      return true;
    }

    return !this.finished;
  };

  /**
   * Wraps a string exposing {@link #match} and {@link #split} methods that return
   * {@link Sequence} objects instead of arrays, improving on the efficiency of
   * JavaScript's built-in `String#split` and `String.match` methods and
   * supporting asynchronous iteration.
   *
   * @param {string} source The string to wrap.
   * @constructor
   */
  function StringWrapper(source) {
    this.source = source;
  }

  StringWrapper.prototype = new StringLikeSequence();

  StringWrapper.prototype.root = function root() {
    return this;
  };

  StringWrapper.prototype.isAsync = function isAsync() {
    return false;
  };

  StringWrapper.prototype.get = function get(i) {
    return this.source.charAt(i);
  };

  StringWrapper.prototype.length = function length() {
    return this.source.length;
  };

  /**
   * A `GeneratedSequence` does not wrap an in-memory colllection but rather
   * determines its elements on-the-fly during iteration according to a generator
   * function.
   *
   * You create a `GeneratedSequence` by calling {@link Lazy.generate}.
   *
   * @public
   * @constructor
   * @param {function(number):*} generatorFn A function which accepts an index
   *     and returns a value for the element at that position in the sequence.
   * @param {number=} length The length of the sequence. If this argument is
   *     omitted, the sequence will go on forever.
   */
  function GeneratedSequence(generatorFn, length) {
    this.get = generatorFn;
    this.fixedLength = length;
  }

  GeneratedSequence.prototype = new Sequence();

  GeneratedSequence.prototype.isAsync = function isAsync() {
    return false;
  };

  /**
   * Returns the length of this sequence.
   *
   * @public
   * @returns {number} The length, or `undefined` if this is an indefinite
   *     sequence.
   */
  GeneratedSequence.prototype.length = function length() {
    return this.fixedLength;
  };

  /**
   * Iterates over the sequence produced by invoking this sequence's generator
   * function up to its specified length, or, if length is `undefined`,
   * indefinitely (in which case the sequence will go on forever--you would need
   * to call, e.g., {@link Sequence#take} to limit iteration).
   *
   * @public
   * @param {Function} fn The function to call on each output from the generator
   *     function.
   */
  GeneratedSequence.prototype.each = function each(fn) {
    var generatorFn = this.get,
        length = this.fixedLength,
        i = 0;

    while (typeof length === "undefined" || i < length) {
      if (fn(generatorFn(i++)) === false) {
        return false;
      }
    }

    return true;
  };

  GeneratedSequence.prototype.getIterator = function getIterator() {
    return new GeneratedIterator(this);
  };

  /**
   * Iterates over a generated sequence. (This allows generated sequences to be
   * iterated asynchronously.)
   *
   * @param {GeneratedSequence} sequence The generated sequence to iterate over.
   * @constructor
   */
  function GeneratedIterator(sequence) {
    this.sequence     = sequence;
    this.index        = 0;
    this.currentValue = null;
  }

  GeneratedIterator.prototype.current = function current() {
    return this.currentValue;
  };

  GeneratedIterator.prototype.moveNext = function moveNext() {
    var sequence = this.sequence;

    if (typeof sequence.fixedLength === "number" && this.index >= sequence.fixedLength) {
      return false;
    }

    this.currentValue = sequence.get(this.index++);
    return true;
  };

  /**
   * An `AsyncSequence` iterates over its elements asynchronously when
   * {@link #each} is called.
   *
   * You get an `AsyncSequence` by calling {@link Sequence#async} on any
   * sequence. Note that some sequence types may not support asynchronous
   * iteration.
   *
   * Returning values
   * ----------------
   *
   * Because of its asynchronous nature, an `AsyncSequence` cannot be used in the
   * same way as other sequences for functions that return values directly (e.g.,
   * `reduce`, `max`, `any`, even `toArray`).
   *
   * Instead, these methods return an `AsyncHandle` whose `onComplete` method
   * accepts a callback that will be called with the final result once iteration
   * has finished.
   *
   * Defining custom asynchronous sequences
   * --------------------------------------
   *
   * There are plenty of ways to define an asynchronous sequence. Here's one.
   *
   * 1. First, implement an {@link Iterator}. This is an object whose prototype
   *    has the methods {@link Iterator#moveNext} (which returns a `boolean`) and
   *    {@link current} (which returns the current value).
   * 2. Next, create a simple wrapper that inherits from `AsyncSequence`, whose
   *    `getIterator` function returns an instance of the iterator type you just
   *    defined.
   *
   * The default implementation for {@link #each} on an `AsyncSequence` is to
   * create an iterator and then asynchronously call {@link Iterator#moveNext}
   * (using `setImmediate`, if available, otherwise `setTimeout`) until the iterator
   * can't move ahead any more.
   *
   * @public
   * @constructor
   * @param {Sequence} parent A {@link Sequence} to wrap, to expose asynchronous
   *     iteration.
   * @param {number=} interval How many milliseconds should elapse between each
   *     element when iterating over this sequence. If this argument is omitted,
   *     asynchronous iteration will be executed as fast as possible.
   */
  function AsyncSequence(parent, interval) {
    if (parent instanceof AsyncSequence) {
      throw new Error("Sequence is already asynchronous!");
    }

    this.parent         = parent;
    this.interval       = interval;
    this.onNextCallback = getOnNextCallback(interval);
    this.cancelCallback = getCancelCallback(interval);
  }

  AsyncSequence.prototype = new Sequence();

  AsyncSequence.prototype.isAsync = function isAsync() {
    return true;
  };

  /**
   * Throws an exception. You cannot manually iterate over an asynchronous
   * sequence.
   *
   * @public
   * @example
   * Lazy([1, 2, 3]).async().getIterator() // throws
   */
  AsyncSequence.prototype.getIterator = function getIterator() {
    throw new Error('An AsyncSequence does not support synchronous iteration.');
  };

  /**
   * An asynchronous version of {@link Sequence#each}.
   *
   * @public
   * @param {Function} fn The function to invoke asynchronously on each element in
   *     the sequence one by one.
   * @returns {AsyncHandle} An {@link AsyncHandle} providing the ability to
   *     cancel the asynchronous iteration (by calling `cancel()`) as well as
   *     supply callback(s) for when an error is encountered (`onError`) or when
   *     iteration is complete (`onComplete`).
   */
  AsyncSequence.prototype.each = function each(fn) {
    var iterator = this.parent.getIterator(),
        onNextCallback = this.onNextCallback,
        cancelCallback = this.cancelCallback,
        i = 0;

    var handle = new AsyncHandle(function cancel() {
      if (cancellationId) {
        cancelCallback(cancellationId);
      }
    });

    var cancellationId = onNextCallback(function iterate() {
      cancellationId = null;

      try {
        if (iterator.moveNext() && fn(iterator.current(), i++) !== false) {
          cancellationId = onNextCallback(iterate);

        } else {
          handle._resolve();
        }

      } catch (e) {
        handle._reject(e);
      }
    });

    return handle;
  };

  /**
   * An `AsyncHandle` provides a [Promises/A+](http://promises-aplus.github.io/promises-spec/)
   * compliant interface for an {@link AsyncSequence} that is currently (or was)
   * iterating over its elements.
   *
   * In addition to behaving as a promise, an `AsyncHandle` provides the ability
   * to {@link AsyncHandle#cancel} iteration (if `cancelFn` is provided)
   * and also offers convenient {@link AsyncHandle#onComplete} and
   * {@link AsyncHandle#onError} methods to attach listeners for when iteration
   * is complete or an error is thrown during iteration.
   *
   * @public
   * @param {Function} cancelFn A function to cancel asynchronous iteration.
   *     This is passed in to support different cancellation mechanisms for
   *     different forms of asynchronous sequences (e.g., timeout-based
   *     sequences, sequences based on I/O, etc.).
   * @constructor
   *
   * @example
   * // Create a sequence of 100,000 random numbers, in chunks of 100.
   * var sequence = Lazy.generate(Math.random)
   *   .chunk(100)
   *   .async()
   *   .take(1000);
   *
   * // Reduce-style operations -- i.e., operations that return a *value* (as
   * // opposed to a *sequence*) -- return an AsyncHandle for async sequences.
   * var handle = sequence.toArray();
   *
   * handle.onComplete(function(array) {
   *   console.log('Created array with ' + array.length + ' elements!');
   * });
   *
   * // Since an AsyncHandle is a promise, you can also use it to create
   * // subsequent promises using `then` (see the Promises/A+ spec for more
   * // info).
   * var flattened = handle.then(function(array) {
   *   return Lazy(array).flatten();
   * });
   */
  function AsyncHandle(cancelFn) {
    this.resolveListeners = [];
    this.rejectListeners = [];
    this.state = PENDING;
    this.cancelFn = cancelFn;
  }

  // Async handle states
  var PENDING  = 1,
      RESOLVED = 2,
      REJECTED = 3;

  AsyncHandle.prototype.then = function then(onFulfilled, onRejected) {
    var promise = new AsyncHandle(this.cancelFn);

    this.resolveListeners.push(function(value) {
      try {
        if (typeof onFulfilled !== 'function') {
          resolve(promise, value);
          return;
        }

        resolve(promise, onFulfilled(value));

      } catch (e) {
        promise._reject(e);
      }
    });

    this.rejectListeners.push(function(reason) {
      try {
        if (typeof onRejected !== 'function') {
          promise._reject(reason);
          return;
        }

        resolve(promise, onRejected(reason));

      } catch (e) {
        promise._reject(e);
      }
    });

    if (this.state === RESOLVED) {
      this._resolve(this.value);
    }

    if (this.state === REJECTED) {
      this._reject(this.reason);
    }

    return promise;
  };

  AsyncHandle.prototype._resolve = function _resolve(value) {
    if (this.state === REJECTED) {
      return;
    }

    if (this.state === PENDING) {
      this.state = RESOLVED;
      this.value = value;
    }

    consumeListeners(this.resolveListeners, this.value);
  };

  AsyncHandle.prototype._reject = function _reject(reason) {
    if (this.state === RESOLVED) {
      return;
    }

    if (this.state === PENDING) {
      this.state = REJECTED;
      this.reason = reason;
    }

    consumeListeners(this.rejectListeners, this.reason);
  };

  /**
   * Cancels asynchronous iteration.
   *
   * @public
   */
  AsyncHandle.prototype.cancel = function cancel() {
    if (this.cancelFn) {
      this.cancelFn();
      this.cancelFn = null;
      this._resolve(false);
    }
  };

  /**
   * Updates the handle with a callback to execute when iteration is completed.
   *
   * @public
   * @param {Function} callback The function to call when the asynchronous
   *     iteration is completed.
   * @return {AsyncHandle} A reference to the handle (for chaining).
   */
  AsyncHandle.prototype.onComplete = function onComplete(callback) {
    this.resolveListeners.push(callback);
    return this;
  };

  /**
   * Updates the handle with a callback to execute if/when any error is
   * encountered during asynchronous iteration.
   *
   * @public
   * @param {Function} callback The function to call, with any associated error
   *     object, when an error occurs.
   * @return {AsyncHandle} A reference to the handle (for chaining).
   */
  AsyncHandle.prototype.onError = function onError(callback) {
    this.rejectListeners.push(callback);
    return this;
  };

  /**
   * Promise resolution procedure:
   * http://promises-aplus.github.io/promises-spec/#the_promise_resolution_procedure
   */
  function resolve(promise, x) {
    if (promise === x) {
      promise._reject(new TypeError('Cannot resolve a promise to itself'));
      return;
    }

    if (x instanceof AsyncHandle) {
      x.then(
        function(value) { resolve(promise, value); },
        function(reason) { promise._reject(reason); }
      );
      return;
    }

    var then;
    try {
      then = (/function|object/).test(typeof x) && x != null && x.then;
    } catch (e) {
      promise._reject(e);
      return;
    }

    var thenableState = PENDING;
    if (typeof then === 'function') {
      try {
        then.call(
          x,
          function resolvePromise(value) {
            if (thenableState !== PENDING) {
              return;
            }
            thenableState = RESOLVED;
            resolve(promise, value);
          },
          function rejectPromise(reason) {
            if (thenableState !== PENDING) {
              return;
            }
            thenableState = REJECTED;
            promise._reject(reason);
          }
        );
      } catch (e) {
        if (thenableState !== PENDING) {
          return;
        }

        promise._reject(e);
      }

      return;
    }

    promise._resolve(x);
  }

  function consumeListeners(listeners, value, callback) {
    callback || (callback = getOnNextCallback());

    callback(function() {
      if (listeners.length > 0) {
        listeners.shift()(value);
        consumeListeners(listeners, value, callback);
      }
    });
  }

  function getOnNextCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof setImmediate === "function") {
        return setImmediate;
      }
    }

    interval = interval || 0;
    return function(fn) {
      return setTimeout(fn, interval);
    };
  }

  function getCancelCallback(interval) {
    if (typeof interval === "undefined") {
      if (typeof clearImmediate === "function") {
        return clearImmediate;
      }
    }

    return clearTimeout;
  }

  /**
   * Transform a value, whether the value is retrieved asynchronously or directly.
   *
   * @private
   * @param {Function} fn The function that transforms the value.
   * @param {*} value The value to be transformed. This can be an {@link AsyncHandle} when the value
   *     is retrieved asynchronously, otherwise it can be anything.
   * @returns {*} An {@link AsyncHandle} when `value` is also an {@link AsyncHandle}, otherwise
   *     whatever `fn` resulted in.
   */
  function transform(fn, value) {
    if (value instanceof AsyncHandle) {
      return value.then(function() { fn(value); });
    }
    return fn(value);
  }

  /**
   * An async version of {@link Sequence#reverse}.
   */
  AsyncSequence.prototype.reverse = function reverse() {
    return this.parent.reverse().async();
  };

  /**
   * A version of {@link Sequence#find} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {Function} predicate A function to call on (potentially) every element
   *     in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     the found element, once it is detected, or else `undefined`.
   */
  AsyncSequence.prototype.find = function find(predicate) {
    var found;

    var handle = this.each(function(e, i) {
      if (predicate(e, i)) {
        found = e;
        return false;
      }
    });

    return handle.then(function() { return found; });
  };

  /**
   * A version of {@link Sequence#indexOf} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     the found index, once it is detected, or -1.
   */
  AsyncSequence.prototype.indexOf = function indexOf(value) {
    var foundIndex = -1;

    var handle = this.each(function(e, i) {
      if (e === value) {
        foundIndex = i;
        return false;
      }
    });

    return handle.then(function() {
      return foundIndex;
    });
  };

  /**
   * A version of {@link Sequence#contains} which returns an {@link AsyncHandle}.
   *
   * @public
   * @param {*} value The element to search for in the sequence.
   * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
   *     either `true` or `false` to indicate whether the element was found.
   */
  AsyncSequence.prototype.contains = function contains(value) {
    var found = false;

    var handle = this.each(function(e) {
      if (e === value) {
        found = true;
        return false;
      }
    });

    return handle.then(function() {
      return found;
    });
  };

  /**
   * Just return the same sequence for `AsyncSequence#async` (I see no harm in this).
   */
  AsyncSequence.prototype.async = function async() {
    return this;
  };

  /**
   * See {@link ObjectLikeSequence#watch} for docs.
   */
  ObjectWrapper.prototype.watch = function watch(propertyNames) {
    return new WatchedPropertySequence(this.source, propertyNames);
  };

  function WatchedPropertySequence(object, propertyNames) {
    this.listeners = [];

    if (!propertyNames) {
      propertyNames = Lazy(object).keys().toArray();
    } else if (!(propertyNames instanceof Array)) {
      propertyNames = [propertyNames];
    }

    var listeners = this.listeners,
        index     = 0;

    Lazy(propertyNames).each(function(propertyName) {
      var propertyValue = object[propertyName];

      Object.defineProperty(object, propertyName, {
        get: function() {
          return propertyValue;
        },

        set: function(value) {
          for (var i = listeners.length - 1; i >= 0; --i) {
            if (listeners[i]({ property: propertyName, value: value }, index) === false) {
              listeners.splice(i, 1);
            }
          }
          propertyValue = value;
          ++index;
        }
      });
    });
  }

  WatchedPropertySequence.prototype = new AsyncSequence();

  WatchedPropertySequence.prototype.each = function each(fn) {
    this.listeners.push(fn);
  };

  /**
   * A StreamLikeSequence comprises a sequence of 'chunks' of data, which are
   * typically multiline strings.
   *
   * @constructor
   */
  function StreamLikeSequence() {}

  StreamLikeSequence.prototype = new AsyncSequence();

  StreamLikeSequence.prototype.isAsync = function isAsync() {
    return true;
  };

  StreamLikeSequence.prototype.split = function split(delimiter) {
    return new SplitStreamSequence(this, delimiter);
  };

  /**
   * @constructor
   */
  function SplitStreamSequence(parent, delimiter) {
    this.parent    = parent;
    this.delimiter = delimiter;
    this.each      = this.getEachForDelimiter(delimiter);
  }

  SplitStreamSequence.prototype = new Sequence();

  SplitStreamSequence.prototype.getEachForDelimiter = function getEachForDelimiter(delimiter) {
    if (delimiter instanceof RegExp) {
      return this.regexEach;
    }

    return this.stringEach;
  };

  SplitStreamSequence.prototype.regexEach = function each(fn) {
    var delimiter = cloneRegex(this.delimiter),
        buffer = '',
        start = 0, end,
        index = 0;

    var handle = this.parent.each(function(chunk) {
      buffer += chunk;

      var match;
      while (match = delimiter.exec(buffer)) {
        end = match.index;
        if (fn(buffer.substring(start, end), index++) === false) {
          return false;
        }
        start = end + match[0].length;
      }

      buffer = buffer.substring(start);
      start = 0;
    });

    handle.onComplete(function() {
      if (buffer.length > 0) {
        fn(buffer);
      }
    });

    return handle;
  };

  SplitStreamSequence.prototype.stringEach = function each(fn) {
    var delimiter  = this.delimiter,
        pieceIndex = 0,
        buffer = '',
        bufferIndex = 0;

    var handle = this.parent.each(function(chunk) {
      buffer += chunk;
      var delimiterIndex;
      while ((delimiterIndex = buffer.indexOf(delimiter)) >= 0) {
        var piece = buffer.substr(0,delimiterIndex);
        buffer = buffer.substr(delimiterIndex+delimiter.length);
        if (fn(piece,pieceIndex++) === false) {
          return false;
        }
      }
      return true;
    });

    handle.onComplete(function() {
      fn(buffer, pieceIndex++);
    });

    return handle;
  };

  StreamLikeSequence.prototype.lines = function lines() {
    return this.split("\n");
  };

  StreamLikeSequence.prototype.match = function match(pattern) {
    return new MatchedStreamSequence(this, pattern);
  };

  /**
   * @constructor
   */
  function MatchedStreamSequence(parent, pattern) {
    this.parent  = parent;
    this.pattern = cloneRegex(pattern);
  }

  MatchedStreamSequence.prototype = new AsyncSequence();

  MatchedStreamSequence.prototype.each = function each(fn) {
    var pattern = this.pattern,
        done      = false,
        i         = 0;

    return this.parent.each(function(chunk) {
      Lazy(chunk).match(pattern).each(function(match) {
        if (fn(match, i++) === false) {
          done = true;
          return false;
        }
      });

      return !done;
    });
  };

  /**
   * Defines a wrapper for custom {@link StreamLikeSequence}s. This is useful
   * if you want a way to handle a stream of events as a sequence, but you can't
   * use Lazy's existing interface (i.e., you're wrapping an object from a
   * library with its own custom events).
   *
   * This method defines a *factory*: that is, it produces a function that can
   * be used to wrap objects and return a {@link Sequence}. Hopefully the
   * example will make this clear.
   *
   * @public
   * @param {Function} initializer An initialization function called on objects
   *     created by this factory. `this` will be bound to the created object,
   *     which is an instance of {@link StreamLikeSequence}. Use `emit` to
   *     generate data for the sequence.
   * @returns {Function} A function that creates a new {@link StreamLikeSequence},
   *     initializes it using the specified function, and returns it.
   *
   * @example
   * var factory = Lazy.createWrapper(function(eventSource) {
   *   var sequence = this;
   *
   *   eventSource.handleEvent(function(data) {
   *     sequence.emit(data);
   *   });
   * });
   *
   * var eventEmitter = {
   *   triggerEvent: function(data) {
   *     eventEmitter.eventHandler(data);
   *   },
   *   handleEvent: function(handler) {
   *     eventEmitter.eventHandler = handler;
   *   },
   *   eventHandler: function() {}
   * };
   *
   * var events = [];
   *
   * factory(eventEmitter).each(function(e) {
   *   events.push(e);
   * });
   *
   * eventEmitter.triggerEvent('foo');
   * eventEmitter.triggerEvent('bar');
   *
   * events // => ['foo', 'bar']
   */
  Lazy.createWrapper = function createWrapper(initializer) {
    var ctor = function() {
      this.listeners = [];
    };

    ctor.prototype = new StreamLikeSequence();

    ctor.prototype.each = function(listener) {
      this.listeners.push(listener);
    };

    ctor.prototype.emit = function(data) {
      var listeners = this.listeners;

      for (var len = listeners.length, i = len - 1; i >= 0; --i) {
        if (listeners[i](data) === false) {
          listeners.splice(i, 1);
        }
      }
    };

    return function() {
      var sequence = new ctor();
      initializer.apply(sequence, arguments);
      return sequence;
    };
  };

  /**
   * Creates a {@link GeneratedSequence} using the specified generator function
   * and (optionally) length.
   *
   * @public
   * @param {function(number):*} generatorFn The function used to generate the
   *     sequence. This function accepts an index as a parameter and should return
   *     a value for that index in the resulting sequence.
   * @param {number=} length The length of the sequence, for sequences with a
   *     definite length.
   * @returns {GeneratedSequence} The generated sequence.
   *
   * @examples
   * var randomNumbers = Lazy.generate(Math.random);
   * var countingNumbers = Lazy.generate(function(i) { return i + 1; }, 5);
   *
   * randomNumbers          // instanceof Lazy.GeneratedSequence
   * randomNumbers.length() // => undefined
   * countingNumbers          // sequence: [1, 2, 3, 4, 5]
   * countingNumbers.length() // => 5
   */
  Lazy.generate = function generate(generatorFn, length) {
    return new GeneratedSequence(generatorFn, length);
  };

  /**
   * Creates a sequence from a given starting value, up to a specified stopping
   * value, incrementing by a given step.
   *
   * @public
   * @returns {GeneratedSequence} The sequence defined by the given ranges.
   *
   * @examples
   * Lazy.range(3)         // sequence: [0, 1, 2]
   * Lazy.range(1, 4)      // sequence: [1, 2, 3]
   * Lazy.range(2, 10, 2)  // sequence: [2, 4, 6, 8]
   * Lazy.range(5, 1, 2)   // sequence: []
   * Lazy.range(5, 15, -2) // sequence: []
   */
  Lazy.range = function range() {
    var start = arguments.length > 1 ? arguments[0] : 0,
        stop  = arguments.length > 1 ? arguments[1] : arguments[0],
        step  = arguments.length > 2 ? arguments[2] : 1;
    return this.generate(function(i) { return start + (step * i); })
      .take(Math.floor((stop - start) / step));
  };

  /**
   * Creates a sequence consisting of the given value repeated a specified number
   * of times.
   *
   * @public
   * @param {*} value The value to repeat.
   * @param {number=} count The number of times the value should be repeated in
   *     the sequence. If this argument is omitted, the value will repeat forever.
   * @returns {GeneratedSequence} The sequence containing the repeated value.
   *
   * @examples
   * Lazy.repeat("hi", 3)          // sequence: ["hi", "hi", "hi"]
   * Lazy.repeat("young")          // instanceof Lazy.GeneratedSequence
   * Lazy.repeat("young").length() // => undefined
   * Lazy.repeat("young").take(3)  // sequence: ["young", "young", "young"]
   */
  Lazy.repeat = function repeat(value, count) {
    return Lazy.generate(function() { return value; }, count);
  };

  Lazy.Sequence           = Sequence;
  Lazy.ArrayLikeSequence  = ArrayLikeSequence;
  Lazy.ObjectLikeSequence = ObjectLikeSequence;
  Lazy.StringLikeSequence = StringLikeSequence;
  Lazy.StreamLikeSequence = StreamLikeSequence;
  Lazy.GeneratedSequence  = GeneratedSequence;
  Lazy.AsyncSequence      = AsyncSequence;
  Lazy.AsyncHandle        = AsyncHandle;

  /*** Useful utility methods ***/

  /**
   * Creates a shallow copy of an array or object.
   *
   * @examples
   * var array  = [1, 2, 3], clonedArray,
   *     object = { foo: 1, bar: 2 }, clonedObject;
   *
   * clonedArray = Lazy.clone(array); // => [1, 2, 3]
   * clonedArray.push(4); // clonedArray == [1, 2, 3, 4]
   * array; // => [1, 2, 3]
   *
   * clonedObject = Lazy.clone(object); // => { foo: 1, bar: 2 }
   * clonedObject.baz = 3; // clonedObject == { foo: 1, bar: 2, baz: 3 }
   * object; // => { foo: 1, bar: 2 }
   */
  Lazy.clone = function clone(target) {
    return Lazy(target).value();
  };

  /**
   * Marks a method as deprecated, so calling it will issue a console warning.
   */
  Lazy.deprecate = function deprecate(message, fn) {
    return function() {
      console.warn(message);
      return fn.apply(this, arguments);
    };
  };

  var arrayPop   = Array.prototype.pop,
      arraySlice = Array.prototype.slice;

  /**
   * Creates a callback... you know, Lo-Dash style.
   *
   * - for functions, just returns the function
   * - for strings, returns a pluck-style callback
   * - for objects, returns a where-style callback
   *
   * @private
   * @param {Function|string|Object} callback A function, string, or object to
   *     convert to a callback.
   * @param {*} defaultReturn If the callback is undefined, a default return
   *     value to use for the function.
   * @returns {Function} The callback function.
   *
   * @examples
   * createCallback(function() {})                  // instanceof Function
   * createCallback('foo')                          // instanceof Function
   * createCallback('foo')({ foo: 'bar'})           // => 'bar'
   * createCallback({ foo: 'bar' })({ foo: 'bar' }) // => true
   * createCallback({ foo: 'bar' })({ foo: 'baz' }) // => false
   */
  function createCallback(callback, defaultValue) {
    switch (typeof callback) {
      case "function":
        return callback;

      case "string":
        return function(e) {
          return e[callback];
        };

      case "object":
        return function(e) {
          return Lazy(callback).all(function(value, key) {
            return e[key] === value;
          });
        };

      case "undefined":
        return defaultValue ?
          function() { return defaultValue; } :
          Lazy.identity;

      default:
        throw new Error("Don't know how to make a callback from a " + typeof callback + "!");
    }
  }

  /**
   * Takes a function that returns a value for one argument and produces a
   * function that compares two arguments.
   *
   * @private
   * @param {Function|string|Object} callback A function, string, or object to
   *     convert to a callback using `createCallback`.
   * @returns {Function} A function that accepts two values and returns 1 if
   *     the first is greater, -1 if the second is greater, or 0 if they are
   *     equivalent.
   *
   * @examples
   * createComparator('a')({ a: 1 }, { a: 2 });       // => -1
   * createComparator('a')({ a: 6 }, { a: 2 });       // => 1
   * createComparator('a')({ a: 1 }, { a: 1 });       // => 0
   * createComparator()(3, 5);                        // => -1
   * createComparator()(7, 5);                        // => 1
   * createComparator()(3, 3);                        // => 0
   */
  function createComparator(callback, descending) {
    if (!callback) { return compare; }

    callback = createCallback(callback);

    return function(x, y) {
      return compare(callback(x), callback(y));
    };
  }

  /**
   * Takes a function and returns a function with the same logic but the
   * arguments reversed. Only applies to functions w/ arity=2 as this is private
   * and I can do what I want.
   *
   * @private
   * @param {Function} fn The function to "reverse"
   * @returns {Function} The "reversed" function
   *
   * @examples
   * reverseArguments(function(x, y) { return x + y; })('a', 'b'); // => 'ba'
   */
  function reverseArguments(fn) {
    return function(x, y) { return fn(y, x); };
  }

  /**
   * Creates a Set containing the specified values.
   *
   * @param {...Array} values One or more array(s) of values used to populate the
   *     set.
   * @returns {Set} A new set containing the values passed in.
   */
  function createSet(values) {
    var set = new Set();
    Lazy(values || []).flatten().each(function(e) {
      set.add(e);
    });
    return set;
  }

  /**
   * Compares two elements for sorting purposes.
   *
   * @private
   * @param {*} x The left element to compare.
   * @param {*} y The right element to compare.
   * @returns {number} 1 if x > y, -1 if x < y, or 0 if x and y are equal.
   *
   * @examples
   * compare(1, 2)     // => -1
   * compare(1, 1)     // => 0
   * compare(2, 1)     // => 1
   * compare('a', 'b') // => -1
   */
  function compare(x, y) {
    if (x === y) {
      return 0;
    }

    return x > y ? 1 : -1;
  }

  /**
   * Iterates over every element in an array.
   *
   * @param {Array} array The array.
   * @param {Function} fn The function to call on every element, which can return
   *     false to stop the iteration early.
   * @returns {boolean} True if every element in the entire sequence was iterated,
   *     otherwise false.
   */
  function forEach(array, fn) {
    var i = -1,
        len = array.length;

    while (++i < len) {
      if (fn(array[i], i) === false) {
        return false;
      }
    }

    return true;
  }

  function getFirst(sequence) {
    var result;
    sequence.each(function(e) {
      result = e;
      return false;
    });
    return result;
  }

  /**
   * Checks if an element exists in an array.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @returns {boolean} Whether or not the element exists in the array.
   *
   * @examples
   * arrayContains([1, 2], 2)              // => true
   * arrayContains([1, 2], 3)              // => false
   * arrayContains([undefined], undefined) // => true
   * arrayContains([NaN], NaN)             // => true
   */
  function arrayContains(array, element) {
    var i = -1,
        length = array.length;

    // Special handling for NaN
    if (element !== element) {
      while (++i < length) {
        if (array[i] !== array[i]) {
          return true;
        }
      }
      return false;
    }

    while (++i < length) {
      if (array[i] === element) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if an element exists in an array before a given index.
   *
   * @private
   * @param {Array} array
   * @param {*} element
   * @param {number} index
   * @param {Function} keyFn
   * @returns {boolean}
   *
   * @examples
   * arrayContainsBefore([1, 2, 3], 3, 2) // => false
   * arrayContainsBefore([1, 2, 3], 3, 3) // => true
   */
  function arrayContainsBefore(array, element, index, keyFn) {
    var i = -1;

    if (keyFn) {
      keyFn = createCallback(keyFn);
      while (++i < index) {
        if (keyFn(array[i]) === keyFn(element)) {
          return true;
        }
      }

    } else {
      while (++i < index) {
        if (array[i] === element) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Swaps the elements at two specified positions of an array.
   *
   * @private
   * @param {Array} array
   * @param {number} i
   * @param {number} j
   *
   * @examples
   * var array = [1, 2, 3, 4, 5];
   *
   * swap(array, 2, 3) // array == [1, 2, 4, 3, 5]
   */
  function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  /**
   * "Clones" a regular expression (but makes it always global).
   *
   * @private
   * @param {RegExp|string} pattern
   * @returns {RegExp}
   */
  function cloneRegex(pattern) {
    return eval("" + pattern + (!pattern.global ? "g" : ""));
  };

  /**
   * A collection of unique elements.
   *
   * @private
   * @constructor
   *
   * @examples
   * var set  = new Set(),
   *     obj1 = {},
   *     obj2 = {},
   *     fn1 = function fn1() {},
   *     fn2 = function fn2() {};
   *
   * set.add('foo')            // => true
   * set.add('foo')            // => false
   * set.add(1)                // => true
   * set.add(1)                // => false
   * set.add('1')              // => true
   * set.add('1')              // => false
   * set.add(obj1)             // => true
   * set.add(obj1)             // => false
   * set.add(obj2)             // => true
   * set.add(fn1)              // => true
   * set.add(fn2)              // => true
   * set.add(fn2)              // => false
   * set.contains('__proto__') // => false
   * set.add('__proto__')      // => true
   * set.add('__proto__')      // => false
   * set.contains('add')       // => false
   * set.add('add')            // => true
   * set.add('add')            // => false
   * set.contains(undefined)   // => false
   * set.add(undefined)        // => true
   * set.contains(undefined)   // => true
   * set.contains('undefined') // => false
   * set.add('undefined')      // => true
   * set.contains('undefined') // => true
   * set.contains(NaN)         // => false
   * set.add(NaN)              // => true
   * set.contains(NaN)         // => true
   * set.contains('NaN')       // => false
   * set.add('NaN')            // => true
   * set.contains('NaN')       // => true
   * set.contains('@foo')      // => false
   * set.add('@foo')           // => true
   * set.contains('@foo')      // => true
   */
  function Set() {
    this.table   = {};
    this.objects = [];
  }

  /**
   * Attempts to add a unique value to the set.
   *
   * @param {*} value The value to add.
   * @returns {boolean} True if the value was added to the set (meaning an equal
   *     value was not already present), or else false.
   */
  Set.prototype.add = function add(value) {
    var table = this.table,
        type  = typeof value,

        // only applies for strings
        firstChar,

        // only applies for objects
        objects;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        if (!table[value]) {
          table[value] = true;
          return true;
        }
        return false;

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        objects = this.objects;
        if (!arrayContains(objects, value)) {
          objects.push(value);
          return true;
        }
        return false;
    }
  };

  /**
   * Checks whether the set contains a value.
   *
   * @param {*} value The value to check for.
   * @returns {boolean} True if the set contains the value, or else false.
   */
  Set.prototype.contains = function contains(value) {
    var type = typeof value,

        // only applies for strings
        firstChar;

    switch (type) {
      case "number":
      case "boolean":
      case "undefined":
        return !!this.table[value];

      case "string":
        // Essentially, escape the first character if it could possibly collide
        // with a number, boolean, or undefined (or a string that happens to start
        // with the escape character!), OR if it could override a special property
        // such as '__proto__' or 'constructor'.
        switch (value.charAt(0)) {
          case "_": // e.g., __proto__
          case "f": // for 'false'
          case "t": // for 'true'
          case "c": // for 'constructor'
          case "u": // for 'undefined'
          case "@": // escaped
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
          case "N": // for NaN
            value = "@" + value;
        }
        return !!this.table[value];

      default:
        // For objects and functions, we can't really do anything other than store
        // them in an array and do a linear search for reference equality.
        return arrayContains(this.objects, value);
    }
  };

  /**
   * A "rolling" queue, with a fixed capacity. As items are added to the head,
   * excess items are dropped from the tail.
   *
   * @private
   * @constructor
   *
   * @examples
   * var queue = new Queue(3);
   *
   * queue.add(1).toArray()        // => [1]
   * queue.add(2).toArray()        // => [1, 2]
   * queue.add(3).toArray()        // => [1, 2, 3]
   * queue.add(4).toArray()        // => [2, 3, 4]
   * queue.add(5).add(6).toArray() // => [4, 5, 6]
   * queue.add(7).add(8).toArray() // => [6, 7, 8]
   *
   * // also want to check corner cases
   * new Queue(1).add('foo').add('bar').toArray() // => ['bar']
   * new Queue(0).add('foo').toArray()            // => []
   * new Queue(-1)                                // throws
   *
   * @benchmarks
   * function populateQueue(count, capacity) {
   *   var q = new Queue(capacity);
   *   for (var i = 0; i < count; ++i) {
   *     q.add(i);
   *   }
   * }
   *
   * function populateArray(count, capacity) {
   *   var arr = [];
   *   for (var i = 0; i < count; ++i) {
   *     if (arr.length === capacity) { arr.shift(); }
   *     arr.push(i);
   *   }
   * }
   *
   * populateQueue(100, 10); // populating a Queue
   * populateArray(100, 10); // populating an Array
   */
  function Queue(capacity) {
    this.contents = new Array(capacity);
    this.start    = 0;
    this.count    = 0;
  }

  /**
   * Adds an item to the queue, and returns the queue.
   */
  Queue.prototype.add = function add(element) {
    var contents = this.contents,
        capacity = contents.length,
        start    = this.start;

    if (this.count === capacity) {
      contents[start] = element;
      this.start = (start + 1) % capacity;

    } else {
      contents[this.count++] = element;
    }

    return this;
  };

  /**
   * Returns an array containing snapshot of the queue's contents.
   */
  Queue.prototype.toArray = function toArray() {
    var contents = this.contents,
        start    = this.start,
        count    = this.count;

    var snapshot = contents.slice(start, start + count);
    if (snapshot.length < count) {
      snapshot = snapshot.concat(contents.slice(0, count - snapshot.length));
    }

    return snapshot;
  };

  /**
   * Shared base method for defining new sequence types.
   */
  function defineSequenceType(base, name, overrides) {
    /** @constructor */
    var ctor = function ctor() {};

    // Make this type inherit from the specified base.
    ctor.prototype = new base();

    // Attach overrides to the new sequence type's prototype.
    for (var override in overrides) {
      ctor.prototype[override] = overrides[override];
    }

    // Define a factory method that sets the new sequence's parent to the caller
    // and (optionally) applies any additional initialization logic.
    // Expose this as a chainable method so that we can do:
    // Lazy(...).map(...).filter(...).blah(...);
    var factory = function factory() {
      var sequence = new ctor();

      // Every sequence needs a reference to its parent in order to work.
      sequence.parent = this;

      // If a custom init function was supplied, call it now.
      if (sequence.init) {
        sequence.init.apply(sequence, arguments);
      }

      return sequence;
    };

    var methodNames = typeof name === 'string' ? [name] : name;
    for (var i = 0; i < methodNames.length; ++i) {
      base.prototype[methodNames[i]] = factory;
    }

    return ctor;
  }

  /*** Exposing Lazy to the world ***/

  // For Node.js
  if (typeof module === "object" && module && module.exports === context) {
    module.exports = Lazy;

  // For browsers
  } else {
    context.Lazy = Lazy;
  }

}(this));



// moment-timezone.js
// version : 0.0.6
// author : Tim Wood
// license : MIT
// github.com/moment/moment-timezone

(function (root, factory) {
  "use strict";

  /*global define*/
  if (typeof define === 'function' && define.amd) {
    define(['moment'], factory);                 // AMD
  } else if (typeof exports === 'object') {
    module.exports = factory(require('moment')); // Node
  } else {
    factory(root.moment);                        // Browser
  }
}(this, function (moment) {
  "use strict";

  // Do not load moment-timezone a second time.
  if (moment.tz !== undefined) {
    return moment;
  }

  var VERSION = "0.0.6",
    zones = {},
    links = {};

  /************************************
   Unpacking
   ************************************/

  function charCodeToInt(charCode) {
    if (charCode > 96) {
      return charCode - 87;
    } else if (charCode > 64) {
      return charCode - 29;
    }
    return charCode - 48;
  }

  function unpackBase60(string) {
    var i = 0,
      parts = string.split('.'),
      whole = parts[0],
      fractional = parts[1] || '',
      multiplier = 1,
      num,
      out = 0,
      sign = 1;

    // handle negative numbers
    if (string.charCodeAt(0) === 45) {
      i = 1;
      sign = -1;
    }

    // handle digits before the decimal
    for (i; i < whole.length; i++) {
      num = charCodeToInt(whole.charCodeAt(i));
      out = 60 * out + num;
    }

    // handle digits after the decimal
    for (i = 0; i < fractional.length; i++) {
      multiplier = multiplier / 60;
      num = charCodeToInt(fractional.charCodeAt(i));
      out += num * multiplier;
    }

    return out * sign;
  }

  function arrayToInt(array) {
    for (var i = 0; i < array.length; i++) {
      array[i] = unpackBase60(array[i]);
    }
  }

  function intToUntil(array, length) {
    for (var i = 0; i < length; i++) {
      array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
    }

    array[length - 1] = Infinity;
  }

  function mapIndices(source, indices) {
    var out = [], i;

    for (i = 0; i < indices.length; i++) {
      out[i] = source[indices[i]];
    }

    return out;
  }

  function unpack(string) {
    var data = string.split('|'),
      offsets = data[2].split(' '),
      indices = data[3].split(''),
      untils = data[4].split(' ');

    arrayToInt(offsets);
    arrayToInt(indices);
    arrayToInt(untils);

    intToUntil(untils, indices.length);

    return {
      name: data[0],
      abbrs: mapIndices(data[1].split(' '), indices),
      offsets: mapIndices(offsets, indices),
      untils: untils
    };
  }

  /************************************
   Zone object
   ************************************/

  function Zone(packedString) {
    var unpacked = unpack(packedString);
    this.name = unpacked.name;
    this.abbrs = unpacked.abbrs;
    this.untils = unpacked.untils;
    this.offsets = unpacked.offsets;
  }

  Zone.prototype = {
    _index: function (timestamp) {
      var target = +timestamp,
        untils = this.untils,
        i;

      for (i = 0; i < untils.length; i++) {
        if (target < untils[i]) {
          return i;
        }
      }
    },

    parse: function (timestamp) {
      var target = +timestamp,
        offsets = this.offsets,
        untils = this.untils,
        i;

      for (i = 0; i < untils.length; i++) {
        if (target < untils[i] - (offsets[i] * 60000)) {
          return offsets[i];
        }
      }
    },

    abbr: function (mom) {
      return this.abbrs[this._index(mom)];
    },

    offset: function (mom) {
      return this.offsets[this._index(mom)];
    }
  };

  /************************************
   Global Methods
   ************************************/

  function normalizeName(name) {
    return (name || '').toLowerCase().replace(/\//g, '_');
  }

  function addZone(packed) {
    var i, zone;

    if (typeof packed === "string") {
      packed = [packed];
    }

    for (i = 0; i < packed.length; i++) {
      zone = new Zone(packed[i]);
      zones[normalizeName(zone.name)] = zone;
    }
  }

  function getZone(name) {
    name = normalizeName(name);
    var linkName = links[name];

    if (linkName && zones[linkName]) {
      name = linkName;
    }

    return zones[name] || null;
  }

  function getNames() {
    var i, out = [];

    for (i in zones) {
      if (zones.hasOwnProperty(i) && zones[i]) {
        out.push(zones[i].name);
      }
    }

    return out.sort();
  }

  function addLink(aliases) {
    var i, alias;

    if (typeof aliases === "string") {
      aliases = [aliases];
    }

    for (i = 0; i < aliases.length; i++) {
      alias = normalizeName(aliases[i]).split('|');
      links[alias[0]] = alias[1];
      links[alias[1]] = alias[0];
    }
  }

  function loadData(data) {
    addZone(data.zones);
    addLink(data.links);
    tz.dataVersion = data.version;
  }

  function zoneExists(name) {
    if (!zoneExists.didShowError) {
      zoneExists.didShowError = true;
      if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
      }
    }
    return !!getZone(name);
  }

  function needsOffset(m) {
    return !!(m._a && (m._tzm === undefined));
  }

  /************************************
   moment.tz namespace
   ************************************/

  function tz() {
    var args = Array.prototype.slice.call(arguments, 0, -1),
      name = arguments[arguments.length - 1],
      zone = getZone(name),
      out = moment.utc.apply(null, args);

    if (zone && needsOffset(out)) {
      out.add('minutes', zone.parse(out));
    }

    out.tz(name);

    return out;
  }

  tz.version = VERSION;
  tz.dataVersion = '';
  tz._zones = zones;
  tz._links = links;
  tz.add = addZone;
  tz.link = addLink;
  tz.load = loadData;
  tz.zone = getZone;
  tz.zoneExists = zoneExists; // deprecated in 0.1.0
  tz.names = getNames;
  tz.Zone = Zone;
  tz.unpack = unpack;
  tz.unpackBase60 = unpackBase60;
  tz.needsOffset = needsOffset;

  /************************************
   Interface with Moment.js
   ************************************/

  var fn = moment.fn;

  moment.tz = tz;

  moment.updateOffset = function (mom, keepTime) {
    var offset;
    if (mom._z) {
      offset = mom._z.offset(mom);
      if (Math.abs(offset) < 16) {
        offset = offset / 60;
      }
      mom.zone(offset, keepTime);
    }
  };

  fn.tz = function (name) {
    if (name) {
      this._z = getZone(name);
      if (this._z) {
        moment.updateOffset(this);
      }
      return this;
    }
    if (this._z) {
      return this._z.name;
    }
  };

  function abbrWrap(old) {
    return function () {
      if (this._z) {
        return this._z.abbr(this);
      }
      return old.call(this);
    };
  }

  function resetZoneWrap(old) {
    return function () {
      this._z = null;
      return old.call(this);
    };
  }

  fn.zoneName = abbrWrap(fn.zoneName);
  fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
  fn.utc = resetZoneWrap(fn.utc);

  // Cloning a moment should include the _z property.
  moment.momentProperties._z = null;

  loadData({
    "version": "2014e",
    "zones": [
      "Africa/Abidjan|GMT|0|0|",
      "Africa/Addis_Ababa|EAT|-30|0|",
      "Africa/Algiers|CET|-10|0|",
      "Africa/Bangui|WAT|-10|0|",
      "Africa/Blantyre|CAT|-20|0|",
      "Africa/Cairo|EET EEST|-20 -30|0101010101010101010101010101010|1Cby0 Fb0 c10 8n0 8Nd0 gL0 e10 mn0 1o10 jz0 gN0 pb0 1qN0 dX0 e10 xz0 1o10 bb0 e10 An0 1o10 5z0 e10 FX0 1o10 2L0 e10 IL0 1C10 Lz0",
      "Africa/Casablanca|WET WEST|0 -10|01010101010101010101010101010101010101010|1Cco0 Db0 1zd0 Lz0 1Nf0 wM0 co0 go0 1o00 s00 dA0 vc0 11A0 A00 e00 y00 11A0 uo0 e00 DA0 11A0 rA0 e00 Jc0 WM0 m00 gM0 M00 WM0 jc0 e00 RA0 11A0 dA0 e00 Uo0 11A0 800 gM0 Xc0",
      "Africa/Ceuta|CET CEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Africa/Johannesburg|SAST|-20|0|",
      "Africa/Tripoli|EET CET CEST|-20 -10 -20|0120|1IlA0 TA0 1o00",
      "Africa/Windhoek|WAST WAT|-20 -10|01010101010101010101010|1C1c0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0",
      "America/Adak|HAST HADT|a0 90|01010101010101010101010|1BR00 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Anchorage|AKST AKDT|90 80|01010101010101010101010|1BQX0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Anguilla|AST|40|0|",
      "America/Araguaina|BRT BRST|30 20|010|1IdD0 Lz0",
      "America/Argentina/Buenos_Aires|ART|30|0|",
      "America/Asuncion|PYST PYT|30 40|01010101010101010101010|1C430 1a10 1fz0 1a10 1fz0 1cN0 17b0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0 19X0 1ip0 17b0 1ip0 17b0 1ip0",
      "America/Atikokan|EST|50|0|",
      "America/Bahia|BRT BRST|30 20|010|1FJf0 Rb0",
      "America/Bahia_Banderas|MST CDT CST|70 50 60|01212121212121212121212|1C1l0 1nW0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
      "America/Belem|BRT|30|0|",
      "America/Belize|CST|60|0|",
      "America/Boa_Vista|AMT|40|0|",
      "America/Bogota|COT|50|0|",
      "America/Boise|MST MDT|70 60|01010101010101010101010|1BQV0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Campo_Grande|AMST AMT|30 40|01010101010101010101010|1BIr0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10",
      "America/Cancun|CST CDT|60 50|01010101010101010101010|1C1k0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
      "America/Caracas|VET|4u|0|",
      "America/Cayenne|GFT|30|0|",
      "America/Chicago|CST CDT|60 50|01010101010101010101010|1BQU0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Chihuahua|MST MDT|70 60|01010101010101010101010|1C1l0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
      "America/Creston|MST|70|0|",
      "America/Dawson|PST PDT|80 70|01010101010101010101010|1BQW0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Detroit|EST EDT|50 40|01010101010101010101010|1BQT0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Eirunepe|AMT ACT|40 50|01|1KLE0",
      "America/Glace_Bay|AST ADT|40 30|01010101010101010101010|1BQS0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Godthab|WGT WGST|30 20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "America/Goose_Bay|AST ADT|40 30|01010101010101010101010|1BQQ1 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Guayaquil|ECT|50|0|",
      "America/Guyana|GYT|40|0|",
      "America/Havana|CST CDT|50 40|01010101010101010101010|1BQR0 1wo0 U00 1zc0 U00 1qM0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0",
      "America/La_Paz|BOT|40|0|",
      "America/Lima|PET|50|0|",
      "America/Metlakatla|MeST|80|0|",
      "America/Miquelon|PMST PMDT|30 20|01010101010101010101010|1BQR0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Montevideo|UYST UYT|20 30|01010101010101010101010|1BQQ0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 14n0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10",
      "America/Noronha|FNT|20|0|",
      "America/North_Dakota/Beulah|MST MDT CST CDT|70 60 60 50|01232323232323232323232|1BQV0 1zb0 Oo0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Paramaribo|SRT|30|0|",
      "America/Port-au-Prince|EST EDT|50 40|0101010101010101010|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "America/Santa_Isabel|PST PDT|80 70|01010101010101010101010|1C1m0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0",
      "America/Santiago|CLST CLT|30 40|01010101010101010101010|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 1wn0 Rd0 1wn0 Rd0 1wn0 Rd0 1zb0 Op0 1zb0 Rd0 1wn0 Rd0",
      "America/Sao_Paulo|BRST BRT|20 30|01010101010101010101010|1BIq0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10",
      "America/Scoresbysund|EGT EGST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "America/St_Johns|NST NDT|3u 2u|01010101010101010101010|1BQPv 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
      "Antarctica/Casey|CAST WST|-b0 -80|0101|1BN30 40P0 KL0",
      "Antarctica/Davis|DAVT DAVT|-50 -70|0101|1BPw0 3Wn0 KN0",
      "Antarctica/DumontDUrville|DDUT|-a0|0|",
      "Antarctica/Macquarie|EST MIST|-b0 -b0|01|1C140",
      "Antarctica/Mawson|MAWT|-50|0|",
      "Antarctica/McMurdo|NZDT NZST|-d0 -c0|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
      "Antarctica/Rothera|ROTT|30|0|",
      "Antarctica/Syowa|SYOT|-30|0|",
      "Antarctica/Troll|UTC CEST|0 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Antarctica/Vostok|VOST|-60|0|",
      "Asia/Aden|AST|-30|0|",
      "Asia/Almaty|ALMT|-60|0|",
      "Asia/Amman|EET EEST|-20 -30|010101010101010101010|1BVy0 1qM0 11A0 1o00 11A0 4bX0 Dd0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0",
      "Asia/Anadyr|ANAT ANAST ANAT|-c0 -c0 -b0|0120|1BWe0 1qN0 WM0",
      "Asia/Aqtau|AQTT|-50|0|",
      "Asia/Ashgabat|TMT|-50|0|",
      "Asia/Baku|AZT AZST|-40 -50|01010101010101010101010|1BWo0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Asia/Bangkok|ICT|-70|0|",
      "Asia/Beirut|EET EEST|-20 -30|01010101010101010101010|1BWm0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0",
      "Asia/Bishkek|KGT|-60|0|",
      "Asia/Brunei|BNT|-80|0|",
      "Asia/Calcutta|IST|-5u|0|",
      "Asia/Choibalsan|CHOT|-80|0|",
      "Asia/Chongqing|CST|-80|0|",
      "Asia/Dacca|BDT|-60|0|",
      "Asia/Damascus|EET EEST|-20 -30|01010101010101010101010|1C0m0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0",
      "Asia/Dili|TLT|-90|0|",
      "Asia/Dubai|GST|-40|0|",
      "Asia/Dushanbe|TJT|-50|0|",
      "Asia/Gaza|EET EEST|-20 -30|01010101010101010101010|1BVW1 SKX 1xd1 MKX 1AN0 1a00 1fA0 1cL0 1cN0 1cL0 1cN0 1cL0 1fB0 19X0 1fB0 19X0 1fB0 19X0 1fB0 1cL0 1cN0 1cL0",
      "Asia/Hebron|EET EEST|-20 -30|0101010101010101010101010|1BVy0 Tb0 1xd1 MKX bB0 cn0 1cN0 1a00 1fA0 1cL0 1cN0 1cL0 1cN0 1cL0 1fB0 19X0 1fB0 19X0 1fB0 19X0 1fB0 1cL0 1cN0 1cL0",
      "Asia/Hong_Kong|HKT|-80|0|",
      "Asia/Hovd|HOVT|-70|0|",
      "Asia/Irkutsk|IRKT IRKST IRKT|-80 -90 -90|0102|1BWi0 1qM0 WM0",
      "Asia/Istanbul|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 Xc0 1qo0 WM0 1qM0 11A0 1o00 1200 1nA0 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Asia/Jakarta|WIB|-70|0|",
      "Asia/Jayapura|WIT|-90|0|",
      "Asia/Jerusalem|IST IDT|-20 -30|01010101010101010101010|1BVA0 17X0 1kp0 1dz0 1c10 1aL0 1eN0 1oL0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0 W10 1rz0 10N0 1oL0 10N0 1oL0",
      "Asia/Kabul|AFT|-4u|0|",
      "Asia/Kamchatka|PETT PETST PETT|-c0 -c0 -b0|0120|1BWe0 1qN0 WM0",
      "Asia/Karachi|PKT|-50|0|",
      "Asia/Kathmandu|NPT|-5J|0|",
      "Asia/Khandyga|VLAT VLAST VLAT YAKT|-a0 -b0 -b0 -a0|01023|1BWg0 1qM0 WM0 17V0",
      "Asia/Krasnoyarsk|KRAT KRAST KRAT|-70 -80 -80|0102|1BWj0 1qM0 WM0",
      "Asia/Kuala_Lumpur|MYT|-80|0|",
      "Asia/Magadan|MAGT MAGST MAGT|-b0 -c0 -c0|0102|1BWf0 1qM0 WM0",
      "Asia/Makassar|WITA|-80|0|",
      "Asia/Manila|PHT|-80|0|",
      "Asia/Nicosia|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Asia/Novokuznetsk|KRAT NOVST NOVT NOVT|-70 -70 -60 -70|0123|1BWj0 1qN0 WM0",
      "Asia/Novosibirsk|NOVT NOVST NOVT|-60 -70 -70|0102|1BWk0 1qM0 WM0",
      "Asia/Omsk|OMST OMSST OMST|-60 -70 -70|0102|1BWk0 1qM0 WM0",
      "Asia/Oral|ORAT|-50|0|",
      "Asia/Pyongyang|KST|-90|0|",
      "Asia/Qyzylorda|QYZT|-60|0|",
      "Asia/Rangoon|MMT|-6u|0|",
      "Asia/Sakhalin|SAKT SAKST SAKT|-a0 -b0 -b0|0102|1BWg0 1qM0 WM0",
      "Asia/Samarkand|UZT|-50|0|",
      "Asia/Singapore|SGT|-80|0|",
      "Asia/Tbilisi|GET|-40|0|",
      "Asia/Tehran|IRST IRDT|-3u -4u|01010101010101010101010|1BTUu 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0",
      "Asia/Thimbu|BTT|-60|0|",
      "Asia/Tokyo|JST|-90|0|",
      "Asia/Ulaanbaatar|ULAT|-80|0|",
      "Asia/Ust-Nera|MAGT MAGST MAGT VLAT|-b0 -c0 -c0 -b0|01023|1BWf0 1qM0 WM0 17V0",
      "Asia/Vladivostok|VLAT VLAST VLAT|-a0 -b0 -b0|0102|1BWg0 1qM0 WM0",
      "Asia/Yakutsk|YAKT YAKST YAKT|-90 -a0 -a0|0102|1BWh0 1qM0 WM0",
      "Asia/Yekaterinburg|YEKT YEKST YEKT|-50 -60 -60|0102|1BWl0 1qM0 WM0",
      "Asia/Yerevan|AMT AMST|-40 -50|01010|1BWm0 1qM0 WM0 1qM0",
      "Atlantic/Azores|AZOT AZOST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Atlantic/Canary|WET WEST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Atlantic/Cape_Verde|CVT|10|0|",
      "Atlantic/South_Georgia|GST|20|0|",
      "Atlantic/Stanley|FKST FKT|30 40|010|1C6R0 U10",
      "Australia/ACT|EST EST|-b0 -a0|01010101010101010101010|1C140 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0",
      "Australia/Adelaide|CST CST|-au -9u|01010101010101010101010|1C14u 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0",
      "Australia/Brisbane|EST|-a0|0|",
      "Australia/Darwin|CST|-9u|0|",
      "Australia/Eucla|CWST|-8J|0|",
      "Australia/LHI|LHST LHST|-b0 -au|01010101010101010101010|1C130 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu",
      "Australia/Perth|WST|-80|0|",
      "Chile/EasterIsland|EASST EAST|50 60|01010101010101010101010|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 1wn0 Rd0 1wn0 Rd0 1wn0 Rd0 1zb0 Op0 1zb0 Rd0 1wn0 Rd0",
      "Eire|GMT IST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Etc/GMT+1|GMT+1|10|0|",
      "Etc/GMT+10|GMT+10|a0|0|",
      "Etc/GMT+11|GMT+11|b0|0|",
      "Etc/GMT+12|GMT+12|c0|0|",
      "Etc/GMT+2|GMT+2|20|0|",
      "Etc/GMT+3|GMT+3|30|0|",
      "Etc/GMT+4|GMT+4|40|0|",
      "Etc/GMT+5|GMT+5|50|0|",
      "Etc/GMT+6|GMT+6|60|0|",
      "Etc/GMT+7|GMT+7|70|0|",
      "Etc/GMT+8|GMT+8|80|0|",
      "Etc/GMT+9|GMT+9|90|0|",
      "Etc/GMT-1|GMT-1|-10|0|",
      "Etc/GMT-10|GMT-10|-a0|0|",
      "Etc/GMT-11|GMT-11|-b0|0|",
      "Etc/GMT-12|GMT-12|-c0|0|",
      "Etc/GMT-13|GMT-13|-d0|0|",
      "Etc/GMT-14|GMT-14|-e0|0|",
      "Etc/GMT-2|GMT-2|-20|0|",
      "Etc/GMT-3|GMT-3|-30|0|",
      "Etc/GMT-4|GMT-4|-40|0|",
      "Etc/GMT-5|GMT-5|-50|0|",
      "Etc/GMT-6|GMT-6|-60|0|",
      "Etc/GMT-7|GMT-7|-70|0|",
      "Etc/GMT-8|GMT-8|-80|0|",
      "Etc/GMT-9|GMT-9|-90|0|",
      "Etc/UCT|UCT|0|0|",
      "Etc/UTC|UTC|0|0|",
      "Europe/Belfast|GMT BST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "Europe/Kaliningrad|EET EEST FET|-20 -30 -30|0102|1BWo0 1qM0 WM0",
      "Europe/Moscow|MSK MSD MSK|-30 -40 -40|0102|1BWn0 1qM0 WM0",
      "Europe/Samara|SAMT SAMST SAMT|-40 -40 -30|0120|1BWm0 1qN0 WM0",
      "Europe/Simferopol|EET EEST MSK|-20 -30 -40|0101010102|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11z0",
      "Europe/Volgograd|VOLT VOLST VOLT|-30 -40 -40|0102|1BWn0 1qM0 WM0",
      "HST|HST|a0|0|",
      "Indian/Chagos|IOT|-60|0|",
      "Indian/Christmas|CXT|-70|0|",
      "Indian/Cocos|CCT|-6u|0|",
      "Indian/Kerguelen|TFT|-50|0|",
      "Indian/Mahe|SCT|-40|0|",
      "Indian/Maldives|MVT|-50|0|",
      "Indian/Mauritius|MUT|-40|0|",
      "Indian/Reunion|RET|-40|0|",
      "Kwajalein|MHT|-c0|0|",
      "MET|MET MEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
      "NZ-CHAT|CHADT CHAST|-dJ -cJ|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
      "Pacific/Apia|WST WSDT WSDT WST|b0 a0 -e0 -d0|01012323232323232323232|1Dbn0 1ff0 1a00 CI0 AQ0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00",
      "Pacific/Chuuk|CHUT|-a0|0|",
      "Pacific/Efate|VUT|-b0|0|",
      "Pacific/Enderbury|PHOT|-d0|0|",
      "Pacific/Fakaofo|TKT TKT|b0 -d0|01|1Gfn0",
      "Pacific/Fiji|FJST FJT|-d0 -c0|01010101010101010101010|1BWe0 1o00 Rc0 1wo0 Ao0 1Nc0 Ao0 1Q00 xz0 1Q10 xz0 1Q10 An0 1Nd0 An0 1Nd0 An0 1Nd0 An0 1Q10 xz0 1Q10",
      "Pacific/Funafuti|TVT|-c0|0|",
      "Pacific/Galapagos|GALT|60|0|",
      "Pacific/Gambier|GAMT|90|0|",
      "Pacific/Guadalcanal|SBT|-b0|0|",
      "Pacific/Guam|ChST|-a0|0|",
      "Pacific/Kiritimati|LINT|-e0|0|",
      "Pacific/Kosrae|KOST|-b0|0|",
      "Pacific/Marquesas|MART|9u|0|",
      "Pacific/Midway|SST|b0|0|",
      "Pacific/Nauru|NRT|-c0|0|",
      "Pacific/Niue|NUT|b0|0|",
      "Pacific/Norfolk|NFT|-bu|0|",
      "Pacific/Noumea|NCT|-b0|0|",
      "Pacific/Palau|PWT|-90|0|",
      "Pacific/Pitcairn|PST|80|0|",
      "Pacific/Pohnpei|PONT|-b0|0|",
      "Pacific/Port_Moresby|PGT|-a0|0|",
      "Pacific/Rarotonga|CKT|a0|0|",
      "Pacific/Tahiti|TAHT|a0|0|",
      "Pacific/Tarawa|GILT|-c0|0|",
      "Pacific/Tongatapu|TOT|-d0|0|",
      "Pacific/Wake|WAKT|-c0|0|",
      "Pacific/Wallis|WFT|-c0|0|"
    ],
    "links": [
      "Africa/Abidjan|Africa/Accra",
      "Africa/Abidjan|Africa/Bamako",
      "Africa/Abidjan|Africa/Banjul",
      "Africa/Abidjan|Africa/Bissau",
      "Africa/Abidjan|Africa/Conakry",
      "Africa/Abidjan|Africa/Dakar",
      "Africa/Abidjan|Africa/Freetown",
      "Africa/Abidjan|Africa/Lome",
      "Africa/Abidjan|Africa/Monrovia",
      "Africa/Abidjan|Africa/Nouakchott",
      "Africa/Abidjan|Africa/Ouagadougou",
      "Africa/Abidjan|Africa/Sao_Tome",
      "Africa/Abidjan|Africa/Timbuktu",
      "Africa/Abidjan|America/Danmarkshavn",
      "Africa/Abidjan|Atlantic/Reykjavik",
      "Africa/Abidjan|Atlantic/St_Helena",
      "Africa/Abidjan|Etc/GMT",
      "Africa/Abidjan|Etc/GMT+0",
      "Africa/Abidjan|Etc/GMT-0",
      "Africa/Abidjan|Etc/GMT0",
      "Africa/Abidjan|Etc/Greenwich",
      "Africa/Abidjan|GMT",
      "Africa/Abidjan|GMT+0",
      "Africa/Abidjan|GMT-0",
      "Africa/Abidjan|GMT0",
      "Africa/Abidjan|Greenwich",
      "Africa/Abidjan|Iceland",
      "Africa/Addis_Ababa|Africa/Asmara",
      "Africa/Addis_Ababa|Africa/Asmera",
      "Africa/Addis_Ababa|Africa/Dar_es_Salaam",
      "Africa/Addis_Ababa|Africa/Djibouti",
      "Africa/Addis_Ababa|Africa/Juba",
      "Africa/Addis_Ababa|Africa/Kampala",
      "Africa/Addis_Ababa|Africa/Khartoum",
      "Africa/Addis_Ababa|Africa/Mogadishu",
      "Africa/Addis_Ababa|Africa/Nairobi",
      "Africa/Addis_Ababa|Indian/Antananarivo",
      "Africa/Addis_Ababa|Indian/Comoro",
      "Africa/Addis_Ababa|Indian/Mayotte",
      "Africa/Algiers|Africa/Tunis",
      "Africa/Bangui|Africa/Brazzaville",
      "Africa/Bangui|Africa/Douala",
      "Africa/Bangui|Africa/Kinshasa",
      "Africa/Bangui|Africa/Lagos",
      "Africa/Bangui|Africa/Libreville",
      "Africa/Bangui|Africa/Luanda",
      "Africa/Bangui|Africa/Malabo",
      "Africa/Bangui|Africa/Ndjamena",
      "Africa/Bangui|Africa/Niamey",
      "Africa/Bangui|Africa/Porto-Novo",
      "Africa/Blantyre|Africa/Bujumbura",
      "Africa/Blantyre|Africa/Gaborone",
      "Africa/Blantyre|Africa/Harare",
      "Africa/Blantyre|Africa/Kigali",
      "Africa/Blantyre|Africa/Lubumbashi",
      "Africa/Blantyre|Africa/Lusaka",
      "Africa/Blantyre|Africa/Maputo",
      "Africa/Cairo|Egypt",
      "Africa/Casablanca|Africa/El_Aaiun",
      "Africa/Ceuta|Arctic/Longyearbyen",
      "Africa/Ceuta|Atlantic/Jan_Mayen",
      "Africa/Ceuta|CET",
      "Africa/Ceuta|Europe/Amsterdam",
      "Africa/Ceuta|Europe/Andorra",
      "Africa/Ceuta|Europe/Belgrade",
      "Africa/Ceuta|Europe/Berlin",
      "Africa/Ceuta|Europe/Bratislava",
      "Africa/Ceuta|Europe/Brussels",
      "Africa/Ceuta|Europe/Budapest",
      "Africa/Ceuta|Europe/Busingen",
      "Africa/Ceuta|Europe/Copenhagen",
      "Africa/Ceuta|Europe/Gibraltar",
      "Africa/Ceuta|Europe/Ljubljana",
      "Africa/Ceuta|Europe/Luxembourg",
      "Africa/Ceuta|Europe/Madrid",
      "Africa/Ceuta|Europe/Malta",
      "Africa/Ceuta|Europe/Monaco",
      "Africa/Ceuta|Europe/Oslo",
      "Africa/Ceuta|Europe/Paris",
      "Africa/Ceuta|Europe/Podgorica",
      "Africa/Ceuta|Europe/Prague",
      "Africa/Ceuta|Europe/Rome",
      "Africa/Ceuta|Europe/San_Marino",
      "Africa/Ceuta|Europe/Sarajevo",
      "Africa/Ceuta|Europe/Skopje",
      "Africa/Ceuta|Europe/Stockholm",
      "Africa/Ceuta|Europe/Tirane",
      "Africa/Ceuta|Europe/Vaduz",
      "Africa/Ceuta|Europe/Vatican",
      "Africa/Ceuta|Europe/Vienna",
      "Africa/Ceuta|Europe/Warsaw",
      "Africa/Ceuta|Europe/Zagreb",
      "Africa/Ceuta|Europe/Zurich",
      "Africa/Ceuta|Poland",
      "Africa/Johannesburg|Africa/Maseru",
      "Africa/Johannesburg|Africa/Mbabane",
      "Africa/Tripoli|Libya",
      "America/Adak|America/Atka",
      "America/Adak|US/Aleutian",
      "America/Anchorage|America/Juneau",
      "America/Anchorage|America/Nome",
      "America/Anchorage|America/Sitka",
      "America/Anchorage|America/Yakutat",
      "America/Anchorage|US/Alaska",
      "America/Anguilla|America/Antigua",
      "America/Anguilla|America/Aruba",
      "America/Anguilla|America/Barbados",
      "America/Anguilla|America/Blanc-Sablon",
      "America/Anguilla|America/Curacao",
      "America/Anguilla|America/Dominica",
      "America/Anguilla|America/Grenada",
      "America/Anguilla|America/Guadeloupe",
      "America/Anguilla|America/Kralendijk",
      "America/Anguilla|America/Lower_Princes",
      "America/Anguilla|America/Marigot",
      "America/Anguilla|America/Martinique",
      "America/Anguilla|America/Montserrat",
      "America/Anguilla|America/Port_of_Spain",
      "America/Anguilla|America/Puerto_Rico",
      "America/Anguilla|America/Santo_Domingo",
      "America/Anguilla|America/St_Barthelemy",
      "America/Anguilla|America/St_Kitts",
      "America/Anguilla|America/St_Lucia",
      "America/Anguilla|America/St_Thomas",
      "America/Anguilla|America/St_Vincent",
      "America/Anguilla|America/Tortola",
      "America/Anguilla|America/Virgin",
      "America/Argentina/Buenos_Aires|America/Argentina/Catamarca",
      "America/Argentina/Buenos_Aires|America/Argentina/ComodRivadavia",
      "America/Argentina/Buenos_Aires|America/Argentina/Cordoba",
      "America/Argentina/Buenos_Aires|America/Argentina/Jujuy",
      "America/Argentina/Buenos_Aires|America/Argentina/La_Rioja",
      "America/Argentina/Buenos_Aires|America/Argentina/Mendoza",
      "America/Argentina/Buenos_Aires|America/Argentina/Rio_Gallegos",
      "America/Argentina/Buenos_Aires|America/Argentina/Salta",
      "America/Argentina/Buenos_Aires|America/Argentina/San_Juan",
      "America/Argentina/Buenos_Aires|America/Argentina/San_Luis",
      "America/Argentina/Buenos_Aires|America/Argentina/Tucuman",
      "America/Argentina/Buenos_Aires|America/Argentina/Ushuaia",
      "America/Argentina/Buenos_Aires|America/Buenos_Aires",
      "America/Argentina/Buenos_Aires|America/Catamarca",
      "America/Argentina/Buenos_Aires|America/Cordoba",
      "America/Argentina/Buenos_Aires|America/Jujuy",
      "America/Argentina/Buenos_Aires|America/Mendoza",
      "America/Argentina/Buenos_Aires|America/Rosario",
      "America/Atikokan|America/Cayman",
      "America/Atikokan|America/Coral_Harbour",
      "America/Atikokan|America/Jamaica",
      "America/Atikokan|America/Panama",
      "America/Atikokan|EST",
      "America/Atikokan|Jamaica",
      "America/Belem|America/Fortaleza",
      "America/Belem|America/Maceio",
      "America/Belem|America/Recife",
      "America/Belem|America/Santarem",
      "America/Belize|America/Costa_Rica",
      "America/Belize|America/El_Salvador",
      "America/Belize|America/Guatemala",
      "America/Belize|America/Managua",
      "America/Belize|America/Regina",
      "America/Belize|America/Swift_Current",
      "America/Belize|America/Tegucigalpa",
      "America/Belize|Canada/East-Saskatchewan",
      "America/Belize|Canada/Saskatchewan",
      "America/Boa_Vista|America/Manaus",
      "America/Boa_Vista|America/Porto_Velho",
      "America/Boa_Vista|Brazil/West",
      "America/Boise|America/Cambridge_Bay",
      "America/Boise|America/Denver",
      "America/Boise|America/Edmonton",
      "America/Boise|America/Inuvik",
      "America/Boise|America/Ojinaga",
      "America/Boise|America/Shiprock",
      "America/Boise|America/Yellowknife",
      "America/Boise|Canada/Mountain",
      "America/Boise|MST7MDT",
      "America/Boise|Navajo",
      "America/Boise|US/Mountain",
      "America/Campo_Grande|America/Cuiaba",
      "America/Cancun|America/Merida",
      "America/Cancun|America/Mexico_City",
      "America/Cancun|America/Monterrey",
      "America/Cancun|Mexico/General",
      "America/Chicago|America/Indiana/Knox",
      "America/Chicago|America/Indiana/Tell_City",
      "America/Chicago|America/Knox_IN",
      "America/Chicago|America/Matamoros",
      "America/Chicago|America/Menominee",
      "America/Chicago|America/North_Dakota/Center",
      "America/Chicago|America/North_Dakota/New_Salem",
      "America/Chicago|America/Rainy_River",
      "America/Chicago|America/Rankin_Inlet",
      "America/Chicago|America/Resolute",
      "America/Chicago|America/Winnipeg",
      "America/Chicago|CST6CDT",
      "America/Chicago|Canada/Central",
      "America/Chicago|US/Central",
      "America/Chicago|US/Indiana-Starke",
      "America/Chihuahua|America/Mazatlan",
      "America/Chihuahua|Mexico/BajaSur",
      "America/Creston|America/Dawson_Creek",
      "America/Creston|America/Hermosillo",
      "America/Creston|America/Phoenix",
      "America/Creston|MST",
      "America/Creston|US/Arizona",
      "America/Dawson|America/Ensenada",
      "America/Dawson|America/Los_Angeles",
      "America/Dawson|America/Tijuana",
      "America/Dawson|America/Vancouver",
      "America/Dawson|America/Whitehorse",
      "America/Dawson|Canada/Pacific",
      "America/Dawson|Canada/Yukon",
      "America/Dawson|Mexico/BajaNorte",
      "America/Dawson|PST8PDT",
      "America/Dawson|US/Pacific",
      "America/Dawson|US/Pacific-New",
      "America/Detroit|America/Fort_Wayne",
      "America/Detroit|America/Grand_Turk",
      "America/Detroit|America/Indiana/Indianapolis",
      "America/Detroit|America/Indiana/Marengo",
      "America/Detroit|America/Indiana/Petersburg",
      "America/Detroit|America/Indiana/Vevay",
      "America/Detroit|America/Indiana/Vincennes",
      "America/Detroit|America/Indiana/Winamac",
      "America/Detroit|America/Indianapolis",
      "America/Detroit|America/Iqaluit",
      "America/Detroit|America/Kentucky/Louisville",
      "America/Detroit|America/Kentucky/Monticello",
      "America/Detroit|America/Louisville",
      "America/Detroit|America/Montreal",
      "America/Detroit|America/Nassau",
      "America/Detroit|America/New_York",
      "America/Detroit|America/Nipigon",
      "America/Detroit|America/Pangnirtung",
      "America/Detroit|America/Thunder_Bay",
      "America/Detroit|America/Toronto",
      "America/Detroit|Canada/Eastern",
      "America/Detroit|EST5EDT",
      "America/Detroit|US/East-Indiana",
      "America/Detroit|US/Eastern",
      "America/Detroit|US/Michigan",
      "America/Eirunepe|America/Porto_Acre",
      "America/Eirunepe|America/Rio_Branco",
      "America/Eirunepe|Brazil/Acre",
      "America/Glace_Bay|America/Halifax",
      "America/Glace_Bay|America/Moncton",
      "America/Glace_Bay|America/Thule",
      "America/Glace_Bay|Atlantic/Bermuda",
      "America/Glace_Bay|Canada/Atlantic",
      "America/Havana|Cuba",
      "America/Noronha|Brazil/DeNoronha",
      "America/Santiago|Antarctica/Palmer",
      "America/Santiago|Chile/Continental",
      "America/Sao_Paulo|Brazil/East",
      "America/St_Johns|Canada/Newfoundland",
      "Antarctica/McMurdo|Antarctica/South_Pole",
      "Antarctica/McMurdo|NZ",
      "Antarctica/McMurdo|Pacific/Auckland",
      "Asia/Aden|Asia/Baghdad",
      "Asia/Aden|Asia/Bahrain",
      "Asia/Aden|Asia/Kuwait",
      "Asia/Aden|Asia/Qatar",
      "Asia/Aden|Asia/Riyadh",
      "Asia/Aqtau|Asia/Aqtobe",
      "Asia/Ashgabat|Asia/Ashkhabad",
      "Asia/Bangkok|Asia/Ho_Chi_Minh",
      "Asia/Bangkok|Asia/Phnom_Penh",
      "Asia/Bangkok|Asia/Saigon",
      "Asia/Bangkok|Asia/Vientiane",
      "Asia/Calcutta|Asia/Colombo",
      "Asia/Calcutta|Asia/Kolkata",
      "Asia/Chongqing|Asia/Chungking",
      "Asia/Chongqing|Asia/Harbin",
      "Asia/Chongqing|Asia/Kashgar",
      "Asia/Chongqing|Asia/Macao",
      "Asia/Chongqing|Asia/Macau",
      "Asia/Chongqing|Asia/Shanghai",
      "Asia/Chongqing|Asia/Taipei",
      "Asia/Chongqing|Asia/Urumqi",
      "Asia/Chongqing|PRC",
      "Asia/Chongqing|ROC",
      "Asia/Dacca|Asia/Dhaka",
      "Asia/Dubai|Asia/Muscat",
      "Asia/Hong_Kong|Hongkong",
      "Asia/Istanbul|Europe/Istanbul",
      "Asia/Istanbul|Turkey",
      "Asia/Jakarta|Asia/Pontianak",
      "Asia/Jerusalem|Asia/Tel_Aviv",
      "Asia/Jerusalem|Israel",
      "Asia/Kathmandu|Asia/Katmandu",
      "Asia/Kuala_Lumpur|Asia/Kuching",
      "Asia/Makassar|Asia/Ujung_Pandang",
      "Asia/Nicosia|EET",
      "Asia/Nicosia|Europe/Athens",
      "Asia/Nicosia|Europe/Bucharest",
      "Asia/Nicosia|Europe/Chisinau",
      "Asia/Nicosia|Europe/Helsinki",
      "Asia/Nicosia|Europe/Kiev",
      "Asia/Nicosia|Europe/Mariehamn",
      "Asia/Nicosia|Europe/Nicosia",
      "Asia/Nicosia|Europe/Riga",
      "Asia/Nicosia|Europe/Sofia",
      "Asia/Nicosia|Europe/Tallinn",
      "Asia/Nicosia|Europe/Tiraspol",
      "Asia/Nicosia|Europe/Uzhgorod",
      "Asia/Nicosia|Europe/Vilnius",
      "Asia/Nicosia|Europe/Zaporozhye",
      "Asia/Pyongyang|Asia/Seoul",
      "Asia/Pyongyang|ROK",
      "Asia/Samarkand|Asia/Tashkent",
      "Asia/Singapore|Singapore",
      "Asia/Tehran|Iran",
      "Asia/Thimbu|Asia/Thimphu",
      "Asia/Tokyo|Japan",
      "Asia/Ulaanbaatar|Asia/Ulan_Bator",
      "Atlantic/Canary|Atlantic/Faeroe",
      "Atlantic/Canary|Atlantic/Faroe",
      "Atlantic/Canary|Atlantic/Madeira",
      "Atlantic/Canary|Europe/Lisbon",
      "Atlantic/Canary|Portugal",
      "Atlantic/Canary|WET",
      "Australia/ACT|Australia/Canberra",
      "Australia/ACT|Australia/Currie",
      "Australia/ACT|Australia/Hobart",
      "Australia/ACT|Australia/Melbourne",
      "Australia/ACT|Australia/NSW",
      "Australia/ACT|Australia/Sydney",
      "Australia/ACT|Australia/Tasmania",
      "Australia/ACT|Australia/Victoria",
      "Australia/Adelaide|Australia/Broken_Hill",
      "Australia/Adelaide|Australia/South",
      "Australia/Adelaide|Australia/Yancowinna",
      "Australia/Brisbane|Australia/Lindeman",
      "Australia/Brisbane|Australia/Queensland",
      "Australia/Darwin|Australia/North",
      "Australia/LHI|Australia/Lord_Howe",
      "Australia/Perth|Australia/West",
      "Chile/EasterIsland|Pacific/Easter",
      "Eire|Europe/Dublin",
      "Etc/UCT|UCT",
      "Etc/UTC|Etc/Universal",
      "Etc/UTC|Etc/Zulu",
      "Etc/UTC|UTC",
      "Etc/UTC|Universal",
      "Etc/UTC|Zulu",
      "Europe/Belfast|Europe/Guernsey",
      "Europe/Belfast|Europe/Isle_of_Man",
      "Europe/Belfast|Europe/Jersey",
      "Europe/Belfast|Europe/London",
      "Europe/Belfast|GB",
      "Europe/Belfast|GB-Eire",
      "Europe/Kaliningrad|Europe/Minsk",
      "Europe/Moscow|W-SU",
      "HST|Pacific/Honolulu",
      "HST|Pacific/Johnston",
      "HST|US/Hawaii",
      "Kwajalein|Pacific/Kwajalein",
      "Kwajalein|Pacific/Majuro",
      "NZ-CHAT|Pacific/Chatham",
      "Pacific/Chuuk|Pacific/Truk",
      "Pacific/Chuuk|Pacific/Yap",
      "Pacific/Guam|Pacific/Saipan",
      "Pacific/Midway|Pacific/Pago_Pago",
      "Pacific/Midway|Pacific/Samoa",
      "Pacific/Midway|US/Samoa",
      "Pacific/Pohnpei|Pacific/Ponape"
    ]
  });


  return moment;
}));
(function(){var a=angular.module("LocalStorageModule",[]);a.provider("localStorageService",function(){this.prefix="ls";this.cookie={expiry:30,path:"/"};this.notify={setItem:true,removeItem:false};this.setPrefix=function(b){this.prefix=b};this.setStorageCookie=function(c,b){this.cookie={expiry:c,path:b}};this.setNotify=function(b,c){this.notify={setItem:b,removeItem:c}};this.$get=["$rootScope",function(m){var h=this.prefix;var c=this.cookie;var p=this.notify;if(h.substr(-1)!=="."){h=!!h?h+".":""}var e=(function(){try{var q=("localStorage" in window&&window.localStorage!==null);var r=h+"__"+Math.round(Math.random()*10000000);if(q){localStorage.setItem(r,"");localStorage.removeItem(r)}return true}catch(s){m.$broadcast("LocalStorageModule.notification.error",s.message);return false}}());var i=function(q,r){if(!e){m.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED");if(p.setItem){m.$broadcast("LocalStorageModule.notification.setitem",{key:q,newvalue:r,storageType:"cookie"})}return j(q,r)}if(typeof r==="undefined"){r=null}try{if(angular.isObject(r)||angular.isArray(r)){r=angular.toJson(r)}localStorage.setItem(h+q,r);if(p.setItem){m.$broadcast("LocalStorageModule.notification.setitem",{key:q,newvalue:r,storageType:"localStorage"})}}catch(s){m.$broadcast("LocalStorageModule.notification.error",s.message);return j(q,r)}return true};var l=function(q){if(!e){m.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED");return f(q)}var r=localStorage.getItem(h+q);if(!r||r==="null"){return null}if(r.charAt(0)==="{"||r.charAt(0)==="["){return angular.fromJson(r)}return r};var g=function(q){if(!e){m.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED");if(p.removeItem){m.$broadcast("LocalStorageModule.notification.removeitem",{key:q,storageType:"cookie"})}return n(q)}try{localStorage.removeItem(h+q);if(p.removeItem){m.$broadcast("LocalStorageModule.notification.removeitem",{key:q,storageType:"localStorage"})}}catch(r){m.$broadcast("LocalStorageModule.notification.error",r.message);return n(q)}return true};var k=function(){if(!e){m.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED");return false}var q=h.length;var s=[];for(var r in localStorage){if(r.substr(0,q)===h){try{s.push(r.substr(q))}catch(t){m.$broadcast("LocalStorageModule.notification.error",t.Description);return[]}}}return s};var b=function(q){var q=q||"";var v=h.slice(0,-1)+".";var t=RegExp(v+q);if(!e){m.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED");return d()}var r=h.length;for(var s in localStorage){if(t.test(s)){try{g(s.substr(r))}catch(u){m.$broadcast("LocalStorageModule.notification.error",u.message);return d()}}}return true};var o=function(){try{return navigator.cookieEnabled||("cookie" in document&&(document.cookie.length>0||(document.cookie="test").indexOf.call(document.cookie,"test")>-1))}catch(q){m.$broadcast("LocalStorageModule.notification.error",q.message);return false}};var j=function(s,t){if(typeof t==="undefined"){return false}if(!o()){m.$broadcast("LocalStorageModule.notification.error","COOKIES_NOT_SUPPORTED");return false}try{var r="",q=new Date();if(t===null){q.setTime(q.getTime()+(-1*24*60*60*1000));r="; expires="+q.toGMTString();t=""}else{if(c.expiry!==0){q.setTime(q.getTime()+(c.expiry*24*60*60*1000));r="; expires="+q.toGMTString()}}if(!!s){document.cookie=h+s+"="+encodeURIComponent(t)+r+"; path="+c.path}}catch(u){m.$broadcast("LocalStorageModule.notification.error",u.message);return false}return true};var f=function(s){if(!o()){m.$broadcast("LocalStorageModule.notification.error","COOKIES_NOT_SUPPORTED");return false}var t=document.cookie.split(";");for(var r=0;r<t.length;r++){var q=t[r];while(q.charAt(0)===" "){q=q.substring(1,q.length)}if(q.indexOf(h+s+"=")===0){return decodeURIComponent(q.substring(h.length+s.length+1,q.length))}}return null};var n=function(q){j(q,null)};var d=function(){var r=null,u=null;var q=h.length;var v=document.cookie.split(";");for(var t=0;t<v.length;t++){r=v[t];while(r.charAt(0)===" "){r=r.substring(1,r.length)}var s=r.substring(q,r.indexOf("="));n(s)}};return{isSupported:e,set:i,add:i,get:l,keys:k,remove:g,clearAll:b,cookie:{set:j,add:j,get:f,remove:n,clearAll:d}}}]})}).call(this);
/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file angular-cache.min.js
* @version 2.3.4 - Homepage <http://jmdobry.github.io/angular-cache/>
* @copyright (c) 2013 -2014 Jason Dobry <http://jmdobry.github.io/angular-cache>
* @license MIT <https://github.com/jmdobry/angular-cache/blob/master/LICENSE>
*
* @overview angular-cache is a very useful replacement for Angular's $cacheFactory.
*/
!function(a,b,c){"use strict";function d(){this.$get=function(){function a(a,b,c){for(var d=a[c],e=b(d);c>0;){var f=Math.floor((c+1)/2)-1,g=a[f];if(e>=b(g))break;a[f]=d,a[c]=g,c=f}}function c(a,b,c){for(var d=a.length,e=a[c],f=b(e);;){var g=2*(c+1),h=g-1,i=null;if(d>h){var j=a[h],k=b(j);f>k&&(i=h)}if(d>g){var l=a[g],m=b(l);m<(null===i?f:b(a[h]))&&(i=g)}if(null===i)break;a[c]=a[i],a[i]=e,c=i}}function d(a){if(a&&!b.isFunction(a))throw new Error("BinaryHeap(weightFunc): weightFunc: must be a function!");a=a||function(a){return a},this.weightFunc=a,this.heap=[]}return d.prototype.push=function(b){this.heap.push(b),a(this.heap,this.weightFunc,this.heap.length-1)},d.prototype.peek=function(){return this.heap[0]},d.prototype.pop=function(){var a=this.heap[0],b=this.heap.pop();return this.heap.length>0&&(this.heap[0]=b,c(this.heap,this.weightFunc,0)),a},d.prototype.remove=function(d){for(var e=this.heap.length,f=0;e>f;f++)if(b.equals(this.heap[f],d)){var g=this.heap[f],h=this.heap.pop();return f!==e-1&&(this.heap[f]=h,a(this.heap,this.weightFunc,f),c(this.heap,this.weightFunc,f)),g}return null},d.prototype.removeAll=function(){this.heap=[]},d.prototype.size=function(){return this.heap.length},d}}function e(){function a(a,c){c(b.isNumber(a)?0>a?"must be greater than zero!":null:"must be a number!")}var d,e=function(){return{capacity:Number.MAX_VALUE,maxAge:null,deleteOnExpire:"none",onExpire:null,cacheFlushInterval:null,recycleFreq:1e3,storageMode:"none",storageImpl:null,verifyIntegrity:!0,disabled:!1}};this.setCacheDefaults=function(c){var f="$angularCacheFactoryProvider.setCacheDefaults(options): ";if(c=c||{},!b.isObject(c))throw new Error(f+"options: must be an object!");if("disabled"in c&&(c.disabled=c.disabled===!0),"capacity"in c&&a(c.capacity,function(a){if(a)throw new Error(f+"capacity: "+a)}),"deleteOnExpire"in c){if(!b.isString(c.deleteOnExpire))throw new Error(f+"deleteOnExpire: must be a string!");if("none"!==c.deleteOnExpire&&"passive"!==c.deleteOnExpire&&"aggressive"!==c.deleteOnExpire)throw new Error(f+'deleteOnExpire: accepted values are "none", "passive" or "aggressive"!')}if("maxAge"in c&&a(c.maxAge,function(a){if(a)throw new Error(f+"maxAge: "+a)}),"recycleFreq"in c&&a(c.recycleFreq,function(a){if(a)throw new Error(f+"recycleFreq: "+a)}),"cacheFlushInterval"in c&&a(c.cacheFlushInterval,function(a){if(a)throw new Error(f+"cacheFlushInterval: "+a)}),"storageMode"in c){if(!b.isString(c.storageMode))throw new Error(f+"storageMode: must be a string!");if("none"!==c.storageMode&&"localStorage"!==c.storageMode&&"sessionStorage"!==c.storageMode)throw new Error(f+'storageMode: accepted values are "none", "localStorage" or "sessionStorage"!');if("storageImpl"in c){if(!b.isObject(c.storageImpl))throw new Error(f+"storageImpl: must be an object!");if(!("setItem"in c.storageImpl&&"function"==typeof c.storageImpl.setItem))throw new Error(f+'storageImpl: must implement "setItem(key, value)"!');if(!("getItem"in c.storageImpl&&"function"==typeof c.storageImpl.getItem))throw new Error(f+'storageImpl: must implement "getItem(key)"!');if(!("removeItem"in c.storageImpl)||"function"!=typeof c.storageImpl.removeItem)throw new Error(f+'storageImpl: must implement "removeItem(key)"!')}}if("onExpire"in c&&"function"!=typeof c.onExpire)throw new Error(f+"onExpire: must be a function!");d=b.extend({},e(),c)},this.setCacheDefaults({}),this.$get=["$window","BinaryHeap",function(e,f){function g(a){return a&&b.isNumber(a)?a.toString():a}function h(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&(c[b]=b);return c}function i(a){var b,c=[];for(b in a)a.hasOwnProperty(b)&&c.push(b);return c}function j(j,k){function m(b){a(b,function(a){if(a)throw new Error("capacity: "+a);for(B.capacity=b;E.size()>B.capacity;)H.remove(E.peek().key,{verifyIntegrity:!1})})}function n(a){if(!b.isString(a))throw new Error("deleteOnExpire: must be a string!");if("none"!==a&&"passive"!==a&&"aggressive"!==a)throw new Error('deleteOnExpire: accepted values are "none", "passive" or "aggressive"!');B.deleteOnExpire=a}function o(b){var c=i(C);if(null===b){if(B.maxAge)for(var d=0;d<c.length;d++){var e=c[d];"maxAge"in C[e]||(delete C[e].expires,D.remove(C[e]))}B.maxAge=b}else a(b,function(a){if(a)throw new Error("maxAge: "+a);if(b!==B.maxAge){B.maxAge=b;for(var d=(new Date).getTime(),e=0;e<c.length;e++){var f=c[e];"maxAge"in C[f]||(D.remove(C[f]),C[f].expires=C[f].created+B.maxAge,D.push(C[f]),C[f].expires<d&&H.remove(f,{verifyIntegrity:!1}))}}})}function p(){for(var a=(new Date).getTime(),b=D.peek();b&&b.expires&&b.expires<a;)H.remove(b.key,{verifyIntegrity:!1}),B.onExpire&&B.onExpire(b.key,b.value),b=D.peek()}function q(b){null===b?(B.recycleFreqId&&(clearInterval(B.recycleFreqId),delete B.recycleFreqId),B.recycleFreq=d.recycleFreq,B.recycleFreqId=setInterval(p,B.recycleFreq)):a(b,function(a){if(a)throw new Error("recycleFreq: "+a);B.recycleFreq=b,B.recycleFreqId&&clearInterval(B.recycleFreqId),B.recycleFreqId=setInterval(p,B.recycleFreq)})}function r(b){null===b?(B.cacheFlushIntervalId&&(clearInterval(B.cacheFlushIntervalId),delete B.cacheFlushIntervalId),B.cacheFlushInterval=b):a(b,function(a){if(a)throw new Error("cacheFlushInterval: "+a);b!==B.cacheFlushInterval&&(B.cacheFlushIntervalId&&clearInterval(B.cacheFlushIntervalId),B.cacheFlushInterval=b,B.cacheFlushIntervalId=setInterval(H.removeAll,B.cacheFlushInterval))})}function s(a,c){var d,f;if(!b.isString(a))throw new Error("storageMode: must be a string!");if("none"!==a&&"localStorage"!==a&&"sessionStorage"!==a)throw new Error('storageMode: accepted values are "none", "localStorage" or "sessionStorage"!');if(("localStorage"===B.storageMode||"sessionStorage"===B.storageMode)&&a!==B.storageMode){for(d=i(C),f=0;f<d.length;f++)I.removeItem(F+".data."+d[f]);I.removeItem(F+".keys")}if(B.storageMode=a,c){if(!b.isObject(c))throw new Error("storageImpl: must be an object!");if(!("setItem"in c&&"function"==typeof c.setItem))throw new Error('storageImpl: must implement "setItem(key, value)"!');if(!("getItem"in c&&"function"==typeof c.getItem))throw new Error('storageImpl: must implement "getItem(key)"!');if(!("removeItem"in c)||"function"!=typeof c.removeItem)throw new Error('storageImpl: must implement "removeItem(key)"!');I=c}else"localStorage"===B.storageMode?I=e.localStorage:"sessionStorage"===B.storageMode&&(I=e.sessionStorage);if("none"!==B.storageMode&&I)if(G)for(d=i(C),f=0;f<d.length;f++)v(d[f]);else u()}function t(a,c,e){if(a=a||{},e=e||{},c=!!c,!b.isObject(a))throw new Error("AngularCache.setOptions(cacheOptions, strict, options): cacheOptions: must be an object!");if(w(e.verifyIntegrity),c&&(a=b.extend({},d,a)),"disabled"in a&&(B.disabled=a.disabled===!0),"verifyIntegrity"in a&&(B.verifyIntegrity=a.verifyIntegrity===!0),"capacity"in a&&m(a.capacity),"deleteOnExpire"in a&&n(a.deleteOnExpire),"maxAge"in a&&o(a.maxAge),"recycleFreq"in a&&q(a.recycleFreq),"cacheFlushInterval"in a&&r(a.cacheFlushInterval),"storageMode"in a&&s(a.storageMode,a.storageImpl),"onExpire"in a){if(null!==a.onExpire&&"function"!=typeof a.onExpire)throw new Error("onExpire: must be a function!");B.onExpire=a.onExpire}G=!0}function u(){var a=b.fromJson(I.getItem(F+".keys"));if(I.removeItem(F+".keys"),a&&a.length){for(var c=0;c<a.length;c++){var d=b.fromJson(I.getItem(F+".data."+a[c]))||{},e=d.maxAge||B.maxAge,f=d.deleteOnExpire||B.deleteOnExpire;if(e&&(new Date).getTime()-d.created>e&&"aggressive"===f)I.removeItem(F+".data."+a[c]);else{var g={created:d.created};d.expires&&(g.expires=d.expires),d.accessed&&(g.accessed=d.accessed),d.maxAge&&(g.maxAge=d.maxAge),d.deleteOnExpire&&(g.deleteOnExpire=d.deleteOnExpire),H.put(a[c],d.value,g)}}v(null)}}function v(a){"none"!==B.storageMode&&I&&(I.setItem(F+".keys",b.toJson(i(C))),a&&I.setItem(F+".data."+a,b.toJson(C[a])))}function w(a){if((a||a!==!1&&B.verifyIntegrity)&&"none"!==B.storageMode&&I){var c=i(C);I.setItem(F+".keys",b.toJson(c));for(var d=0;d<c.length;d++)I.setItem(F+".data."+c[d],b.toJson(C[c[d]]))}}function x(a,c){if((c||c!==!1&&B.verifyIntegrity)&&"none"!==B.storageMode&&I){var d=I.getItem(F+".data."+a);if(!d&&a in C)H.remove(a);else if(d){var e=b.fromJson(d),f=e?e.value:null;f&&H.put(a,f)}}}function y(a){if("none"!==B.storageMode&&I){var c=a||i(C);I.setItem(F+".keys",b.toJson(c))}}function z(a){"none"!==B.storageMode&&I&&a in C&&I.setItem(F+".data."+a,b.toJson(C[a]))}function A(){if("none"!==B.storageMode&&I){for(var a=i(C),c=0;c<a.length;c++)I.removeItem(F+".data."+a[c]);I.setItem(F+".keys",b.toJson([]))}}var B=b.extend({},{id:j}),C={},D=new f(function(a){return a.expires}),E=new f(function(a){return a.accessed}),F="angular-cache.caches."+j,G=!1,H=this,I=null;k=k||{},this.put=function(c,d,e){if(!B.disabled){if(e=e||{},c=g(c),!b.isString(c))throw new Error("AngularCache.put(key, value, options): key: must be a string!");if(e&&!b.isObject(e))throw new Error("AngularCache.put(key, value, options): options: must be an object!");if(e.maxAge&&null!==e.maxAge)a(e.maxAge,function(a){if(a)throw new Error("AngularCache.put(key, value, options): maxAge: "+a)});else{if(e.deleteOnExpire&&!b.isString(e.deleteOnExpire))throw new Error("AngularCache.put(key, value, options): deleteOnExpire: must be a string!");if(e.deleteOnExpire&&"none"!==e.deleteOnExpire&&"passive"!==e.deleteOnExpire&&"aggressive"!==e.deleteOnExpire)throw new Error('AngularCache.put(key, value, options): deleteOnExpire: accepted values are "none", "passive" or "aggressive"!');if(b.isUndefined(d))return}var f,h,i=(new Date).getTime();return w(e.verifyIntegrity),C[c]?(D.remove(C[c]),E.remove(C[c])):C[c]={key:c},h=C[c],h.value=d,h.created=parseInt(e.created,10)||h.created||i,h.accessed=parseInt(e.accessed,10)||i,e.deleteOnExpire&&(h.deleteOnExpire=e.deleteOnExpire),e.maxAge&&(h.maxAge=e.maxAge),(h.maxAge||B.maxAge)&&(h.expires=h.created+(h.maxAge||B.maxAge)),f=h.deleteOnExpire||B.deleteOnExpire,h.expires&&"aggressive"===f&&D.push(h),y(),z(c),E.push(h),E.size()>B.capacity&&this.remove(E.peek().key,{verifyIntegrity:!1}),d}},this.get=function(a,d){if(!B.disabled){if(b.isArray(a)){var e=a,f=[];return b.forEach(e,function(a){var c=H.get(a,d);b.isDefined(c)&&f.push(c)}),f}if(a=g(a),d=d||{},!b.isString(a))throw new Error("AngularCache.get(key, options): key: must be a string!");if(d&&!b.isObject(d))throw new Error("AngularCache.get(key, options): options: must be an object!");if(d.onExpire&&!b.isFunction(d.onExpire))throw new Error("AngularCache.get(key, options): onExpire: must be a function!");if(x(a,d.verifyIntegrity),a in C){var h=C[a],i=h.value,j=(new Date).getTime(),k=h.deleteOnExpire||B.deleteOnExpire;return E.remove(h),h.accessed=j,E.push(h),"passive"===k&&"expires"in h&&h.expires<j&&(this.remove(a,{verifyIntegrity:!1}),B.onExpire?B.onExpire(a,h.value,d.onExpire):d.onExpire&&d.onExpire(a,h.value),i=c),z(a),i}}},this.remove=function(a,b){b=b||{},w(b.verifyIntegrity),E.remove(C[a]),D.remove(C[a]),"none"!==B.storageMode&&I&&I.removeItem(F+".data."+a),delete C[a],y()},this.removeAll=function(){A(),E.removeAll(),D.removeAll(),C={}},this.removeExpired=function(a){a=a||{};for(var b=(new Date).getTime(),c=i(C),d={},e=0;e<c.length;e++)C[c[e]]&&C[c[e]].expires&&C[c[e]].expires<b&&(d[c[e]]=C[c[e]].value);for(var f in d)H.remove(f);if(w(a.verifyIntegrity),a.asArray){var g=[];for(f in d)g.push(d[f]);return g}return d},this.destroy=function(){B.cacheFlushIntervalId&&clearInterval(B.cacheFlushIntervalId),B.recycleFreqId&&clearInterval(B.recycleFreqId),this.removeAll(),"none"!==B.storageMode&&I&&(I.removeItem(F+".keys"),I.removeItem(F)),I=null,C=null,E=null,D=null,B=null,F=null,H=null;for(var a=i(this),b=0;b<a.length;b++)this.hasOwnProperty(a[b])&&delete this[a[b]];l[j]=null,delete l[j]},this.info=function(a){if(a){if(C[a]){var c={created:C[a].created,accessed:C[a].accessed,expires:C[a].expires,maxAge:C[a].maxAge||B.maxAge,deleteOnExpire:C[a].deleteOnExpire||B.deleteOnExpire,isExpired:!1};return c.maxAge&&(c.isExpired=(new Date).getTime()-c.created>c.maxAge),c}return C[a]}return b.extend({},B,{size:E&&E.size()||0})},this.keySet=function(){return h(C)},this.keys=function(){return i(C)},this.setOptions=t,t(k,!0,{verifyIntegrity:!1})}function k(a,c){if(a in l)throw new Error("cacheId "+a+" taken!");if(!b.isString(a))throw new Error("cacheId must be a string!");return l[a]=new j(a,c),l[a]}var l={};return k.info=function(){for(var a=i(l),c={size:a.length,caches:{}},e=0;e<a.length;e++){var f=a[e];c.caches[f]=l[f].info()}return c.cacheDefaults=b.extend({},d),c},k.get=function(a){if(!b.isString(a))throw new Error("$angularCacheFactory.get(cacheId): cacheId: must be a string!");return l[a]},k.keySet=function(){return h(l)},k.keys=function(){return i(l)},k.removeAll=function(){for(var a=i(l),b=0;b<a.length;b++)l[a[b]].destroy()},k.clearAll=function(){for(var a=i(l),b=0;b<a.length;b++)l[a[b]].removeAll()},k.enableAll=function(){for(var a=i(l),b=0;b<a.length;b++)l[a[b]].setOptions({disabled:!1})},k.disableAll=function(){for(var a=i(l),b=0;b<a.length;b++)l[a[b]].setOptions({disabled:!0})},k}]}b.module("jmdobry.binary-heap",[]).provider("BinaryHeap",d),b.module("jmdobry.angular-cache",["ng","jmdobry.binary-heap"]).provider("$angularCacheFactory",e)}(window,window.angular);
/*! NProgress (c) 2013, Rico Sta. Cruz
 *  http://ricostacruz.com/nprogress */

;(function(factory) {

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    this.NProgress = factory();
  }

})(function() {
  var NProgress = {};

  NProgress.version = '0.1.3';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    var key, value;
    for (key in options) {
      value = options[key];
      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
    }

    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var progress = NProgress.render(!started),
      bar      = progress.querySelector(Settings.barSelector),
      speed    = Settings.speed,
      ease     = Settings.easing;

    progress.offsetWidth; /* Repaint */

    queue(function(next) {
      // Set positionUsing if it hasn't already been set
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      css(bar, barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        css(progress, {
          transition: 'none',
          opacity: 1
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(function() {
          css(progress, {
            transition: 'all ' + speed + 'ms linear',
            opacity: 0
          });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   *
   * @param $promise jQUery Promise
   */
  (function() {
    var initial = 0, current = 0;

    NProgress.promise = function($promise) {
      if (!$promise || $promise.state() == "resolved") {
        return this;
      }

      if (current == 0) {
        NProgress.start();
      }

      initial++;
      current++;

      $promise.always(function() {
        current--;
        if (current == 0) {
          initial = 0;
          NProgress.done();
        } else {
          NProgress.set((initial - current) / initial);
        }
      });

      return this;
    };

  })();

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    if (NProgress.isRendered()) return document.getElementById('nprogress');

    addClass(document.documentElement, 'nprogress-busy');

    var progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = Settings.template;

    var bar      = progress.querySelector(Settings.barSelector),
      perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
      spinner;

    css(bar, {
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) {
      spinner = progress.querySelector(Settings.spinnerSelector);
      spinner && removeElement(spinner);
    }

    document.body.appendChild(progress);
    return progress;
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    removeClass(document.documentElement, 'nprogress-busy');
    var progress = document.getElementById('nprogress');
    progress && removeElement(progress);
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress');
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
      ('MozTransform' in bodyStyle) ? 'Moz' :
        ('msTransform' in bodyStyle) ? 'ms' :
          ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  /**
   * (Internal) Queues a function to be executed.
   */

  var queue = (function() {
    var pending = [];

    function next() {
      var fn = pending.shift();
      if (fn) {
        fn(next);
      }
    }

    return function(fn) {
      pending.push(fn);
      if (pending.length == 1) next();
    };
  })();

  /**
   * (Internal) Applies css properties to an element, similar to the jQuery
   * css method.
   *
   * While this helper does assist with vendor prefixed property names, it
   * does not perform any manipulation of values prior to setting styles.
   */

  var css = (function() {
    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
      cssProps    = {};

    function camelCase(string) {
      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
        return letter.toUpperCase();
      });
    }

    function getVendorProp(name) {
      var style = document.body.style;
      if (name in style) return name;

      var i = cssPrefixes.length,
        capName = name.charAt(0).toUpperCase() + name.slice(1),
        vendorName;
      while (i--) {
        vendorName = cssPrefixes[i] + capName;
        if (vendorName in style) return vendorName;
      }

      return name;
    }

    function getStyleProp(name) {
      name = camelCase(name);
      return cssProps[name] || (cssProps[name] = getVendorProp(name));
    }

    function applyCss(element, prop, value) {
      prop = getStyleProp(prop);
      element.style[prop] = value;
    }

    return function(element, properties) {
      var args = arguments,
        prop,
        value;

      if (args.length == 2) {
        for (prop in properties) {
          value = properties[prop];
          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
        }
      } else {
        applyCss(element, args[1], args[2]);
      }
    }
  })();

  /**
   * (Internal) Determines if an element or space separated list of class names contains a class name.
   */

  function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
  }

  /**
   * (Internal) Adds a class to an element.
   */

  function addClass(element, name) {
    var oldList = classList(element),
      newList = oldList + name;

    if (hasClass(oldList, name)) return;

    // Trim the opening space.
    element.className = newList.substring(1);
  }

  /**
   * (Internal) Removes a class from an element.
   */

  function removeClass(element, name) {
    var oldList = classList(element),
      newList;

    if (!hasClass(element, name)) return;

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  /**
   * (Internal) Gets a space separated list of the class names on the element.
   * The list is wrapped with a single space on each end to facilitate finding
   * matches within the list.
   */

  function classList(element) {
    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  /**
   * (Internal) Removes an element from the DOM.
   */

  function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
  }

  return NProgress;
});
angular.module('templates-main', ['admin/masquerading/_modal_list_avail', 'auditing/_modal_view_confirmation_detail', 'auditing/events', 'catering/_header_add', 'catering/_header_main', 'catering/add', 'catering/categories/view', 'catering/items/_header_index', 'catering/items/index', 'catering/items/new', 'catering/main', 'catering/menus/new', 'client-module/release_to_team_automate_invitations', 'client-module/release_to_team_business_unit', 'client-module/release_to_team_class', 'client-module/release_to_team_release_expiry', 'clients/_new_address', 'clients/_new_admin', 'clients/_new_config', 'clients/_new_facility_lease', 'clients/_new_name', 'clients/new', 'clients/view', 'companies/add', 'companies/addSearchResults', 'companies/edit', 'companies/forms/address', 'companies/forms/config', 'companies/forms/details', 'companies/forms/notifications', 'companies/index', 'companies/new', 'companies/searchByEmail', 'dashboard/_header_main', 'dashboard/_modal_manual_ticket_create', 'dashboard/debug', 'dashboard/main', 'employees/_add_employee', 'employees/_header_add', 'employees/_header_main', 'employees/add', 'employees/main', 'events/_header_main', 'events/_modal_add_event_date', 'events/add', 'events/add_date', 'events/add_event', 'events/client_index', 'events/edit', 'events/edit_date', 'events/forms/attachments', 'events/forms/control', 'events/forms/date', 'events/forms/event', 'events/forms/ticketing', 'events/main', 'events/release', 'events/view', 'facilities/_header_add', 'facilities/_header_main', 'facilities/_header_view', 'facilities/add', 'facilities/add_facility', 'facilities/edit', 'facilities/edit_lease', 'facilities/forms/facility', 'facilities/main', 'facilities/new', 'facilities/new_lease', 'facilities/view', 'inventory/_modal_drinksChoices', 'inventory/_modal_guest_names', 'inventory/_modal_snack_conditions', 'inventory/add', 'inventory/confirm_attendance', 'inventory/confirm_drinks', 'inventory/confirm_host_details', 'inventory/confirm_menu', 'inventory/confirm_options', 'inventory/confirm_parking', 'inventory/confirm_review', 'inventory/confirm_snacks', 'inventory/shared/review', 'inventory_releases/main', 'layouts/authenticated', 'layouts/guest', 'login', 'navigation/main', 'navigation/user_header_menu', 'notifications/index', 'reporting/_modal_report_select', 'reporting/catering/event_select', 'reporting/catering/view', 'reporting/guest_report', 'reporting/index', 'reporting/suite_orders/event_select', 'reporting/suite_orders/unconfirmed', 'reporting/suite_orders/view', 'resetPassword', 'resetPasswordRequest', 'teasers/modal_help', 'teasers/modal_release_to_team', 'tickets/index', 'ui/modal/backdrop', 'ui/modal/window']);

angular.module("admin/masquerading/_modal_list_avail", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/masquerading/_modal_list_avail",
    "<div class=panel><div class=flex-toolbar><div class=title>Users</div><div class=\"field search\"><input type=search placeholder=Search ng-model=filterModel autofocus></div></div><hr><div class=employees-table><div ng-repeat=\"user in users| filter:filterModel:strict track by user.id\" class=\"record repeat-animation\"><div class=details><div ng-bind=user.full_name class=name></div><div ng-bind=user.company_name class=company></div><div ng-bind=user.email class=email></div></div><div class=actions><button ng-click=masqueradeAs(user) class=\"small dark-accent outline\"><i class=icon-thin-218_thinking_brain_head_mind></i><span>Masquerade</span></button></div></div></div></div>");
}]);

angular.module("auditing/_modal_view_confirmation_detail", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auditing/_modal_view_confirmation_detail",
    "<div id=reviewInventoryOptions class=in-modal><div ng-if=Options.selectedOptions.is_attending class=panel><div class=top-bar><div ng-bind=Options.selectedOptions.company.friendly_name class=title></div></div><br><p ng-bind=Options.selectedOptions.event_date.event_name></p><br><div ng-if=Options.selectedOptions.selection.menu class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Menu</div></div><h1 ng-bind=Options.selectedOptions.selection.menu.name></h1></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Additional Beverages</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.drinks\"><td ng-bind=item.name></td></tr></tbody></table><br><div class=top-bar><div class=title>Wine, Beer and Pairings</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Devil’s Lair The Hidden Cave Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Redback Original</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Beez Neez</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Saltram 1859 Shiraz</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Muscat</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Topaque</td></tr><tr ng-show=Options.selectedOptions.selection.standardDrinkList><td>Your Standard Drinks List</td></tr><tr ng-if=Options.shouldShowCoke()><td>A variety of Coca-Cola soft drinks</td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.snacks class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Snacks</div></div><table><thead><tr><th>Name</th><th class=actions>Quantity</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.snacks\"><td ng-bind=item.name></td><td ng-bind=item.count class=actions></td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.parkingSpaces class=flex-center><div class=panel><div class=top-bar><div class=title>Parking</div></div><h1>{{Options.selectedOptions.selection.parkingSpaces}}</h1></div></div><br><div class=flex-center><div class=panel><div class=top-bar><div class=title>Details</div></div><div class=field><label>Instructions<textarea ng-model=Options.selectedOptions.selection.notes disabled></textarea></label></div><div class=field><label>Host Details<textarea ng-model=Options.selectedOptions.selection.host_details disabled></textarea></label></div><div class=field><label>Host can order additional items<input type=checkbox ng-model=Options.selectedOptions.selection.hostCanOrderAdditionalItems disabled></label></div></div></div></div><div ng-if=!Options.selectedOptions.is_attending class=panel><div class=top-bar><div ng-bind=Options.selectedOptions.company.friendly_name class=title></div></div><br><p ng-bind=Options.selectedOptions.event_date.event_name></p><br><p class=bold>This event has been marked as not attending.</p></div></div>");
}]);

angular.module("auditing/events", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auditing/events",
    "<div class=panel><div ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=toolbar><div class=filters><div class=\"field search\"><input type=text placeholder=\"Client / Event Name\" ng-change=updateFilter() ng-model=$parent.filterValue autofocus></div></div></div><table><thead><tr><th>ID</th><th class=time>Date Confirmed</th><th>Name</th><th>Start Time</th><th>Facility Name</th><th ng-if=\"Auth.currentUser.company.company_type =='venue'\">Client Name</th><th ng-if=\"Auth.currentUser.company.company_type =='venue'\">Reminders</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"event in data | filterMultiple:filterModel | orderBy:'event_date.start'\" ng-class=\"!event.is_attending &amp;&amp; 'red'\"><td ng-bind=$index></td><td ng-bind=\"event.created_at | date\" class=time></td><td><span ng-bind=event.event_date.event_name></span></td><td><span ng-bind=\"event.event_date.start | amDateFormat: 'D'\"></span><sup ng-bind=\"event.event_date.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"event.event_date.start | amDateFormat: ' MMM YYYY'\"></span><div ng-bind=\"event.event_date.start | amDateFormat: 'h:mm a'\" class=time></div></td><td ng-bind=event.facility_name></td><td ng-if=\"Auth.currentUser.company.company_type =='venue'\" ng-bind=event.company.name></td><td ng-if=\"Auth.currentUser.company.company_type =='venue'\"><div ng-if=\"event.company.ticket_type == 'hard'\" class=field><label>Hard Tickets Sent<input type=checkbox ng-model=event.data.hardTicketsSent ng-change=updateOption(event)></label></div><div ng-if=event.selection.parkingSpaces class=field><label>Parking Allocated<input type=checkbox ng-model=event.data.parkingAllocated ng-change=updateOption(event)></label></div></td><td class=actions><button ng-click=viewDetails(event) class=\"dark-accent outline small\">View Details</button></td></tr></tbody></table></div>");
}]);

angular.module("catering/_header_add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/_header_add",
    "<h1>New Company</h1>");
}]);

angular.module("catering/_header_main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/_header_main",
    "<h1>Catering Management</h1>");
}]);

angular.module("catering/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/add",
    "<div class=flex-center><div class=\"panel smallish\"><fieldset><legend>Search By Email</legend><div class=field><input type=text placeholder=admin@company.com.au ng-model=email></div><div class=\"field right\"><button ng-click=search(email) class=dark-accent>Search</button></div></fieldset></div></div>");
}]);

angular.module("catering/categories/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/categories/view",
    "<div class=toolbar><button ui-sref=\"authenticated.main.catering.menu.item.new({category_id: category.id})\" class=dark-accent>Add Item</button></div><table><thead><tr><th>Name</th><th>Price</th></tr></thead><tbody><tr ng-repeat=\"item in category.menu_items\"><td ng-bind=item.name></td><td>{{item.price_cents/100 | currency}}</td></tr></tbody></table>");
}]);

angular.module("catering/items/_header_index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/items/_header_index",
    "<h1>Menu Categories</h1>");
}]);

angular.module("catering/items/index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/items/index",
    "<div class=toolbar><button ui-sref=authenticated.main.catering.menu.categories.new class=dark-accent>New Category</button></div><div ng-repeat=\"category in categories\"><div ng-bind=category.name class=title></div><hr><div class=\"flex-panel-grid quad\"><div ng-repeat=\"child in category.children\" ui-sref=authenticated.main.catering.menu.category.view({id:child.id}) ng-class=\"child.items.length &gt; 0 &amp;&amp; 'paper-stack'\" class=\"category panel paper-stack\"><div class=top-bar><div class=title><a ng-bind=child.name></a></div><div class=count>{{child.items.length}}</div></div></div><div class=\"category panel dashed\">New Sub-Category</div></div></div>");
}]);

angular.module("catering/items/new", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/items/new",
    "<div class=flex-center><div class=\"panel smallish\"><fieldset><legend>New Menu Item</legend><div class=field><input type=text placeholder=\"Item Name\" ng-model=item.name autofocus></div><div class=field><textarea placeholder=\"Item Description\" ng-model=item.description></textarea></div><div class=field><input type=text placeholder=Price min=0 ng-model=item.price money=money></div><div class=\"field right\"><button ng-click=createItem(item) class=dark-accent>Create Item</button></div></fieldset></div></div>");
}]);

angular.module("catering/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/main",
    "<div class=flex-container><div class=flex-container><div class=panel><div class=top-bar></div><button ui-sref=authenticated.main.catering.menu.category.index class=dark-accent>View Menu Items</button></div><div class=panel><div class=top-bar></div><button ui-sref=authenticated.main.catering.menu.new class=dark-accent>Build Menu</button></div></div></div>");
}]);

angular.module("catering/menus/new", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("catering/menus/new",
    "<div class=flex-container><div id=menu-items-container class=flex-left><div class=\"panel smaller\"><div class=top-bar><div class=title>Menu Items</div><input type=text placeholder=Search... ng-model=itemFilter></div><div id=menu-items-list><div ng-repeat=\"category in categories\"><div ng-repeat=\"child in category.children\"><div ng-repeat=\"item in child.menu_items | filter:itemFilter\" ui-draggable=true drag=item class=menu-item><div class=inner-left><div ng-bind=item.name class=item-name></div><div ng-bind=item.description class=item-description></div></div><div class=inner-right><div ng-bind=child.name class=item-category></div></div></div></div></div></div></div></div><div id=menu-builder class=flex-right><div class=panel><div class=top-bar><div class=title>Menu Build</div><button ng-click=saveMenu() class=\"small dark-accent wider\">Create Menu</button></div><div id=menu-builder-sections-list><div ui-draggable=true ng-repeat=\"section in menu.sections\" ui-on-drop=\"addItemToSection(section, $event, $data)\" class=\"menu-section dashed\"><div class=field><input type=text autofocus placeholder=\"Section Name\" ng-model=section.name></div><ol><li ng-repeat=\"item in section.items\"><a ng-bind=item.name></a><input type=checkbox ng-model=item.data.drink></li></ol></div><button ng-click=addMenuSection() class=grey>Add Menu Section</button></div></div></div></div>");
}]);

angular.module("client-module/release_to_team_automate_invitations", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("client-module/release_to_team_automate_invitations",
    "<div class=flex-center><div id=steps><div data-desc=\"Identify Class\" class=\"step done\">1</div><div data-desc=\"Allocate To Business Units\" class=\"step done\">2</div><div data-desc=\"Release Expiry\" class=\"step done\">3</div><div data-desc=\"Automate Invitation\" class=\"step active\">4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Automate Invitations</div></div><hr><div class=alert-info>Once a ticket is requested, and a guest email or mobile is captured, the system can automatically issue an invitation using your company’s logo or template. Once a connection is made with the guest we can then automate RSVP. Finally, guest information like a survey after the event or details around the guest’s favourite event or team can be requested and used for future development of this relationship.</div><form novalidate name=form><div class=field><select ng-model=event_class><option ng-value=circus>Yes</option><option value=\"\" selected>No</option></select></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.release.releaseExpiry class=grey>Previous</button><button ng-disabled=form.$invalid class=dark-accent>Release</button></div></div></div></div>");
}]);

angular.module("client-module/release_to_team_business_unit", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("client-module/release_to_team_business_unit",
    "<div class=flex-center><div id=steps><div data-desc=\"Identify Class\" class=\"step done\">1</div><div data-desc=\"Allocate To Business Units\" class=\"step active\">2</div><div data-desc=\"Release Expiry\" class=step>3</div><div data-desc=\"Automate Invitation\" class=step>4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Allocate To Business Units</div></div><hr><div class=alert-info>You can share tickets across your teams for fair allocations. Or choose ALL to simply allow “first in” access.</div><form novalidate name=form><div class=\"field large\"><label>Marketing<input type=number required min=0 placeholder=0></label></div><div class=\"field large\"><label>Sales<input type=number required min=0 placeholder=0></label></div><div class=\"field large\"><label>Operations<input type=number required min=0 placeholder=0></label></div><div class=\"field large\"><label>Administration<input type=number required min=0 placeholder=0></label></div><div class=\"field large\"><label>All<input type=number required min=0 placeholder=0></label></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.release.identifyClass class=grey>Previous</button><button ui-sref=authenticated.main.inventory.release.releaseExpiry ng-disabled=form.$invalid class=dark-accent>Next</button></div></div></div></div>");
}]);

angular.module("client-module/release_to_team_class", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("client-module/release_to_team_class",
    "<div class=flex-center><div id=steps><div data-desc=\"Identify Class\" class=\"step active\">1</div><div data-desc=\"Allocate To Business Units\" class=step>2</div><div data-desc=\"Release Expiry\" class=step>3</div><div data-desc=\"Automate Invitation\" class=step>4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Event Class</div></div><hr><div class=alert-info>This identifies the class of a ticket. Only users at or above this class get access to these tickets to request.</div><form novalidate name=form><div class=field><select ng-model=event_class><option ng-value=circus>Class A</option><option ng-value=live_event>Class B</option><option ng-value=live_event>Class C</option><option ng-value=live_event>Class D</option><option selected value=\"\">Select Event Class</option></select></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.release.allocateBusinessUnits ng-disabled=form.$invalid class=dark-accent>Next</button></div></div></div></div>");
}]);

angular.module("client-module/release_to_team_release_expiry", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("client-module/release_to_team_release_expiry",
    "<div class=flex-center><div id=steps><div data-desc=\"Identify Class\" class=\"step done\">1</div><div data-desc=\"Allocate To Business Units\" class=\"step done\">2</div><div data-desc=\"Release Expiry\" class=\"step active\">3</div><div data-desc=\"Automate Invitation\" class=step>4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Release Expiry</div></div><hr><div class=alert-info>Sometimes Tickets are not used. After a certain number of days you can release to other teams or to everyone if tickets are not in demand.</div><form novalidate name=form><div class=field><label>Number of days to remain available<input type=number required min=0 placeholder=0></label></div><div class=field><select ng-model=event_class><option ng-value=circus>Release to next class</option><option ng-value=live_event>Place back in allocation pool</option><option selected value=\"\">Select Expiry Action</option></select></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.release.allocateBusinessUnits class=grey>Previous</button><button ui-sref=authenticated.main.inventory.release.automateInvitations ng-disabled=form.$invalid class=dark-accent>Next</button></div></div></div></div>");
}]);

angular.module("clients/_new_address", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/_new_address",
    "<div class=flex-center><div id=steps><div data-desc=\"Company Name\" class=\"step done\">1</div><div data-desc=\"Company Address\" class=\"step active\">2</div><div data-desc=\"Platform Config\" class=step>3</div><div data-desc=\"Company Administrator\" class=step>4</div></div></div><div class=flex-center><div class=panel><form novalidate name=form><div class=field><input type=text placeholder=Address ng-model=company.data.address1 required></div><div class=field><input type=text placeholder=\"Address 2\" ng-model=company.data.address2></div><div class=inline-postcode><div class=\"suburb field\"><input type=text placeholder=Suburb ng-model=company.data.suburb required></div><div class=\"postcode field\"><input type=text placeholder=Postcode ng-model=company.data.postcode required ng-minlength=4 ng-maxlength=4 ng-pattern=\"/^\\d+$/\"></div></div><div class=inline-state><div class=\"city field\"><input type=text placeholder=City ng-model=company.data.city required></div><div class=\"state field\"><select ng-model=company.data.state required><option value=NSW>New South Wales</option><option value=VIC>Victoria</option><option value=QLD>Queensland</option><option value=SA>South Australia</option><option value=WA>Western Australia</option><option value=ACT>Australian Capital Territory</option><option value=NT>Northern Territory</option><option value=TAS>Tasmania</option></select></div></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.clients.add.name class=grey>Previous</button><button ui-sref=authenticated.main.clients.add.config ng-disabled=address.$invalid class=dark-accent>Next</button></div></div></div></div>");
}]);

angular.module("clients/_new_admin", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/_new_admin",
    "<div class=flex-center><div id=steps><div data-desc=\"Company Name\" class=\"step done\">1</div><div data-desc=\"Company Address\" class=\"step done\">2</div><div data-desc=\"Platform Config\" class=\"step done\">3</div><div data-desc=\"Company Administrator\" class=\"step active\">4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Company Administrator</div></div><form name=admin novalidate><div class=field><input type=email placeholder=Email ng-model=admin.email></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.clients.add.config class=grey>Previous</button><button ng-click=save(company.data) ng-disabled=admin.$invalid class=dark-accent>Save</button></div></div></div></div>");
}]);

angular.module("clients/_new_config", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/_new_config",
    "<div class=flex-center><div id=steps><div data-desc=\"Company Name\" class=\"step done\">1</div><div data-desc=\"Company Address\" class=\"step done\">2</div><div data-desc=\"Platform Config\" class=\"step active\">3</div><div data-desc=\"Company Administrator\" class=step>4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Platform Configuration</div></div><form><legend>Ticket Type</legend><div class=field><select ng-model=company.data.ticket_type><option value=ezyticket>EzyTicket</option><option value=hard>Hard Ticket</option><option value=digital>Digital Ticket</option></select></div><legend>Notifcations</legend><div class=field><label>Email<input type=checkbox ng-model=company.data.notify_email></label></div><div class=field><label>SMS<input type=checkbox ng-model=company.data.notify_sms></label></div><br><div class=right><button ui-sref=authenticated.main.clients.add.address class=grey>Previous</button><button ui-sref=authenticated.main.clients.add.admin class=dark-accent>Next</button></div></form></div></div>");
}]);

angular.module("clients/_new_facility_lease", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/_new_facility_lease",
    "<div class=flex-center><div id=steps><div data-desc=\"Company Name\" class=\"step done\">1</div><div data-desc=\"Company Address\" class=\"step done\">2</div><div data-desc=\"Company Config\" class=\"step done\">3</div><div data-desc=\"Company Administrator\" class=\"step done\">4</div><div data-desc=\"Facility Lease\" class=\"step active\">5</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Facility Lease</div></div><form novalidate name=form></form><br><div class=toolbar><div class=\"actions full\"><button ng-click=createLease(lease) class=dark-accent>Create Lease</button></div></div></div></div>");
}]);

angular.module("clients/_new_name", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/_new_name",
    "<div class=flex-center><div id=steps><div data-desc=\"Company Name\" class=\"step active\">1</div><div data-desc=\"Company Address\" class=step>2</div><div data-desc=\"Platform Config\" class=step>3</div><div data-desc=\"Company Administrator\" class=step>4</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>New Company</div></div><form novalidate name=form><div class=field><input type=text placeholder=\"Company Name\" ng-model=company.data.name required ng-minlength=2></div><div class=inline-numbers><div class=field><input type=text placeholder=Phone ng-model=company.data.phone required ng-minlength=8 ng-pattern=\"/^\\d+$/\"></div><div class=field><input type=text placeholder=Fax ng-model=company.data.fax></div></div></form><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.clients.add.address ng-disabled=form.$invalid class=dark-accent>Next</button></div></div></div></div>");
}]);

angular.module("clients/new", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/new",
    "<div id=new-company ui-view=steps class=animate-form></div>");
}]);

angular.module("clients/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("clients/view",
    "<div id=event-view><div class=row><div class=panel><div class=details><div class=top-bar><div ng-bind=company.data.name ng-if=company.data.name class=title></div><div class=actions><button ng-click=editCompany() class=\"small grey\">Edit</button></div></div><div class=info-pair><div class=lead>Address:</div><div class=data><div ng-bind=company.data.address1></div><div ng-bind=company.data.address2></div><div ng-bind=company.data.suburb></div><div ng-bind=company.data.city></div><div>{{ [company.data.state,company.data.postcode].join(' ') }}</div></div></div><div class=info-pair><div class=lead>Contact:</div><div class=data><div ng-bind=company.data.phone ng-if=company.data.phone class=icon-thin-321_phone_telephone_call_ringing></div><div ng-bind=company.data.fax ng-if=company.data.fax class=icon-thin-181_printer></div></div></div><div class=info-pair><div class=lead>Notifications:</div><div class=data><br><div class=info-pair><div class=lead>SMS</div><div ng-bind=\"company.data.notify_sms ? 'Enabled' : 'Disabled'\" class=data></div></div><div class=info-pair><div class=lead>Email</div><div ng-bind=\"company.data.notify_email ? 'Enabled' : 'Disabled'\" class=data></div></div></div></div><div class=info-pair><div class=lead>Modules:</div><div class=data><br><div class=info-pair><div class=lead>Guest</div><div ng-bind=\"company.data.guest_module ? 'Enabled' : 'Disabled'\" class=data></div></div></div></div><div class=info-pair><div class=lead>Misc:</div><div class=data><br><div class=info-pair><div class=lead>Ticket</div><div ng-bind=company.data.ticket_type class=data></div></div></div></div></div></div><div class=panel><div class=top-bar><div class=title>Leased Facilities</div><button ng-click=newLease() class=\"small grey wide\">New Lease</button></div><table><tbody><tr ng-repeat=\"lease in leases\"><td ng-bind=lease.data.facility.name></td><td><span ng-bind=\"lease.data.start | amDateFormat: 'D'\"></span><sup ng-bind=\"lease.data.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"lease.data.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"lease.data.start | amDateFormat: 'h:mm a'\" class=time></div></td><td><span ng-bind=\"lease.data.finish | amDateFormat: 'D'\"></span><sup ng-bind=\"lease.data.finish | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"lease.data.finish | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"lease.data.finish | amDateFormat: 'h:mm a'\" class=time></div></td><td class=actions><button ng-click=editLease(lease) class=\"small dark-accent outline\">Edit</button></td></tr></tbody></table></div></div></div>");
}]);

angular.module("companies/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/add",
    "<div ui-view=form class=\"flex-center animate-form\"></div>");
}]);

angular.module("companies/addSearchResults", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/addSearchResults",
    "<div class=panel><div ng-show=results class=employee-profile><i ng-show=\"results.minimalProfile.sex == 'Male'\" class=icon-thin-191_user_profile_avatar></i><i ng-show=\"results.minimalProfile.sex == 'Female'\" class=icon-thin-192_user_profile_avatar_female></i><div><div class=name>{{ results.minimalProfile.first_name + ' ' + results.minimalProfile.last_name}}</div><div ng-bind=results.minimalCompany.name></div></div><button ng-click=createRelationshipWithCompany(results.minimalCompany) class=\"outline dark-accent small\">Add Company</button></div></div>");
}]);

angular.module("companies/edit", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/edit",
    "<div class=tabbed-panel><form name=editForm novalidate><tabset><tab heading=Details><div class=field><input type=text placeholder=\"Company Name\" ng-model=company.data.name required ng-minlength=2></div><div class=inline-numbers><div class=field><input type=text placeholder=Phone ng-model=company.data.phone required ng-minlength=8 ng-pattern=\"/^\\d+$/\"></div><div class=field><input type=text placeholder=Fax ng-model=company.data.fax></div></div><div class=field><input type=text placeholder=Address ng-model=company.data.address1 required></div><div class=field><input type=text placeholder=\"Address 2\" ng-model=company.data.address2></div><div class=inline-postcode><div class=\"suburb field\"><input type=text placeholder=Suburb ng-model=company.data.suburb required></div><div class=\"postcode field\"><input type=text placeholder=Postcode ng-model=company.data.postcode required ng-minlength=4 ng-maxlength=4 ng-pattern=\"/^\\d+$/\"></div></div><div class=inline-state><div class=\"city field\"><input type=text placeholder=City ng-model=company.data.city required></div><div class=\"state field\"><select ng-model=company.data.state required><option value=NSW>New South Wales</option><option value=VIC>Victoria</option><option value=QLD>Queensland</option><option value=SA>South Australia</option><option value=WA>Western Australia</option><option value=ACT>Australian Capital Territory</option><option value=NT>Northern Territory</option><option value=TAS>Tasmania</option></select></div></div></tab><tab heading=Notifications><div class=field><label>Email<input type=checkbox ng-model=company.data.notify_email></label></div><div class=field><label>SMS<input type=checkbox ng-model=company.data.notify_sms></label></div></tab><tab heading=\"Platform Config\"><legend>Ticket Type</legend><div class=field><select ng-model=company.data.ticket_type><option value=ezyticket>EzyTicket</option><option value=hard>Hard Ticket</option><option value=digital>Digital Ticket</option></select></div></tab></tabset></form><hr><div class=modal-footer><button ng-disabled=editForm.$invalid ng-click=save() class=\"dark-accent full\">Save Changes</button></div></div>");
}]);

angular.module("companies/forms/address", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/forms/address",
    "<div class=field><input type=text placeholder=Address ng-model=company.data.address1 required></div><div class=field><input type=text placeholder=\"Address 2\" ng-model=company.data.address2></div><div class=inline-postcode><div class=\"suburb field\"><input type=text placeholder=Suburb ng-model=company.data.suburb required></div><div class=\"postcode field\"><input type=text placeholder=Postcode ng-model=company.data.postcode required ng-minlength=4 ng-maxlength=4 ng-pattern=\"/^\\d+$/\"></div></div><div class=inline-state><div class=\"city field\"><input type=text placeholder=City ng-model=company.data.city required></div><div class=\"state field\"><select ng-model=company.data.state required><option value=NSW>New South Wales</option><option value=VIC>Victoria</option><option value=QLD>Queensland</option><option value=SA>South Australia</option><option value=WA>Western Australia</option><option value=ACT>Australian Capital Territory</option><option value=NT>Northern Territory</option><option value=TAS>Tasmania</option></select></div></div>");
}]);

angular.module("companies/forms/config", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/forms/config",
    "<legend>Ticket Type</legend><div class=field><select ng-model=company.data.ticket_type><option value=ezyticket>EzyTicket</option><option value=hard>Hard Ticket</option><option value=digital>Digital Ticket</option></select></div>");
}]);

angular.module("companies/forms/details", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/forms/details",
    "<div class=field><input type=text placeholder=\"Company Name\" ng-model=company.data.name required ng-minlength=2></div><div class=inline-numbers><div class=field><input type=text placeholder=Phone ng-model=company.data.phone required ng-minlength=8 ng-pattern=\"/^\\d+$/\"></div><div class=field><input type=text placeholder=Fax ng-model=company.data.fax></div></div>");
}]);

angular.module("companies/forms/notifications", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/forms/notifications",
    "<div class=field><label>Email<input type=checkbox ng-model=company.data.notify_email></label></div><div class=field><label>SMS<input type=checkbox ng-model=company.data.notify_sms></label></div>");
}]);

angular.module("companies/index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/index",
    "<div class=toolbar><div class=filters><div class=\"field search\"><input type=text placeholder=\"Name or Email\" ng-model=filterValue ng-change=updateFilter() autofocus></div></div><div class=actions><button ui-sref=authenticated.main.company.add.search class=dark-accent>Add Company</button></div></div><table><thead><tr><th>Name</th><th>Manager Email</th><th>Ticket Type</th><th class=actions>Actions</th></tr><tbody><tr ng-repeat=\"client in data | filter:filterModel\"><td ng-bind=client.data.name></td><td ng-bind=client.data.manager.email></td><td ng-bind=client.data.ticket_type></td><td class=actions><button ng-click=viewCompany(client.data.id) class=\"small dark-accent outline\">View</button></td></tr></tbody></thead></table>");
}]);

angular.module("companies/new", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/new",
    "<div id=new-company ui-view=steps class=panel></div>");
}]);

angular.module("companies/searchByEmail", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("companies/searchByEmail",
    "<div class=panel><fieldset><legend>Search By Email</legend><div class=field><input type=text placeholder=admin@company.com.au ng-model=email></div><div class=\"field right\"><button ui-sref=authenticated.main.clients.add class=grey>Manually Add</button><button ng-click=search(email) class=dark-accent>Search</button></div></fieldset></div>");
}]);

angular.module("dashboard/_header_main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/_header_main",
    "<h1>Dashboard</h1>");
}]);

angular.module("dashboard/_modal_manual_ticket_create", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/_modal_manual_ticket_create",
    "<div class=tabbed-panel><form name=editForm novalidate><tabset><tab heading=\"Request From Ticketek\"></tab><tab heading=\"Manually Create\"><form name=form><div class=field><label>Event Name<input type=text disabled ng-model=inventory.event_name></label></div><div class=field><label>Client Name<input type=text disabled ng-model=inventory.client_name></label></div><div class=field><label>Event Date<input type=datetime disabled to-unix=to-unix ng-model=inventory.event_start></label></div><div class=field><label>Ticket Prefix<input type=text placeholder=\"e.g: 20140702-8313-\" ng-model=ticketPrefix required></label></div><div class=\"field right\"><button ng-click=createManual(ticketPrefix) ng-disabled=\"form.$invalid || inProgress\" class=dark-accent>Create</button></div></form></tab></tabset></form></div>");
}]);

angular.module("dashboard/debug", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/debug",
    "<div class=toolbar></div><div class=\"form add\"><form><div class=flex-left><div class=panel><fieldset><legend>Current Company Details</legend><div class=field><label>Company Name<input type=text disabled ng-model=Auth.currentUser.company.name></label></div><div class=field><label>Company Type<input type=text disabled ng-model=Auth.currentUser.company.type></label></div><div class=field><label>Company ID<input type=text disabled ng-model=Auth.currentUser.company.id></label></div></fieldset></div><div class=panel><div class=flex-toolbar><div class=title>Manual Ticketing</div><div class=\"field search\"><input type=search placeholder=Search ng-model=filterModel autofocus></div></div><table><thead><tr><th></th><th>Client Name</th><th>Event Name</th><th>Event Date</th><th>Facility Name</th><th>Ticket Count</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"item in inventory | orderBy:'event_date_id':false | filter:filterModel:strict track by item.id\" class=repeat-animation><td><input type=checkbox ng-model=item.done></td><td ng-bind=item.client_name></td><td ng-bind=item.event_name></td><td ng-bind=\"item.event_start | amDateFormat:'DD/MM/YYYY h:mm a'\"></td><td ng-bind=item.facility_name></td><td ng-bind=item.ticket_count></td><td class=actions><button ng-click=createTickets(item) class=\"dark-accent small\">Create Tickets</button></td></tr></tbody></table></div></div><div class=flex-right><div class=panel><fieldset><legend>Current User Permissions</legend></fieldset><div ng-repeat=\"(name, permission) in Auth.currentUser.permissions\" class=field><label ng-bind=name></label><input type=text disabled ng-model=permission></div></div><div class=panel><fieldset><legend>User</legend><div class=field><label>Access Token</label><input type=text disabled ng-model=Auth.accessToken></div></fieldset></div></div></form></div>");
}]);

angular.module("dashboard/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/main",
    "<div class=panel><iframe ng-if=\"Auth.currentUser.company.company_type == 'venue'\" src=\"https://public.tableausoftware.com/views/allphones-Bi/EventDashBoard?:showVizHome=no#5\"></iframe></div>");
}]);

angular.module("employees/_add_employee", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("employees/_add_employee",
    "<div class=\"panel smallish\"><fieldset><legend>New Employee</legend><div class=field><input type=email placeholder=Email ng-model=employee.email autofocus></div><div class=field><select ng-model=employee.department_id><option value=\"\" selected>Department (optional)</option></select></div><div class=\"field right\"><button ng-click=createEmployee(employee) class=dark-accent>Create Employee</button></div></fieldset></div>");
}]);

angular.module("employees/_header_add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("employees/_header_add",
    "<h1>New Employee</h1>");
}]);

angular.module("employees/_header_main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("employees/_header_main",
    "<h1>Employee Management</h1>");
}]);

angular.module("employees/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("employees/add",
    "<div class=\"add employee\"><div class=flex-center><div id=steps><div data-desc=\"User Creation\" class=\"step active\">1</div><div data-desc=\"Assign Rights\" class=step>2</div></div></div><div ui-view=step class=\"flex-center animate-form\"></div></div>");
}]);

angular.module("employees/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("employees/main",
    "<div class=toolbar></div><table><thead><tr><th>Name</th><th>Email</th><th>Department</th></tr></thead><tbody><tr ng-repeat=\"user in data\"><td ng-bind=\"user.profile.first_name + ' ' +user.profile.last_name\"></td><td ng-bind=user.email></td><td ng-bind=user.department.name></td></tr></tbody></table>");
}]);

angular.module("events/_header_main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/_header_main",
    "<h1>Event Management</h1>");
}]);

angular.module("events/_modal_add_event_date", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/_modal_add_event_date",
    "<div class=panel><div class=top-bar><div class=title>Event Date</div><h1 ng-bind=date.start></h1></div><div class=field><label>Start Date<input type=datetime-local ng-model=date.start_time></label></div><div class=field><label>Finish Date<input type=datetime-local ng-model=date.end_time></label></div><div class=field><label>Agenda<textarea placeholder=\"e.g: Dinner at 6pm, Dessert served in foyer at 9pm\" ng-model=date.agenda></textarea></label></div><div class=\"field right\"><button ng-click=save() class=dark-accent>Save Event Date</button></div></div>");
}]);

angular.module("events/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/add",
    "<div class=panel><form name=form><legend>New Event</legend><div class=field><select ng-model=event.data.event_type autofocus><option value=\"\">Select Event Type</option><option ng-value=circus>Circus</option><option ng-value=live_event>Live Event</option><option ng-value=sports>Sports</option><option ng-value=childrens_entertainment>Childrens Entertainment</option></select></div><div class=field><select ng-model=event.data.status required><option value=\"\">Select Event Status</option><option ng-value=\"Coming Soon\">Coming Soon</option><option ng-value=Open>Open</option><option ng-value=\"Closing Soon\">Closing Soon</option><option ng-value=Closed>Closed</option></select></div><div class=field><input type=text ng-model=event.data.name placeholder=Name required></div><div class=field><textarea ng-model=event.data.description placeholder=Description required></textarea></div></form><hr><div class=modal-footer><button ng-disabled=form.$invalid ng-click=save(event) class=\"dark-accent full\">Create Event</button></div></div>");
}]);

angular.module("events/add_date", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/add_date",
    "<div class=panel><form name=form><legend>New Date</legend><div class=field><label>Event Start<input type=datetime-local ng-model=date.data.start date-fix=date-fix to-unix=to-unix required></label></div><div class=field><label>Event Finish<input type=datetime-local ng-model=date.data.finish date-fix=date-fix to-unix=to-unix required></label></div></form><hr><div class=modal-footer><button ng-disabled=form.$invalid ng-click=save(event) class=\"dark-accent full\">Create Date</button></div></div>");
}]);

angular.module("events/add_event", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/add_event",
    "<div class=panel><fieldset><legend>New Event</legend><div class=field><input type=text placeholder=\"Event Name\" ng-model=event.name autofocus></div><div class=field><textarea placeholder=\"Event Description\" ng-model=event.description></textarea></div><div class=field><select ng-model=event.type><option ng-value=circus>Circus</option><option ng-value=live_event>Live Event</option><option>Foo Bar</option></select></div><div class=\"field right\"><button ng-click=createEvent(event) class=dark-accent>Create Event</button></div></fieldset></div>");
}]);

angular.module("events/client_index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/client_index",
    "<wdiv class=toolbar></wdiv><div class=panel><div class=top-bar><div class=title>Released Inventory</div></div><table><thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Start Time</th><th>Venue</th><th>Facility Name</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"event in data | orderBy:'event_start'\" ng-class=\"event.completed &amp;&amp; 'green'\"><td><span ng-bind=event.event_name></span><span ng-click=openFile(event.inventory_options.menu_file) ng-if=event.inventory_options.menu_file class=menu-exists>M</span><span ng-click=openFile(event.inventory_options.agenda_file) ng-if=event.inventory_options.agenda_file class=agenda-exists>A</span><span ui-sref=authenticated.main.tickets.index class=tickets-exist>T</span></td><td ng-bind=event.event_type></td><td ng-bind=event.event_status></td><td><span ng-bind=\"event.event_start | amDateFormat: 'D'\"></span><sup ng-bind=\"event.event_start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"event.event_start | amDateFormat: ' MMM YYYY'\"></span><div ng-bind=\"event.event_start | amDateFormat: 'h:mm a'\" class=time></div></td><td ng-bind=event.venue_name></td><td ng-bind=event.facility_name></td><td class=\"actions block\"><button ng-if=event.is_confirmed class=\"small green-confirmed\"><i class=icon-thin-254_check_ok_done_success></i>Confirmed</button><button ng-if=\"event.event_status == 'Closed'\" tooltip=\"This event is marked as closed, Please contact the venue if you need any changes made to this event\" class=\"small red-confirmed\">Closed</button><div ng-if=\"event.event_status != 'Closed'\"><button ng-if=event.is_confirmed ng-click=reconfirmOption(event) tooltip=\"Clicking this button will void your old confirmation. You will need to confirm your attendance again.\" class=\"small dark-accent\">Replace Order</button><button ui-sref=\"authenticated.main.inventory.confirmOptions({id: event.id})\" ng-if=\"!event.is_confirmed &amp;&amp; event.event_status !='Coming Soon'\" class=\"small dark-accent\">Confirm Attendance</button></div><button ng-click=confirmGuests(event.id) ng-if=event.is_confirmed class=\"small dark-accent\">Guest List</button><button ui-sref=\"authenticated.main.inventory.release.identifyClass({id: event.id})\" class=\"small dark-accent\">Release To Team</button></td></tr></tbody></table></div><br><hr><div class=panel><div class=top-bar><div class=title>Upcoming Events</div></div><table><thead><tr><th>Name</th><th>Type</th><th>Start Time</th><th>Time Until Event</th><th>Number Of Events</th><th>Venue Name</th></tr></thead><tbody><tr ng-repeat=\"event in upcomingEvents | orderBy:'first_event_date':false\"><td ng-bind=event.name></td><td ng-bind=event.event_type></td><td><div ng-bind=\"event.first_event_date | amDateFormat: 'h:mm a'\" class=time></div><span ng-bind=\"event.first_event_date | amDateFormat: 'dddd D'\"></span><sup ng-bind=\"event.first_event_date | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"event.first_event_date | amDateFormat: ' of MMMM YYYY'\"></span></td><td am-time-ago=event.first_event_date></td><td ng-bind=event.event_dates_count></td><td ng-bind=event.venue_name></td></tr></tbody></table></div>");
}]);

angular.module("events/edit", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/edit",
    "<div class=tabbed-panel><form name=editForm novalidate><tabset><tab heading=Details><div class=field><select ng-model=event.data.event_type autofocus><option value=\"\">Select Event Type</option><option ng-value=circus>Circus</option><option ng-value=live_event>Live Event</option><option ng-value=sports>Sports</option><option ng-value=childrens_entertainment>Childrens Entertainment</option></select></div><div class=field><select ng-model=event.data.status required><option value=\"\">Select Event Status</option><option ng-value=\"Coming Soon\">Coming Soon</option><option ng-value=Open>Open</option><option ng-value=\"Closing Soon\">Closing Soon</option><option ng-value=Closed>Closed</option></select></div><div class=field><input type=text ng-model=event.data.name placeholder=Name required></div><div class=field><textarea ng-model=event.data.description placeholder=Description required></textarea></div></tab><tab heading=\"Event Control\"><form><div class=\"field pfix\"><label>Send reminder to clients who haven't confirmed yet</label><input type=number placeholder=0><span class=postfix>Workdays Before Event</span></div><div class=\"field pfix\"><label>Change event status to closed</label><input type=number placeholder=0><span class=postfix>Workdays Before Event</span></div></form></tab></tabset></form><hr><div class=modal-footer><button ng-disabled=editForm.$invalid ng-click=save(event) class=\"dark-accent full\">Save Changes</button></div></div>");
}]);

angular.module("events/edit_date", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/edit_date",
    "<div class=tabbed-panel><form name=editForm novalidate><tabset><tab heading=Date><div class=field><label>Event Start<input type=datetime-local ng-model=date.data.start date-fix=date-fix to-unix=to-unix required></label></div><div class=field><label>Event Finish<input type=datetime-local ng-model=date.data.finish date-fix=date-fix to-unix=to-unix required></label></div></tab><tab heading=Attachments><form><div class=field><label>Event Agenda<input type=file></label></div><div class=field><label>Event Menu<input type=file></label></div><div class=field><label>Event Image<input type=file></label></div></form></tab><tab heading=Ticketing><form><div class=field><label>Ticketek Event Code<input type=text placeholder=\"e.g: ESDS20140428\"></label></div><div class=field><label>Release tickets when available<input type=checkbox checked></label></div></form></tab></tabset></form><hr><div class=modal-footer><button ng-disabled=editForm.$invalid ng-click=save(event) class=\"dark-accent full\">Save Date</button></div></div>");
}]);

angular.module("events/forms/attachments", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/forms/attachments",
    "<div class=field><label>Event Agenda<input type=file></label></div><div class=field><label>Event Menu<input type=file></label></div><div class=field><label>Event Image<input type=file></label></div>");
}]);

angular.module("events/forms/control", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/forms/control",
    "<div class=\"field pfix\"><label>Send reminder to clients who haven't confirmed yet</label><input type=number placeholder=0><span class=postfix>Workdays Before Event</span></div><div class=\"field pfix\"><label>Change event status to closed</label><input type=number placeholder=0><span class=postfix>Workdays Before Event</span></div>");
}]);

angular.module("events/forms/date", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/forms/date",
    "<div class=field><label>Event Start<input type=datetime-local ng-model=date.data.start date-fix=date-fix to-unix=to-unix required></label></div><div class=field><label>Event Finish<input type=datetime-local ng-model=date.data.finish date-fix=date-fix to-unix=to-unix required></label></div>");
}]);

angular.module("events/forms/event", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/forms/event",
    "<div class=field><select ng-model=event.data.event_type autofocus><option value=\"\">Select Event Type</option><option ng-value=circus>Circus</option><option ng-value=live_event>Live Event</option><option ng-value=sports>Sports</option><option ng-value=childrens_entertainment>Childrens Entertainment</option></select></div><div class=field><select ng-model=event.data.status required><option value=\"\">Select Event Status</option><option ng-value=\"Coming Soon\">Coming Soon</option><option ng-value=Open>Open</option><option ng-value=\"Closing Soon\">Closing Soon</option><option ng-value=Closed>Closed</option></select></div><div class=field><input type=text ng-model=event.data.name placeholder=Name required></div><div class=field><textarea ng-model=event.data.description placeholder=Description required></textarea></div>");
}]);

angular.module("events/forms/ticketing", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/forms/ticketing",
    "<div class=field><label>Ticketek Event Code<input type=text placeholder=\"e.g: ESDS20140428\"></label></div><div class=field><label>Release tickets when available<input type=checkbox checked></label></div>");
}]);

angular.module("events/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/main",
    "<div class=toolbar><div class=filters><div class=\"field search\"><input type=text placeholder=Search ng-model=filterModel.data.name autofocus><label><input type=checkbox ng-change=toggleShowUpcomingOnly() ng-model=upcomingOnly>Show only upcoming events</label><select ng-model=event_type ng-options=\"t.value as t.caption for t in event_types\"></select></div></div><div class=actions><button ng-click=newEvent() class=dark-accent>Add Event</button></div></div><table><thead><tr><th>Name</th><th>Type</th><th>First Event Date</th><th>Time Until Event</th><th>Status</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"event in data | orderBy:'data.first_event_date':false | filter:filterModel:strict\"><td ng-bind=event.data.name></td><td ng-bind=event.data.event_type></td><td><div ng-bind=\"event.data.first_event_date | amDateFormat: 'h:mm a'\" class=time></div><span ng-bind=\"event.data.first_event_date | amDateFormat: 'dddd D'\"></span><sup ng-bind=\"event.data.first_event_date | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"event.data.first_event_date | amDateFormat: ' of MMMM YYYY'\"></span></td><td am-time-ago=event.data.first_event_date></td><td ng-bind=event.data.status></td><td class=actions><button ui-sref=\"authenticated.main.event.view({event_id: event.data.id})\" class=\"small dark-accent\">View</button></td></tr></tbody></table>");
}]);

angular.module("events/release", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/release",
    "<div class=toolbar><button ng-click=releaseToInventory() class=dark-accent>Release To Inventory</button></div><table><thead><tr><th><input type=checkbox ng-change=toggleSelectAll() ng-model=allSelected></th><th>Company Name</th><th>Facility Name</th></tr></thead><tbody><tr ng-repeat=\"item in data\"><td><input type=checkbox ng-model=item.selected></td><td ng-bind=item.company_name></td><td ng-bind=item.facility_name></td></tr></tbody></table>");
}]);

angular.module("events/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("events/view",
    "<div id=event-view><div class=row><div class=panel><div class=details><div class=top-bar><div ng-bind=event.data.name ng-if=event.data.name class=title></div><div class=actions><button ng-click=editEvent() class=\"small grey\">Edit</button></div></div><div class=info-pair><div class=lead>Type</div><div class=data><div ng-bind=event.data.event_type></div></div></div><div class=info-pair><div class=lead>Status</div><div class=data><div ng-bind=event.data.status></div></div></div><div class=info-pair><div class=lead>Description</div><div class=data><div ng-bind=event.data.description></div></div></div><div class=info-pair><div class=lead>Agenda</div><div class=data><div ng-bind=event.data.agenda></div></div></div></div></div><div class=panel><div class=top-bar><div class=title>Event Dates</div><button ng-click=newEventDate() class=\"small grey wide\">New Date</button></div><table><tbody><tr ng-repeat=\"date in dates\"><td ng-bind=date.data.facility.name></td><td><span ng-bind=\"date.data.start | amDateFormat: 'D'\"></span><sup ng-bind=\"date.data.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"date.data.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"date.data.start | amDateFormat: 'h:mm a'\" class=time></div></td><td><span ng-bind=\"date.data.finish | amDateFormat: 'D'\"></span><sup ng-bind=\"date.data.finish | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"date.data.finish | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"date.data.finish | amDateFormat: 'h:mm a'\" class=time></div></td><td class=actions><button ng-click=editDate(date) class=\"small dark-accent outline\">Edit</button><button ng-click=releaseDate(date) class=\"small dark-accent outline\">Release</button></td></tr></tbody></table></div></div></div>");
}]);

angular.module("facilities/_header_add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/_header_add",
    "<h1>New Facility</h1>");
}]);

angular.module("facilities/_header_main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/_header_main",
    "<h1>Facility Management</h1>");
}]);

angular.module("facilities/_header_view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/_header_view",
    "<h1 ng-bind=facility.name></h1>");
}]);

angular.module("facilities/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/add",
    "<div class=\"add facility\"><div class=flex-center><div id=steps><div data-desc=\"Facility Creation\" class=\"step active\">1</div><div data-desc=\"Assign Facilities\" class=step>2</div></div></div><div ui-view=step class=\"flex-center animate-form\"></div></div>");
}]);

angular.module("facilities/add_facility", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/add_facility",
    "<div class=panel><fieldset><legend>New Facility</legend><div class=field><select ng-model=facility.type><option value=\"\" selected>Facility Type</option><option value=Suite>Suite</option><option value=Parking>Parking</option></select></div><div class=field><input type=text placeholder=\"Facility Name\" ng-model=facility.name autofocus></div><div class=field><input type=number placeholder=\"Facility Capacity\" ng-model=facility.capacity min=0></div><div class=\"field right\"><button ng-click=createFacility(facility) class=dark-accent>Create Facility</button></div></fieldset></div>");
}]);

angular.module("facilities/edit", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/edit",
    "<div class=panel><div class=top-bar><div class=title>Edit Facility</div></div><form name=form novalidate><div class=field><select ng-model=facility.data.facility_type required><option value=\"\" selected>Facility Type</option><option value=Suite>Suite</option></select></div><div class=field><input type=text placeholder=Name ng-model=facility.data.name autofocus required></div><div class=field><input type=text placeholder=Capacity ng-model=facility.data.capacity ng-pattern=\"/^\\d+$/\" required></div><div class=\"field right\"><button ng-click=save(facility) ng-disabled=form.$invalid class=dark-accent>Save</button></div></form></div>");
}]);

angular.module("facilities/edit_lease", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/edit_lease",
    "<div class=panel><form name=leaseForm><div class=title>Edit Lease</div><div class=field><select ng-model=lease.data.company_id ng-options=\"client.data.id as client.data.name for client in companies\" ng-if=companies required></select></div><div class=field><select ng-model=lease.data.facility_id ng-options=\"facility.data.id as facility.data.name for facility in facilities\" ng-if=facilities required></select></div><div class=field><input type=datetime-local placeholder=\"Start Date\" ng-model=lease.data.start date-fix=date-fix to-unix=to-unix required></div><div class=field><input type=datetime-local placeholder=\"End Date\" ng-model=lease.data.finish date-fix=date-fix to-unix=to-unix required></div><div class=field><label>Enabled<input type=checkbox ng-model=lease.data.is_enabled></label></div><div class=\"field right\"><button ng-click=save() ng-disabled=leaseForm.$invalid class=dark-accent>Save Lease</button></div></form></div>");
}]);

angular.module("facilities/forms/facility", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/forms/facility",
    "<form name=form novalidate><div class=field><select ng-model=facility.data.facility_type required><option value=\"\" selected>Facility Type</option><option value=Suite>Suite</option></select></div><div class=field><input type=text placeholder=Name ng-model=facility.data.name autofocus required></div><div class=field><input type=text placeholder=Capacity ng-model=facility.data.capacity ng-pattern=\"/^\\d+$/\" required></div><div class=\"field right\"><button ng-click=save(facility) ng-disabled=form.$invalid class=dark-accent>Save</button></div></form>");
}]);

angular.module("facilities/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/main",
    "<div class=toolbar><div class=filters><div class=\"field search\"><input type=text placeholder=\"Name or Company\" ng-model=filterValue ng-change=updateFilter() autofocus></div></div><div class=actions><button ng-click=newFacility() class=dark-accent>Add Facility</button></div></div><table><thead><tr><th>Name</th><th>Type</th><th>Capacity</th><th class=actions>Company</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"facility in data | filter:filterModel\"><td ng-bind=facility.data.name></td><td ng-bind=facility.data.facility_type></td><td ng-bind=facility.data.capacity></td><td ng-bind=facility.data.current_leasee_name class=actions></td><td class=actions><button ui-sref=\"authenticated.main.facility.view({facility_id: facility.data.id})\" class=\"small dark-accent\">View</button></td></tr></tbody></table>");
}]);

angular.module("facilities/new", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/new",
    "<div class=panel><div class=top-bar><div class=title>New Facility</div></div><form name=form novalidate><div class=field><select ng-model=facility.data.facility_type required><option value=\"\" selected>Facility Type</option><option value=Suite>Suite</option></select></div><div class=field><input type=text placeholder=Name ng-model=facility.data.name autofocus required></div><div class=field><input type=text placeholder=Capacity ng-model=facility.data.capacity ng-pattern=\"/^\\d+$/\" required></div><div class=\"field right\"><button ng-click=save(facility) ng-disabled=form.$invalid class=dark-accent>Save</button></div></form></div>");
}]);

angular.module("facilities/new_lease", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/new_lease",
    "<div class=panel><form name=leaseForm><div class=title>New Lease</div><div class=field><select ng-model=lease.data.company_id ng-options=\"client.data.id as client.data.name for client in companies\" ng-if=companies required></select></div><div class=field><select ng-model=lease.data.facility_id ng-options=\"facility.data.id as facility.data.name for facility in facilities\" ng-if=facilities required></select></div><div class=field><input type=datetime-local placeholder=\"Start Date\" ng-model=lease.data.start date-fix=date-fix to-unix=to-unix required></div><div class=field><input type=datetime-local placeholder=\"End Date\" ng-model=lease.data.finish date-fix=date-fix to-unix=to-unix required></div><div class=\"field right\"><button ng-click=save() ng-disabled=leaseForm.$invalid class=dark-accent>Create Lease</button></div></form></div>");
}]);

angular.module("facilities/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("facilities/view",
    "<div id=event-view><div class=row><div class=panel><div class=details><div class=top-bar><div ng-bind=facility.data.name class=title></div><div class=actions><button ng-click=editFacility() class=\"small grey\">Edit</button></div></div><div class=info-pair><div class=lead>Capacity:</div><div class=data><div ng-bind=facility.data.capacity></div></div></div><div class=info-pair><div class=lead>Type:</div><div class=data><div ng-bind=facility.data.facility_type></div></div></div></div></div><div class=panel><div class=top-bar><div class=title>Facility Leases</div><button ng-click=newLease() class=\"small grey wide\">New Lease</button></div><table><tbody><tr ng-repeat=\"lease in leases\"><td ng-bind=lease.data.company.name></td><td><span ng-bind=\"lease.data.start | amDateFormat: 'D'\"></span><sup ng-bind=\"lease.data.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"lease.data.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"lease.data.start | amDateFormat: 'h:mm a'\" class=time></div></td><td><span ng-bind=\"lease.data.finish | amDateFormat: 'D'\"></span><sup ng-bind=\"lease.data.finish | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"lease.data.finish | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"lease.data.finish | amDateFormat: 'h:mm a'\" class=time></div></td><td class=actions><button ng-click=editLease(lease) class=\"small dark-accent outline\">Edit</button></td></tr></tbody></table></div></div></div>");
}]);

angular.module("inventory/_modal_drinksChoices", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/_modal_drinksChoices",
    "<div class=panel><div class=top-bar><div class=title>Beverages Package</div></div><div class=field><label><input type=checkbox ng-model=Options.selectedOptions.selection.foodBeveragePairing>Include Wine & Beer pairings to compliment menu selection</label></div><div class=field><label><input type=checkbox ng-model=Options.selectedOptions.selection.dessertWinePairing>Include Baileys of Glenrowan Fortified Founder Series wines with dessert</label></div><div class=\"field right\"><button ng-click=next() class=dark-accent>Next</button></div></div>");
}]);

angular.module("inventory/_modal_guest_names", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/_modal_guest_names",
    "<div class=panel><div class=top-bar><div class=title>Guest Names</div></div><p style=\"margin-bottom: 1em; font-size:0.8em; color: #555\">If no guest data currently exists, just click save</p><form name=form novalidate><div ng-repeat=\"guest in guestList\" class=field><input type=text placeholder=\"Guest Name\" autofocus ng-model=guest.name></div><div class=\"field right\"><button ng-click=addNewGuestName() class=\"grey outline\"><i class=icon-thin-251_plus_add></i><span>Add Guest Name</span></button></div></form><hr><div class=modal-footer><button ng-click=save() class=\"dark-accent full\">Save</button></div></div>");
}]);

angular.module("inventory/_modal_snack_conditions", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/_modal_snack_conditions",
    "<div class=panel><div class=top-bar><div class=title>Snack Conditions</div></div><p>A minimum order of 4 platters applies when ordering from the snack menu (excluding crisps, tea & coffee service, cupcakes, birthday cakes & ice creams)</p><br><p>Service charge applicable to all snack menus: Monday to Saturday + $250, Sunday & Public Holidays +$300</p><hr><div class=\"field right\"><button ng-click=$close() class=dark-accent>Accept</button></div></div>");
}]);

angular.module("inventory/add", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/add",
    "<div class=flex-center><div class=panel><div class=top-bar><div class=title>Foo</div></div></div></div>");
}]);

angular.module("inventory/confirm_attendance", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_attendance",
    "<div class=flex-center><div class=panel><div class=top-bar><div class=\"title big\">Confirm your attendance</div></div><hr><div class=details><div class=flex-left><img src=/{{details.event_data.file_name}}></div><div class=flex-right><div class=pairing><div class=title>Event Name</div><div ng-bind=details.event_name class=desc></div></div><div class=pairing><div class=title>Event Date</div><div class=desc><span ng-bind=\"details.start | amDateFormat: 'D'\"></span><sup ng-bind=\"details.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"details.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"details.start | amDateFormat: 'h:mm a'\" class=time></div></div></div></div></div><div class=inner-align-right><button ng-click=notComing() class=grey>Not this time</button><button ui-sref=authenticated.main.inventory.confirmOptions.menu class=dark-accent>Yes</button></div></div></div>");
}]);

angular.module("inventory/confirm_drinks", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_drinks",
    "<div class=flex-center><div id=steps><div data-desc=Menu class=\"step done\">1</div><div data-desc=Drinks class=\"step active\">2</div><div data-desc=Snacks class=step>3</div><div data-desc=Parking class=step>4</div><div data-desc=Details class=step>5</div><div data-desc=\"Final Review\" class=step>6</div></div></div><div class=toolbar><div class=\"actions full\"><button ng-click=wantStandardDrinksMenu() tooltip=\"This button confirms a standard drinks order, if selected we will provide drinks to your suite\" class=grey>Just Our Standard Drinks Order</button><button ui-sref=authenticated.main.inventory.confirmOptions.menu class=grey>Previous</button><button ng-click=goToSnackSelection() class=dark-accent>Next</button></div></div><div id=drinksGrid><div ng-repeat=\"section in Options.drinks.sections\"><div ng-bind=section.name class=title></div><span ng-if=section.description ng-bind=section.description></span><hr><div class=\"flex-panel-grid quad\"><div ng-repeat=\"item in section.items\" class=\"category panel\"><div class=flex><div ng-bind=item.name class=heading></div><i ng-click=openModalForItemImage(item) ng-if=item.data.image class=icon-thin-368_photo_image_camera_take_shot></i></div><div ng-bind=item.description class=description></div><br><div style=\"text-align: center\" class=price>{{ item.price_cents / 100 | currency }}</div><br><div class=buttons><button ng-click=confirmDrink(item) ng-show=!item.requested class=\"grey small\">Request</button><button ng-click=unConfirmDrink(item) ng-show=item.requested class=\"dark-accent small\">Un-Request</button></div></div></div></div></div><hr><div class=toolbar><div class=\"actions full\"><button ng-click=wantStandardDrinksMenu() tooltip=\"This button confirms a standard drinks order, if selected we will provide drinks to your suite\" class=grey>Just Our Standard Drinks Order</button><button ui-sref=authenticated.main.inventory.confirmOptions.menu class=grey>Previous</button><button ng-click=goToSnackSelection() class=dark-accent>Next</button></div></div>");
}]);

angular.module("inventory/confirm_host_details", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_host_details",
    "<div class=flex-center><div id=steps><div data-desc=Menu class=\"step done\">1</div><div data-desc=Drinks class=\"step done\">2</div><div data-desc=Snacks class=\"step done\">3</div><div data-desc=Parking class=\"step done\">4</div><div data-desc=Details class=\"step active\">5</div><div data-desc=\"Final Review\" class=step>6</div></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Event Specific Details</div></div><form name=form novalidate><div class=field><label>Instructions<textarea placeholder=\"e.g: No peanuts / Needs disabled access\" ng-model=Options.selectedOptions.selection.notes></textarea></label></div><div class=field><label>Host Details<textarea placeholder=\"John Smith, 0418 277 332\" ng-model=Options.selectedOptions.selection.host_details required></textarea></label></div><div class=field><label>Host can order additional items<input type=checkbox ng-model=Options.selectedOptions.selection.hostCanOrderAdditionalItems></label></div><div class=\"field right\"><button ui-sref=authenticated.main.inventory.confirmOptions.parking class=grey>Previous</button><button ng-click=buildOptions() ng-disabled=form.$invalid class=dark-accent>Next</button></div></form></div></div>");
}]);

angular.module("inventory/confirm_menu", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_menu",
    "<div class=flex-center><div id=steps><div data-desc=Menu class=\"step active\">1</div><div data-desc=Snacks class=step>2</div><div data-desc=Drinks class=step>3</div><div data-desc=Parking class=step>4</div><div data-desc=Details class=step>5</div><div data-desc=\"Final Review\" class=step>6</div></div></div><div class=\"flex-container menu-selection\"><div ng-repeat=\"menu in Options.menus\" ng-click=selectMenu(menu) class=\"panel menu\"><div class=top-bar><div ng-bind=menu.name class=title></div></div><div class=menu-item-listing><div ng-repeat=\"section in menu.sections\" class=menu-section><div ng-bind=section.name class=section-title></div><div ng-repeat=\"item in section.items\" ng-class=\"item.drink &amp;&amp; 'highlighted'\" class=menu-item><a ng-bind=item.name></a></div></div></div><div class=bottom-bar><div class=title>{{menu.price_cents / 100 | currency }} per person</div></div></div></div><br><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.confirmOptions.drinks class=grey>No Thanks</button></div></div>");
}]);

angular.module("inventory/confirm_options", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_options",
    "<div ui-view=step class=animate-fade></div>");
}]);

angular.module("inventory/confirm_parking", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_parking",
    "<div class=flex-center><div id=steps><div data-desc=Menu class=\"step done\">1</div><div data-desc=Drinks class=\"step done\">2</div><div data-desc=Snacks class=\"step done\">3</div><div data-desc=Parking class=\"step active\">4</div><div data-desc=Details class=step>5</div><div data-desc=\"Final Review\" class=step>6</div></div></div><div class=flex-center><div id=parking class=panel><div class=top-bar><div class=title>P1 Prepaid Parking Requests</div></div><div class=field><input type=text placeholder=0 ng-model=Options.selectedOptions.selection.parkingSpaces></div><small>$25 per parking space</small></div></div><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.confirmOptions.snacks class=grey>Previous</button><button ui-sref=authenticated.main.inventory.confirmOptions.details class=dark-accent>Next</button></div></div>");
}]);

angular.module("inventory/confirm_review", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_review",
    "<div id=reviewInventoryOptions><div class=flex-center><div id=steps><div data-desc=Menu class=\"step done\">1</div><div data-desc=Drinks class=\"step done\">2</div><div data-desc=Snacks class=\"step done\">3</div><div data-desc=Parking class=\"step done\">4</div><div data-desc=Details class=\"step done\">5</div><div data-desc=\"Final Review\" class=\"step active\">6</div></div></div><div ng-if=Options.selectedOptions.selection.menu class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Menu</div></div><h1 ng-bind=Options.selectedOptions.selection.menu.name></h1></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Additional Beverages</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.drinks\"><td ng-bind=item.name></td></tr></tbody></table><br><div class=top-bar><div class=title>Wine, Beer and Pairings</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Devil’s Lair The Hidden Cave Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Redback Original</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Beez Neez</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Saltram 1859 Shiraz</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Muscat</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Topaque</td></tr><tr ng-show=Options.selectedOptions.selection.standardDrinkList><td>Your Standard Drinks List</td></tr><tr ng-if=Options.shouldShowCoke()><td>A variety of Coca-Cola soft drinks</td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.snacks class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Snacks</div></div><table><thead><tr><th>Name</th><th class=actions>Quantity</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.snacks\"><td ng-bind=item.name></td><td ng-bind=item.count class=actions></td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.parkingSpaces class=flex-center><div class=panel><div class=top-bar><div class=title>Parking</div></div><h1>{{Options.selectedOptions.selection.parkingSpaces}}</h1></div></div><br><div class=flex-center><div class=panel><div class=top-bar><div class=title>Details</div></div><div class=field><label>Instructions<textarea ng-model=Options.selectedOptions.selection.notes disabled></textarea></label></div><div class=field><label>Host Details<textarea ng-model=Options.selectedOptions.selection.host_details disabled></textarea></label></div><div class=field><label>Host can order additional items<input type=checkbox ng-model=Options.selectedOptions.selection.hostCanOrderAdditionalItems disabled></label></div></div></div><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.confirmOptions.details class=grey>Previous</button><button ng-click=confirmChoices() ng-bind=confirmButtonText ng-disabled=confirmButtonDisabled class=dark-accent></button></div></div></div>");
}]);

angular.module("inventory/confirm_snacks", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/confirm_snacks",
    "<div class=flex-center><div id=steps><div data-desc=Menu class=\"step done\">1</div><div data-desc=Drinks class=\"step done\">2</div><div data-desc=Snacks class=\"step active\">3</div><div data-desc=Parking class=step>4</div><div data-desc=Details class=step>5</div><div data-desc=\"Final Review\" class=step>6</div></div></div><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.confirmOptions.drinks class=grey>Previous</button><button ui-sref=authenticated.main.inventory.confirmOptions.parking class=dark-accent>Next</button></div></div><div id=snacksGrid><div ng-repeat=\"section in Options.snacks.sections\"><div ng-bind=section.name class=title></div><hr><div class=\"flex-panel-grid quad\"><div ng-repeat=\"snack in section.items\" class=\"category panel\"><div ng-bind=snack.name class=heading></div><div ng-bind=snack.description class=description></div><br><div class=price>{{ snack.price_cents / 100 | currency }}</div><br><div class=field><input type=number min=0 placeholder=0 ng-model=snack.count></div><div class=buttons><button ng-click=decrement(snack) ng-disabled=\"snack.count === 0\" class=\"grey small wide\">-</button><button ng-click=increment(snack) class=\"grey small wide\">+</button></div></div></div></div></div><hr><div class=toolbar><div class=\"actions full\"><button ui-sref=authenticated.main.inventory.confirmOptions.drinks class=grey>Previous</button><button ui-sref=authenticated.main.inventory.confirmOptions.parking class=dark-accent>Next</button></div></div>");
}]);

angular.module("inventory/shared/review", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory/shared/review",
    "<div ng-if=Options.selectedOptions.selection.menu class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Menu</div></div><h1 ng-bind=Options.selectedOptions.selection.menu.name></h1></div></div><div class=flex-center><div class=panel><div class=top-bar><div class=title>Additional Beverages</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.drinks\"><td ng-bind=item.name></td></tr></tbody></table><br><div class=top-bar><div class=title>Wine, Beer and Pairings</div></div><table><thead><tr><th>Name</th></tr></thead><tbody><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Devil’s Lair The Hidden Cave Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Redback Original</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu One' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Beez Neez</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.selectedOptions.selection.menu.name == 'Menu Two' &amp;&amp; !Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Matilda Bay Fat Yak Pale Ale</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Saltram 1859 Shiraz</td></tr><tr ng-show=\"Options.selectedOptions.selection.foodBeveragePairing &amp;&amp; Options.iceHockey\"><td>Rosemount Estate District Release Chardonnay</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Muscat</td></tr><tr ng-show=Options.selectedOptions.selection.dessertWinePairing><td>Baileys of Glenrowan Fortified Founder Series Topaque</td></tr><tr ng-show=Options.selectedOptions.selection.standardDrinkList><td>Your Standard Drinks List</td></tr><tr ng-if=Options.shouldShowCoke()><td>A variety of Coca-Cola soft drinks</td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.snacks class=flex-center><div class=panel><div class=top-bar><div class=title>Selected Snacks</div></div><table><thead><tr><th>Name</th><th class=actions>Quantity</th></tr></thead><tbody><tr ng-repeat=\"item in Options.selectedOptions.selection.snacks\"><td ng-bind=item.name></td><td ng-bind=item.count class=actions></td></tr></tbody></table></div></div><br><div ng-if=Options.selectedOptions.selection.parkingSpaces class=flex-center><div class=panel><div class=top-bar><div class=title>Parking</div></div><h1>{{Options.selectedOptions.selection.parkingSpaces}}</h1></div></div><br><div class=flex-center><div class=panel><div class=top-bar><div class=title>Details</div></div><div class=field><label>Instructions<textarea ng-model=Options.selectedOptions.selection.notes disabled></textarea></label></div><div class=field><label>Host Details<textarea ng-model=Options.selectedOptions.selection.host_details disabled></textarea></label></div><div class=field><label>Host can order additional items<input type=checkbox ng-model=Options.selectedOptions.selection.hostCanOrderAdditionalItems disabled></label></div></div></div>");
}]);

angular.module("inventory_releases/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("inventory_releases/main",
    "<div class=toolbar><div class=filters><div class=\"field search\"><input type=text placeholder=Search ng-model=filterModel.data.name autofocus><label><input type=checkbox ng-change=toggleShowUpcomingOnly() ng-model=upcomingOnly>Show only upcoming events</label><select ng-model=event_type ng-options=\"t.value as t.caption for t in event_types\"></select></div></div><div class=actions><button ng-click=newEvent() class=dark-accent>Add Event</button></div></div><table><thead><tr><th>Name</th><th>Location</th><th>State</th><th>EventDate</th><th>TimeStart</th><th>TimeEnd</th><th>Department</th><th>Class</th><th>Category</th><th>Description</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"inventory_release in data | orderBy:'data.first_event_date':false | filter:filterModel:strict\"><td ng-bind=inventory_release.data.event_name></td><td ng-bind=inventory_release.data.event_location></td><td ng-bind=inventory_release.data.event_state></td><td ng-bind=inventory_release.data.event_date></td><td ng-bind=inventory_release.data.event_start></td><td ng-bind=inventory_release.data.event_end></td><td ng-bind=inventory_release.data.department_name></td><td ng-bind=inventory_release.data.event_class></td><td ng-bind=inventory_release.data.event_category></td><td ng-bind=inventory_release.data.event_description></td><td class=actions><button ui-sref=\"authenticated.main.inventory_release.view({inventory_release_id: inventory_release.data.id})\" class=\"small dark-accent\">View</button></td></tr></tbody></table>");
}]);

angular.module("layouts/authenticated", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layouts/authenticated",
    "<div id=masqueradeToolbar ng-show=Auth.currentlyMasquerading><a ng-click=Auth.stopMasquerading() tooltip=\"Stop Masquerading\" tooltip-placement=bottom class=clickable>&times; Masquerading as {{Auth.currentUser.email}}</a></div><div id=content-outer class=container><header><div ui-view=header class=page-title></div><div ui-view=user-menu class=user-details></div></header><main><section id=main ui-view=content ng-class=currentStateCss class=animate-fade></section></main><nav id=mainNav><div ui-view=main-navigation></div></nav></div>");
}]);

angular.module("layouts/guest", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layouts/guest",
    "<script src=/js/browser-detect.js></script><div class=\"centered ie-visible\"><div class=ie-panel><div class=top-bar><div class=title>Howdy</div></div><p>We have noticed you are using an old version of Internet Explorer.<br>For security reasons we only support modern browsers.<br>We recommend that you use Google Chrome, which can be downloaded here<br><a href=http://google.com/chrome>Google Chrome</a></p><br><p>If this is an issue for you or your organization, please contact Scott at 0414 652 480 or<br><a href=mailto:cs@turnkeyhospitality.com.au>cs@turnkeyhospitality.com.au</a></p></div></div><div id=guest-content-outer><main ui-view=content></main></div>");
}]);

angular.module("login", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login",
    "<div class=flex-center><div class=\"panel smallish\"><div class=top-bar><div class=title>Login</div></div><form name=form novalidate autocomplete=on><div ng-show=invalidLogin class=\"nice-alert invalid\">Un-Authorized</div><div class=field><input type=email placeholder=Email name=email required ng-class=inputClass ng-model=details.email autofocus></div><div class=field><input type=password placeholder=Password ng-model=details.password name=password ng-minlength=6 required ng-class=inputClass></div><div class=\"field right\"><button type=submit value=Login ng-click=login(user) ng-bind=loginBtnText ng-disabled=\"inProgress || form.$invalid\" class=accent></button></div></form><a style=\"color: #555; font-size: 0.7em\" ui-sref=guest.password_reset_request>Reset Password</a></div></div>");
}]);

angular.module("navigation/main", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("navigation/main",
    "<div id=nav-header><img src=/images/all-phones.png width=75% height=auto></div><ul><li class=title>Main</li><li ui-sref=authenticated.main.home ui-sref-active=active class=link><i class=icon-thin-277_dashboard_full_fuel_gauge></i><a>Dashboard</a></li><li ui-sref=authenticated.main.reporting.index active-class-on=authenticated.main.reporting ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-355_analytics_line_chart_diagram_presentation></i><a>Reporting</a></li><li ui-sref=authenticated.main.event.client.index active-class-on=\"authenticated.main.event authenticated.main.inventory\" ng-if=\"Auth.currentUser.company.company_type == 'company'\" class=link><i class=icon-thin-231_star_favorite></i><a>Events</a></li><li ui-sref=authenticated.main.audit.venue.index active-class-on=authenticated.main.audit.venue ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-299_drink_cocktail_disco_going_out_shake></i><a>Confirmations</a></li><li ng-if=\"Auth.currentUser.company.company_type == 'company'\" ui-sref=authenticated.main.tickets.index active-class-on=authenticated.main.tickets class=link><i class=icon-thin-376_movie_cinema_ticket></i><a>Tickets</a><span ng-bind=Tickets.count class=notification></span></li></ul><ul><li class=title>Master Data Management</li><li ui-sref=authenticated.main.event.index active-class-on=authenticated.main.event ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-231_star_favorite></i><a>Events</a></li><li ui-sref=authenticated.main.facility.index active-class-on=authenticated.main.facility ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-049_building_industry_factory></i><a>Facilities</a></li><li ui-sref=authenticated.main.company.index active-class-on=authenticated.main.company ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-360_hierarchy_diagram_structure></i><a>Companies</a></li><li ui-sref=authenticated.main.employee.index active-class-on=authenticated.main.employee class=link><i class=icon-thin-195_users_group></i><a>Employees</a></li><li ui-sref=authenticated.main.catering.index active-class-on=authenticated.main.catering ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-294_fork_knife_spoon_eating_restaurant_food></i><a>Catering</a></li><li ng-if=\"Auth.currentUser.company.company_type == 'venue'\" class=link><i class=icon-thin-148_shopping_price_tag_bag_sale></i><a>Merchandising</a></li></ul><ul><li class=title>Auditing</li><li class=link><i class=icon-thin-029_wall_clock_time></i><a>Event History</a></li><li ui-sref=authenticated.main.audit.client.index active-class-on=authenticated.main.audit.client ng-if=\"Auth.currentUser.company.company_type == 'company'\" class=link><i class=icon-thin-299_drink_cocktail_disco_going_out_shake></i><a>My Confirmations</a></li></ul><ul ng-if=Auth.currentUser.permissions.developer><li class=title>Developers Only</li><li ui-sref=authenticated.main.home.debug ng-class=\"(currentState.contains('authenticated.main.home.debug')) &amp;&amp; 'active'\" class=link><i class=icon-thin-170_business_tie></i><a>Debug Information</a></li></ul>");
}]);

angular.module("navigation/user_header_menu", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("navigation/user_header_menu",
    "<nav ng-controller=UserHeaderController><ul><li ng-click=help() class=border-right><i class=\"visible icon-thin-229_question_support_help\"></i></li><li dropdown=dropdown ng-click=toggleUserMenu() is-open=userMenu.isOpen><i ng-class=\"(Auth.currentUser.profile.sex == 'Male') &amp;&amp; 'visible'\" class=icon-thin-191_user_profile_avatar></i><i ng-class=\"(Auth.currentUser.profile.sex == 'Female') &amp;&amp; 'visible'\" class=icon-thin-192_user_profile_avatar_female></i><a class=dropdown-toggle>{{Auth.currentUser.profile.first_name +' '+Auth.currentUser.profile.last_name }}</a><span class=caret></span><ul role=menu class=dropdown-menu><li><a ng-click=showMasqueradeUserList()>Switch User</a></li><li ng-if=Auth.currentUser.permissions.developer><a ui-sref=authenticated.main.home.debug>Debug</a></li><li><a ng-click=logout()>Logout</a></li></ul></li></ul></nav>");
}]);

angular.module("notifications/index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notifications/index",
    "<table><thead><tr><th>Name</th><th>Manager</th><th>Manager Email</th><th>Manager Id</th></tr><tbody><tr ng-repeat=\"client in data\"><td ng-bind=client.data.name></td><td ng-bind=client.data.manager.full_name></td><td ng-bind=client.data.manager.email></td><td ng-bind=client.data.manager.id></td></tr></tbody></thead></table><input type=text placeholder=Suburb ng-model=message required><button ng-click=notify() class=\"dark-accent full pull-right\">Send Notification</button>");
}]);

angular.module("reporting/_modal_report_select", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/_modal_report_select",
    "<div class=panel><div class=top-bar><div class=title>Available Reports</div></div><div><button ng-click=viewSuiteOrders() class=\"grey full\">Suite Orders</button></div><hr><div><button ng-click=viewGuestList() class=\"grey full\">Guest List</button></div><hr><div><button ng-click=viewUnConfirmedReport() class=\"grey full\">Clients without confirmations</button></div><hr><div><button ng-click=viewCateringReport() class=\"grey full\">Catering</button></div></div>");
}]);

angular.module("reporting/catering/event_select", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/catering/event_select",
    "<div ng-repeat=\"event in events\" class=panel><div ng-bind=event.name class=title></div><hr><div class=\"flex-panel-grid quad\"><div ng-repeat=\"date in event.dates\" ng-click=openSelectionModal(date) class=\"category panel clickable\"><div class=top-bar><div class=title><span ng-bind=\"date.start | amDateFormat: 'D'\"></span><sup ng-bind=\"date.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"date.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"date.start | amDateFormat: 'h:mm a'\" class=time></div></div></div><hr><p>{{date.confirmations}} Confirmed</p><p>{{date.total_inventory}} Total Inventory</p><p>Event&nbsp;<span>{{ date.start | timeFromNow }}</span></p></div></div></div>");
}]);

angular.module("reporting/catering/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/catering/view",
    "<div class=panel><div class=toolbar><div class=filters><div ng-bind=event.event_name class=title></div></div><div class=actions><button ng-click=downloadExcel(event.id) class=dark-accent>Download Excel</button></div></div><table><thead><tr><th>#</th><th>Suite Name</th><th>Suite Contact</th><th>Client Name</th><th>Menu</th><th>Beverages</th><th>Snacks</th><th>Host</th><th class=tiny>Host Authorized to order additional items</th><th>Notes</th></tr></thead><tbody><tr ng-repeat=\"confirmation in event.confirmed_inventory_options | orderBy:'facility_number'\" ng-class=\"!confirmation.is_attending &amp;&amp; 'red'\"><td>{{ $index + 1 }}</td><td ng-bind=confirmation.facility_name></td><td ng-bind=confirmation.company.manager.full_name></td><td ng-bind=confirmation.company.name></td><td ng-bind=confirmation.selection.menu.name></td><td><div ng-repeat=\"drink in confirmation.selection.drinks\"><span>{{ drink.name }}</span></div><div ng-show=confirmation.selection.foodBeveragePairing>Beer And Wine Pairing</div><div ng-show=confirmation.selection.dessertWinePairing>Dessert Wine Pairing</div><div ng-show=confirmation.selection.standardDrinkList>Standard Drinks List</div></td><td><div ng-repeat=\"snack in confirmation.selection.snacks\"><span>{{ snack.name + ' - ' + snack.count }}</span></div></td><td ng-bind=confirmation.selection.host_details></td><td ng-bind=confirmation.selection.hostCanOrderAdditionalItems class=tiny></td><td ng-bind=confirmation.selection.notes></td></tr></tbody></table></div>");
}]);

angular.module("reporting/guest_report", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/guest_report",
    "<div class=panel><div class=toolbar><div class=title>Guest List for {{event.event_name}}</div></div><table><thead><tr><th>Suite Name</th><th>Host</th><th>Company</th><th>Suite Guests</th></tr></thead><tbody><tr ng-repeat=\"confirmation in event.confirmed_inventory_options | orderBy:'facility_number'\"><td ng-bind=confirmation.facility_name></td><td ng-bind=confirmation.company.manager.full_name></td><td ng-bind=confirmation.company.friendly_name></td><td><p ng-repeat=\"guest in confirmation.guests\" ng-bind=guest.name></p></td></tr></tbody></table></div>");
}]);

angular.module("reporting/index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/index",
    "<div class=flex-container><div class=flex-left><div ui-sref=authenticated.main.reporting.suiteOrders.eventSelect class=panel><div class=top-bar><div class=title>Suite Orders</div></div></div></div><div class=flex-right><div class=panel><div class=top-bar><div class=title>Guest Lists</div></div></div><div ui-sref=authenticated.main.reporting.cateringExplosion.eventSelect class=panel><div class=top-bar><div class=title>Catering Explosion</div></div></div></div></div>");
}]);

angular.module("reporting/suite_orders/event_select", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/suite_orders/event_select",
    "<div ng-repeat=\"event in events\"><div ng-bind=event.name class=title></div><hr><div class=\"flex-panel-grid quad\"><div ng-repeat=\"date in event.dates | orderBy:'start'\" ui-sref=authenticated.main.reporting.suiteOrders.view({id:date.id}) class=\"category panel\"><div class=top-bar><div class=title><span ng-bind=\"date.start | amDateFormat: 'D'\"></span><sup ng-bind=\"date.start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"date.start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"date.start | amDateFormat: 'h:mm a'\" class=time></div></div></div></div></div></div>");
}]);

angular.module("reporting/suite_orders/unconfirmed", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/suite_orders/unconfirmed",
    "<div class=panel><table sticky-header=sticky-header><thead><tr><th>#</th><th>Suite Name</th><th>Suite Contact</th><th>Client Name</th><th>Contact Email</th><th>Contact Phone</th></tr></thead><tbody><tr ng-repeat=\"person in data | orderBy:'facility_number'\"><td>{{ $index + 1 }}</td><td ng-bind=person.facility_name></td><td ng-bind=person.client_contact></td><td ng-bind=person.client_name></td><td ng-bind=person.client_email></td><td ng-bind=person.client_phone></td></tr></tbody></table></div>");
}]);

angular.module("reporting/suite_orders/view", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("reporting/suite_orders/view",
    "<div class=panel><div class=toolbar><div class=filters><div ng-bind=event.event_name class=title></div></div><div class=actions><button ng-click=downloadExcel(event.id) class=dark-accent>Download Excel</button></div></div><table><thead><tr><th>#</th><th>Suite Name</th><th>Suite Contact</th><th>Client Name</th><th>Parking Tickets</th><th>Menu</th><th>Beverages</th><th>Snacks</th><th>Host</th><th class=tiny>Host Authorized to order additional items</th><th>Notes</th></tr></thead><tbody><tr ng-repeat=\"confirmation in event.confirmed_inventory_options | orderBy:'facility_number'\" ng-class=\"!confirmation.is_attending &amp;&amp; 'red'\"><td>{{ $index + 1 }}</td><td ng-bind=confirmation.facility_name></td><td ng-bind=confirmation.company.manager.full_name></td><td ng-bind=confirmation.company.name></td><td ng-bind=\"confirmation.selection.parkingSpaces || 0\"></td><td ng-bind=confirmation.selection.menu.name></td><td><div ng-repeat=\"drink in confirmation.selection.drinks\"><span>{{ drink.name }}</span></div><div ng-show=confirmation.selection.foodBeveragePairing>Beer And Wine Pairing</div><div ng-show=confirmation.selection.dessertWinePairing>Dessert Wine Pairing</div><div ng-show=confirmation.selection.standardDrinkList>Standard Drinks List</div></td><td><div ng-repeat=\"snack in confirmation.selection.snacks\"><span>{{ snack.name + ' - ' + snack.count }}</span></div></td><td ng-bind=confirmation.selection.host_details></td><td ng-bind=confirmation.selection.hostCanOrderAdditionalItems class=tiny></td><td ng-bind=confirmation.selection.notes></td></tr></tbody></table></div>");
}]);

angular.module("resetPassword", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("resetPassword",
    "<div class=flex-center><div class=\"panel smallish\"><div class=top-bar><div class=title>Password Reset</div></div><form novalidate name=form><div class=field><input type=password placeholder=Password ng-model=data.password required ng-minlength=6></div><div class=field><input type=password placeholder=\"Password Confirmation\" ng-model=data.password_confirmation required ui-validate=\" '$value==data.password' \" ui-validate-watch=\"'data.password'\"></div><div class=\"field right\"><button ng-bind=buttonText ng-disabled=\"form.$invalid &amp;&amp; buttonDisabled\" ng-click=resetPassword(data)></button></div></form></div></div>");
}]);

angular.module("resetPasswordRequest", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("resetPasswordRequest",
    "<div class=flex-center><div class=\"panel smallish\"><div class=top-bar><div class=title>Password Reset</div></div><form no-validate=no-validate name=form><div class=field><input type=email placeholder=Email ng-model=data.email required></div><div class=\"field right\"><input type=submit value=\"Send Request\" ng-click=sendRequest(data) ng-disabled=form.$invalid></div></form></div></div>");
}]);

angular.module("teasers/modal_help", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("teasers/modal_help",
    "<div id=help-modal class=panel><p><strong>All Venue and Non-technical Related Queries</strong><br>Please email Kelly at<br><a href=mailto:kmacintosh@allphonesarena.com.au>kmacintosh@allphonesarena.com.au</a><br>or phone Kelly on<br><a href=tel:0287654352>(02) 8765 4352</a></p><hr><p><strong>All technical issues related to this software</strong><br>Please email<br><a href=mailto:cs@turnkeyhospitality.com.au>cs@turnkeyhospitality.com.au</a><br>or phone Scott on<br><a href=tel:0414652480>0414 652 480</a></p><div class=\"field right\"><button ng-click=$close() class=dark-accent>Close</button></div></div>");
}]);

angular.module("teasers/modal_release_to_team", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("teasers/modal_release_to_team",
    "<div id=teaser class=panel><div class=top-bar><div class=title>Release To Team</div></div><hr><p>Hi there, This functionality is coming in our next release - some examples;<ul><li>Department allocations</li><li>Approval Paths</li><li>FBT allocations</li><li>Guest apps</li><li>Guest survey</li></ul></p><p>These of course are optional extras, if your interested let us know. Thanks :)</p><hr><div class=modal-footer><button ng-click=$close() class=dark-accent>Close</button></div></div>");
}]);

angular.module("tickets/index", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tickets/index",
    "<accordion><accordion-group ng-repeat=\"event in data | orderBy:'data.first_event_date':false\" class=panel><accordion-heading><div class=flex-toolbar><div ng-bind=event.data.event_name class=title></div><div class=actions><button class=grey>View Tickets</button><button ng-click=downloadAllTickets(event) ng-if=event class=dark-accent>Download All Tickets</button></div></div></accordion-heading><table><thead><tr><th class=small>Event Date</th><th>Suite</th><th>Seat</th><th class=actions>Actions</th></tr></thead><tbody><tr ng-repeat=\"ticket in event.data.tickets | orderBy:'seat'\"><td class=small><span ng-bind=\"ticket.event_start | amDateFormat: 'D'\"></span><sup ng-bind=\"ticket.event_start | amDateFormat: 'Do' | filterNumeric\"></sup><span ng-bind=\"ticket.event_start | amDateFormat: ' MMMM YYYY'\"></span><div ng-bind=\"ticket.event_start | amDateFormat: 'h:mm a'\" class=time></div></td><td ng-bind=ticket.facility_name></td><td ng-bind=ticket.seat></td><td class=actions><button ng-click=viewTicket(ticket) class=\"small dark-accent\">View</button></td></tr></tbody></table></accordion-group></accordion>");
}]);

angular.module("ui/modal/backdrop", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("ui/modal/backdrop",
    "<div ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + (index &amp;&amp; 1 || 0) + index*10}\" class=\"modal-backdrop fade\"></div>");
}]);

angular.module("ui/modal/window", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("ui/modal/window",
    "<div tabindex=-1 ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=close($event) class=\"modal fade\"><div ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\" class=modal-dialog><div ng-transclude=ng-transclude class=modal-content></div></div></div>");
}]);
/**
 * humane.js
 * Humanized Messages for Notifications
 * @author Marc Harter (@wavded)
 * @example
 *   humane.log('hello world');
 * See more usage examples at: http://wavded.github.com/humane-js/
 */

var Humane = function() {
    var win = window;
    var doc = document;

    var ENV = {
        on: function (el, type, cb) {
            'addEventListener' in win ? el.addEventListener(type, cb, false) : el.attachEvent('on' + type, cb)
        },
        off: function (el, type, cb) {
            'removeEventListener' in win ? el.removeEventListener(type, cb, false) : el.detachEvent('on' + type, cb)
        },
        bind: function (fn, ctx) {
            return function () {
                fn.apply(ctx, arguments)
            }
        },
        isArray: Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]'
        },
        config: function (preferred, fallback) {
            return preferred != null ? preferred : fallback
        },
        transSupport: false,
        useFilter: /msie [678]/i.test(navigator.userAgent), // sniff, sniff
        _checkTransition: function () {
            var el = doc.createElement('div')
            var vendors = { webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' }

            for (var vendor in vendors)
                if (vendor + 'Transition' in el.style) {
                    this.vendorPrefix = vendors[vendor]
                    this.transSupport = true
                }
        }
    };

    ENV._checkTransition();

    var Humane = function (o) {
        o || (o = {});
        this.queue = [];
        this.baseCls = o.baseCls || 'humane';
        this.addnCls = o.addnCls || '';
        this.timeout = 'timeout' in o ? o.timeout : 2500;
        this.waitForMove = o.waitForMove || false;
        this.clickToClose = o.clickToClose || false;
        this.forceNew = o.forceNew || false;
        this.container = o.container || doc.body;

        try {
            this._setupEl()
        } // attempt to setup elements
        catch (e) {
            ENV.on(win, 'load', ENV.bind(this._setupEl, this)) // dom wasn't ready, wait till ready
        }
    };

    Humane.prototype = {
        constructor: Humane,
        _setupEl: function () {
            var el = doc.createElement('div')
            el.style.display = 'none'
            this.container.appendChild(el)
            this.el = el
            this.removeEvent = ENV.bind(this.remove, this)
            this.transEvent = ENV.bind(this._afterAnimation, this)
            this._run()
        },
        _afterTimeout: function () {
            if (!ENV.config(this.currentMsg.waitForMove, this.waitForMove)) this.remove()

            else if (!this.removeEventsSet) {
                ENV.on(doc.body, 'mousemove', this.removeEvent)
                ENV.on(doc.body, 'click', this.removeEvent)
                ENV.on(doc.body, 'keypress', this.removeEvent)
                ENV.on(doc.body, 'touchstart', this.removeEvent)
                this.removeEventsSet = true
            }
        },
        _run: function () {
            if (this._animating || !this.queue.length || !this.el) return

            this._animating = true
            if (this.currentTimer) {
                clearTimeout(this.currentTimer)
                this.currentTimer = null
            }

            var msg = this.queue.shift()
            var clickToClose = ENV.config(msg.clickToClose, this.clickToClose)

            if (clickToClose) {
                ENV.on(this.el, 'click', this.removeEvent)
                ENV.on(this.el, 'touchstart', this.removeEvent)
            }

            var timeout = ENV.config(msg.timeout, this.timeout)

            if (timeout > 0)
                this.currentTimer = setTimeout(ENV.bind(this._afterTimeout, this), timeout)

            if (ENV.isArray(msg.html)) msg.html = '<ul><li>' + msg.html.join('<li>') + '</ul>'

            this.el.innerHTML = msg.html
            this.currentMsg = msg
            this.el.className = this.baseCls
            if (ENV.transSupport) {
                this.el.style.display = 'block'
                setTimeout(ENV.bind(this._showMsg, this), 50)
            } else {
                this._showMsg()
            }

        },
        _setOpacity: function (opacity) {
            if (ENV.useFilter)
                this.el.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity * 100
            else
                this.el.style.opacity = String(opacity)
        },
        _showMsg: function () {
            var addnCls = ENV.config(this.currentMsg.addnCls, this.addnCls)
            if (ENV.transSupport) {
                this.el.className = this.baseCls + ' ' + addnCls + ' ' + this.baseCls + '-animate'
            }
            else {
                var opacity = 0
                this.el.className = this.baseCls + ' ' + addnCls + ' ' + this.baseCls + '-js-animate'
                this._setOpacity(0) // reset value so hover states work
                this.el.style.display = 'block'

                var self = this
                var interval = setInterval(function () {
                    if (opacity < 1) {
                        opacity += 0.1
                        if (opacity > 1) opacity = 1
                        self._setOpacity(opacity)
                    }
                    else clearInterval(interval)
                }, 30)
            }
        },
        _hideMsg: function () {
            var addnCls = ENV.config(this.currentMsg.addnCls, this.addnCls)
            if (ENV.transSupport) {
                this.el.className = this.baseCls + ' ' + addnCls
                ENV.on(this.el, ENV.vendorPrefix ? ENV.vendorPrefix + 'TransitionEnd' : 'transitionend', this.transEvent)
            }
            else {
                var opacity = 1
                var self = this
                var interval = setInterval(function () {
                    if (opacity > 0) {
                        opacity -= 0.1
                        if (opacity < 0) opacity = 0
                        self._setOpacity(opacity);
                    }
                    else {
                        self.el.className = self.baseCls + ' ' + addnCls
                        clearInterval(interval)
                        self._afterAnimation()
                    }
                }, 30)
            }
        },
        _afterAnimation: function () {
            if (ENV.transSupport) ENV.off(this.el, ENV.vendorPrefix ? ENV.vendorPrefix + 'TransitionEnd' : 'transitionend', this.transEvent)

            if (this.currentMsg.cb) this.currentMsg.cb()
            this.el.style.display = 'none'

            this._animating = false
            this._run()
        },
        remove: function (e) {
            var cb = typeof e == 'function' ? e : null

            ENV.off(doc.body, 'mousemove', this.removeEvent)
            ENV.off(doc.body, 'click', this.removeEvent)
            ENV.off(doc.body, 'keypress', this.removeEvent)
            ENV.off(doc.body, 'touchstart', this.removeEvent)
            ENV.off(this.el, 'click', this.removeEvent)
            ENV.off(this.el, 'touchstart', this.removeEvent)
            this.removeEventsSet = false

            if (cb) this.currentMsg.cb = cb
            if (this._animating) this._hideMsg()
            else if (cb) cb()
        },
        log: function (html, o, cb, defaults) {
            var msg = {}
            if (defaults)
                for (var opt in defaults)
                    msg[opt] = defaults[opt]

            if (typeof o == 'function') cb = o
            else if (o)
                for (var opt in o) msg[opt] = o[opt]

            msg.html = html
            if (cb) msg.cb = cb
            this.queue.push(msg)
            this._run()
            return this
        },
        spawn: function (defaults) {
            var self = this
            return function (html, o, cb) {
                self.log.call(self, html, o, cb, defaults)
                return self
            }
        },
        create: function (o) {
            return new Humane(o)
        }
    };
    return new Humane()
};
!function(a,b){a.NewrelicTiming=function(){this.marks={},this.NREUM=b,this.mark=function(a){this.marks[a]=+new Date},this.measure=function(a,b){var c,d;return b?(d=this.marks[b],c=this.marks[a]):(d=this.marks[a],c=+new Date),c-d},this.sendNRBeacon=function(b){if(this.checkBeaconRequirements()){b||(b=a.location.hash.substring(1));var c=this.measure("domLoaded","navStart"),d=this.measure("pageRendered","navStart");this.NREUM.inlineHit(b,0,0,0,c,d)}},this.checkBeaconRequirements=function(){return this.NREUM&&this.NREUM.inlineHit&&"function"==typeof this.NREUM.inlineHit?this.marks.navStart&&this.marks.domLoaded&&this.marks.pageRendered:!1}}}(window,window.NREUM);
!function(a,b){if("undefined"!=typeof a&&null!==a&&"function"==typeof a.module){var c=a.module("newrelic-timing",[]);"function"==typeof c.run&&c.run(["$rootScope","$location",function(a,c){function d(){f.mark("navStart")}function e(){f.mark("domLoaded")}var f=new b;a.$on("$routeChangeStart",d),a.$on("$routeChangeSuccess",e),a.$on("$stateChangeStart",d),a.$on("$stateChangeSuccess",e),a.$on("$viewContentLoaded",function(){f.mark("pageRendered"),f.sendNRBeacon(c.path())})}])}}(window.angular,window.NewrelicTiming);
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
                  Auth.checkLoggedIn().then(function() {
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
(function() {
  var CompanyEditCtrl, CompanyIndexCtrl, CompanyShowCtrl, app,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.companies', ['thms.services', 'thms.modules.facilities', 'thms.directives', 'ui.router', 'jmdobry.angular-cache', 'ui.bootstrap']);

  app = angular.module('thms.services');

  app.factory('Companies', [
    '$http', '$q', '$angularCacheFactory', 'Company', function($http, $q, $angularCacheFactory, Company) {
      var BASE_URL, Companies;
      BASE_URL = '/api/v2/companies/';
      return new (Companies = (function() {
        var __collection, __selected;

        window.foo = Companies;

        $angularCacheFactory('CompaniesCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function Companies() {}

        Companies.prototype.sync = function() {
          var deffered;
          deffered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Company(data, false));
              }
              return deffered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return deffered.reject(error);
          });
          return deffered.promise;
        };

        Companies.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              return defferred.resolve(new Company(result.data, false));
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        Companies.prototype.selected = function(id) {
          if (id) {
            __selected = id;
          }
          if (id) {
            console.log("Selected " + __selected);
          }
          return __selected;
        };

        Companies.prototype.addElement = function(element) {
          return __collection.push(element);
        };

        return Companies;

      })());
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Company', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, Company;
      BASE_URL = '/api/v2/companies/';
      return Company = (function() {
        function Company(data, edited) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          if (!this.data) {
            this.data = {};
          }
          this.url = this.data.id ? BASE_URL + this.data.id : BASE_URL;
        }

        Company.prototype.save = function(data) {
          var defferred, method;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          method = this.data.id ? 'PUT' : 'POST';
          $http({
            method: method,
            url: this.url,
            data: data
          }).then((function(_this) {
            return function(result) {
              _this.data = result.data;
              return defferred.resolve(_this);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return Company;

      })();
    }
  ]);

  this.BaseCtrl = (function() {
    BaseCtrl.register = function(app, name) {
      var _ref;
      if (name == null) {
        name = this.name || ((_ref = this.toString().match(/function\s*(.*?)\(/)) != null ? _ref[1] : void 0);
      }
      return app.controller(name, this);
    };

    BaseCtrl.inject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.$inject = args;
    };

    function BaseCtrl() {
      var args, fn, index, key, _i, _len, _ref, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.constructor.$inject;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        key = _ref[index];
        this[key] = args[index];
      }
      _ref1 = this.constructor.prototype;
      for (key in _ref1) {
        fn = _ref1[key];
        if (typeof fn !== 'function') {
          continue;
        }
        if ((key === 'constructor' || key === 'initialize') || key[0] === '_') {
          continue;
        }
        this.$scope[key] = (typeof fn.bind === "function" ? fn.bind(this) : void 0) || _.bind(fn, this);
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return BaseCtrl;

  })();

  app = angular.module('thms.modules.companies');

  CompanyEditCtrl = (function(_super) {
    __extends(CompanyEditCtrl, _super);

    function CompanyEditCtrl() {
      return CompanyEditCtrl.__super__.constructor.apply(this, arguments);
    }

    CompanyEditCtrl.register(app);

    CompanyEditCtrl.inject('$scope', '$modal', 'company', '$humane');

    CompanyEditCtrl.prototype.initialize = function() {
      return this.$scope.company = angular.copy(this.company);
    };

    CompanyEditCtrl.prototype.save = function() {
      return this.company.save(this.$scope.company.data).then((function(_this) {
        return function(result) {
          _this.$humane.successShort('Company Updated');
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError('Error Updating Company');
        };
      })(this));
    };

    return CompanyEditCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.companies');

  CompanyIndexCtrl = (function(_super) {
    __extends(CompanyIndexCtrl, _super);

    function CompanyIndexCtrl() {
      return CompanyIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    CompanyIndexCtrl.register(app);

    CompanyIndexCtrl.inject('$scope', 'Companies', 'data', '$state');

    CompanyIndexCtrl.prototype.initialize = function() {
      return this.$scope.data = this.data;
    };

    CompanyIndexCtrl.prototype.viewCompany = function(id) {
      return this.$state.go('authenticated.main.company.view', {
        company_id: id
      });
    };

    CompanyIndexCtrl.prototype.updateFilter = function() {
      return this.$scope.filterModel = {
        data: {
          name: this.$scope.filterValue,
          friendly_name: this.$scope.filterValue,
          manager: {
            email: this.$scope.filterValue
          }
        }
      };
    };

    return CompanyIndexCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.companies');

  CompanyShowCtrl = (function(_super) {
    __extends(CompanyShowCtrl, _super);

    function CompanyShowCtrl() {
      return CompanyShowCtrl.__super__.constructor.apply(this, arguments);
    }

    CompanyShowCtrl.register(app);

    CompanyShowCtrl.inject('$scope', 'company', '$modal', '$humane', '$timeout', 'leases');

    CompanyShowCtrl.prototype.initialize = function() {
      this.$scope.company = this.company;
      return this.$scope.leases = this.leases;
    };

    CompanyShowCtrl.prototype.editCompany = function() {
      this.modal = this.$modal.open({
        templateUrl: 'companies/edit',
        windowClass: 'effect-8',
        resolve: {
          company: [
            'Companies', '$stateParams', function(Companies, $stateParams) {
              return Companies.view($stateParams.company_id);
            }
          ]
        },
        controller: 'CompanyEditCtrl'
      });
      return this.modal.result.then((function(_this) {
        return function(result) {
          return _this.$scope.company.data = result.data;
        };
      })(this))["catch"](function(error) {
        return console.log(error);
      });
    };

    CompanyShowCtrl.prototype.editLease = function(lease) {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/edit_lease',
        windowClass: 'effect-8',
        resolve: {
          facilities: [
            'Facilities', function(Facilities) {
              return Facilities.sync();
            }
          ],
          companies: function() {
            return void 0;
          },
          lease: [
            'Leases', function(Leases) {
              return Leases.view(lease.id);
            }
          ]
        },
        controller: 'EditFacilityLeaseCtrl'
      });
      return this.modal.result.then(function(result) {
        return console.log(result);
      });
    };

    CompanyShowCtrl.prototype.newLease = function() {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/new_lease',
        windowClass: 'effect-8',
        resolve: {
          facilities: [
            'Facilities', function(Facilities) {
              return Facilities.sync();
            }
          ],
          companies: function() {
            return void 0;
          }
        },
        controller: 'NewFacilityLeaseCtrl'
      });
      return this.modal.result.then(function(result) {
        return console.log(result);
      });
    };

    return CompanyShowCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.company', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.company.index', {
        url: '/companies',
        resolve: {
          data: [
            'Companies', function(Companies) {
              return Companies.sync();
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'companies/index',
            controller: 'CompanyIndexCtrl'
          },
          'header@authenticated': {
            template: '<h1>Company Management</h1>'
          }
        }
      }).state('authenticated.main.company.add', {
        views: {
          'content@authenticated': {
            templateUrl: 'companies/add',
            controller: [
              '$scope', function($scope) {
                return $scope.email = '';
              }
            ]
          }
        }
      }).state('authenticated.main.company.add.search', {
        url: '/companies/add/search',
        views: {
          form: {
            templateUrl: 'companies/searchByEmail'
          }
        }
      }).state('authenticated.main.company.view', {
        url: '/companies/:company_id',
        resolve: {
          company: [
            'Companies', '$stateParams', function(Companies, $stateParams) {
              return Companies.view($stateParams.company_id);
            }
          ],
          leases: [
            'Leases', '$stateParams', function(Leases, $stateParams) {
              return Leases.forCompany($stateParams.company_id);
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'clients/view',
            controller: 'CompanyShowCtrl'
          }
        }
      }).state('authenticated.main.company.add.showResult', {
        url: '/companies/add/search/results',
        views: {
          form: {
            templateUrl: 'companies/addSearchResults'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var ClientShowCtrl, IndexCtrl, NewClientCtrl, app,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.clients', ['thms.services', 'ui.router']);

  this.BaseCtrl = (function() {
    BaseCtrl.register = function(app, name) {
      var _ref;
      if (name == null) {
        name = this.name || ((_ref = this.toString().match(/function\s*(.*?)\(/)) != null ? _ref[1] : void 0);
      }
      return app.controller(name, this);
    };

    BaseCtrl.inject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.$inject = args;
    };

    function BaseCtrl() {
      var args, fn, index, key, _i, _len, _ref, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.constructor.$inject;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        key = _ref[index];
        this[key] = args[index];
      }
      _ref1 = this.constructor.prototype;
      for (key in _ref1) {
        fn = _ref1[key];
        if (typeof fn !== 'function') {
          continue;
        }
        if ((key === 'constructor' || key === 'initialize') || key[0] === '_') {
          continue;
        }
        this.$scope[key] = (typeof fn.bind === "function" ? fn.bind(this) : void 0) || _.bind(fn, this);
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return BaseCtrl;

  })();

  app = angular.module('thms.modules.clients');

  IndexCtrl = (function(_super) {
    __extends(IndexCtrl, _super);

    function IndexCtrl() {
      return IndexCtrl.__super__.constructor.apply(this, arguments);
    }

    IndexCtrl.register(app);

    IndexCtrl.inject('$scope', 'clients', '$state');

    IndexCtrl.prototype.initialize = function() {
      return this.$scope.data = this.clients;
    };

    return IndexCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.clients');

  NewClientCtrl = (function(_super) {
    __extends(NewClientCtrl, _super);

    function NewClientCtrl() {
      return NewClientCtrl.__super__.constructor.apply(this, arguments);
    }

    NewClientCtrl.register(app);

    NewClientCtrl.inject('$scope', 'Company', '$state', '$humane');

    NewClientCtrl.prototype.initialize = function() {
      this.$scope.company = new this.Company();
      return this.$state.go('authenticated.main.clients.add.name');
    };

    NewClientCtrl.prototype.save = function() {
      return this.$scope.company.save().then((function(_this) {
        return function(result) {
          console.log(result.data);
          _this.$state.go('authenticated.main.company.view', {
            company_id: result.data.id
          });
          return _this.$humane.stickySuccess('Company Created');
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return console.warn(error);
        };
      })(this));
    };

    return NewClientCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.clients');

  ClientShowCtrl = (function(_super) {
    __extends(ClientShowCtrl, _super);

    function ClientShowCtrl() {
      return ClientShowCtrl.__super__.constructor.apply(this, arguments);
    }

    ClientShowCtrl.register(app);

    ClientShowCtrl.inject('$scope', 'company', '$state');

    ClientShowCtrl.prototype.initialize = function() {
      return this.$scope.data = this.company;
    };

    return ClientShowCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.clients', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.clients.view', {
        url: '/clients/view',
        resolve: {
          data: [
            'Company', function(Company) {
              return console.log(Company);
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'clients/view'
          }
        }
      }).state('authenticated.main.clients.add', {
        url: '/clients/new',
        views: {
          'content@authenticated': {
            templateUrl: 'clients/new',
            controller: 'NewClientCtrl'
          }
        }
      }).state('authenticated.main.clients.add.name', {
        url: '/name',
        views: {
          'steps': {
            templateUrl: 'clients/_new_name'
          }
        }
      }).state('authenticated.main.clients.add.address', {
        url: '/address',
        views: {
          'steps': {
            templateUrl: 'clients/_new_address'
          }
        }
      }).state('authenticated.main.clients.add.config', {
        url: '/config',
        views: {
          'steps': {
            templateUrl: 'clients/_new_config'
          }
        }
      }).state('authenticated.main.clients.add.admin', {
        url: '/administrator',
        views: {
          'steps': {
            templateUrl: 'clients/_new_admin'
          }
        }
      });
    }
  ]);

}).call(this);
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
(function() {
  var EditFacilityLeaseCtrl, FacilitiesIndexCtrl, FacilityEditCtrl, FacilityShowCtrl, NewFacilityLeaseCtrl, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.facilities', ['thms.services', 'restangular', 'ui.router', 'LocalStorageModule']);

  app = angular.module('thms.services');

  app.factory('Facilities', [
    '$http', '$q', '$angularCacheFactory', 'Facility', function($http, $q, $angularCacheFactory, Facility) {
      var BASE_URL, Facilities;
      BASE_URL = '/api/v2/facilities/';
      return new (Facilities = (function() {
        var __collection, __selected;

        $angularCacheFactory('FacilitiesCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function Facilities() {}

        Facilities.prototype.sync = function() {
          var deffered;
          deffered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Facility(data, false));
              }
              return deffered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return deffered.reject(error);
          });
          return deffered.promise;
        };

        Facilities.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.data.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              var facility;
              facility = new Facility(result.data, false);
              __collection.push(facility);
              return defferred.resolve(facility);
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        Facilities.prototype.selected = function(id) {
          if (id) {
            __selected = id;
          }
          if (id) {
            console.log("Selected " + __selected);
          }
          return __selected;
        };

        Facilities.prototype.addElement = function(element) {
          return __collection.push(element);
        };

        return Facilities;

      })());
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Facility', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, Facility;
      BASE_URL = '/api/v2/facilities/';
      return Facility = (function() {
        function Facility(data, edited) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          if (!this.data) {
            this.data = {};
          }
          this.url = this.data.id ? BASE_URL + this.data.id : BASE_URL;
        }

        Facility.prototype.save = function(data) {
          var defferred, method;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          method = this.data.id ? 'PUT' : 'POST';
          $http({
            method: method,
            url: this.url,
            data: data
          }).then((function(_this) {
            return function(result) {
              _this.data = result.data;
              return defferred.resolve(result);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return Facility;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Lease', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, Lease;
      BASE_URL = '/api/v2/leases/';
      return Lease = (function() {
        function Lease(data, edited) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          if (!this.data) {
            this.data = {};
          }
          this.url = this.data.id ? BASE_URL + this.data.id : BASE_URL;
        }

        Lease.prototype.save = function(data) {
          var defferred, method;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          method = this.data.id ? 'PUT' : 'POST';
          $http({
            method: method,
            url: this.url,
            data: data
          }).then((function(_this) {
            return function(result) {
              _this.data = result.data;
              return defferred.resolve(_this);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return Lease;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Leases', [
    '$http', '$q', '$angularCacheFactory', 'Lease', function($http, $q, $angularCacheFactory, Lease) {
      var BASE_URL, Leases;
      BASE_URL = '/api/v2/leases/';
      return new (Leases = (function() {
        var forRelation, __collection, __selected;

        $angularCacheFactory('LeasesCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function Leases() {}

        Leases.prototype.sync = function() {
          var deffered;
          deffered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Lease(data, false));
              }
              return deffered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return deffered.reject(error);
          });
          return deffered.promise;
        };

        Leases.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              return defferred.resolve(new Lease(result.data, false));
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        Leases.prototype.selected = function(id) {
          if (id) {
            __selected = id;
          }
          if (id) {
            console.log("Selected " + __selected);
          }
          return __selected;
        };

        Leases.prototype.addElement = function(element) {
          return __collection.push(element);
        };

        Leases.prototype.forFacility = function(id) {
          return forRelation('facilities', id);
        };

        Leases.prototype.forCompany = function(id) {
          return forRelation('companies', id);
        };

        forRelation = function(name, id) {
          var defferred, elements;
          defferred = $q.defer();
          elements = _.filter(__collection, function(item) {
            return item.facility_id === id;
          });
          if (_.size(elements) > 0) {
            defferred.resolve(elements);
          } else {
            $http.get("/api/v2/" + name + "/" + id + "/leases").then(function(result) {
              var data, _i, _len, _ref;
              __collection = [];
              _ref = result.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Lease(data, false));
              }
              return defferred.resolve(__collection);
            })["catch"](function(error) {
              console.log(error);
              return defferred.reject(error);
            });
          }
          return defferred.promise;
        };

        return Leases;

      })());
    }
  ]);

  app = angular.module('thms.modules.facilities');

  FacilityEditCtrl = (function(_super) {
    __extends(FacilityEditCtrl, _super);

    function FacilityEditCtrl() {
      return FacilityEditCtrl.__super__.constructor.apply(this, arguments);
    }

    FacilityEditCtrl.register(app);

    FacilityEditCtrl.inject('$scope', 'facility', '$state', '$humane');

    FacilityEditCtrl.prototype.initialize = function() {
      return this.$scope.facility = angular.copy(this.facility);
    };

    FacilityEditCtrl.prototype.save = function(facility) {
      return facility.save(facility.data).then((function(_this) {
        return function(result) {
          _this.$humane.stickySuccess('Facility Saved');
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError('Error Saving Facility');
        };
      })(this));
    };

    return FacilityEditCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.facilities');

  EditFacilityLeaseCtrl = (function(_super) {
    __extends(EditFacilityLeaseCtrl, _super);

    function EditFacilityLeaseCtrl() {
      return EditFacilityLeaseCtrl.__super__.constructor.apply(this, arguments);
    }

    EditFacilityLeaseCtrl.register(app);

    EditFacilityLeaseCtrl.inject('$scope', '$modal', '$injector', '$humane', 'facilities', 'companies', '$stateParams', 'lease', 'Lease');

    EditFacilityLeaseCtrl.prototype.initialize = function() {
      this.$scope.lease = angular.copy(this.lease);
      if (this.facilities) {
        this.$scope.facilities = this.facilities;
        this.$scope.lease.data.company_id = this.$stateParams.company_id;
      }
      if (this.companies) {
        this.$scope.companies = this.companies;
        return this.$scope.lease.data.facility_id = this.$stateParams.facility_id;
      }
    };

    EditFacilityLeaseCtrl.prototype.save = function() {
      return this.$scope.lease.save().then((function(_this) {
        return function(result) {
          _this.lease.data = result.data;
          _this.$humane.stickySuccess("Lease Updated");
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError("Error Updating Lease");
        };
      })(this));
    };

    return EditFacilityLeaseCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.facilities');

  FacilitiesIndexCtrl = (function(_super) {
    __extends(FacilitiesIndexCtrl, _super);

    function FacilitiesIndexCtrl() {
      return FacilitiesIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    FacilitiesIndexCtrl.register(app);

    FacilitiesIndexCtrl.inject('$scope', 'facilities', '$state', '$modal');

    FacilitiesIndexCtrl.prototype.initialize = function() {
      return this.$scope.data = this.facilities;
    };

    FacilitiesIndexCtrl.prototype.newFacility = function() {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/new',
        windowClass: 'effect-8',
        resolve: {
          facility: [
            'Facility', '$q', function(Facility, $q) {
              return new Facility();
            }
          ]
        },
        controller: 'FacilityEditCtrl'
      });
      return this.modal.result.then((function(_this) {
        return function(result) {
          return _this.facilities.addElement(result);
        };
      })(this))["catch"](function(error) {
        return console.log(error);
      });
    };

    FacilitiesIndexCtrl.prototype.updateFilter = function() {
      return this.$scope.filterModel = {
        data: {
          name: this.$scope.filterValue,
          facility_type: this.$scope.filterValue,
          current_leasee_name: this.$scope.filterValue
        }
      };
    };

    return FacilitiesIndexCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.facilities');

  NewFacilityLeaseCtrl = (function(_super) {
    __extends(NewFacilityLeaseCtrl, _super);

    function NewFacilityLeaseCtrl() {
      return NewFacilityLeaseCtrl.__super__.constructor.apply(this, arguments);
    }

    NewFacilityLeaseCtrl.register(app);

    NewFacilityLeaseCtrl.inject('$scope', '$modal', '$injector', '$humane', 'facilities', 'companies', '$stateParams', 'Leases', 'Lease');

    NewFacilityLeaseCtrl.prototype.initialize = function() {
      if (this.facilities) {
        this.$scope.facilities = this.facilities;
        this.$scope.lease = new this.Lease({
          company_id: this.$stateParams.company_id
        });
      }
      if (this.companies) {
        this.$scope.companies = this.companies;
        return this.$scope.lease = new this.Lease({
          facility_id: this.$stateParams.facility_id
        });
      }
    };

    NewFacilityLeaseCtrl.prototype.save = function() {
      return this.$scope.lease.save().then((function(_this) {
        return function(result) {
          _this.Leases.addElement(result);
          _this.$humane.stickySuccess("New Lease Created");
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError("Error Creating Lease");
        };
      })(this));
    };

    return NewFacilityLeaseCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.facilities');

  FacilityShowCtrl = (function(_super) {
    __extends(FacilityShowCtrl, _super);

    function FacilityShowCtrl() {
      return FacilityShowCtrl.__super__.constructor.apply(this, arguments);
    }

    FacilityShowCtrl.register(app);

    FacilityShowCtrl.inject('$scope', 'facility', 'leases', '$state', '$modal');

    FacilityShowCtrl.prototype.initialize = function() {
      this.$scope.facility = this.facility;
      return this.$scope.leases = this.leases;
    };

    FacilityShowCtrl.prototype.editFacility = function() {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/edit',
        windowClass: 'effect-8',
        resolve: {
          facility: [
            'Facilities', '$stateParams', function(Facilities, $stateParams) {
              return Facilities.view($stateParams.facility_id);
            }
          ]
        },
        controller: 'FacilityEditCtrl'
      });
      return this.modal.result.then((function(_this) {
        return function(result) {
          return _this.$scope.facility.data = result.data;
        };
      })(this))["catch"](function(error) {
        return console.log(error);
      });
    };

    FacilityShowCtrl.prototype.editLease = function(lease) {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/edit_lease',
        windowClass: 'effect-8',
        resolve: {
          companies: [
            'Companies', function(Companies) {
              return Companies.sync();
            }
          ],
          facilities: function() {
            return void 0;
          },
          lease: [
            'Leases', function(Leases) {
              return Leases.view(lease.id);
            }
          ]
        },
        controller: 'EditFacilityLeaseCtrl'
      });
      return this.modal.result.then(function(result) {
        return console.log(result);
      });
    };

    FacilityShowCtrl.prototype.newLease = function() {
      this.modal = this.$modal.open({
        templateUrl: 'facilities/new_lease',
        windowClass: 'effect-8',
        resolve: {
          companies: [
            'Companies', function(Companies) {
              return Companies.sync();
            }
          ],
          facilities: function() {
            return void 0;
          }
        },
        controller: 'NewFacilityLeaseCtrl'
      });
      return this.modal.result.then(function(result) {
        return console.log(result);
      });
    };

    return FacilityShowCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.facility', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.facility.index', {
        url: '/facilities',
        resolve: {
          facilities: [
            'Facilities', function(Facilities) {
              return Facilities.sync();
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'facilities/main',
            controller: 'FacilitiesIndexCtrl'
          }
        }
      }).state('authenticated.main.facility.view', {
        url: '/facilities/:facility_id',
        resolve: {
          facility: [
            'Facilities', '$stateParams', function(Facilities, $stateParams) {
              return Facilities.view($stateParams.facility_id);
            }
          ],
          leases: [
            'Leases', '$stateParams', function(Leases, $stateParams) {
              return Leases.forFacility($stateParams.facility_id);
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'facilities/view',
            controller: 'FacilityShowCtrl'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var ClientShowCtrl, NewFacilityLeaseCtrl, TicketsIndexCtrl, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.tickets', ['thms.services', 'restangular', 'ui.router', 'LocalStorageModule']);

  app = angular.module('thms.services');

  app.factory('Ticket', [
    '$http', '$q', function($http, $q) {
      var Ticket;
      return Ticket = (function() {
        function Ticket(id, data, url, edited) {
          this.id = id;
          this.data = data;
          this.url = url;
          this.edited = edited != null ? edited : false;
        }

        Ticket.prototype.save = function(data) {
          var defferred;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          $http.put(this.url, data).then((function(_this) {
            return function(result) {
              _this.data = angular.copy(data);
              return defferred.resolve(result);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return Ticket;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Tickets', [
    '$http', '$q', '$angularCacheFactory', 'Ticket', '$humane', function($http, $q, $angularCacheFactory, Ticket, $humane) {
      var BASE_URL, Tickets;
      BASE_URL = '/api/v2/my/tickets/';
      return new (Tickets = (function() {
        var __collection, __selected;

        window.foo = Tickets;

        $angularCacheFactory('TicketsCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function Tickets() {
          this.addMagicalTickets = __bind(this.addMagicalTickets, this);
        }

        Tickets.prototype.count = 0;

        Tickets.prototype.sync = function() {
          var deffered;
          deffered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Ticket(data.id, data, BASE_URL + data.id, false));
              }
              _this.count = __collection.length;
              return deffered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return deffered.reject(error);
          });
          return deffered.promise;
        };

        Tickets.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              return defferred.resolve(result.data);
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        Tickets.prototype.selected = function(id) {
          if (id) {
            __selected = id;
          }
          if (id) {
            console.log("Selected " + __selected);
          }
          return __selected;
        };

        Tickets.prototype.addMagicalTickets = function() {
          return this.sync().then((function(_this) {
            return function(result) {};
          })(this));
        };

        return Tickets;

      })());
    }
  ]);

  app = angular.module('thms.modules.tickets');

  TicketsIndexCtrl = (function(_super) {
    __extends(TicketsIndexCtrl, _super);

    function TicketsIndexCtrl() {
      return TicketsIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    TicketsIndexCtrl.register(app);

    TicketsIndexCtrl.inject('$scope', '$state', 'tickets', '$modal', '$window', '$http');

    TicketsIndexCtrl.prototype.initialize = function() {
      return this.$scope.data = this.tickets;
    };

    TicketsIndexCtrl.prototype.viewTicket = function(ticket) {
      var file, modal;
      file = "/tickets/" + ticket.storage['file_name'];
      return modal = this.$modal.open({
        template: "<div class='panel'><iframe src='" + file + "'></iframe></div>",
        windowClass: 'effect-0 xxlarge xxtall'
      });
    };

    TicketsIndexCtrl.prototype.downloadAllTickets = function(event) {
      return this.$window.open("/api/v2/my/inventory/" + event.data.inventory_id + "/tickets/zip", "_blank");
    };

    return TicketsIndexCtrl;

  })(BaseCtrl);

  app = angular.module('thms.controllers');

  NewFacilityLeaseCtrl = (function(_super) {
    __extends(NewFacilityLeaseCtrl, _super);

    function NewFacilityLeaseCtrl() {
      return NewFacilityLeaseCtrl.__super__.constructor.apply(this, arguments);
    }

    NewFacilityLeaseCtrl.register(app);

    NewFacilityLeaseCtrl.inject('$scope', '$modal', '$injector', '$humane');

    NewFacilityLeaseCtrl.prototype.initialize = function() {
      if (this.$injector.has('facilities')) {
        this.facilities = this.$injector.get('facilities');
      }
      if (this.$injector.has('companies')) {
        this.facilities = this.$injector.get('companies');
      }
      if (this.facilities) {
        this.$scope.facilities = this.facilities;
      }
      if (this.companies) {
        return this.$scope.companies = this.companies;
      }
    };

    NewFacilityLeaseCtrl.prototype.save = function() {};

    return NewFacilityLeaseCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.clients');

  ClientShowCtrl = (function(_super) {
    __extends(ClientShowCtrl, _super);

    function ClientShowCtrl() {
      return ClientShowCtrl.__super__.constructor.apply(this, arguments);
    }

    ClientShowCtrl.register(app);

    ClientShowCtrl.inject('$scope', 'company', '$state');

    ClientShowCtrl.prototype.initialize = function() {
      return this.$scope.data = this.company;
    };

    return ClientShowCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.tickets', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.tickets.index', {
        url: '/tickets',
        resolve: {
          tickets: [
            'Tickets', function(Tickets) {
              return Tickets.sync();
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'tickets/index',
            controller: 'TicketsIndexCtrl'
          },
          'header@authenticated': {
            template: '<h1>Tickets</h1>'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var EventEditCtrl, EventShowCtrl, EventsIndexCtrl, NewEventDateCtrl, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.events', ['thms.services', 'ui.router', 'LocalStorageModule']);

  app = angular.module('thms.services');

  app.factory('EventDate', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, EventDate;
      BASE_URL = '/api/v2/dates/';
      return EventDate = (function() {
        function EventDate(data, edited, url, relation) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          this.url = url != null ? url : BASE_URL;
          this.relation = relation != null ? relation : false;
          if (!this.data) {
            this.data = {};
          }
          if (this.relation) {
            this.url = this.relation.url;
          }
          this.url = this.data.id ? this.url + this.data.id : this.url;
        }

        EventDate.prototype.save = function(data) {
          var defferred, method;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          method = this.data.id ? 'PUT' : 'POST';
          $http({
            method: method,
            url: this.url,
            data: data
          }).then((function(_this) {
            return function(result) {
              _this.data = result.data;
              return defferred.resolve(_this);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return EventDate;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('EventDates', [
    '$http', '$q', '$angularCacheFactory', 'EventDate', function($http, $q, $angularCacheFactory, EventDate) {
      var BASE_URL, EventDates;
      BASE_URL = '/api/v2/dates/';
      return new (EventDates = (function() {
        var forRelation, __collection, __selected;

        $angularCacheFactory('EventDatesCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function EventDates() {}

        EventDates.prototype.sync = function() {
          var deffered;
          deffered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new EventDate(data, false));
              }
              return deffered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return deffered.reject(error);
          });
          return deffered.promise;
        };

        EventDates.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              var eventDate;
              eventDate = new EventDate(result.data, false);
              __collection.push(eventDate);
              return defferred.resolve(eventDate);
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        EventDates.prototype.addElement = function(element) {
          return __collection.push(element);
        };

        EventDates.prototype.forEvent = function(id) {
          return forRelation('events', id);
        };

        forRelation = function(name, id) {
          var defferred, elements, relationUrl;
          defferred = $q.defer();
          elements = _.filter(__collection, function(item) {
            return item.event_id === id;
          });
          if (_.size(elements) > 0) {
            defferred.resolve(elements);
          } else {
            relationUrl = "/api/v2/" + name + "/" + id + "/dates/";
            $http.get(relationUrl).then(function(result) {
              var data, _i, _len, _ref;
              __collection = [];
              _ref = result.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new EventDate(data, false, relationUrl));
              }
              return defferred.resolve(__collection);
            })["catch"](function(error) {
              console.log(error);
              return defferred.reject(error);
            });
          }
          return defferred.promise;
        };

        EventDates.prototype.facilitiesForRelease = function(eventId, eventDateId) {
          var Url, defferred;
          defferred = $q.defer();
          Url = "/api/v2/events/" + eventId + "/dates/" + eventDateId + "/release";
          $http.get(Url).then(function(result) {
            return defferred.resolve(result);
          })["catch"](function(error) {
            return defferred.reject(error);
          });
          return defferred.promise;
        };

        return EventDates;

      })());
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Event', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, Event;
      BASE_URL = '/api/v2/events/';
      return Event = (function() {
        function Event(data, edited) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          if (!this.data) {
            this.data = {};
          }
          this.url = this.data.id ? BASE_URL + this.data.id : BASE_URL;
        }

        Event.prototype.save = function(data) {
          var defferred, method;
          if (data == null) {
            data = this.data;
          }
          defferred = $q.defer();
          method = this.data.id ? 'PUT' : 'POST';
          $http({
            method: method,
            url: this.url,
            data: data
          }).then((function(_this) {
            return function(result) {
              _this.data = result.data;
              return defferred.resolve(result);
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return defferred.reject(error);
            };
          })(this));
          return defferred.promise;
        };

        return Event;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('Events', [
    '$http', '$q', '$angularCacheFactory', 'Event', function($http, $q, $angularCacheFactory, Event) {
      var BASE_URL, Events;
      BASE_URL = '/api/v2/events/';
      return new (Events = (function() {
        var __collection, __selected;

        window.foo = Events;

        $angularCacheFactory('EventsCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function Events() {}

        Events.prototype.sync = function() {
          var defered;
          defered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new Event(data, false));
              }
              return defered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return defered.reject(error);
          });
          return defered.promise;
        };

        Events.prototype.view = function(id) {
          var defferred, element;
          defferred = $q.defer();
          element = _.find(__collection, function(item) {
            return item.data.id === id;
          });
          if (element) {
            defferred.resolve(element);
          } else if (id) {
            $http.get(BASE_URL + id).then(function(result) {
              var event;
              event = new Event(result.data, false);
              __collection.push(event);
              console.log(result.data);
              return defferred.resolve(event);
            })["catch"](function(error) {
              return defferred.reject(error);
            });
          } else {
            defferred.reject(false);
          }
          return defferred.promise;
        };

        Events.prototype.selected = function(id) {
          if (id) {
            __selected = id;
          }
          if (id) {
            console.log("Selected " + __selected);
          }
          return __selected;
        };

        Events.prototype.addElement = function(element) {
          return __collection.push(element);
        };

        return Events;

      })());
    }
  ]);

  app = angular.module('thms.modules.events');

  EventEditCtrl = (function(_super) {
    __extends(EventEditCtrl, _super);

    function EventEditCtrl() {
      return EventEditCtrl.__super__.constructor.apply(this, arguments);
    }

    EventEditCtrl.register(app);

    EventEditCtrl.inject('$scope', 'event', '$state', '$humane');

    EventEditCtrl.prototype.initialize = function() {
      return this.$scope.event = angular.copy(this.event);
    };

    EventEditCtrl.prototype.save = function(event) {
      console.log('foo');
      return event.save(event.data).then((function(_this) {
        return function(result) {
          _this.$humane.stickySuccess('Event Saved');
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError('Error Saving Event');
        };
      })(this));
    };

    return EventEditCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.events');

  EventsIndexCtrl = (function(_super) {
    __extends(EventsIndexCtrl, _super);

    function EventsIndexCtrl() {
      return EventsIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    EventsIndexCtrl.register(app);

    EventsIndexCtrl.inject('$scope', 'events', 'event_types', '$state', '$modal');

    EventsIndexCtrl.prototype.initialize = function() {
      this.$scope.data = this.events;
      return this.$scope.event_types = this.event_types.data;
    };

    EventsIndexCtrl.prototype.newEvent = function() {
      this.modal = this.$modal.open({
        templateUrl: 'events/add',
        windowClass: 'effect-8',
        resolve: {
          event: [
            'Event', '$q', function(Event, $q) {
              return new Event();
            }
          ]
        },
        controller: 'EventEditCtrl'
      });
      return this.modal.result.then((function(_this) {
        return function(result) {
          return _this.$state.go('authenticated.main.event.view', {
            event_id: result.data.id
          });
        };
      })(this))["catch"](function(error) {
        return console.log(error);
      });
    };

    return EventsIndexCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.events');

  NewEventDateCtrl = (function(_super) {
    __extends(NewEventDateCtrl, _super);

    function NewEventDateCtrl() {
      return NewEventDateCtrl.__super__.constructor.apply(this, arguments);
    }

    NewEventDateCtrl.register(app);

    NewEventDateCtrl.inject('$scope', '$modal', '$injector', '$humane', '$stateParams', 'EventDate', 'EventDates');

    NewEventDateCtrl.prototype.initialize = function() {
      return this.$scope.date = new this.EventDate({
        event_id: this.$stateParams.event_id
      }, false, "/api/v2/events/" + this.$stateParams.event_id + "/dates/");
    };

    NewEventDateCtrl.prototype.save = function() {
      return this.$scope.date.save().then((function(_this) {
        return function(result) {
          _this.EventDates.addElement(result);
          _this.$humane.stickySuccess("New Date Created");
          return _this.$scope.$close(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return _this.$humane.stickyError("Error Creating Date");
        };
      })(this));
    };

    return NewEventDateCtrl;

  })(BaseCtrl);

  app = angular.module('thms.modules.events');

  EventShowCtrl = (function(_super) {
    __extends(EventShowCtrl, _super);

    function EventShowCtrl() {
      return EventShowCtrl.__super__.constructor.apply(this, arguments);
    }

    EventShowCtrl.register(app);

    EventShowCtrl.inject('$scope', 'event', 'dates', '$state', '$modal');

    EventShowCtrl.prototype.initialize = function() {
      this.$scope.event = this.event;
      return this.$scope.dates = this.dates;
    };

    EventShowCtrl.prototype.editEvent = function() {
      this.modal = this.$modal.open({
        templateUrl: 'events/edit',
        windowClass: 'effect-8',
        resolve: {
          event: [
            'Events', '$stateParams', function(Events, $stateParams) {
              return Events.view($stateParams.event_id);
            }
          ]
        },
        controller: 'EventEditCtrl'
      });
      return this.modal.result.then((function(_this) {
        return function(result) {
          return _this.$scope.event.data = result.data;
        };
      })(this))["catch"](function(error) {
        return console.log(error);
      });
    };

    EventShowCtrl.prototype.newEventDate = function() {
      this.modal = this.$modal.open({
        templateUrl: 'events/add_date',
        windowClass: 'effect-8',
        controller: 'NewEventDateCtrl'
      });
      return this.modal.result.then(function(result) {
        return console.log(result);
      });
    };

    EventShowCtrl.prototype.editDate = function(date) {
      var modal;
      return modal = this.$modal.open({
        templateUrl: 'events/edit_date',
        windowClass: 'effect-8',
        controller: [
          '$scope', '$humane', function($scope, $humane) {
            $scope.date = angular.copy(date);
            return $scope.save = function() {
              return date.save($scope.date.data).then((function(_this) {
                return function(result) {
                  $humane.stickySuccess("Changes Saved");
                  return $scope.$close(result);
                };
              })(this))["catch"]((function(_this) {
                return function(error) {
                  return $humane.stickyError("Error Saving Changes");
                };
              })(this));
            };
          }
        ]
      });
    };

    EventShowCtrl.prototype.releaseDate = function(date) {
      return this.$state.go('authenticated.main.event.view.release', {
        date_id: date.data.id
      });
    };

    return EventShowCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.event.client', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.event.client.index', {
        url: '/my/events',
        resolve: {
          inventory: [
            '$http', function($http) {
              return $http.get('/api/v2/my/inventory');
            }
          ],
          upcomingEvents: [
            '$http', function($http) {
              return $http.get('/api/v2/my/events/upcoming');
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'events/client_index',
            controller: [
              '$scope', 'inventory', 'upcomingEvents', '$humane', '$modal', '$http', '$state', 'Tickets', function($scope, inventory, upcomingEvents, $humane, $modal, $http, $state, Tickets) {
                $scope.data = inventory.data;
                $scope.upcomingEvents = upcomingEvents.data;
                $scope.openFile = function(file) {
                  var modal;
                  return modal = $modal.open({
                    template: "<div class='panel'><iframe src='" + file + "'></iframe></div>",
                    windowClass: 'effect-4 xxlarge xxtall'
                  });
                };
                $scope.confirmAttendance = function(inventory) {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'inventory/confirm_attendance'
                  });
                };
                $scope.releaseToTeam = function() {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'teasers/modal_release_to_team'
                  });
                };
                $scope.reconfirmOption = function(event) {
                  return $http["delete"]("/api/v2/confirmations/" + event.confirmation_id).success(function(result) {
                    Tickets.count = 0;
                    return $state.go('authenticated.main.inventory.confirmOptions', {
                      id: event.id
                    });
                  });
                };
                return $scope.confirmGuests = function(inventoryId) {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'inventory/_modal_guest_names',
                    controller: [
                      '$scope', 'confirmation', 'InventoryConfirmation', function($scope, confirmation, InventoryConfirmation) {
                        $scope.confirmation = confirmation.data;
                        if ($scope.confirmation.guests.length === 0) {
                          $scope.guestList = [
                            {
                              name: ''
                            }
                          ];
                        } else {
                          $scope.guestList = $scope.confirmation.guests;
                        }
                        $scope.addNewGuestName = function() {
                          return $scope.guestList.push({
                            name: ''
                          });
                        };
                        return $scope.save = function() {
                          $scope.confirmation.guests = $scope.guestList;
                          return InventoryConfirmation.update($scope.confirmation).then(function(result) {
                            $humane.stickySuccess('Guest List Updated');
                            return $scope.$close();
                          })["catch"](function(error) {
                            $humane.stickyError('Error Saving Guest List');
                            return $scope.$close();
                          });
                        };
                      }
                    ],
                    resolve: {
                      confirmation: [
                        'InventoryConfirmation', function(InventoryConfirmation) {
                          return InventoryConfirmation.view(inventoryId);
                        }
                      ]
                    },
                    windowClass: 'effect-8'
                  });
                };
              }
            ]
          }
        }
      }).state('authenticated.main.event', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.event.index', {
        url: '/events',
        resolve: {
          events: [
            'Events', function(Events) {
              return Events.sync();
            }
          ],
          event_types: [
            '$http', function($http) {
              return $http.post('/api/v2/events/event_types');
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'events/main',
            controller: 'EventsIndexCtrl'
          }
        }
      }).state('authenticated.main.event.view', {
        url: '/events/:event_id',
        resolve: {
          event: [
            'Events', '$stateParams', function(Events, $stateParams) {
              return Events.view($stateParams.event_id);
            }
          ],
          dates: [
            'EventDates', '$stateParams', function(EventDates, $stateParams) {
              return EventDates.forEvent($stateParams.event_id);
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'events/view',
            controller: 'EventShowCtrl'
          }
        }
      }).state('authenticated.main.event.view.release', {
        url: '/dates/:date_id/release',
        resolve: {
          availableFacilities: [
            'EventDates', '$stateParams', function(EventDates, $stateParams) {
              return EventDates.facilitiesForRelease($stateParams.event_id, $stateParams.date_id);
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'events/release',
            controller: 'EventReleaseController'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var app;

  app = angular.module('thms.modules.audit', []);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.audit.client', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.audit.venue', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.audit.client.index', {
        url: '/my/confirmations',
        resolve: {
          events: [
            '$http', function($http) {
              return $http.get('/api/v2/my/confirmations');
            }
          ]
        },
        views: {
          'header@authenticated': {
            template: '<h1>My Confirmations</h1>'
          },
          'content@authenticated': {
            templateUrl: 'auditing/events',
            controller: [
              '$scope', 'events', '$humane', '$modal', '$http', '$state', function($scope, events, $humane, $modal, $http, $state) {
                $scope.data = events.data;
                $scope.filterModel = {
                  event_date: ''
                };
                return $scope.viewDetails = function(event) {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'auditing/_modal_view_confirmation_detail',
                    controller: [
                      '$scope', function($scope) {
                        return $scope.Options = {
                          selectedOptions: event
                        };
                      }
                    ]
                  });
                };
              }
            ]
          }
        }
      }).state('authenticated.main.audit.venue.index', {
        url: '/reporting/confirmations',
        resolve: {
          events: [
            '$http', function($http) {
              return $http.get('/api/v2/confirmations');
            }
          ]
        },
        views: {
          'header@authenticated': {
            template: '<h1>Event Confirmations</h1>'
          },
          'content@authenticated': {
            templateUrl: 'auditing/events',
            controller: [
              '$scope', 'events', '$humane', '$modal', '$http', '$state', function($scope, events, $humane, $modal, $http, $state) {
                $scope.data = events.data;
                $scope.filterModel = {
                  event_date: ''
                };
                $scope.updateOption = function(option) {
                  var url;
                  url = "/api/v2/confirmations/" + option.id;
                  return $http.put(url, option).then((function(_this) {
                    return function(result) {
                      return console.log(result);
                    };
                  })(this))["catch"]((function(_this) {
                    return function(error) {
                      return console.log(error);
                    };
                  })(this));
                };
                $scope.filterValue = '';
                $scope.updateFilter = function() {
                  return $scope.filterModel = {
                    event_date: {
                      event_name: $scope.filterValue
                    },
                    company: {
                      name: $scope.filterValue
                    }
                  };
                };
                return $scope.viewDetails = function(event) {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'auditing/_modal_view_confirmation_detail',
                    controller: [
                      '$scope', function($scope) {
                        return $scope.Options = {
                          selectedOptions: event
                        };
                      }
                    ]
                  });
                };
              }
            ]
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var app;

  app = angular.module('thms.modules.reporting', ['thms.modules.events']);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.reporting', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.reporting.index', {
        url: '/reporting',
        resolve: {
          events: [
            '$http', function($http) {
              return $http.get('/api/v2/reporting/suite_orders');
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'reporting/catering/event_select',
            controller: [
              '$scope', 'events', '$modal', function($scope, events, $modal) {
                $scope.events = events.data;
                return $scope.openSelectionModal = function(date) {
                  var modal;
                  return modal = $modal.open({
                    templateUrl: 'reporting/_modal_report_select',
                    windowClass: 'effect-8 quarter',
                    controller: [
                      '$scope', '$state', function($scope, $state) {
                        $scope.data = date;
                        $scope.viewSuiteOrders = function() {
                          $state.go('authenticated.main.reporting.suiteOrders', {
                            id: $scope.data.id
                          });
                          return $scope.$close();
                        };
                        $scope.viewGuestList = function() {
                          $state.go('authenticated.main.reporting.guests', {
                            id: $scope.data.id
                          });
                          return $scope.$close();
                        };
                        $scope.viewCateringReport = function() {
                          $state.go('authenticated.main.reporting.catering', {
                            id: $scope.data.id
                          });
                          return $scope.$close();
                        };
                        return $scope.viewUnConfirmedReport = function() {
                          $state.go('authenticated.main.reporting.unconfirmed', {
                            id: $scope.data.id
                          });
                          return $scope.$close();
                        };
                      }
                    ]
                  });
                };
              }
            ]
          }
        }
      }).state('authenticated.main.reporting.unconfirmed', {
        url: '/reporting/events/dates/:id/unconfirmed',
        resolve: {
          unconfirmedUsers: [
            '$http', '$stateParams', function($http, $stateParams) {
              return $http.get("/api/v2/reporting/dates/" + $stateParams.id + "/unconfirmed");
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'reporting/suite_orders/unconfirmed',
            controller: [
              '$scope', 'unconfirmedUsers', function($scope, unconfirmedUsers) {
                return $scope.data = unconfirmedUsers.data;
              }
            ]
          }
        }
      }).state('authenticated.main.reporting.catering', {
        url: '/reporting/events/dates/:id/catering',
        resolve: {
          eventDate: [
            '$http', '$stateParams', function($http, $stateParams) {
              return $http.get("/api/v2/reporting/dates/" + $stateParams.id + "/confirmations");
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'reporting/catering/view',
            controller: [
              '$scope', 'eventDate', '$window', function($scope, eventDate, $window) {
                $scope.event = eventDate.data;
                return $scope.downloadExcel = function(eventDateId) {
                  return $window.open("/api/v2/reporting/dates/" + eventDateId + "/catering.xlsx", "_blank");
                };
              }
            ]
          }
        }
      }).state('authenticated.main.reporting.suiteOrders', {
        url: '/reporting/events/dates/:id/suites',
        resolve: {
          eventDate: [
            '$http', '$stateParams', function($http, $stateParams) {
              return $http.get("/api/v2/reporting/dates/" + $stateParams.id + "/confirmations");
            }
          ]
        },
        views: {
          'header@authenticated': {
            template: '<h1>Suite Order Report</h1>'
          },
          'content@authenticated': {
            templateUrl: 'reporting/suite_orders/view',
            controller: [
              '$scope', 'eventDate', '$window', function($scope, eventDate, $window) {
                $scope.event = eventDate.data;
                return $scope.downloadExcel = function(eventDateId) {
                  return $window.open("/api/v2/reporting/dates/" + eventDateId + "/confirmations.xlsx", "_blank");
                };
              }
            ]
          }
        }
      }).state('authenticated.main.reporting.guests', {
        url: '/reporting/events/dates/:id/guests',
        resolve: {
          eventDate: [
            '$http', '$stateParams', function($http, $stateParams) {
              return $http.get("/api/v2/reporting/dates/" + $stateParams.id + "/confirmations");
            }
          ]
        },
        views: {
          'header@authenticated': {
            template: '<h1>Guest Report</h1>'
          },
          'content@authenticated': {
            templateUrl: 'reporting/guest_report',
            controller: [
              '$scope', 'eventDate', '$window', function($scope, eventDate, $window) {
                $scope.event = eventDate.data;
                window.foob = _.map($scope.event.confirmed_inventory_options, function(option) {
                  return option.guests;
                });
                return $scope.downloadExcel = function(eventDateId) {
                  return $window.open("/api/v2/reporting/dates/" + eventDateId + "/confirmations.xlsx", "_blank");
                };
              }
            ]
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var app;

  app = angular.module('thms.modules.catering', ['thms.controllers', 'thms.services', 'ui.router']);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.catering.menu.index', {
        url: '/catering/menus',
        views: {
          'content@authenticated': {
            template: '<h1>Foo</h1>'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var NotificationIndexCtrl, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.notifications', ['thms.services', 'thms.modules.facilities', 'thms.directives', 'ui.router', 'jmdobry.angular-cache', 'ui.bootstrap']);

  app = angular.module('thms.modules.notifications');

  NotificationIndexCtrl = (function(_super) {
    __extends(NotificationIndexCtrl, _super);

    function NotificationIndexCtrl() {
      return NotificationIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    NotificationIndexCtrl.register(app);

    NotificationIndexCtrl.inject('$scope', 'Companies', 'data', '$q', '$http');

    NotificationIndexCtrl.prototype.initialize = function() {
      this.$scope.message = '';
      return this.$scope.data = this.data;
    };

    NotificationIndexCtrl.prototype.send_notification = function() {
      var defferred, method, uuids;
      this.url = '/api/v2/notifications';
      method = 'POST';
      uuids = [];
      this.$scope.data.map((function(_this) {
        return function(company) {
          return uuids.push(company.data.id);
        };
      })(this));
      this.data = {
        companies: uuids,
        message: this.$scope.message
      };
      defferred = this.$q.defer();
      this.$http({
        method: method,
        url: this.url,
        data: this.data
      }).then((function(_this) {
        return function(result) {
          return defferred.resolve(result);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return defferred.reject(error);
        };
      })(this));
      return defferred.promise;
    };

    NotificationIndexCtrl.prototype.notify = function() {
      return this.send_notification().then((function(_this) {
        return function(result) {
          return alert('Sent');
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          return alert('Error');
        };
      })(this));
    };

    return NotificationIndexCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.notification', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.notification.index', {
        url: '/notifications',
        resolve: {
          data: [
            'Companies', function(Companies) {
              return Companies.sync();
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'notifications/index',
            controller: 'NotificationIndexCtrl'
          },
          'header@authenticated': {
            template: '<h1>Notification</h1>'
          }
        }
      });
    }
  ]);

}).call(this);
(function() {
  var InventoryReleasesIndexCtrl, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = angular.module('thms.modules.inventory_releases', ['thms.services', 'ui.router', 'LocalStorageModule']);

  app = angular.module('thms.services');

  app.factory('InventoryRelease', [
    '$http', '$q', function($http, $q) {
      var BASE_URL, InventoryRelease;
      BASE_URL = '/api/v2/inventory_releases/';
      return InventoryRelease = (function() {
        function InventoryRelease(data, edited) {
          this.data = data;
          this.edited = edited != null ? edited : false;
          if (!this.data) {
            this.data = {};
          }
          this.url = this.data.id ? BASE_URL + this.data.id : BASE_URL;
        }

        return InventoryRelease;

      })();
    }
  ]);

  app = angular.module('thms.services');

  app.factory('InventoryReleases', [
    '$http', '$q', '$angularCacheFactory', 'InventoryRelease', function($http, $q, $angularCacheFactory, InventoryRelease) {
      var BASE_URL, InventoryReleases;
      BASE_URL = '/api/v2/inventory_releases/';
      return new (InventoryReleases = (function() {
        var __collection, __selected;

        window.foo = InventoryReleases;

        $angularCacheFactory('InventoryReleasesCache', {
          capacity: 100,
          maxAge: 900000,
          storageMode: 'localStorage'
        });

        __collection = [];

        __selected = '';

        function InventoryReleases() {}

        InventoryReleases.prototype.sync = function() {
          var defered;
          defered = $q.defer();
          __collection = [];
          $http.get(BASE_URL).then((function(_this) {
            return function(results) {
              var data, _i, _len, _ref;
              _ref = results.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                __collection.push(new InventoryRelease(data, false));
              }
              return defered.resolve(__collection);
            };
          })(this))["catch"](function(error) {
            return defered.reject(error);
          });
          return defered.promise;
        };

        return InventoryReleases;

      })());
    }
  ]);

  app = angular.module('thms.modules.inventory_releases');

  InventoryReleasesIndexCtrl = (function(_super) {
    __extends(InventoryReleasesIndexCtrl, _super);

    function InventoryReleasesIndexCtrl() {
      return InventoryReleasesIndexCtrl.__super__.constructor.apply(this, arguments);
    }

    InventoryReleasesIndexCtrl.register(app);

    InventoryReleasesIndexCtrl.inject('$scope', 'inventory_releases', '$state', '$modal');

    InventoryReleasesIndexCtrl.prototype.initialize = function() {
      return this.$scope.data = this.inventory_releases;
    };

    return InventoryReleasesIndexCtrl;

  })(BaseCtrl);

  app.config([
    '$stateProvider', function($stateProvider) {
      return $stateProvider.state('authenticated.main.inventory_release', {
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('authenticated.main.inventory_release.index', {
        url: '/inventory_releases',
        resolve: {
          inventory_releases: [
            'InventoryReleases', function(InventoryReleases) {
              return InventoryReleases.sync();
            }
          ]
        },
        views: {
          'content@authenticated': {
            templateUrl: 'inventory_releases/main',
            controller: 'InventoryReleasesIndexCtrl'
          }
        }
      });
    }
  ]);

}).call(this);