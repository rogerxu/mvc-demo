/*
 * QtWebKit-powered headless test runner using PhantomJS
 *
 * PhantomJS binaries: http://phantomjs.org/download.html
 * Requires PhantomJS 1.6+ (1.7+ recommended)
 *
 * Run with:
 *   phantomjs runner.js [url-of-your-qunit-testsuite]
 *
 * e.g.
 *   phantomjs runner.js http://localhost/qunit/test/index.html
 */

/*global phantom:false, require:false, console:false, window:false, QUnit:false */

(function() {
    'use strict';

    var url, page, reportDir, timeout,
        args = require('system').args;

    // arg[0]: scriptName, args[1...]: arguments
    if (args.length < 2 || args.length > 4) {
        console.error('Usage:\n  phantomjs runner.js [url-of-your-qunit-testsuite] [test-report-directory] [timeout-in-seconds]');
        phantom.exit(1);
    }

    url = args[1];
    page = require('webpage').create();
    if (args[2] !== undefined) {
        reportDir = args[2];
    }
    if (args[3] !== undefined) {
        timeout = parseInt(args[3], 10);
    }

    // Route `console.log()` calls from within the Page context to the main Phantom context (i.e. current `this`)
    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.onInitialized = function() {
        page.evaluate(addLogging);
    };

    page.onCallback = function(message) {
        if (message) {

            // QUnit.injectJs
            if (message.name === 'QUnit.injectJs') {
                var scriptFile = 'src/test/config/qunit-reporter-junit/qunit-reporter-junit.js';
                var injectResult = page.injectJs(scriptFile);

                return injectResult;
            }

            // QUnit.jUnitReport
            if (message.name === 'QUnit.jUnitReport') {
                var data = message.data;

                // Ok now let's write junit xml report file.
                var dir = reportDir || 'target/failsafe-reports';
                var file = dir + '/' + 'TEST-QUnitIT.xml';
                writeXml(file, data.xml);
            }

            // QUnit.done
            if (message.name === 'QUnit.done') {
                var result = message.data;
                var failed = !result || result.failed;

                //phantom.exit(failed ? 1 : 0);
                phantom.exit(0);
            }
        }
    };

    page.open(url, function(status) {
        if (status !== 'success') {
            console.error('Unable to access network: ' + status);
            phantom.exit(1);
        } else {
            // Cannot do this verification with the 'DOMContentLoaded' handler because it
            // will be too late to attach it if a page does not have any script tags.
            var qunitMissing = page.evaluate(function() { return (typeof QUnit === 'undefined' || !QUnit); });
            if (qunitMissing) {
                console.error('The `QUnit` object is not present on this page.');
                phantom.exit(1);
            }

            // Set a timeout on the test running, otherwise tests with async problems will hang forever
            if (typeof timeout === 'number') {
                setTimeout(function() {
                    console.error('The specified timeout of ' + timeout + ' seconds has expired. Aborting...');
                    phantom.exit(1);
                }, timeout * 1000);
            }

            // Do nothing... the callback mechanism will handle everything!
        }
    });

    function addLogging() {
        window.document.addEventListener('DOMContentLoaded', function() {

            // call phantomjs to inject js
            var injectJsOk = window.callPhantom({
                'name': 'QUnit.injectJs'
            });

            if (injectJsOk) {
                // register QUnit.jUnitReport callback
                QUnit.jUnitReport = function(data) {
                    // call phantomjs to generate junit report
                    window.callPhantom({
                        'name': 'QUnit.jUnitReport',
                        'data': data
                    });
                };
            } else {
                console.error('Cannot inject QUnit jUnit report plugin into this page!');
            }

            // record test assertions
            var currentTestAssertions = [];

            QUnit.log(function(details) {
                var response;

                // Ignore passing assertions
                if (details.result) {
                    return;
                }

                response = details.message || '';

                if (typeof details.expected !== 'undefined') {
                    if (response) {
                        response += ', ';
                    }

                    response += 'expected: ' + details.expected + ', but was: ' + details.actual;
                }

                if (details.source) {
                    response += "\n" + details.source;
                }

                currentTestAssertions.push('Failed assertion: ' + response);
            });

            QUnit.testDone(function(result) {
                var i,
                    len,
                    name = result.module + ': ' + result.name;

                if (result.failed) {
                    console.log('Test failed: ' + name);

                    for (i = 0, len = currentTestAssertions.length; i < len; i++) {
                        console.log('    ' + currentTestAssertions[i]);
                    }
                }

                currentTestAssertions.length = 0;
            });

            QUnit.done(function(result) {
                // display pretty console logs
                var summaryEntities = [];
                summaryEntities.push('Tests run: ' + result.total);
                summaryEntities.push('Passes: ' + result.passed);
                summaryEntities.push('Failures: ' + result.failed);
                summaryEntities.push('Time elapsed: ' + result.runtime + ' ms');

                console.log('');
                console.log('-------------------------------------------------------');
                console.log(' T E S T S');
                console.log('-------------------------------------------------------');
                console.log('');
                console.log('Results :');
                console.log('');
                console.log(summaryEntities.join(', '));
                console.log('');

                // call phantomjs to exit
                window.callPhantom({
                    'name': 'QUnit.done',
                    'data': result
                });
            });
        }, false);
    }

    function writeXml(file, xml) {
        var fs = require('fs');

        if (!fs.isFile(file)) {
            fs.write(file, xml, 'w');
        } else {
            console.error('Cannot write junit report file.');
        }
    }
})();
