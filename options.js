function saveOptions(e) {

    // prefs object
    let prefs = {
        enabledAtStartup     : document.querySelector('#enabledAtStartup').checked  || false,
        maxLength     : document.querySelector('#maxLength').checked  || 500
    }

    browser.storage.sync.set(prefs);

    // reload prefs
    browser.runtime.getBackgroundPage().then((res) => {
        res.javanxd_requestPadding.loadPrefs(function(){
            // refresh options
            restoreOptions();
        });
    });

    e.preventDefault();
}

function restoreOptions() {
    browser.storage.sync.get('enabledAtStartup').then((res) => {
        document.querySelector('#enabledAtStartup').checked = res.enabledAtStartup || false;
    });
    browser.storage.sync.get('maxLength').then((res) => {
        document.querySelector('#maxLength').checked = res.maxLength || false;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
