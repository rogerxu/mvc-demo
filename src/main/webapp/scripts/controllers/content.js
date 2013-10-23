app.controllers.content = (function() {
    var exports,
        options = {
            pSelector: '#content',
            viewId: 'content'
        },
        parent = $(options.pSelector),
        viewPath = app.config.views[options.viewId],
        template;

    var dateFormat = app.modules.dateFormat;

    function _render() {
        $.get(viewPath, function(templ) {
            template = templ;
            parent.html(_.template(template, {
                time: dateFormat.now()
            }));
        });
    }

    exports = {
        init: function() {
            _render();
        }
    };
    return exports;
})();

app.controllers.content.init();