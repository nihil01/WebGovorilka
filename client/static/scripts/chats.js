import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

function allowNotifications(){
    if (Notification.permission === "default"){
        alert("For better user experience, we recommend you to allow notifications for incoming calls")
        Notification.requestPermission();
    }
}


allowNotifications()

const btnHide = document.querySelector('#btn-hide');
const btnShow = document.querySelector('#btn-show');

const chat_list = document.querySelector('.chat-list-container');

const chat = document.querySelector(".chat-container");

let state = false;


const socket = io.connect('https://localhost:8000/');

socket.on("incomingCall", (e) => {
    // document.body.style.background = "rgba(0, 0, 0, 0.5);"
    const panel = document.createElement("div");
    panel.setAttribute("class", "panelOuter");
    let data = document.createElement("div");
    data.textContent = `Incoming call: ${e.user} `;

    const pickUp = document.createElement("button");
    const pickDown = document.createElement("button");
    pickDown.textContent = "Pick Down";
    pickDown.onclick = () => {
        document.body.removeChild(document.querySelector('.panelOuter'));
    }
    pickUp.textContent = "Pick Up";
    pickUp.onclick = () => {
        window.open(e.joinLink, "_blank");
    }
    data.append(pickDown, pickUp)

    setTimeout(() => {
        document.body.removeChild(document.querySelector('.panelOuter'));
    }, 10000);

    panel.appendChild(data);
    document.body.insertBefore(panel, document.body.firstChild)

    new Notification(`${e.user} is calling to you`, { icon: "https://localhost:8000/images/phone.png", lang: "en-US",
        requireInteraction: true});
})

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


const elements = chat_list.getElementsByClassName("friend-container");
for (let i = 0; i < elements.length; i++) {
    elements.item(i).addEventListener("click", async (e) => {
        for (let j = 0; j < elements.length; j++) {
            elements.item(j).style.border = "1px solid black";
        }

        state = false;
        if (e.target.className !== "friend-container") {
            state = true;
            await loadChat(e.target.parentNode.childNodes[1]["name"]);
            socket.emit("JOIN_REQUEST", e.target.parentNode.childNodes[1]["name"]);
            if (state) {
                processMessage();
            }
            e.target.parentNode.style.border = "1px solid red";
        } else {
            state = true;
            await loadChat(e.target.childNodes[1]["name"]);
            socket.emit("JOIN_REQUEST", e.target.childNodes[1]["name"]);
            if (state) {
                processMessage();
            }
            e.target.style.border = "1px solid red";
        }
        state = false;
    });
}



async function loadChat(e){
    const data = await fetch("/api/v1/loadChat", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            userID: e.split("_")[1]
        })
    })
    createChat(await data.json(), e);
}

function createChat(data, e){
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
    video.title = "Click to start a video call!";
    video.onclick = () => {
        new MakeACall("video", `${e.split("_")[1]}`, `${e.split("_")[0]}`);
    };

    const phone = new Image(30, 20);
    phone.src = `https://localhost:8000/images/phone.png`;
    phone.title = "Click to start an audio call!";

    phone.onclick = () => {
        new MakeACall("audio", `${e.split("_")[1]}`, `${e.split("_")[0]}`);
    };

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

class MakeACall{
    constructor(callType, userID, callerID) {
        this.type = callType;
        this.userID = userID;
        this.callerID = callerID;
        this._call();
    }

    static status = '';


    _checkUserStatus(userId){
        return new Promise((resolve, reject) => {
            socket.emit("checkUserStatus", userId);
            socket.on("checkUserStatus", (data) => {
                !data ? MakeACall.status = "OFFLINE" : MakeACall.status = "ONLINE";
                resolve(MakeACall.status);
            })
            setTimeout(()=>{ reject("TIMEOUT NO STATUS") },3000)
        })

    }

     _genID(){
        return crypto.randomUUID();
    }

    _sendRequest(data){
        socket.emit("sendRequestToRecipient", this.userID, this.callerID, data);
    }

    async _reroute(type){
        let data;

        switch (type){
            case "audio":
                data = `/call?session=${this._genID()}&re=${this.callerID}_${this.userID}&audio=true`;
                await this._sendRequest(data)
                window.location.href = data;
                break;
            case "video":
                data = `/call?session=${this._genID()}&re=${this.callerID}_${this.userID}&audio=true&video=true`;
                await this._sendRequest(data)
                window.location.href = data;
                break;
        }
    }

    async _call(){
        await this._checkUserStatus(this.userID);
        await this._reroute(this.type);
    }

}
