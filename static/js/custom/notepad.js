document.getElementById('toggle-notepad').parentNode.addEventListener('click', (e) => {
    e.target.style.fill = 'var(--highlight-blue)';
    window.location.href = '#notepad';
    document.querySelectorAll('nav a').forEach((nav) => {
        nav.classList.remove('active');
    })
})

document.querySelectorAll('.notepad-bar-item').forEach((note_bar_item) => {
    note_bar_item.addEventListener('click', () => {
        if (note_bar_item.dataset.clear == 'true') {
            ctx.clearRect(0, 0, notepad_cv.width, notepad_cv.height);
        } else {
            if (note_bar_item.dataset.color) {
                ctx_color = note_bar_item.dataset.color;
            }
            if (note_bar_item.dataset.linewidth) {
                ctx_width = note_bar_item.dataset.linewidth;
            }
            if (note_bar_item.dataset.eraser) {
                eraser_mode = (note_bar_item.dataset.eraser == 'false') ? false : true;
            }
        }
    })
})

function notepad_startup(notepad, parent) {

    const ongoingTouches = [];
    let ctx_color = 'white';
    let ctx_width = 2;
    let eraser_mode = false;
    const rect = notepad.getBoundingClientRect();

    const notepad_cv = notepad.querySelector('canvas');
    notepad_cv.width = notepad.offsetWidth;
    notepad_cv.height = notepad.offsetHeight;
    const ctx = notepad_cv.getContext("2d");

    notepad.addEventListener("touchstart", handleStart);
    notepad.addEventListener("touchend", handleEnd);
    notepad.addEventListener("touchcancel", handleCancel);
    notepad.addEventListener("touchmove", handleMove);

    function handleStart(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            ongoingTouches.push(copyTouch(touches[i]));
        }
    }

    function handleMove(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const idx = ongoingTouchIndexById(touches[i].identifier, ongoingTouches);

            if (idx >= 0) {
                ctx.beginPath();
                if (eraser_mode) {
                    ctx.globalCompositeOperation = "destination-out";
                } else {
                    ctx.globalCompositeOperation = "source-over";
                }
                console.log(touches[i].pageY - notepad_cv.offsetTop)
                ctx.moveTo(ongoingTouches[idx].pageX - rect.left, ongoingTouches[idx].pageY - rect.top);
                ctx.lineTo(touches[i].pageX - rect.left, touches[i].pageY - rect.top);
                ctx.lineWidth = ctx_width;
                ctx.strokeStyle = ctx_color;
                ctx.stroke();

                ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
            }
        }
    }

    function handleEnd(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            let idx = ongoingTouchIndexById(touches[i].identifier, ongoingTouches);

            if (idx >= 0) {
                ongoingTouches.splice(idx, 1);
            }
        }
    }

    function handleCancel(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            let idx = ongoingTouchIndexById(touches[i].identifier, ongoingTouches);
            ongoingTouches.splice(idx, 1);
        }
    }

    function copyTouch({ identifier, pageX, pageY }) {
        return { identifier, pageX, pageY };
    }

    function ongoingTouchIndexById(idToFind) {
        for (let i = 0; i < ongoingTouches.length; i++) {
            const id = ongoingTouches[i].identifier;

            if (id === idToFind) {
                return i;
            }
        }
        return -1;
    }

}