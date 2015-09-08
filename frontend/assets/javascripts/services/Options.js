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