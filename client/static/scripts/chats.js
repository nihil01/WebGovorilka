const btnHide = document.querySelector('#btn-hide');
const btnShow = document.querySelector('#btn-show');

const chat_list = document.querySelector('.chat-list-container');
const chat_container = document.querySelector('.chat-container');

const svg = document.querySelector('.details svg');
const dropdown = document.querySelector('.dropdown-content');
// const dropdownMenu = document.querySelector('.dropdown-menu');
let flag = false;
svg.onclick = function () {
    if (!flag){
        dropdown.style.display = "block";
        flag = true;
    }else{
        dropdown.style.display = "none";
        flag = false;
    }
}

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