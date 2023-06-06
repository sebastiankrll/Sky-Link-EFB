let simbrief_status = false;

function initSimbriefData(auto_login) {
    getData('/datasets/simbrief_dataset/', '', (response) => {

        setSimbrief_GENERAL(response);
        setSimbrief_SUMMARY(response);
        setSimbrief_DISPATCHWX(response);
        setSimbrief_NOTAM(response);
        createWaypointList(response);
        animateSimbriefLoader('success');

        if (auto_login) {
            moveLogin();
        }
    });
    getData('/datasets/simbrief_waypoints/', '', (response) => {
        drawWeatherMap()
        drawRouteMap(response)
    });
}

function checkSimbriefEndpoint(login_userId) {
    setData('datapoint', 'userid', login_userId);
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
    getData('/simbrief/status/', '', (response) => {
        if (response.STATUS == true) {
            simbrief_status = true;
            initSimbriefData(false);
        }
    });
}