

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']


function enhanceRenderedContent(root) {
    root.querySelectorAll('a[href^="http"]').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
    });
}


function setupCustomCursor() {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (!finePointer || reduceMotion || !dot || !ring) {
        return;
    }

    let ringX = 0;
    let ringY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let ticking = false;

    const moveCursor = () => {
        ringX += (pointerX - ringX) * 0.18;
        ringY += (pointerY - ringY) * 0.18;
        dot.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        ticking = false;
    };

    window.addEventListener('pointermove', event => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        document.body.classList.add('cursor-ready');

        if (!ticking) {
            requestAnimationFrame(moveCursor);
            ticking = true;
        }
    });

    document.addEventListener('pointerover', event => {
        if (event.target.closest('a, button, .stack-row, .audio-ribbon')) {
            document.body.classList.add('cursor-hover');
        }
    });

    document.addEventListener('pointerout', event => {
        if (event.target.closest('a, button, .stack-row, .audio-ribbon')) {
            document.body.classList.remove('cursor-hover');
        }
    });
}


window.addEventListener('DOMContentLoaded', event => {
    setupCustomCursor();

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
                enhanceRenderedContent(document.getElementById(name + '-md'));
            }).then(() => {
                // MathJax
                if (window.MathJax && MathJax.typeset) {
                    MathJax.typeset();
                }
            })
            .catch(error => console.log(error));
    })

}); 
