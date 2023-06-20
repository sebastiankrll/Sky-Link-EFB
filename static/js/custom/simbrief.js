let simbrief_status = false;

function initSimbriefData(auto_login) {
    flaskGet('/datasets/simbrief_dataset/', '', (response) => {

        setSimbrief_SUMMARY(response);
        setSimbrief_DISPATCHWX(response);
        setSimbrief_NOTAM(response);
        createWaypointList(response);

        Object.keys(response).forEach((key) => {
            document.querySelectorAll('.' + key).forEach((el) => {
                el.innerHTML = response[key]
            })
        })
        animateSimbriefLoader('success');

        if (auto_login) {
            moveLogin();
        }
    });
    flaskGet('/datasets/simbrief_waypoints/', '', (response) => {
        drawWeatherMap()
        drawRouteMap(response)
    });
}

function checkSimbriefEndpoint(login_userId) {
    flaskSet('datapoint', 'userid', login_userId);
    animateSimbriefLoader('loading');
    let timesRun = 0;
    let fetch_timer = setInterval(function () {
        timesRun += 1;
        if (timesRun == 10) {
            clearInterval(fetch_timer);
            animateSimbriefLoader('error');
        }
        if (simbrief_status) {
            clearInterval(fetch_timer);
        } else {
            fetchSimbriefStatus();
        }
    }, 1000);
}

function fetchSimbriefStatus() {
    flaskGet('/simbrief/status/', '', (response) => {
        if (response.STATUS == true) {
            simbrief_status = true;
            initSimbriefData(false);
        }
    });
}

function setSimbrief_SUMMARY(response) {

    setInterval(() => {
        document.getElementById('briefing-time-utc').innerHTML = timeToUTC(Date.now()) + ' UTC';
        document.getElementById('briefing-time-dep').innerHTML = timeToUTC(Date.now() + response.TIME_UTC_OFF_DEP * 3600000) + ' (UTC ' + leadingSign(response.TIME_UTC_OFF_DEP) + ')';
        document.getElementById('briefing-time-arr').innerHTML = timeToUTC(Date.now() + response.TIME_UTC_OFF_ARR * 3600000) + ' (UTC ' + leadingSign(response.TIME_UTC_OFF_ARR) + ')';
    }, 1000);

}

function setSimbrief_DISPATCHWX(response) {

    let briefing_item = document.getElementById('brief-dispatch-wx-enr-list');
    let fixes = response.MAP_IDENT;
    for (let i = 0; i < fixes.length; i++) {
        const wrapper = document.createElement('div');
        const header = document.createElement('h1');
        header.innerHTML = fixes[i];
        wrapper.appendChild(header);
        let alts = response.DISPATCH_ENROUTE_ALT;
        for (let j = 0; j < alts.length / fixes.length; j++) {
            let temp = document.createElement('div');
            temp.innerHTML = leadingZeros(alts[j + (i * (alts.length / fixes.length))], 5);
            wrapper.appendChild(temp);
            temp = document.createElement('div');
            temp.innerHTML = leadingZeros(response.DISPATCH_ENROUTE_WIND_DIR[j + (i * (alts.length / fixes.length))], 3) + '/' + leadingZeros(response.DISPATCH_ENROUTE_WIND_SPD[j + (i * (alts.length / fixes.length))], 3);
            wrapper.appendChild(temp);
            temp = document.createElement('div');
            temp.innerHTML = response.DISPATCH_ENROUTE_OAT[j + (i * (alts.length / fixes.length))];
            wrapper.appendChild(temp);
        }
        briefing_item.appendChild(wrapper);
    }

    briefing_item = document.getElementById('brief-dispatch-wx-chart');
    let charts = response.DISPATCH_IMG_NAME;
    const wrapper = briefing_item.querySelector('ul');
    for (let i = 0; i < charts.length; i++) {
        let li = document.createElement('li');
        const header = document.createElement('h1');
        header.innerHTML = charts[i];
        li.appendChild(header);
        li.classList.add('briefing-item-li-img')
        let img = document.createElement('img');
        let hr = document.createElement('hr');
        img.src = response.DISPATCH_IMG_DIR + response.DISPATCH_IMG_LINK[i];
        li.appendChild(img)
        wrapper.append(li)
        wrapper.appendChild(hr)
    }

}

function setSimbrief_NOTAM(response) {

    let briefing_item = document.getElementById('brief-notam-dep');
    let notams = response.NOTAM_DEP_ID;
    let wrapper = briefing_item.querySelector('ul');
    for (let i = 0; i < notams.length; i++) {
        let li = document.createElement('li');
        li.classList.add('briefing-item-li-vertical-left');
        li.classList.add('briefing-item-li-notam');
        const header = document.createElement('p');
        const t_eff = new Date(response.NOTAM_DEP_DATE_EFF[i]);
        const t_exp = new Date(response.NOTAM_DEP_DATE_EXP[i]);
        header.innerHTML = t_eff.toUTCString() + ' - ' + t_exp.toUTCString();
        li.appendChild(header);
        let div = document.createElement('h1');
        div.innerHTML = response.NOTAM_DEP_HTML[i];
        li.appendChild(div);
        div = document.createElement('h1');
        div.innerHTML = 'NOTAM ID: ' + response.NOTAM_DEP_ID[i];
        li.appendChild(div);
        wrapper.append(li)

        let hr = document.createElement('hr');
        wrapper.appendChild(hr)
    }

    briefing_item = document.getElementById('brief-notam-arr');
    notams = response.NOTAM_ARR_ID;
    wrapper = briefing_item.querySelector('ul');
    for (let i = 0; i < notams.length; i++) {
        let li = document.createElement('li');
        li.classList.add('briefing-item-li-vertical-left');
        li.classList.add('briefing-item-li-notam');
        const header = document.createElement('p');
        const t_eff = new Date(response.NOTAM_ARR_DATE_EFF[i]);
        const t_exp = new Date(response.NOTAM_ARR_DATE_EXP[i]);
        header.innerHTML = t_eff.toUTCString() + ' - ' + t_exp.toUTCString();
        li.appendChild(header);
        let div = document.createElement('h1');
        div.innerHTML = response.NOTAM_ARR_HTML[i];
        li.appendChild(div);
        div = document.createElement('h1');
        div.innerHTML = 'NOTAM ID: ' + response.NOTAM_ARR_ID[i];
        li.appendChild(div);
        wrapper.append(li)

        let hr = document.createElement('hr');
        wrapper.appendChild(hr)
    }

    briefing_item = document.getElementById('brief-notam-altn');
    notams = response.NOTAM_ALTN_ID;
    wrapper = briefing_item.querySelector('ul');
    for (let i = 0; i < notams.length; i++) {
        let li = document.createElement('li');
        li.classList.add('briefing-item-li-vertical-left');
        li.classList.add('briefing-item-li-notam');
        const header = document.createElement('p');
        const t_eff = new Date(response.NOTAM_ALTN_DATE_EFF[i]);
        const t_exp = new Date(response.NOTAM_ALTN_DATE_EXP[i]);
        header.innerHTML = t_eff.toUTCString() + ' - ' + t_exp.toUTCString();
        li.appendChild(header);
        let div = document.createElement('h1');
        div.innerHTML = response.NOTAM_ALTN_HTML[i];
        li.appendChild(div);
        div = document.createElement('h1');
        div.innerHTML = 'NOTAM ID: ' + response.NOTAM_ALTN_ID[i];
        li.appendChild(div);
        wrapper.append(li)

        let hr = document.createElement('hr');
        wrapper.appendChild(hr)
    }

}

function leadingZeros(num, n) {
    num = Math.abs(num).toString();
    while (num.length < n) num = "0" + num;
    return num;
}

function leadingSign(num) {
    return (num > 0) ? '+' + num.toString() : num.toString();
}