app = angular.module 'thms.modules.catering', ['thms.controllers', 'thms.services', 'ui.router']

app.config [
    '$stateProvider', ($stateProvider) ->
        $stateProvider
        .state 'authenticated.main.catering.menu.index',
            url: '/catering/menus'
            views:
                'content@authenticated':
                    template: '<h1>Foo</h1>'
]