function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

var contentfulClient = null;
var currentEntry = null;

function CFDirect(accessToken, space, entry) {
    contentfulClient = contentful.createClient({
        accessToken: accessToken,
        space: space
    });

    contentfulClient.getEntry(entry)
        .then(function (entry) {
            console.log(entry);
            currentEntry = entry;
            console.log(document.querySelectorAll("[cf-data-key]"));
            document.querySelectorAll("[cf-data-list]").forEach(function (itm) {
                //itm is a datalist
                var key = itm.getAttribute('cf-data-list');
                var html = itm.innerHTML;
                itm.innerHTML = '';

                currentEntry.fields[key].forEach(function (i2) {
                    var inner = document.createElement('div');
                    inner.innerHTML = html;
                    inner.querySelectorAll('[cf-data-listitem]').forEach(function (listitm) {
                        listitm.innerHTML = i2;
                    });
                    itm.insertAdjacentHTML('beforeend', inner.innerHTML);
                });
            });
            document.querySelectorAll("[cf-data-key]").forEach(function (itm) {
                var key = itm.getAttribute('cf-data-key');
                if (itm.tagName.toLowerCase() === 'img') {
                    itm.setAttribute('src', currentEntry.fields[key].fields.file.url);
                } else if (itm.getAttribute('cf-data-format') === 'rich') {
                    itm.innerHTML = documentToHtmlString(currentEntry.fields[key]);
                } else if (itm.getAttribute('cf-data-format') === 'markdown') {
                    itm.innerHTML = marked(currentEntry.fields[key]);
                } else if (itm.getAttribute('cf-data-format') != null) { //(currentEntry.fields[key] instanceof Date) &&
                    itm.innerHTML = date2str(new Date(currentEntry.fields[key]), itm.getAttribute('cf-data-format'));
                } else {
                    itm.innerHTML = currentEntry.fields[key];
                }
            });
        });
}