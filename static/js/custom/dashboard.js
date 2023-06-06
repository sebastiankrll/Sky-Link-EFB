let btns_cond = [document.getElementById('btn_cond_dep'), document.getElementById('btn_cond_arr')];

btns_cond.forEach((btn_cond) => {
    btn_cond.addEventListener('click', () => {

        let popup = document.querySelector('.popup');
        let icao_class = btn_cond.parentNode.querySelector('.icao');

        viewConditions();

        let ul = popup.querySelectorAll('.conditions-popup-container ul');
        let preloader = popup.querySelector('.conditions-popup-container .preloader');
        let title = popup.querySelector('.popup-title p');
        title.innerHTML = 'WX ' + icao_class.innerHTML;

        fetchWeatherReport('https://avwx.rest/api/metar/', icao_class.innerHTML, (resp) => {
            ul[0].querySelectorAll('p')[1].innerHTML = resp.raw;
            const t = Date.parse(resp.time.dt);
            let delta = Date.now() - t;
            const dt = new Date(delta);
            ul[0].querySelectorAll('p')[0].innerHTML = 'Issued ' + dt.getHours() + 'h' + dt.getMinutes() + 'm ago';
            ul[1].querySelectorAll('p')[0].innerHTML = 'Issued ' + dt.getHours() + 'h' + dt.getMinutes() + 'm ago';
            
            if (resp.wind_variable_direction.length == 0) {
                ul[1].querySelectorAll('p')[1].innerHTML = 'from ' + resp.wind_direction.value + '&deg; at ' + resp.wind_speed.value + ' knots';
            } else {
                ul[1].querySelectorAll('p')[1].innerHTML = 'from ' + resp.wind_direction.value + '&deg; at ' + resp.wind_speed.value + ' knots<br>varying from ' + resp.wind_variable_direction[0].value + '&deg; to ' + resp.wind_variable_direction[1].value + '&deg;';
            }

            if (resp.runway_visibility.length == 0) {
                ul[1].querySelectorAll('p')[2].innerHTML = 'more than 10000 meters';
            } else {
                ul[1].querySelectorAll('p')[2].innerHTML = 'more than ' + resp.runway_visibility[0] + ' meters';
            }

            if (resp.clouds.length == 0) {
                ul[1].querySelectorAll('p')[3].innerHTML = 'clear sky';
            } else {
                let cloud_str = ""
                resp.clouds.forEach((cl) => {
                    cloud_str = cloud_str + parseCloudIdent(cl.type) + ' at ' + cl.altitude * 100 + '&apos;<br>';
                })
                ul[1].querySelectorAll('p')[3].innerHTML = cloud_str;
            }
            ul[1].querySelectorAll('p')[4].innerHTML = resp.temperature.value + '&deg;C';
            ul[1].querySelectorAll('p')[5].innerHTML = resp.dewpoint.value + '&deg;C';
            ul[1].querySelectorAll('p')[6].innerHTML = resp.altimeter.value + ' inHg';

            if (resp.remarks_info.codes.length == 0) {
                ul[1].querySelectorAll('p')[7].innerHTML = 'no codes';
            } else {
                let code_str = ""
                resp.remarks_info.clouds.forEach((cd) => {
                    code_str = code_str + cd.value + '<br>';
                })
                ul[1].querySelectorAll('p')[7].innerHTML = code_str;
            }
            ul[0].style.display = 'inline-block';
            preloader.style.display = 'none';
        });
        fetchWeatherReport('https://avwx.rest/api/taf/', icao_class.innerHTML, (resp) => {
            ul[0].querySelectorAll('p')[3].innerHTML = resp.raw;
            const t = Date.parse(resp.time.dt);
            let delta = Date.now() - t;
            const dt = new Date(delta);
            ul[0].querySelectorAll('p')[2].innerHTML = 'Issued ' + dt.getHours() + 'h' + dt.getMinutes() + 'm ago';
            ul[0].style.display = 'inline-block';
            preloader.style.display = 'none';
        });

    })
})

function parseCloudIdent(str) {
    if (str == 'FEW') {
        return 'few';
    }
    if (str == 'SCT') {
        return 'scattered';
    }
    if (str == 'BKN') {
        return 'broken';
    }
    if (str == 'OVC') {
        return 'overcast';
    }
}

function viewConditions() {

    let popup = document.querySelector('.popup');
    popup.innerHTML = "";
    let temp = document.getElementById('template-conditions-popup');
    let tr = document.importNode(temp.content, true);
    popup.appendChild(tr);
    popup.style.display = 'inline-block';
    let close_popup = popup.querySelector('.popup-title button');

    close_popup.addEventListener('click', () => {
        popup.style.display = 'none';
    })

    let ul = popup.querySelectorAll('.conditions-popup-container ul');
    document.querySelectorAll('.popup-nav p').forEach((nav, i) => {
        nav.addEventListener('click', () => {
            document.querySelectorAll('.popup-nav p').forEach((nav, i) => {
                nav.classList.remove('active');
                ul[i].style.display = 'none';
            })
            nav.classList.add('active');
            ul[i].style.display = 'inline-block';
        })
    })

}

function fetchWeatherReport(url, icao, callback) {

    var request = new XMLHttpRequest();
    request.open('GET', url + icao);
    request.setRequestHeader('Content-Type', 'text/plain');
    request.setRequestHeader('Authorization', 'Y8A3CYfgHXndwbwi4H7aHXFFbslU0P-18KC3Y3CoAp0');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            const resp = JSON.parse(this.responseText);
            callback(resp)
        }
    };

    request.send();
}