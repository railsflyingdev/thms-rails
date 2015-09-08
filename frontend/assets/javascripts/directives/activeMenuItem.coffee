app = angular.module 'thms.directives'

app.directive 'activeClassOn', [
    '$state', ($state) ->
        restrict: 'A'
        controller: [
            '$scope', '$element', '$attrs', ($scope, $element, $attrs) ->
                # we pass in the routes we want to be 'active on'
                routesToMatch = $attrs['activeClassOn'].split ' '

                isMatch = () ->
                    _.any routesToMatch, (route) ->
                        $state.includes route

                $scope.$on '$stateChangeSuccess', () ->
                    if isMatch() then $element.addClass 'active' else $element.removeClass 'active'

                if isMatch() then $element.addClass 'active' else $element.removeClass 'active'
        ]
]