app.modules.dateFormat = (function() {
    var exports;

    function _init() {

    }

    function _formatDateTime(date) {
        return date.toLocaleString();
    }

    exports = {
        init: function() {
            return _init();
        },
        formatDateTime: _formatDateTime,
        now: function() {
            return _formatDateTime(new Date());
        }
    };

    return exports;
})();

app.modules.dateFormat.init();
