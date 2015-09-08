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