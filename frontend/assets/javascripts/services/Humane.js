angular.module('thms.services').service('$humane', ['$rootScope', function() {
    var humane = new Humane({container: document.body});

    this.spawn = humane.spawn();

    this.error = humane.spawn({
        addnCls: "humane-libnotify-error",
        timeout: 4e3
    });

    this.errorShort = humane.spawn({
        addnCls: "humane-libnotify-error"
    });

    this.stickyError = humane.spawn({
        waitForMove: true,
        addnCls: "humane-libnotify-error",
        timeout: 4e3
    });

    this.stickySuccess = humane.spawn({
      waitForMove: true,
      addnCls: "humane-libnotify-success",
      timeout: 4e3
    });

    this.successShort = humane.spawn({
      addnCls: "humane-libnotify-success"
    });

    this.sticky = humane.spawn({
        waitForMove: true,
        timeout: 4e3
    });
}]);