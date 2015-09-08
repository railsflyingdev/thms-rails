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