$(function () {
    AppendFPScript();   
    SetFingerprintCookie();   
    SubmitBrowserDataToAPI();   
});

function AppendFPScript() {
    var script = document.createElement("script");    
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/2.0.3/fingerprint2.min.js";
    document.head.appendChild(script);
}

function WriteCookie(name, value, days) {
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function ReadCookie(name) {
    var i, c, ca, nameEQ = name + "=";
    ca = document.cookie.split(';');
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return '';
}
function SetFingerprintCookie() {
    var fp = "";
    Fingerprint2.get(function (components) {
        var values = components.map(function (mycomponent) { return mycomponent.value; });
        fp = Fingerprint2.x64hash128(values.join(''), 31);
        WriteCookie('FingerPrint', fp, 30);
    });
}
function SubmitBrowserDataToAPI() {
    if (window.requestIdleCallback) {
        requestIdleCallback(function () {
            Fingerprint2.get(function (components) {
                components.forEach(function (component, index) {
                    var endpoint = ComposeEndpoint(component.key, component.value);
                    InsertFingerPrintValues(endpoint);
                });
            });
        });
    } else {
        setTimeout(function () {
            Fingerprint2.get(function (components) {
                components.forEach(function (component, index) {
                    var endpoint = ComposeEndpoint(component.key, component.value);
                    InsertFingerPrintValues(endpoint);
                });
            });
        }, 500);
    }
}
function ComposeEndpoint(key, value) {
    var baseUrl = "https://pgalphasvc.azurewebsites.net:443/api/Data/StoreFingerPrintData";
    return baseUrl.concat("?fingerPrint=", ReadCookie("FingerPrint"), "&key=", key, "&value=", value);
}
function InsertFingerPrintValues(endpoint) {
    $.ajax({
        type: "POST",
        url: endpoint,
        dataType: "json"
    });
}
