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