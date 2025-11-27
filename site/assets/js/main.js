let lenis = new Lenis({
    lerp: 0.05, // Lower values create a smoother scroll effect
    smoothWheel: true // Enables smooth scrolling for mouse wheel events
});

// Make lenis available globally
window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

// Sticky header with blur on scroll
window.addEventListener('DOMContentLoaded', function() {
    const headerWrapper = document.querySelector('.header-wrapper');
    if (headerWrapper) {
        lenis.on('scroll', ({ scroll }) => {
            if (scroll > 50) {
                headerWrapper.classList.add('scrolled');
            } else {
                headerWrapper.classList.remove('scrolled');
            }
        });
    }
});

if(window.location.hash) {
    var hash = window.location.hash
    window.location.hash = '';
    setTimeout(function() {
        lenis.scrollTo(hash);
        window.location.hash = hash;
    }, 500);
    
    //alert (hash);
    //alert(window.location.href)
    // hash found
} 

const FORM_BUTTONS = {
    'en': {
        'send': 'Send',
        'sending': 'Sending...',
        'invalidEmail': "You haven't entered an email address, or the one you entered does not look valid. If you want to continue anyway, press \"Send\" again.",
        'emptyForm': "The form is completely empty. Please fill in at least the message field before sending."
    },
    'se': {
        'send': 'Skicka',
        'sending': 'Skickar...',
        'invalidEmail': "Du har inte angett en e-postadress, eller den du angav ser ogiltig ut. Om du vill fortsätta ändå, tryck på \"Skicka\" igen.",
        'emptyForm': "Formuläret är helt tomt. Vänligen fyll i åtminstone meddelandefältet innan du skickar."
    },
    'es': {
        'send': 'Enviar',
        'sending': 'Enviando...',
        'invalidEmail': "No has introducido una dirección de correo electrónico, o la que has introducido no parece válida. Si quieres continuar de todos modos, presiona \"Enviar\" de nuevo.",
        'emptyForm': "El formulario está completamente vacío. Por favor, rellena al menos el campo de mensaje antes de enviar."
    }
};


function scrollToTop() {
    console.log("scrollToTop", lenis); 
    // scroll to top smoothly, maybe use the library lenis
    lenis.scrollTo("top");
}

function getLanguageFromPath() {
    let defaultLanguage = 'en';
    let path = window.location.pathname;
    
    let match = path.match(/^\/(en|se|es)(\/|$)/);
    console.log(match);
    if (match) {
        return match[1];
    }
    return defaultLanguage;
}

function changeLanguage() {
    var languageSwitcherSelect = document.getElementById('language-switcher');
    var selectedLanguage = languageSwitcherSelect.options[languageSwitcherSelect.selectedIndex].value

    let defaultLanguage = 'en';
    let remainingLanguages = ['se', 'es'];
    let path = window.location.pathname;
    let pathRemaining = path.replace(/\/(en|se|es)\//, '');
    
    if (path.match(/\/(en|se|es)\/?/)) {
        if ( selectedLanguage === defaultLanguage ) {
            console.log("case 1")
            path = path.replace(/\/(en|se|es)\/?/, '');
            console.log("new path is", path, "pathRemaining is", pathRemaining)
        } else {
            console.log("case 2", path)
            //path = path.replace(/\/(en|se|es)\//, selectedLanguage);
            
            path = path.replace(/\/(en|se|es)\//, '/' + selectedLanguage + '/');
            console.log("new path is", path, "pathRemaining is", pathRemaining)         
        }
    } else {
        console.log("case 3")
        path = '/' + selectedLanguage;
        console.log("new path is", path, "pathRemaining is", pathRemaining)
        // if the length of pathRemaining is greater than 0, then append it to the path, adding a slash if the pathRemaining or the path does not start with a slash
        if (pathRemaining.length > 0) {
            if (pathRemaining[0] !== '/' && path[path.length - 1] !== '/') {
                path += '/';
            }
            path += pathRemaining;
        }
    }

    // load the new path
    window.location.href = path.length == 0 || path[0] != '/' ? '/' + path : path;  
}




// on dom loaded
document.addEventListener('DOMContentLoaded', function() {
    var languageSwitcherSelect = document.getElementById('language-switcher');
    languageSwitcherSelect.addEventListener('change', changeLanguage);
});