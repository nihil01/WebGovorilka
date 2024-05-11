import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const btnHide = document.querySelector('#btn-hide');
const btnShow = document.querySelector('#btn-show');

const chat_list = document.querySelector('.chat-list-container');

const chat = document.querySelector(".chat-container");

let state = false;


const socket = io.connect('https://localhost:8000/');

btnHide.addEventListener("click", (e) => {
    e.preventDefault();
        chat_list.style.display = "none";
        btnHide.style.display = "none";
        btnShow.style.display = "block";
})

btnShow.addEventListener("click", (e) => {
    e.preventDefault();
        chat_list.style.display = "flex";
        btnShow.style.display = "none";
        btnHide.style.display = "block";
})

if (chat_list.children.length === 1){
    const el = document.createElement("p");
    el.textContent = "You have no chats :("
    chat_list.appendChild(el);
}


chat_list.addEventListener('click', async (e) => {
    console.log(e.target)
    if (e.target.nodeName !== 'H2'){
        state = false;
        if (e.target.parentNode.className === "chat-list-container"){
            state = true;
            await loadChat(e.target);
            socket.emit("JOIN_REQUEST", e.target.children[0]["name"]);
            console.log(e.target)
            if (state){
                processMessage();
            }
        }else{
            if (e.target.parentNode.nodeName !== 'MAIN'){
                state = true;
                await loadChat(e.target.parentNode);
                socket.emit("JOIN_REQUEST", e.target.children[0]["name"]);
                console.log(e.target)
                if (state){
                    processMessage();
                }
            }
        }
    }
    state = false;
})

async function loadChat(e){
    const data = await fetch("/api/v1/loadChat", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            userID: e.children[0]["name"].split("_")[1]
        })
    })
    console.log(e.children[0]["name"].split("_")[1])
    createChat(await data.json())
}

function createChat(data){
    chat.innerHTML = "";
    const chatHeader = document.createElement("div");
    const chatArea = document.createElement("div");
    const chatFooter = document.createElement("div");

    chatHeader.setAttribute("class", "chat-header");
    chatArea.setAttribute("class", "chat-area");
    chatFooter.setAttribute("class", "chat-footer");
    //header
    const video = new Image(25, 20);
    video.src = `https://localhost:8000/images/video-call.png`

    const phone = new Image(30, 20);
    phone.src = `https://localhost:8000/images/phone.png`;

    chatHeader.append(phone,video)
    //main area

    data.chat.forEach(el => {
        const friendField = document.createElement("div");
        const p = document.createElement("p");
        const p2 = document.createElement("p");

        if (el.message !== ''){
            if (el.user !== "You"){
                friendField.setAttribute("class", "friend-field");
                p.textContent = el.message;
                p.style.marginBottom = "5px";
                p2.textContent = el.date ;
                p2.style.fontSize = "9px";
                friendField.append(p,p2);
            }else {
                friendField.setAttribute("class", "your-field");
                p.textContent = el.message;
                p.style.marginBottom = "5px";
                p2.textContent = el.date;
                p2.style.fontSize = "9px";
                friendField.append(p,p2);
            }
        }
        chatArea.appendChild(friendField)
    })



    //footer area
    const input = document.createElement("input");
    const input2 = document.createElement("input");
    const form = document.createElement("form");

    form.method = "post";
    form.id = "form-sbm"

    input.type = "text";
    input.id = "input-field";
    input.placeholder = "Type a message ..";

    input2.type = "submit";
    input2.value = 'Send';
    input2.id = "btn-sbm";

    form.append(input, input2);

    chatFooter.appendChild(form);

    chat.append(chatHeader, chatArea, chatFooter);
}

function processMessage(){
    const form = document.querySelector("#form-sbm");
    const inp_field = document.querySelector("#input-field");
    const chat = document.querySelector(".chat-area");

    socket.on("new_message", (cb)=>{
        const div = document.createElement("div");
        div.setAttribute("class", "friend-field");
        div.textContent = cb;
        chat.appendChild(div);
    })

    form.addEventListener("submit", (e)=>{
        e.preventDefault();
        if (inp_field.value.trim() !== ''){
            const div = document.createElement("div");
            div.setAttribute("class", "your-field");
            div.textContent = inp_field.value;
            chat.appendChild(div);
            socket.emit("message", inp_field.value);
            inp_field.value = "";
        }
    })
}