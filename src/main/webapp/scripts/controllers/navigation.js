app.controllers.navigation = (function() {
    var exports,
        options = {
            pSelector: '#header',
            viewId: 'navigation'
        },
        parent = $(options.pSelector),
        viewPath = app.config.views[options.viewId],
        template;

    function _render() {
        $.get(viewPath, function(templ) {
            template = templ;
            parent.append(_.template(template));
        });
    }

    exports = {
        init: function() {
            _render();
        }
    };
    return exports;
})();

app.controllers.navigation.init();