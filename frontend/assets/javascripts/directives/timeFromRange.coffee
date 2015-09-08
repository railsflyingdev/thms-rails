app = angular.module 'thms.directives'

app.filter 'timerange', [
    'angularMomentConfig', 'amMoment', (angularMomentConfig, amMoment) ->
        (input) ->
            timeRange = input.split '..'
            start = moment(timeRange[0])

            if angularMomentConfig.timezone then start = amMoment.applyTimezone start
            start.format('MMM Do h:mm a');
]