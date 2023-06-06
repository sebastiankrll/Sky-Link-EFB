function createWaypointList(response) {
    const ul = document.querySelector('.navigation-list ul');
    let fixes = response.MAP_IDENT;

    let fir = "";

    for (let i = 0; i < fixes.length; i++) {

        if (response.MAP_FIR[i] != fir) {
            fir = response.MAP_FIR[i];
            let fir_li = document.createElement('li');
            fir_li.classList.add('navigation-list-li-fir');
            fir_li.innerHTML = 'FIR BOUNDARY ' + response.MAP_FIR[i];
            ul.appendChild(fir_li);
        }

        if (response.MAP_IDENT[i] == 'TOC') {
            let fir_li = document.createElement('li');
            fir_li.classList.add('navigation-list-li-fir');
            fir_li.innerHTML = 'Top of Climb';
            ul.appendChild(fir_li);
        }

        if (response.MAP_IDENT[i] == 'TOD') {
            let fir_li = document.createElement('li');
            fir_li.classList.add('navigation-list-li-fir');
            fir_li.innerHTML = 'Top of Descent';
            ul.appendChild(fir_li);
        }

        const t = new Date((+response.MAP_TIME_TOT[i] + +response.MAP_OFF_EST) * 1000);
        let t_delta = ("0" + t.getUTCHours()).slice(-2) + ':' + ("0" + t.getUTCMinutes()).slice(-2);

        let keys = [
            response.MAP_IDENT[i],
            response.MAP_LAT[i],
            response.MAP_AIRWAY[i],
            t_delta,
            response.MAP_FUEL[i],
            response.MAP_HEADING[i],
            response.MAP_SHEAR[i],
            response.MAP_WC[i],
            response.MAP_LONG[i]
        ]

        let temp = document.getElementById('template-navigation-list-li');
        let tr = document.importNode(temp.content, true);
        let fields = tr.querySelectorAll('.navigation-list-li-main p');

        for (let j = 0; j < keys.length; j++) {
            fields[j].innerHTML = keys[j];
            if (i == 0) {
                tr.querySelector('li').classList.add('active');
            }
        }

        keys = [
            t_delta,
            response.MAP_FUEL[i],
            response.MAP_MACH[i],
            response.MAP_FL[i]
        ]

        fields = tr.querySelectorAll('.navigation-list-li-dropdown p');

        for (let j = 0; j < keys.length; j++) {
            fields[j].innerHTML = keys[j];
        }

        let inputs = tr.querySelectorAll('input');
        inputs[0].addEventListener('change', (e) => {

            const li = e.target.parentNode.parentNode;
            const label_dropdown = li.querySelector('.navigation-list-li-dropdown .navigation-list-li-time');
            const label_main = li.querySelector('.navigation-list-li-main .navigation-list-li-time');
            const header_main = li.querySelector('.navigation-list-li-main .navigation-list-li-h1-time');

            if (e.target.value == "") {
                header_main.innerHTML = 'EST TIME';
                label_main.style.color = 'white';
                label_main.innerHTML = label_dropdown.innerHTML;
            } else {
                const t_act = new Date(0, 0, 0, e.target.value.slice(0, 2), e.target.value.slice(-2), 0);
                const t_est = new Date(0, 0, 0, label_dropdown.innerHTML.slice(0, 2), label_dropdown.innerHTML.slice(-2), 0);

                const t_delta = (t_act - t_est) / 60000;

                if (t_delta >= 0) {
                    label_main.innerHTML = '+' + ("0" + Math.floor(Math.abs(t_delta) / 60)).slice(-2) + ':' + ("0" + Math.abs(t_delta) % 60).slice(-2);
                    label_main.style.color = 'var(--main-red)';
                    header_main.innerHTML = '&Delta; TIME';
                } else {
                    label_main.innerHTML = '-' + ("0" + Math.floor(Math.abs(t_delta) / 60)).slice(-2) + ':' + ("0" + Math.abs(t_delta) % 60).slice(-2);
                    label_main.style.color = 'var(--main-green)';
                    header_main.innerHTML = '&Delta; TIME';
                }
            }

        })

        inputs[1].addEventListener('change', (e) => {

            const li = e.target.parentNode.parentNode;
            const label_dropdown = li.querySelector('.navigation-list-li-dropdown .navigation-list-li-fuel');
            const label_main = li.querySelector('.navigation-list-li-main .navigation-list-li-fuel');
            const header_main = li.querySelector('.navigation-list-li-main .navigation-list-li-h1-fuel');

            if (e.target.value == "") {
                header_main.innerHTML = 'EST FUEL';
                label_main.style.color = 'white';
                label_main.innerHTML = label_dropdown.innerHTML;
            } else {

                const t_delta = e.target.value - label_dropdown.innerHTML;

                if (t_delta >= 0) {
                    label_main.innerHTML = '+' + t_delta;
                    label_main.style.color = 'var(--main-green)';
                    header_main.innerHTML = '&Delta; FUEL';
                } else {
                    label_main.innerHTML = t_delta;
                    label_main.style.color = 'var(--main-red)';
                    header_main.innerHTML = '&Delta; FUEL';
                }
            }

        })

        ul.appendChild(tr);
    }

    let dd = document.querySelectorAll('.navigation-list-li-dropdown');
    ul.querySelectorAll('.navigation-list-li-toggle-dropdown').forEach((dropdown, i) => {
        dropdown.addEventListener('click', () => {
            dd[i].classList.toggle('active');
            dropdown.classList.toggle('active');
        })
    })

}

document.querySelector('.navigation-header-toggle-mode').addEventListener('click', (e) => {
    if (e.target.innerHTML == 'Switch To Map Mode') {
        document.querySelector('.navigation-list').style.display = 'none';
        document.getElementById('navigation-map').style.display = 'flex';
        e.target.innerHTML = 'Switch To List Mode';
    } else {
        document.querySelector('.navigation-list').style.display = 'flex';
        document.getElementById('navigation-map').style.display = 'none';
        e.target.innerHTML = 'Switch To Map Mode';
    }
})