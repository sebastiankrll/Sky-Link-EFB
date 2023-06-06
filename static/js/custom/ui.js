let simconnect_status = 'Connecting';
let simconnect_interval

let sim_con_lamp = document.getElementById('sim-connection');
sim_con_lamp.addEventListener('click', () => {
    let timesRun = 0;
    if (simconnect_status == "Connecting") {
        sim_con_lamp.style.animation = 'sim_beacon 1s ease 0s infinite normal forwards';
        simconnect_interval = window.setInterval(() => {
            timesRun += 1;
            if (timesRun == 10) {
                clearInterval(simconnect_interval);
                sim_con_lamp.style.animation = '';
            } else {
                fetchSimconnectStatus();
            }
        }, 3000);
    }
})

function fetchSimconnectStatus() {
    getData('/simconnect/status/', '', (response) => {
        if (response.STATUS == "Sim connected") {
            simconnect_status = 'Success';
            clearInterval(simconnect_interval);
            sim_con_lamp.style.animation = '';
            sim_con_lamp.style.background = 'var(--main-green)';
            let sim_interval = window.setInterval(() => {
                getData('/simconnect/status/', '', (response) => {
                    if (response.STATUS == "Sim not found") {
                        clearInterval(sim_interval)
                        simconnect_status = 'Connecting';
                        sim_con_lamp.style.background = 'var(--main-red)';
                    }
                }),
                    getSimulatorData();
            }, 1000);
        }
    });
}

function getSimulatorData() {
    getData('/datasets/simconnect_location/', '', (response) => {
        drawAirplaneOnMap(response);
    });
}


let btn_no_simbrief = document.getElementById('btn-no-simbrief');
let btn_load_simbrief = document.getElementById('btn-load-simbrief');
let login_userId = document.getElementById('simbrief-user');

btn_no_simbrief.addEventListener('click', moveLogin);
btn_load_simbrief.addEventListener('click', btnLoadSimbrief);

let navs = document.querySelectorAll('nav a');
navs.forEach((nav) => {
    nav.addEventListener('click', () => {
        navs.forEach((nav) => {
            nav.classList.remove('active');
            toggle_notepad.style.fill = 'white';
        })
        nav.classList.add('active');
    })
})

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

function moveLogin() {
    let login_page = document.getElementById('login-page');
    login_page.style.top = '-100%';
}

function btnLoadSimbrief() {
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
    let lds_simbrief = document.getElementById('lds-simbrief');
    let btn_simbrief_p = btn_load_simbrief.querySelector('p');
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
            btn_simbrief_p.innerHTML = '<span style="font">' + callsign + '</span>' + icao_dep + ' &ndash; ' + icao_arr;
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

function saveLocalVariables(name, data) {
    setData('local', name, data);
}

function fetchLocalVariables() {
    getData('/datasets/temp_local/', '', (response) => {
        document.querySelectorAll('.local-variable').forEach((vrb) => {
            if (vrb.type == "checkbox") {
                vrb.checked = response[vrb.dataset.localSave];
            } else {
                vrb.value = response[vrb.dataset.localSave];
            }
        })
        setBriefingEntryFields(); 4
        setBriefingLinks(response);
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

clock();
notepad_startup(document.getElementById('notepad-canvas-notes'));

document.addEventListener('DOMContentLoaded', () => {
    getData('/simbrief/status/', '', (response) => {
        if (response.STATUS == true) {
            simbrief_status = true;
            initSimbriefData(true);
        } else {
            let preloader = document.getElementById('preloader-login');
            let logo = document.querySelector('aside>img');
            let form = document.querySelector('aside form');
            let footer = document.getElementById('login-footer');
            preloader.style.display = 'none';
            logo.style.display = 'inline-block';
            form.style.display = 'grid';
            footer.style.display = 'flex';
            if (response.USER_ID) {
                login_userId.value = response.USER_ID;
            }
        }
    });
    fetchSimconnectStatus();
    fetchLocalVariables();
})