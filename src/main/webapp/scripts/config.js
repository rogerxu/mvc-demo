app.config = app.config || {};

var config = app.config;

config.views = {
    header: 'templates/header.html',
    footer: 'templates/footer.html',
    content: 'templates/content.html',
    navigation: 'templates/navigation.html'
};

config.api = {
    online: true,
    apiURL: {
        online: {

        },
        offline: {

        }
    }
};

config.locale = {
    name: 'language',
    path: 'i18n/',
    mode: 'map',
    language: 'zh_CN',
    cache: true
};

config.consts = {
    STATUS_OK: 'OK',
    STATUS_FAILED: 'FAILED'
};

config.pbTypes = {
    // event types for public & subscribe
};
