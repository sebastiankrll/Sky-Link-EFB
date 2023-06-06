function getData(url, datapoint, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url + datapoint, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(JSON.parse(request.responseText));
        } else {
        }
    };
    request.onerror = function () {
    };
    request.send();
}

function setData(dir, datapoint_name, valueToUse) {
    let request = new XMLHttpRequest();
    request.open('POST', '/' + dir + '/' + datapoint_name + '/set', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        value_to_use: valueToUse
    }));
}