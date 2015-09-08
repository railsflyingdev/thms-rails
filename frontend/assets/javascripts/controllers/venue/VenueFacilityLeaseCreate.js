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