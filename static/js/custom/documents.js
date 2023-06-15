
document.getElementById('documents-opened-folders').addEventListener('click', () => {
    document.querySelectorAll('.documents-opened-item').forEach((documents_item) => {
        documents_item.classList.remove('active');
    })
    document.getElementById('documents-opened-folders').classList.add('active');
    document.getElementById('document-viewer-explorer').style.display = ''
    document.getElementById('document-viewer-wrapper').style.display = ''
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
                    addDocument(folder_name.toLowerCase(), sResp[i])
                })
                ul.appendChild(tr);
            }
        });
    })
})

function redirectToDocument(file) {
    const wrapper = document.getElementById('document-viewer-wrapper')
    document.getElementById('document-viewer-explorer').style.display = 'none'
    wrapper.style.display = 'flex'
    wrapper.querySelectorAll('.pdf-viewer').forEach((pdf_viewer) => {
        if (pdf_viewer.dataset.file == file) {
            pdf_viewer.style.display = 'flex'
        } else {
            pdf_viewer.style.display = 'none'
        }
    })
    document.querySelectorAll('.documents-opened-item').forEach((documents_item) => {
        if (documents_item.dataset.file == file) {
            documents_item.classList.add('active');
        } else {
            documents_item.classList.remove('active');
        }
    })
}

function addDocument(dir, file) {
    let exists = false
    const opened = document.getElementById('documents-opened-scroller')
    opened.querySelectorAll('p').forEach((opened_file) => {
        if (opened_file.innerHTML == file) {
            exists = true
            return
        }
    })
    if (exists) {
        redirectToDocument(dir + '/' + file)
        return
    } else {
        showPDF(dir + '/' + file)
    }

    let temp = document.getElementById('documents-opened-item');
    let tr = document.importNode(temp.content, true);
    tr.querySelector('p').innerHTML = file
    const div = tr.querySelector('div')

    document.querySelectorAll('.documents-opened-item').forEach((documents_item) => {
        documents_item.classList.remove('active');
    })
    div.classList.add('active');

    div.addEventListener('click', () => {
        redirectToDocument(dir + '/' + file)
    })

    const span = tr.querySelector('span')
    span.addEventListener('click', (e) => {
        e.stopPropagation()
        div.remove()
        if (div.classList.contains('active')) {
            document.getElementById('documents-opened-folders').classList.add('active')
        }
        document.getElementById('document-viewer-explorer').style.display = ''
        const wrapper = document.getElementById('document-viewer-wrapper')
        wrapper.style.display = ''
        wrapper.querySelectorAll('.pdf-viewer').forEach((pdf_viewer) => {
            if (pdf_viewer.dataset.file == div.dataset.file) {
                pdf_viewer.remove()
            }
        })
    })
    div.dataset.file = dir + '/' + file
    opened.appendChild(tr);
    redirectToDocument(dir + '/' + file)
}

function showPDF(url) {

    let pdf_state = {
        pdf: null,
        zoom: 1,
        currentPage: 1,
        init: true
    }

    let xDown = null;
    let yDown = null;

    let loadingTask = pdfjsLib.getDocument({
        url: './static/media/documents/' + url
    });
    loadingTask.promise.then((pdf) => {

        pdf_state.pdf = pdf;

        let container = document.getElementById("document-viewer-wrapper");
        let temp = document.getElementById('pdf-viewer');
        let tr = document.importNode(temp.content, true);
        tr.querySelector('.pdf-viewer').dataset.file = url;
        const pdf_viewer = tr.querySelector('.pdf-viewer-container')
        const pageInput = tr.querySelector('.pdf-page-current input')
        pageInput.value = 1
        tr.querySelector('.pdf-page-current p').innerHTML = '/ ' + pdf.numPages

        tr.querySelector('.pdf-zoom-in').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }
            if (pdf_state.zoom < 5) {
                pdf_state.zoom *= 1.5;
                pdf_viewer.scrollTop = pdf_viewer.scrollTop * 1.5;
                pdf_viewer.scrollLeft = pdf_viewer.scrollLeft * 1.5;
                pdf_viewer.innerHTML = ""
                render(pdf_viewer, pdf_state);
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
                pdf_viewer.innerHTML = ""
                render(pdf_viewer, pdf_state);
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

            pdf_viewer.innerHTML = ""
            render(pdf_viewer, pdf_state);
        })

        tr.querySelector('.pdf-fit-width').addEventListener('click', () => {
            if (pdf_state.pdf == null) {
                return;
            }
            let canvas = pdf_viewer.querySelector('canvas');
            pdf_state.zoom *= pdf_viewer.offsetWidth / canvas.offsetWidth;
            pdf_viewer.scrollTop = pdf_viewer.scrollTop * pdf_viewer.offsetWidth / canvas.offsetWidth;
            pdf_viewer.scrollLeft = pdf_viewer.scrollLeft * pdf_viewer.offsetWidth / canvas.offsetWidth;

            pdf_viewer.innerHTML = ""
            render(pdf_viewer, pdf_state);
        })

        pageInput.addEventListener('change', (e) => {
            if (pdf_state.pdf == null || e.target.valueAsNumber < 1 || e.target.valueAsNumber > pdf_state.pdf.numPages) {
                pageInput.value = pdf_state.currentPage
                return;
            }
            pdf_state.currentPage = e.target.valueAsNumber

            pdf_viewer.innerHTML = ""
            render(pdf_viewer, pdf_state);
        })

        function swipePage(direction) {
            if (direction) {
                if (pdf_state.pdf == null || pdf_state.currentPage == 1) {
                    return;
                }
                pdf_state.currentPage -= 1
                pageInput.value = pdf_state.currentPage
            } else {
                if (pdf_state.pdf == null || pdf_state.currentPage == pdf_state.pdf.numPages) {
                    return;
                }
                pdf_state.currentPage += 1
                pageInput.value = pdf_state.currentPage
            }
            pdf_viewer.innerHTML = ""
            render(pdf_viewer, pdf_state);
        }

        tr.querySelector('.pdf-page-prev').addEventListener('click', () => {
            swipePage(true)
        })

        tr.querySelector('.pdf-page-next').addEventListener('click', () => {
            swipePage(false)
        })

        tr.querySelector('.pdf-viewer').addEventListener('touchstart', handlePDFTouchStart, false);
        tr.querySelector('.pdf-viewer').addEventListener('touchmove', handlePDFTouchMove, false);

        function getTouches(evt) {
            return evt.touches || evt.originalEvent.touches;
        }

        function handlePDFTouchStart(evt) {
            const firstTouch = getTouches(evt)[0];
            xDown = firstTouch.clientX;
            yDown = firstTouch.clientY;
        };

        function handlePDFTouchMove(evt) {
            let canvas = pdf_viewer.querySelector('canvas');
            if (pdf_viewer.offsetHeight / canvas.offsetHeight < 1) {
                xDown = null;
                yDown = null;
                return
            }

            evt.preventDefault();
            if (!xDown || !yDown) {
                return;
            }

            let xUp = evt.touches[0].clientX;
            let yUp = evt.touches[0].clientY;

            let xDiff = xDown - xUp;
            let yDiff = yDown - yUp;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 0) {
                    swipePage(false)
                } else {
                    swipePage(true)
                }
            } else {
                if (yDiff > 0) {
                    swipePage(false)
                } else {
                    swipePage(true)
                }
            }
            xDown = null;
            yDown = null;
        };

        container.appendChild(tr);
        render(pdf_viewer, pdf_state);

    });
}

function render(container, pdf_state) {

    pdf_state.pdf.getPage(pdf_state.currentPage).then((page) => {

        let viewport = page.getViewport({ scale: pdf_state.zoom });
        let div = document.createElement("div");

        if (pdf_state.init) {
            pdf_state.init = false
            pdf_state.zoom *= container.offsetHeight / viewport.height
            viewport = page.getViewport({ scale: pdf_state.zoom })
        }

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