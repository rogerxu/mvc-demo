app.controllers.footer = (function() {
    var exports,
        options = {
            pSelector: '#footer',
            viewId: 'footer'
        },
        parent = $(options.pSelector),
        viewPath = app.config.views[options.viewId],
        template;

    function _render() {
        $.get(viewPath, function(templ) {
            template = templ;
            parent.html(_.template(template));
        });
    }

    exports = {
        init: function() {
            _render();
        }
    };
    return exports;
})();

app.controllers.footer.init();