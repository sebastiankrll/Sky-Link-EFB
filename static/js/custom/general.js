
// Flask POST and GET

function flaskGet(url, datapoint, callback) {
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

function flaskSet(dir, datapoint_name, valueToUse) {
    let request = new XMLHttpRequest();
    request.open('POST', '/' + dir + '/' + datapoint_name + '/set', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        value_to_use: valueToUse
    }));
}

// Communication to simulator through SimConnect API

let sim_connect = {
    status: false,
    interval: null
}

document.getElementById('sim-connection').addEventListener('click', (e) => {
    let timesRun = 0;
    if (!sim_connect.status) {
        e.target.style.animation = 'sim_beacon 1s ease 0s infinite normal forwards';
        sim_connect.interval = window.setInterval(() => {
            timesRun += 1;
            if (timesRun == 10) {
                clearInterval(sim_connect.interval);
                e.target.style.animation = '';
            } else {
                fetchSimconnectStatus();
            }
        }, 3000);
    }
})

function fetchSimconnectStatus() {
    flaskGet('/simconnect/status/', '', (response) => {
        if (response.STATUS == "Sim connected") {
            sim_connect.status = true;
            clearInterval(sim_connect.interval);
            const sim_con_lamp = document.getElementById('sim-connection')
            sim_con_lamp.style.animation = '';
            sim_con_lamp.style.background = 'var(--main-green)';
            let sim_interval = window.setInterval(() => {
                flaskGet('/simconnect/status/', '', (response) => {
                    if (response.STATUS == "Sim not found") {
                        clearInterval(sim_interval)
                        sim_connect.status = false;
                        sim_con_lamp.style.background = 'var(--main-red)';
                    }
                }),
                    getSimulatorData();
            }, 1000);
        }
    });
}

function getSimulatorData() {
    flaskGet('/datasets/simconnect_location/', '', (response) => {
        drawAirplaneOnMap(response);
    });
}

// Login page handler

document.getElementById('btn-no-simbrief').addEventListener('click', moveLogin);
document.getElementById('btn-load-simbrief').addEventListener('click', btnLoadSimbrief);

document.querySelectorAll('nav a').forEach((nav) => {
    nav.addEventListener('click', () => {
        document.querySelectorAll('nav a').forEach((nav) => {
            nav.classList.remove('active');
            document.getElementById('toggle-notepad').style.fill = 'white';
        })
        nav.classList.add('active');
    })
})

function moveLogin() {
    let login_page = document.getElementById('login-page');
    login_page.style.top = '-100%';
}

function btnLoadSimbrief() {
    const login_userId = document.getElementById('simbrief-user');
    if (login_userId.value) {
        checkSimbriefEndpoint(login_userId.value);
    } else {
        login_userId.style.animationName = "none";
        login_userId.style.animationPlayState = 'paused';
        requestAnimationFrame(() => {
            setTimeout(() => {
                login_userId.style.animationName = "";
                login_userId.style.animationPlayState = 'running';
            }, 0);
        });
    }
}

function animateSimbriefLoader(status) {
    const btn_no_simbrief = document.getElementById('btn-no-simbrief');
    const btn_load_simbrief = document.getElementById('btn-load-simbrief');
    const lds_simbrief = document.getElementById('lds-simbrief');
    const btn_simbrief_p = btn_load_simbrief.querySelector('p');
    switch (status) {
        case 'loading':
            btn_simbrief_p.style.display = 'none';
            lds_simbrief.style.display = 'inline-block';
            btn_load_simbrief.style.background = 'var(--main-red)';
            btn_no_simbrief.innerHTML = 'Continue without flight plan';
            break;
        case 'success':
            btn_simbrief_p.style.display = 'inline-block';
            lds_simbrief.style.display = 'none';
            // btn_simbrief_p.innerHTML = '<span style="font">' + callsign + '</span>' + icao_dep + ' &ndash; ' + icao_arr;
            btn_load_simbrief.style.background = 'var(--main-green)';
            btn_no_simbrief.innerHTML = 'Continue';
            break;
        case 'error':
            btn_simbrief_p.style.display = 'inline-block';
            lds_simbrief.style.display = 'none';
            btn_simbrief_p.innerHTML = 'No flight plan found';
            btn_load_simbrief.style.background = 'var(--main-red)';
            btn_no_simbrief.innerHTML = 'Continue without flight plan';
            break;
        default:
            btn_simbrief_p.style.display = 'inline-block';
            lds_simbrief.style.display = 'none';
            btn_simbrief_p.innerHTML = 'Load flight plan';
            btn_load_simbrief.style.background = 'var(--main-red)';
            btn_no_simbrief.innerHTML = 'Continue without flight plan';
            break;
    }
}

// Helper functions

function timeToUTC(t) {
    const stamp = new Date(t);
    let h = stamp.getUTCHours();
    let m = stamp.getUTCMinutes();
    return ((h.toString().length < 2) ? '0' + h : h) + ":" + ((m.toString().length < 2) ? '0' + m : m);
}

function clock() {
    document.getElementById('time').innerHTML = timeToUTC(Date.now()) + ' UTC';
    setTimeout(clock, 1000);
}

function saveLocalVariables(name, data) {
    flaskSet('local', name, data);
}

function fetchLocalVariables() {
    flaskGet('/datasets/temp_local/', '', (response) => {
        document.querySelectorAll('.local-variable').forEach((vrb) => {
            if (vrb.type == "checkbox") {
                vrb.checked = response[vrb.dataset.localSave];
            } else {
                vrb.value = response[vrb.dataset.localSave];
            }
        })
        setBriefingEntryFields()
        setBriefingLinks(response)
    });
}

document.body.addEventListener('touchstart', () => {
    document.activeElement.blur();
})

screen.orientation.addEventListener('change', () => {
    let changed = false;
    navs.forEach((nav, i) => {
        if (nav.classList.contains('active')) {
            document.querySelectorAll('section')[i].scrollIntoView();
            changed = true;
        }
    })
    if (!changed) {
        document.querySelectorAll('section')[5].scrollIntoView();
    }
})

// Initial state on page load

clock();
notepad_startup(document.getElementById('notepad-canvas-notes'));

document.addEventListener('DOMContentLoaded', () => {
    flaskGet('/simbrief/status/', '', (response) => {
        if (response.STATUS == true) {
            simbrief_status = true;
            initSimbriefData(true);
        } else {
            let preloader = document.getElementById('preloader-login');
            let logo = document.querySelector('#login-page img');
            let form = document.querySelector('#login-page form');
            let footer = document.getElementById('login-footer');
            preloader.style.display = 'none';
            logo.style.display = 'inline-block';
            form.style.display = 'grid';
            footer.style.display = 'flex';
            const login_userId = document.getElementById('simbrief-user');
            if (response.USER_ID) {
                login_userId.value = response.USER_ID;
            }
        }
    });
    fetchSimconnectStatus();
    fetchLocalVariables();
})