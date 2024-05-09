//styling
const prev_video = document.getElementById("prev-video");
const greet_container = document.querySelector(".greet-container");
const form_container = document.querySelector(".form-container");
const footer = document.querySelector('footer');

const form = document.querySelector("form");
const pass = document.getElementById("pass-form");
const email = document.getElementById("email-form");

const forgotPassCreator = document.querySelector(".nav-bottom p");

document.addEventListener("DOMContentLoaded", () => {
    let int = Math.floor(Math.random() * 4 + 1);
    const videoSrc = document.createElement("source");
    videoSrc.src = `videos/prev${int}.mp4`;
    videoSrc.type = "video/mp4";
    prev_video.appendChild(videoSrc);

    greet_container.style.animation = "fading 3s"
    form_container.style.display = 'none'
    footer.style.display = 'none';

    setTimeout(() => {
        form_container.style.display = 'flex'
        footer.style.display = 'block'
    },
        3200)
});

//password forgot
const forgotPass = () => {
    const input = prompt("Enter your email to request a password request");
    if (input){
        fetch("/api/v1/forgotPassword", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ email: input })

        }).then(resp => resp.json())
            .then(data => {
                alert(data.success || data.error);
            })
            .catch(err => {
                alert(err);
            })
    }else{
        return alert("Invalid input data")
    }
}

forgotPassCreator.addEventListener("click", forgotPass)

//form submitting

const sendToServer = (data) => {
    fetch("/api/v1/auth/state/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }).then(data =>{
        if (data.ok){
            return data.json()
        }
    })
    .then(response => {
        if (response.success){
            window.location.href = "/";
        }
    })
}

const warn = document.createElement("span");
const span = form_container.children[0].lastElementChild.parentNode.insertBefore(warn, form_container.children[0].lastElementChild.nextSibling);
form_container.lastElementChild.appendChild(warn);
form.addEventListener('submit', (e) => {
    e.preventDefault();
    span.style.color = 'red';
    if (email.value === '' || pass.value === ''){
        span.textContent = '';
        span.textContent = 'empty !!';
    }else if('/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/'.match(email.value)){
        span.textContent = '';
        span.textContent = 'invalid email address!';
    }else if(pass.value.length < 8){
        span.textContent = '';
        span.textContent = 'password must be at least 8 characters';
    }else{
        span.textContent = '';
        const data = {
            email: email.value,
            password: pass.value,
        }
        sendToServer(data);
        console.log(JSON.stringify(data));
    }

})


