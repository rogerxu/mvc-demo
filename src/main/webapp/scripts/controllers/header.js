app.controllers.header = (function() {
    var exports,
        options = {
            pSelector: '#header',
            viewId: 'header'
        },
        parent = $(options.pSelector),
        viewPath = app.config.views[options.viewId],
        template;

    function _render() {
        $.get(viewPath, function(templ) {
            template = templ;
            parent.html(_.template(template));
        });

        // load navigation
        $LAB.script([
            'scripts/controllers/navigation.js'
        ]);
    }

    exports = {
        init: function() {
            _render();
        }
    };
    return exports;
})();

app.controllers.header.init();