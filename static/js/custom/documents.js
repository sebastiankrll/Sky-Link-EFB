document.querySelectorAll('#documents-opened>div').forEach((documents_item) => {
    documents_item.addEventListener('click', () => {
        document.querySelectorAll('#documents-opened>div').forEach((documents_item) => {
            documents_item.classList.remove('active');
        })
        documents_item.classList.add('active');
    })
})

document.querySelectorAll('.document-viewer-item').forEach((documents_item) => {
    documents_item.addEventListener('click', () => {
        document.querySelectorAll('.document-viewer-item').forEach((documents_item) => {
            documents_item.classList.remove('active');
        })
        documents_item.classList.add('active');
        const ul = document.getElementById('document-viewer-list').querySelector('ul');
        ul.innerHTML = "";
        let folder_name = documents_item.querySelector('p').innerText;
        getData('/documents/list/', '', (response) => {
            const sResp = response[folder_name.toUpperCase()]
            for (let i = 0; i < sResp.length; i++) {
                let temp = document.getElementById('document-viewer-list-item');
                let tr = document.importNode(temp.content, true);
                tr.querySelector('p').innerHTML = sResp[i]
                tr.querySelector('li').addEventListener('click', () => {
                    addDocumentsTab(folder_name.toLowerCase(), sResp[i])
                    showPDF(folder_name.toLowerCase() + '/' + sResp[i])
                    document.getElementById('document-viewer-explorer').style.display = 'none'
                    document.getElementById('document-viewer-wrapper').style.display = 'flex'
                })
                ul.appendChild(tr);
            }
        });
    })
})

function addDocumentsTab(dir, file) {
    let exists = false
    const opened = document.getElementById('documents-opened')
    opened.querySelectorAll('p').forEach((opened_file) => {
        if (opened_file.innerHTML == file) {
            exists = true
            return
        }
    })
    if (exists) {
        return
    }

    let temp = document.getElementById('documents-opened-item');
    let tr = document.importNode(temp.content, true);
    tr.querySelector('p').innerHTML = file
    const div = tr.querySelector('div')

    document.querySelectorAll('#documents-opened>div').forEach((documents_item) => {
        documents_item.classList.remove('active');
    })
    div.classList.add('active');

    div.addEventListener('click', () => {
        document.querySelectorAll('#documents-opened>div').forEach((documents_item) => {
            documents_item.classList.remove('active');
        })
        div.classList.add('active');
    })
    const span = tr.querySelector('span')
    span.addEventListener('click', (e) => {
        e.stopPropagation()
        div.remove()
        if (div.classList.contains('active')) {
            document.querySelectorAll('#documents-opened>div')[0].classList.add('active')
        }
    })
    div.dataset.file = dir + '/' + file
    opened.appendChild(tr);
}

let pdf_state = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

function showPDF(url) {

    let loadingTask = pdfjsLib.getDocument('./static/media/documents/' + url);
    loadingTask.promise.then((pdf) => {

        pdf_state.pdf = pdf;

        let container = document.getElementById("document-viewer-wrapper");
        let temp = document.getElementById('pdf-viewer');
        let tr = document.importNode(temp.content, true);
        const pdf_viewer = tr.querySelector('.pdf-viewer-container')

        tr.querySelector('.pdf-zoom-in').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }
            if (pdf_state.zoom < 5) {
                pdf_state.zoom *= 1.5;
                pdf_viewer.scrollTop = pdf_viewer.scrollTop * 1.5;
                pdf_viewer.scrollLeft = pdf_viewer.scrollLeft * 1.5;
                render(pdf_viewer);
            }
        })

        tr.querySelector('.pdf-zoom-out').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }
            if (pdf_state.zoom - 0.2 > 0) {
                pdf_state.zoom /= 1.5;
                pdf_viewer.scrollTop = pdf_viewer.scrollTop / 1.5;
                pdf_viewer.scrollLeft = pdf_viewer.scrollLeft / 1.5;
                render(pdf_viewer);
            }
        })

        tr.querySelector('.pdf-fit-height').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }

            let canvas = pdf_viewer.querySelector('canvas');
            pdf_state.zoom *= pdf_viewer.offsetHeight / canvas.offsetHeight;
            pdf_viewer.scrollTop = pdf_viewer.scrollTop * pdf_viewer.offsetWidth / canvas.offsetWidth;
            pdf_viewer.scrollLeft = pdf_viewer.scrollLeft * pdf_viewer.offsetWidth / canvas.offsetWidth;

            render(pdf_viewer);
        })

        tr.querySelector('.pdf-fit-width').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }
            let canvas = pdf_viewer.querySelector('canvas');
            pdf_state.zoom *= pdf_viewer.offsetWidth / canvas.offsetWidth;
            pdf_viewer.scrollTop = pdf_viewer.scrollTop * pdf_viewer.offsetWidth / canvas.offsetWidth;
            pdf_viewer.scrollLeft = pdf_viewer.scrollLeft * pdf_viewer.offsetWidth / canvas.offsetWidth;

            render(pdf_viewer);
        })

        container.appendChild(tr);

        render(pdf_viewer);

    });
}

function render(container) {

    container.innerHTML = ""
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