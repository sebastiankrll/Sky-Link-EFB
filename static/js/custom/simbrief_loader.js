let icao_dep;
let icao_arr;
let callsign;

function setSimbrief_GENERAL(response) {

    let callsign_class = document.querySelectorAll('.callsign');
    let icao_dep_class = document.querySelectorAll('.icao_dep');
    let icao_arr_class = document.querySelectorAll('.icao_arr');
    let iata_dep_class = document.querySelectorAll('.iata_dep');
    let iata_arr_class = document.querySelectorAll('.iata_arr');
    let name_dep_class = document.querySelectorAll('.name_dep');
    let name_arr_class = document.querySelectorAll('.name_arr');
    let sched_out_date_class = document.querySelectorAll('.sched_out_date');
    let sched_out_class = document.querySelectorAll('.sched_out');
    let sched_in_date_class = document.querySelectorAll('.sched_in_date');
    let sched_in_class = document.querySelectorAll('.sched_in');
    let dispatch_info_class = document.querySelectorAll('.dispatch_info');

    setSimbriefData(callsign_class, response.CALLSIGN);
    setSimbriefData(icao_dep_class, response.ICAO_DEP);
    setSimbriefData(icao_arr_class, response.ICAO_ARR);
    setSimbriefData(iata_dep_class, response.IATA_DEP);
    setSimbriefData(iata_arr_class, response.IATA_ARR);
    setSimbriefData(name_dep_class, response.NAME_DEP);
    setSimbriefData(name_arr_class, response.NAME_ARR);

    icao_dep = response.ICAO_DEP;
    icao_arr = response.ICAO_ARR;
    callsign = response.CALLSIGN;

    setSimbriefData(sched_out_date_class, response.DATE_OUT_SCHED);
    setSimbriefData(sched_out_class, response.TIME_OUT_SCHED);
    setSimbriefData(sched_in_date_class, response.DATE_IN_SCHED);
    setSimbriefData(sched_in_class, response.TIME_IN_SCHED);

    setSimbriefData(dispatch_info_class, response.DISPATCH_HEADER);
}

function setSimbrief_SUMMARY(response) {

    let briefing_item = document.getElementById('brief-flt-summary');
    let p_fields = briefing_item.querySelectorAll('p');
    let keys = [
        "CREW_CAPT",
        "AC_ID",
        "ROUTE",
        "GND_DIST",
        "AIR_DIST",
        "CI",
        "FUEL_FACTOR",
        "AVG_WC",
        "ISA",
        "ZFW_EST",
        "TOW_EST",
        "LDW_EST",
        "ALTN",
        "STEP_CLIMB",
        "DISPATCH_REMARKS",
        "CREW_DX",
        "CREW_FO",
        "CREW_PU",
        "CREW_FA"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

    briefing_item = document.getElementById('brief-time-summary');
    p_fields = briefing_item.querySelectorAll('p');
    keys = [
        "TIME_OUT_SCHED",
        "TIME_OFF_SCHED",
        "TIME_ON_SCHED",
        "TIME_IN_SCHED",
        "TIME_OUT_EST",
        "TIME_OFF_EST",
        "TIME_ON_EST",
        "TIME_IN_EST",
        "TIME_IMPACTS_WEIGHT_UP",
        "TIME_IMPACTS_WEIGHT_DN",
        "TIME_IMPACTS_FL_UP",
        "TIME_IMPACTS_FL_DN",
        "TIME_IMPACTS_CI_DN",
        "TIME_IMPACTS_CI_UP"
    ]

    setInterval(() => {
        p_fields[1].innerHTML = timeToUTC(Date.now()) + ' UTC';
        p_fields[2].innerHTML = timeToUTC(Date.now() + response.TIME_UTC_OFF_DEP * 3600000) + ' (UTC ' + leadingSign(response.TIME_UTC_OFF_DEP) + ')';
        p_fields[3].innerHTML = timeToUTC(Date.now() + response.TIME_UTC_OFF_ARR * 3600000) + ' (UTC ' + leadingSign(response.TIME_UTC_OFF_ARR) + ')';
    }, 1000);

    for (let i = 4; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 4]];
    }

    briefing_item = document.getElementById('brief-weight-summary');
    p_fields = briefing_item.querySelectorAll('p');
    keys = [
        "WEIGHT_MAX_TOW",
        "WEIGHT_MAX_LDW",
        "WEIGHT_MAX_ZFW",
        "WEIGHT_MAX_FUEL",
        "TOW_EST",
        "LDW_EST",
        "ZFW_EST",
        "WEIGHT_FUEL_RAMP",
        "WEIGHT_FUEL_BURN",
        "WEIGHT_FUEL_CONT",
        "WEIGHT_FUEL_ALTN",
        "WEIGHT_FUEL_RES",
        "WEIGHT_FUEL_MIN",
        "WEIGHT_FUEL_EXT",
        "WEIGHT_FUEL_TO",
        "WEIGHT_FUEL_TAXI",
        "WEIGHT_FUEL_RAMP",
        "WEIGHT_FUEL_FIN",
        "WEIGHT_FUEL_AVG_FLOW",
        "WEIGHT_PAX",
        "WEIGHT_BAG",
        "WEIGHT_PAX_W",
        "WEIGHT_BAG_W",
        "WEIGHT_CARGO",
        "WEIGHT_PAYLOAD",
        "WEIGHT_IMPACTS_WEIGHT_UP",
        "WEIGHT_IMPACTS_WEIGHT_DN",
        "WEIGHT_IMPACTS_FL_UP",
        "WEIGHT_IMPACTS_FL_DN",
        "WEIGHT_IMPACTS_CI_DN",
        "WEIGHT_IMPACTS_CI_UP"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

    briefing_item = document.getElementById('brief-alternate-summary');
    p_fields = briefing_item.querySelectorAll('p');
    keys = [
        "ALTN",
        "ALTN_FL",
        "ALTN_DIST",
        "ALTN_WIND",
        "ALTN_FUEL",
        "ALTN_ROUTE"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

}

function setSimbrief_DISPATCHWX(response) {

    let briefing_item = document.getElementById('brief-dispatch-wx-dep');
    let p_fields = briefing_item.querySelectorAll('p');
    let keys = [
        "DISPATCH_METAR_DEP",
        "DISPATCH_TAF_DEP"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

    briefing_item = document.getElementById('brief-dispatch-wx-arr');
    p_fields = briefing_item.querySelectorAll('p');
    keys = [
        "DISPATCH_METAR_ARR",
        "DISPATCH_TAF_ARR"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

    briefing_item = document.getElementById('brief-dispatch-wx-altn');
    p_fields = briefing_item.querySelectorAll('p');
    keys = [
        "DISPATCH_METAR_ALTN",
        "DISPATCH_TAF_ALTN"
    ]

    for (let i = 1; i < p_fields.length; i++) {
        p_fields[i].innerHTML = response[keys[i - 1]];
    }

    briefing_item = document.getElementById('brief-dispatch-wx-enr-list');
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

function capitalize(str) {
    let lower = str.toLowerCase();
    let split_lower = lower.split(' ');
    for (let i = 0; i < split_lower.length; i++) {
        let first = split_lower[i].charAt(0);
        let upper = first.toUpperCase();
        split_lower[i] = upper + split_lower[i].slice(1);
    }
    return split_lower.join(' ');
}

function leadingZeros(num, n) {
    num = Math.abs(num).toString();
    while (num.length < n) num = "0" + num;
    return num;
}

function leadingSign(num) {
    return (num > 0) ? '+' + num.toString() : num.toString();
}

function setSimbriefData(elements, data) {
    elements.forEach(element => {
        element.innerHTML = data;
    });
}