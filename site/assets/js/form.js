function infoMessage(message) {
    var growDiv = document.getElementById('info-message');
    if (message === '') {
      growDiv.style.height = 0;
      //growDiv.innerHTML = message;
    } else {
        growDiv.innerHTML = message;
        growDiv.style.height = growDiv.scrollHeight + "px";
        setTimeout(function() {
            lenis.stop();
            lenis.start();
        }, 1000);
    }
 }

 function isEmailValid(email) {
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
 }

var sendAnyway = false;

function formAction(reset = false) {
    let lang = getLanguageFromPath();

    infoMessage('');

    let nameInput = document.getElementById('name');
    let emailInput = document.getElementById('email');
    let subjectInput = document.getElementById('subject');
    let messageTextarea = document.getElementById('message');
    let infoMessageEl = document.getElementById('info-message');
    let submitButton = document.getElementById('submit');

    if (reset) { 
        nameInput.value = '';
        emailInput.value = '';
        subjectInput.value = '';
        messageTextarea.value = '';
        //if (infoMessageEl.innerHTML !== '') { infoMessageEl.classList.remove("show"); }
        //infoMessageEl.innerHTML = '';
        infoMessage('');
        sendAnyway = false;
        return;
    }

    // Check if form is completely empty
    let isFormEmpty = !nameInput.value.trim() && 
                      !emailInput.value.trim() && 
                      !subjectInput.value.trim() && 
                      !messageTextarea.value.trim();

    if (isFormEmpty) {
        let msg = FORM_BUTTONS[lang]['emptyForm'] || FORM_BUTTONS['en']['emptyForm']; 
        infoMessage(msg);
        return; // Don't allow sending at all
    }

    let emailValid = isEmailValid(emailInput.value);
    console.log(emailValid);

    if (!sendAnyway && !emailValid) {
        let msg = FORM_BUTTONS[lang]['invalidEmail'] || FORM_BUTTONS['en']['invalidEmail']; 
        infoMessage(msg);
        sendAnyway = true;
        return;
    }


    let submitButtonText = FORM_BUTTONS[lang]['sending'] || FORM_BUTTONS['en']['sending'];
    submitButton.innerHTML = submitButtonText;


    // send a post request with the data to the path /contact
    fetch(`/${lang}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            subject: subjectInput.value,
            text: messageTextarea.value
        })
    }).then(async (response) => {
        console.log(response.text);

        // reset the submit button text
        let submitButtonText = FORM_BUTTONS[lang]['send'] || FORM_BUTTONS['en']['send'];
        submitButton.innerHTML = submitButtonText;

        if (response.status === 200) {

        
            // load the response text as json
            

            
            formAction(true);
        }
        let j = await response.json();
        console.log(j);
        if (j.ok === true) { formAction(true); }
        //infoMessageEl.innerHTML = j.message;
        infoMessage(j.message);
        //infoMessageEl.classList.add("show");
    })
}


document.addEventListener('DOMContentLoaded', function() {
    var resetButton = document.getElementById('reset');
    var submitButton = document.getElementById('submit');
    resetButton.addEventListener('click', () => formAction(true));
    submitButton.addEventListener('click', () => formAction(false));
});