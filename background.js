//************************************************************* class definition
var javanxd_requestPadding = {


    /***************************************************************************
    props
    ***/
    enabled                     : false
    ,prefs                      : {} // holds user prefs
    ,transactions               : {} // contains requests/responses


    /***************************************************************************
    init
    ***/
    ,init : function() {

        // toggle activation on button click
        browser.browserAction.onClicked.addListener(function(){
            javanxd_requestPadding.toggle();
        });

        // load prefs
        javanxd_requestPadding.loadPrefs(function(){
            // enact enabled at startup
            if(javanxd_requestPadding.prefs.enabledAtStartup) {
                javanxd_requestPadding.toggle(true);
            }

            // update button
            javanxd_requestPadding.updateButton();
        });

        return this;
    }


    /***************************************************************************
    toggle
    ***/
    ,toggle : function(state) {

        // set state by input
        if(typeof state === 'boolean') {
            javanxd_requestPadding.enabled = state;
        }
        // set state by toggle
        else {
            javanxd_requestPadding.enabled = !javanxd_requestPadding.enabled;
        }

        // update button
        javanxd_requestPadding.updateButton();

        // clear transactions
        javanxd_requestPadding.transactions = {};

        // add observer, observe http responses
        if(javanxd_requestPadding.enabled) {

            browser.webRequest.onBeforeSendHeaders.addListener(
                javanxd_requestPadding.requestHandler
                ,{urls: ["<all_urls>"]}
                ,["blocking" ,"requestHeaders"]
            );

            browser.webRequest.onHeadersReceived.addListener(
                javanxd_requestPadding.responseHandler
                ,{urls: ["<all_urls>"]}
                ,["blocking" ,"responseHeaders"]
            );
        }

        // remove observer
        else {

            browser.webRequest.onBeforeSendHeaders.removeListener(
                javanxd_requestPadding.requestHandler
            );

            browser.webRequest.onHeadersReceived.removeListener(
                javanxd_requestPadding.responseHandler
            );
        }

        return this;
    }


    /***************************************************************************
    re/load preferences
    Because fetching prefs returns a promise, we use a callback to do stuff when
    the promise is fullfilled.
    ***/
    ,loadPrefs : function(callback) {

        browser.storage.sync.get([
            'enabledAtStartup',
            'maxLength'
        ]).then((res) => {

            // get prefs, set default value if n/a
            javanxd_requestPadding.prefs.enabledAtStartup    = res.enabledAtStartup    || false;

            // get prefs, set default value if n/a
            javanxd_requestPadding.prefs.maxLength    = res.maxLength    || 500;

            if(callback) {
                callback();
            }
        });

        return this;
    }


    /***************************************************************************
    updateButton
    ***/
    ,updateButton : function() {

        // icon
        let buttonStatus = javanxd_requestPadding.enabled ? 'on' : 'off';

        // tooltip text
        let buttonTitle = javanxd_requestPadding.enabled
            ? 'Random padding is enabled'
            : 'Random passing is disabled';


        // proceed
        browser.browserAction.setIcon({path:{48:'media/button-48-'+buttonStatus+'.png'}});
        browser.browserAction.setTitle({title:buttonTitle});

        return this;
    }


    /***************************************************************************
    requestHandler
    ***/
    ,requestHandler : function(request) {

        // prepare transaction, store transaction request
        let transaction = {
             request         : request
            ,requestHeaders  : {}
            ,response        : {}
            ,responseHeaders : {}
        };

        // shorthand access to request headers
        for(let header of request.requestHeaders) {
            transaction.requestHeaders[header.name.toLowerCase()] = header;
        }

        // store transaction
        javanxd_requestPadding.transactions[request.requestId] = transaction;

        // add a new header
        let maxLength = javanxd_requestPadding.prefs.maxLength;
        let randomNumber = Math.floor(Math.random() * (maxLength+1));
        let padding = new Array(randomNumber + 1).join( 'X' );
        transaction.request.requestHeaders.push({name:"Random-Padding",value:padding});

        // apply modifications
        return {
            requestHeaders : transaction.request.requestHeaders
        };
    }


    /***************************************************************************
    responseHandler
    ***/
    ,responseHandler : function(response) {

        // get transaction
        let transaction = javanxd_requestPadding.transactions[response.requestId];


        // delete transaction
        delete javanxd_requestPadding.transactions[response.requestId];

        // return headers
        return {
            responseHeaders: transaction.response.responseHeaders
        };
    }
};




//************************************************************************** run
var bg = javanxd_requestPadding.init();
