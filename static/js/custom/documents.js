let pdf_state = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

function showPDF(url) {
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then((pdf) => {

        pdf_state.pdf = pdf;
        render();

    });
}

function render() {

    let container = document.getElementById("pdf-viewer-container");
    container.innerHTML = "";

    for (let i = 1; i <= pdf_state.pdf.numPages; i++) {

        pdf_state.pdf.getPage(i).then((page) => {

            let viewport = page.getViewport({ scale: pdf_state.zoom });
            let div = document.createElement("div");

            div.setAttribute("id", "page-" + (page._pageIndex + 1));
            container.appendChild(div);

            let canvas = document.createElement("canvas");
            div.appendChild(canvas);

            let context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.oImageSmoothingEnabled = false;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (window.devicePixelRatio > 1) {
                let canvasWidth = canvas.width;
                let canvasHeight = canvas.height;

                canvas.width = canvasWidth * window.devicePixelRatio;
                canvas.height = canvasHeight * window.devicePixelRatio;
                canvas.style.width = canvasWidth + "px";
                canvas.style.height = canvasHeight + "px";

                context.scale(window.devicePixelRatio, window.devicePixelRatio);
            }

            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            page.render(renderContext);
        });
    }
}

document.getElementById('pdf-zoom-in').addEventListener('click', () => {
    if (pdf_state.pdf == null) {
        return;
    }
    if (pdf_state.zoom < 5) {
        pdf_state.zoom *= 1.5;
        let viewer = document.getElementById('pdf-viewer-container');
        viewer.scrollTop = viewer.scrollTop * 1.5;
        viewer.scrollLeft = viewer.scrollLeft * 1.5;
        render();
    }
})

document.getElementById('pdf-zoom-out').addEventListener('click', () => {
    if (pdf_state.pdf == null) {
        return;
    }
    if (pdf_state.zoom - 0.2 > 0) {
        pdf_state.zoom /= 1.5;
        let viewer = document.getElementById('pdf-viewer-container');
        viewer.scrollTop = viewer.scrollTop / 1.5;
        viewer.scrollLeft = viewer.scrollLeft / 1.5;
        render();
    }
})

document.getElementById('pdf-fit-height').addEventListener('click', () => {
    if (pdf_state.pdf == null) {
        return;
    }

    let viewer = document.getElementById('pdf-viewer-container');
    let canvas = viewer.querySelector('canvas');
    pdf_state.zoom *= viewer.offsetHeight / canvas.offsetHeight;
    viewer.scrollTop = viewer.scrollTop * viewer.offsetWidth / canvas.offsetWidth;
    viewer.scrollLeft = viewer.scrollLeft * viewer.offsetWidth / canvas.offsetWidth;

    render();
})

document.getElementById('pdf-fit-width').addEventListener('click', () => {
    if (pdf_state.pdf == null) {
        return;
    }
    let viewer = document.getElementById('pdf-viewer-container');
    let canvas = viewer.querySelector('canvas');
    pdf_state.zoom *= viewer.offsetWidth / canvas.offsetWidth;
    viewer.scrollTop = viewer.scrollTop * viewer.offsetWidth / canvas.offsetWidth;
    viewer.scrollLeft = viewer.scrollLeft * viewer.offsetWidth / canvas.offsetWidth;

    render();
})

window.addEventListener('load', () => {
    showPDF('./static/media/test.pdf');
});