app = angular.module 'thms.services'

app.factory 'Auth', [
    '$rootScope', '$http', 'localStorageService', '$q', ($rootScope, $http, ls, $q) ->
        new class Auth
            constructor: ->
                @setAccessToken ls.get 'access-token'
                @setCurrentUser ls.get 'current-user'

            setCurrentUser: (user) ->
                return unless user
                ls.set 'current-user', user
                @currentUser = user

            setAccessToken: (token) ->
                return unless token
                ls.set 'access-token', token
                @accessToken = token
                $http.defaults.headers.common['Authorization'] = "Bearer #{@accessToken}"

            wipeData: ->
                @currentUser = undefined
                @accessToken = undefined
                @currentlyMasquerading = false
                ls.set 'access-token', null
                ls.set 'current-user', null
                delete $http.defaults.headers.common['Authorization']
                delete $http.defaults.headers.common['EH-Masquerading-As']

            login: (details = {}) ->
                $http.post '/api/v2/sessions', details
                    .success (result, status, headers) =>
                        @setAccessToken headers('x-set-auth-token')
                        @setCurrentUser result.data
                        $rootScope.$broadcast 'event:auth-logged-in', result.data
                    .error (response) =>
                        $rootScope.$broadcast 'event:auth-login-invalid', response


            logout: () ->
                $http.delete '/api/v2/sessions'
                    .then (response) =>
                        @wipeData()
                        $rootScope.$broadcast 'event:auth-logged-out'

            checkLoggedIn: ->
                deferred = $q.defer()

                deferred.reject unless @currentUser

                $http.get '/api/v2/auth/check'
                    .then (response, status) =>
                        @setCurrentUser response.data
                        deferred.resolve response.data
                    .catch (response) -> deferred.reject response

                deferred.promise


            startMasquerading: (id) ->
                deferred = $q.defer()

                $http.defaults.headers.common['EH-Masquerading-As'] = id

                $http.get '/api/v2/masquerading/current'
                    .then (response) =>
                        @setCurrentUser response.data
                        @currentlyMasquerading = true
                        console.warn "Masquerading As #{response.data.email}"
                        deferred.resolve(response.data)
                    .catch (response) =>
                        deferred.reject(response)
                        @stopMasquerading()

                deferred.promise

            stopMasquerading: ->
                delete $http.defaults.headers.common['EH-Masquerading-As']
                @currentlyMasquerading = false
                @checkLoggedIn()
                $rootScope.$broadcast 'event:redirect-home'

    ]