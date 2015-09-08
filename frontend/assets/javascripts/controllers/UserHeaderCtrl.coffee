app = angular.module 'thms.controllers'

class UserHeaderController extends BaseCtrl
    @register app

    @inject '$scope', '$modal', 'Auth'

    initialize: ->
        @$scope.userMenu =
            isOpen: false

    toggleUserMenu: ->
        @$scope.userMenu.isOpen = !@$scope.userMenu.isOpen

    help: ->
        modal = @$modal.open
            templateUrl: 'teasers/modal_help'
            windowClass: 'effect-10'

    logout: ->
        @Auth.logout()

#       User Masquerading Stuff

    showMasqueradeUserList: ->
        modal = @$modal.open
            templateUrl: 'admin/masquerading/_modal_list_avail'
            resolve:
                users: [
                    '$http', ($http) ->
                        $http.get '/api/v2/masquerading/available'
                ]
            windowClass: 'effect-10 masquerade'
            controller: [
                '$scope', '$humane', '$state', 'users', 'Auth', ($scope, $humane, $state, users, Auth) ->
                    $scope.users = users.data

                    $scope.masqueradeAs = (user) ->
                        Auth.startMasquerading(user.id)
                            .then (user) ->
                                $state.go 'authenticated.main.home'
                                $scope.$close()
                            .catch (error) ->
                                $scope.$close()
                                $humane.stickyError error

            ]