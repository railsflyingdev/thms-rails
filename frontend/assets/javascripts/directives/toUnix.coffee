app = angular.module 'thms.directives'

app.directive 'toUnix', [
    'angularMomentConfig', 'amMoment', (angularMomentConfig, amMoment) ->
        require: 'ngModel'
        link: (scope, el, attr, ngModel) ->

            # Store unix timestamp in our model
            ngModel.$parsers.push (val) ->
                new Date(val).getTime() / 1000

            # Convert unix timestamp to normal time for view
            ngModel.$formatters.push (originalVal) ->
                value = amMoment.preprocessDate originalVal
                if angularMomentConfig.timezone then value = amMoment.applyTimezone value
                value.format 'YYYY-MM-DDTHH:mm'
]