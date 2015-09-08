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