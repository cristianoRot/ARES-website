let patchesData = [];
let patchesShown = 0;
const PATCHES_STEP = 3;

document.addEventListener('DOMContentLoaded', () => {
    loadComponent();
});

async function loadComponent() {
    const components = [
        { id: 'hero-section', url: 'pages/hero-section/hero-section.html' },
        { id: 'info-section', url: 'pages/info-section/info-section.html' },
        { id: 'game-features', url: 'pages/game-features/game-features.html'},
        { id: 'game-modes', url: 'pages/game-modes/game-modes.html' },
        { id: 'dev-section', url: 'pages/development-section/dev-section.html' },
        { id: 'popup-view', url: 'pages/popup/popup.html' },
        { id: 'support-section', url: 'pages/support/support.html' },
        { id: 'footer-container', url: 'pages/footer/footer.html' }
    ];

    const loadingScreen = document.getElementById('loading-screen');
    let loadedComponents = 0;
    const totalComponents = components.length;

    const loadPromises = components.map(component => {
        return fetch(component.url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(component.id).innerHTML = data;
                loadedComponents++;

                if (component.id === 'dev-section') {
                    return loadPatches();
                }
                if (component.id === 'support-section') {
                    loadSupportPackages();
                    updateSupportProgressBar();
                }
            })
            .catch(error => {
                console.error(`Error while loading ${component.id}:`, error);
                loadedComponents++;
            });
    });

    await Promise.all(loadPromises.map(p => p.catch(e => console.error("Error in Promise.all:", e))));

    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.classList.add('loaded');
            initializeAnimations();
            trackVisit();
        }, 500);
    } else {
        document.body.classList.add('loaded');
        initializeAnimations();
        trackVisit();
    }
}

async function loadPatches() {
    try {
        const response = await fetch('pages/development-section/patches.json');
        patchesData = await response.json();
        patchesShown = 0;
        renderPatches();
    } catch (err) {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML += '<p style="color:red;">Failed to load updates.</p>';
        console.error('Error loading patches:', err);
    }
}

function renderPatches() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '<div class="timeline-bar"></div>';

    const toShow = patchesData.slice(0, patchesShown + PATCHES_STEP);
    toShow.forEach(patch => {
        const patchBlock = document.createElement('div');
        patchBlock.className = 'patch-block';
        patchBlock.innerHTML = `
            <div class="absolute left-4 transform -translate-x-1/2 mt-1.5 w-2 h-2 rounded-full bg-ares-red"></div>
            <div class="pl-10">
                <div class="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <svg class="note-svg" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>${patch.date}</span>
                </div>
                <h3 class="text-xl font-bold mb-2">${patch.name}</h3>
                <p class="text-gray-400">${patch.description}</p>
            </div>
        `;
        timeline.appendChild(patchBlock);
    });

    patchesShown = toShow.length;

    // Gestione pulsante "View More"
    let viewMoreBtn = document.getElementById('view-more-patches');
    if (!viewMoreBtn) {
        viewMoreBtn = document.createElement('button');
        viewMoreBtn.id = 'view-more-patches';
        viewMoreBtn.className = 'button-secondary';
        viewMoreBtn.textContent = 'View More';
        viewMoreBtn.style.display = 'block';
        viewMoreBtn.style.margin = '32px auto 0 auto';
        viewMoreBtn.onclick = function () {
            renderPatches();
        };
        timeline.parentElement.appendChild(viewMoreBtn);
    }
    if (patchesShown >= patchesData.length) {
        viewMoreBtn.style.display = 'none';
    } else {
        viewMoreBtn.style.display = 'block';
    }
}

function initializeAnimations() {
    // Inizializza gli observer per le animazioni delle card
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('card-container-1')) {
                    entry.target.querySelector('.card-container-image').classList.add('visible-from-left');
                } else {
                    entry.target.querySelector('.card-container-image').classList.add('visible-from-right');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.card-container-1, .card-container-2').forEach(container => {
        cardObserver.observe(container);
    });

    // Inizializza gli observer per il dev-section (se presente)
    const devSection = document.querySelector('#dev-section');
    if (devSection) {
        const header = devSection.querySelector('.development-header');
        const patches = devSection.querySelector('.w-full');
        const form = devSection.querySelector('.form');

        if (header && patches && form) {
            const devObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            }, { threshold: 0.1 });

            [header, patches, form].forEach(element => {
                devObserver.observe(element);
            });
        }
    }
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
}

function watchTrailer() {
    alert("Trailer coming soon!");
}

function trackVisit() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        return;

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbz9xoXyjKQkZ9JII9QN9FsexqzIvTPDA_CIUjYR9Ye6fPA1F21QJ0y6cie0Cl6HsIE9/exec';

    const clientTimestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;

    const body = new URLSearchParams();
    body.append('clientTimestamp', clientTimestamp);
    body.append('userAgent', userAgent);
    body.append('referrer', referrer);

    fetch(scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        console.log('Visit tracked:', data);
    })
    .catch(error => {
        console.error('Error tracking visit:', error);
    });
}

function saveContactFromPopup(event) {
    event.preventDefault();
    let emailInput = document.getElementById('popup-email');
    let nameInput = document.getElementById('popup-name');
    
    popupLoading();
    
    saveContact(nameInput, emailInput)
        .then(data => {
            if (data.result === "success") {
                popupSuccess();
                emailInput.value = '';
                nameInput.value = '';
            } else {
                popupFailed();
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            popupFailed();
            console.error('Error:', error);
        });
}

function saveContactFromForm(event) {
    event.preventDefault();
    let emailInput = document.getElementById('form-email');
    let nameInput = document.getElementById('form-name');
    
    formLoading(); 
    
    saveContact(nameInput, emailInput)
        .then(data => {
            if (data.result === "success") {
                formSuccess();
                emailInput.value = '';
                nameInput.value = '';
            } else {
                formFailed();
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            formFailed();
            console.error('Error:', error);
        });
}

function saveContact(nameInput, emailInput) {
    return new Promise((resolve, reject) => {
        if (emailInput instanceof HTMLInputElement && nameInput instanceof HTMLInputElement) {
            let email = emailInput.value.trim();
            let name = nameInput.value.trim();

            console.log('Email:', email);
            console.log('Name:', name);

            if (email !== '' && name !== '') {
                let body = `email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

                fetch("https://script.google.com/macros/s/AKfycbwk2Y3NK5rzZaVB6KbOTYfcG5QUM8ir1Qk-cGv48SkjYCtVnc9WRWx2sCg3ahOu_Qbv/exec", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: body
                })
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
            } else {
                reject(new Error('Please enter both a valid name and email.'));
            }
        } else {
            reject(new Error('Invalid input elements'));
        }
    });
}

function popupLoading() {
    let popupCta = document.getElementById('popup-cta');
    let loader = document.getElementById('loader-popup');

    popupCta.style.display = 'none';
    loader.style.display = 'block';
}

function popupSuccess() {
    let popup = document.getElementById('popup');
    let loader = document.getElementById('loader-popup');
    let popupSuccess = document.getElementById('popup-success');

    loader.style.display = 'none';
    popup.style.display = 'none';
    popupSuccess.style.display = 'block';
}

function popupFailed() {
    let popup = document.getElementById('popup');
    let loader = document.getElementById('loader-popup');
    let popupFailed = document.getElementById('popup-failed');

    loader.style.display = 'none';
    popup.style.display = 'none';
    popupFailed.style.display = 'block';
}

function openPopup() {
    popupReset();
    document.body.classList.add('popup-active');
    document.querySelector('.popup-view').classList.add('active');
}

function closePopup() {
    document.body.classList.remove('popup-active');
    document.querySelector('.popup-view').classList.remove('active');
}

function popupReset() {
    let popup = document.getElementById('popup');
    let popupSuccess = document.getElementById('popup-success');
    let popupFailed = document.getElementById('popup-failed');
    let loader = document.getElementById('loader-bar');

    popup.style.display = 'block';
    popupSuccess.style.display = 'none';
    popupFailed.style.display = 'none';
    loader.style.display = 'none';
}

function formLoading() {
    const formContent = document.getElementById('form-content');
    const formLoading = document.getElementById('form-loading');
    const formSuccess = document.getElementById('form-success');
    
    formContent.style.display = 'none';
    formLoading.style.display = 'block';
    formSuccess.style.display = 'none';
}

function formSuccess() {
    const formContent = document.querySelector('.form-content');
    const formLoading = document.querySelector('.form-loading');
    const formSuccess = document.querySelector('.form-success');
    
    formContent.style.display = 'none';
    formLoading.style.display = 'none';
    formSuccess.style.display = 'block';
}

function formFailed() {
    const formContent = document.querySelector('.form-content');
    const formLoading = document.querySelector('.form-loading');
    const formSuccess = document.querySelector('.form-success');
    
    formContent.style.display = 'block';
    formLoading.style.display = 'none';
    formSuccess.style.display = 'none';
    alert('Something went wrong. Please try again.');
}

function setupPayPalDonationButton(card) {
    const supportButton = card.querySelector('button');

    supportButton.addEventListener('click', () => {
        const existingWrapper = document.getElementById('paypal-donate-wrapper');

        if (!existingWrapper) {
            const wrapper = document.createElement('div');
            wrapper.id = 'paypal-donate-wrapper';
            wrapper.style.display = 'none';
            document.body.appendChild(wrapper);

            const donateDiv = document.createElement('div');
            donateDiv.id = 'donate-button';
            wrapper.appendChild(donateDiv);

            const script = document.createElement('script');
            script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js';
            script.charset = 'UTF-8';
            script.onload = () => {
                PayPal.Donation.Button({
                    env: 'production',
                    hosted_button_id: 'RB4QWTEXCBHT4',
                    image: {
                        src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif',
                        alt: 'Donate with PayPal button',
                        title: 'PayPal - The safer, easier way to pay online!',
                    }
                }).render('#donate-button');
            };
            document.body.appendChild(script);
        } else {
            existingWrapper.style.display = 'block';
            existingWrapper.querySelector('img')?.click();
        }
    });
}

function loadSupportPackages() {
    fetch('pages/support/packages.json')
        .then(res => res.json())
        .then(packages => {
            const container = document.getElementById('support-packages');
            if (!container) return;
            container.innerHTML = '';
            packages.forEach(pkg => {
                const card = document.createElement('div');
                card.className = 'package-card';
                card.innerHTML = `
                    <div class="package-info">
                        <div class="package-title">${pkg.title}</div>
                        <ul class="package-content">
                            ${pkg.content.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="package-side">
                        <div class="package-price">${pkg.price}</div>
                        <button type="button" class="button-primary">
                            <span class="button_text">Support</span>
                        </button>
                    </div>
                `;
                container.appendChild(card);
                setupPayPalDonationButton(card);
            });
        });
}

function updateSupportProgressBar() {
    const raisedEl = document.getElementById('funds-raised');
    const goalEl = document.getElementById('funds-goal');
    const barFill = document.querySelector('.progress-bar-fill');
    if (!raisedEl || !goalEl || !barFill) return;

    // Rimuove simboli e virgole, poi converte in numero
    const raised = parseFloat(raisedEl.textContent.replace(/[^0-9.]/g, ''));
    const goal = parseFloat(goalEl.textContent.replace(/[^0-9.]/g, ''));
    let percent = 0;
    if (goal > 0) {
        percent = Math.min((raised / goal) * 100, 100);
    }
    barFill.style.width = percent + "%";
}