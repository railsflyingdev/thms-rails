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