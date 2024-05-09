const btnHide = document.querySelector('#btn-hide');
const btnShow = document.querySelector('#btn-show');

const chat_list = document.querySelector('.chat-list-container');

const chat = document.querySelector(".chat-container");

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

let flag2 = false;
chat_list.addEventListener('click', (e) => {
    if (e.target.nodeName !== 'H2'){
        if (e.target.parentNode.className === "chat-list-container"){
            !flag2 ? e.target.style.border = '1px solid red' : e.target.style.border = '1px solid black';
            loadChat(e.target);
        }else{
            if (e.target.parentNode.nodeName !== 'MAIN'){
                !flag2 ? e.target.parentNode.style.border = '1px solid red' : e.target.parentNode.style.border = '1px solid black';
                loadChat(e.target.parentNode);
            }
        }
        flag2 = !flag2;
    }
})

async function loadChat(e){
    const data = await fetch("/api/v1/loadChat", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({userID: parseInt(e.children[0]["name"])})
    })
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
        if (el.message !== ''){
            if (el.user !== "You"){
                friendField.setAttribute("class", "friend-field");
                friendField.textContent = el.message;
            }else {
                friendField.setAttribute("class", "your-field");
                friendField.textContent = el.message;
            }
        }
        chatArea.appendChild(friendField)
    })



    //footer area
    const input = document.createElement("input");
    const input2 = document.createElement("input")
    input.type = "text"
    input.placeholder = "Type a message .."

    input2.type = "submit"
    input2.value = 'Send'
    input2.id = "btn-sbm"

    chatFooter.append(input,input2)

    chat.append(chatHeader, chatArea, chatFooter)
}
