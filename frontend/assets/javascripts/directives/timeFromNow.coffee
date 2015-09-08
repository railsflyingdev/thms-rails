#angular.module('thms.directives').filter('timerange', function() {
#   return function(input) {
#
#//     var timeRange = input.replace(/\[|\]|"/g,'');
#//     timeRange = timeRange.split(',');
#     var timeRange = input.split('..');
#     var start = moment(timeRange[0]).format('MMM Do h:mm a');
#//     var finish =  moment(timeRange[1]).format('MMM Do HH:mm');
#
#//     console.log(start);
#     return start
#   }
#});
#
#//var timeRange = model.get('event_period').replace(/\[|\]|"/g,'');
#//timeRange = timeRange.split(',');
#//model.set('start', moment(timeRange[0]).format('YYYY-MM-DDTHH:mm:ss'));
#//model.set('finish', moment(timeRange[1]).format('YYYY-MM-DDTHH:mm:ss'));

app = angular.module 'thms.directives'

app.filter 'timeFromNow', [
    'angularMomentConfig', 'amMoment', (angularMomentConfig, amMoment) ->
        (time) ->
            moment.unix(time).fromNow()
#            moment.utc().from(moment.unix(time).utc())
#            moment().from moment(new Date(time*1000))
]