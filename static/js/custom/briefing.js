document.querySelectorAll('.briefing-folder li:not(.briefing-folder-li)').forEach((briefing_link, i) => {
    let briefing_items = document.querySelectorAll('.briefing-item');
    briefing_link.addEventListener('click', () => {
        document.querySelectorAll('.briefing-folder li:not(.briefing-folder-li)').forEach((briefing_link) => {
            briefing_link.classList.remove('active');
        })
        briefing_items.forEach((briefing_item) => {
            briefing_item.classList.remove('active');
        })
        briefing_link.classList.add('active');
        briefing_items[i].classList.add('active');
        document.getElementById('flt-fldr-title').innerHTML = briefing_link.innerHTML;
        saveLocalVariables(briefing_link.dataset.localSave, true)
        briefing_link.classList.add('checked');
    })
})

document.getElementById('briefing-folder-sign').addEventListener('click', () => {
    
    let popup = document.getElementById('flightplan-signature-popup');
    popup.innerHTML = "";
    let temp = document.getElementById('template-flightplan-signature');
    let tr = document.importNode(temp.content, true);
    popup.appendChild(tr);
    popup.style.display = 'inline-block';
    let close_popup = popup.querySelector('.popup-title button');

    close_popup.addEventListener('click', () => {
        popup.style.display = 'none';
    })
    notepad_startup(document.getElementById('notepad-canvas-sign'))
})

function setBriefingLinks(response) {
    document.querySelectorAll('.briefing-folder li:not(.briefing-folder-li)').forEach((briefing_link) => {
        if (response[briefing_link.dataset.localSave]) {
            briefing_link.classList.add('checked');
        }
    })
}

function setBriefingEntryFields() {
    document.querySelectorAll('.briefing-item-data-insert').forEach((data_insert) => {
        let btn_cancel = data_insert.nextElementSibling;
        let input = btn_cancel.nextElementSibling;

        if (input.value) {
            data_insert.style.display = 'none';
            input.style.display = 'flex';
            if (!data_insert.classList.contains('no-cancel')) {
                btn_cancel.style.display = 'inline-block';
                btn_cancel.innerHTML = 'Delete';
            }
            if (input.tagName == 'TEXTAREA') {
                input.style.height = input.scrollHeight + 'px';
            }
        }

        data_insert.addEventListener('click', () => {
            data_insert.style.display = 'none';
            if (!data_insert.classList.contains('no-cancel')) {
                btn_cancel.style.display = 'inline-block';
            }
            input.style.display = 'flex';
            input.focus();
        })
        btn_cancel.addEventListener('click', () => {
            data_insert.style.display = '';
            data_insert.nextElementSibling.style.display = '';
            input.style.display = '';
            input.value = '';
            if (!data_insert.classList.contains('no-cancel')) {
                btn_cancel.innerHTML = 'Cancel';
            }
            saveLocalVariables(input.dataset.localSave, input.value)
        })
        input.addEventListener('input', () => {
            if (!data_insert.classList.contains('no-cancel')) {
                if (input.value == "") {
                    btn_cancel.innerHTML = 'Cancel';
                } else {
                    btn_cancel.innerHTML = 'Delete';
                }
            }
            if (input.tagName == 'TEXTAREA') {
                input.style.height = input.scrollHeight + 'px';
            }
        })
        input.addEventListener('change', () => {
            if (input.value == "") {
                input.style.display = '';
                btn_cancel.style.display = '';
                data_insert.style.display = '';
            }
            if (input.type == "checkbox") {
                saveLocalVariables(input.dataset.localSave, input.checked);
            } else {
                saveLocalVariables(input.dataset.localSave, input.value);
            }
        })
        input.addEventListener('focusout', () => {
            if (input.value == "") {
                input.style.display = '';
                btn_cancel.style.display = '';
                data_insert.style.display = '';
            }
        })
    })
}