const contactsAdd = document.querySelector("#contacts-add");
const contactsSee = document.querySelector("#contacts-see");
const friendRequest = document.querySelector("#friends-request");

const windowMain = document.querySelector(".window-main");

document.addEventListener("click", (e) => {
    resetColors();
    if (contactsAdd.contains(e.target) || contactsSee.contains(e.target) || friendRequest.contains(e.target)){
        if (contactsAdd.contains(e.target)){
            addContact(e);
        }else if (contactsSee.contains(e.target)){
            getContacts(e);
        }else if (friendRequest.contains(e.target)){
            getRequests(e);
        }
        e.target.style.color = "orange";
    }
});

function addContact(e){
    e.preventDefault();
    windowMain.innerHTML = "";

    const divInp = document.createElement('input-div')
    const input = document.createElement("input");

    const divOut = document.createElement('div')

    input.type = "text";
    input.id = "contacts-input";
    input.placeholder = "Try to add contacts!"

    divOut.setAttribute('class','output-div');

    divInp.appendChild(input);
    windowMain.appendChild(divInp);
    windowMain.appendChild(divOut);

    keyDown();

}

function getContacts(e){
    e.preventDefault();
    fetch("/fetch?userState=showFriends")
        .then(response =>{
            if (response.ok){
                return response.json();
            }
        })
        .then(data => {
            windowMain.innerHTML = "";
            const divOuter = document.createElement("div");
            !data.error ? data.friendsInfo.forEach(friend => {
                const divInner = document.createElement("div");
                divInner.setAttribute("class","inner-div");
                divInner.textContent = friend.nickname;

                const img = document.createElement("img");
                img.src = "https://localhost:8000/images/envelope.png";
                img.title = "Click to send friend request";
                img.style.width = "20px";

                divOuter.appendChild(img);
                divOuter.appendChild(divInner);
            }): divOuter.textContent = data.error
            windowMain.appendChild(divOuter);
        })
        .catch(e => {
            console.error(e)
        })
}

function getRequests(e){
    e.preventDefault();
    fetch("/fetch?userState=showRequests")
        .then(response => {
            if (response.ok){
                return response.json();
            }
        })
        .then(data => {
            windowMain.innerHTML = "";
            const divFrame = document.createElement("div");
            divFrame.setAttribute('class','div-frame');
            !data.error ? data.forEach(item => {
                const divInner = document.createElement("div");
                const p1 = document.createElement("p");
                const p2 = document.createElement("p");
                divInner.setAttribute('class','div-inner');

                p1.textContent = item.nickname;
                divInner.appendChild(p1);

                divFrame.appendChild(divInner);
                divInner.style.display = "flex"

                const btnSubmit = document.createElement("button");
                const btnReject = document.createElement("button");
                const btnBlock = document.createElement("button");

                btnReject.textContent = "Reject";
                btnSubmit.textContent = "Submit";
                btnBlock.textContent = "Block";

                btnReject.onclick = () => rejectRequest(item.id);
                btnSubmit.onclick = () =>submitRequest(item.id);
                btnBlock.onclick = () => blockRequest(item.id);

                p2.appendChild(btnSubmit);
                p2.appendChild(btnReject);
                p2.appendChild(btnBlock);

                divInner.appendChild(p1);
                divInner.appendChild(p2);
                divFrame.appendChild(divInner);
            }) : divFrame.textContent = data.error;

            windowMain.appendChild(divFrame)
        })
        .catch(e => {
            console.error(e);
        })
}

//HELPER
function addFriend(friendID){
    fetch(`/fetch/user?addFriend=${friendID}`)
        .then(resp => {
            if (resp.ok){
                return resp.json();
            }
        })
        .then(data=>{
            popup(data)
        })
        .catch(err => {
            console.log(err)
            return err;
        })
}


function keyDown(){
    let timer = undefined;
    const inp = document.querySelector("#contacts-input");
    const divOut = document.querySelector('.output-div');

    inp.addEventListener("keydown", (e) => {
        clearTimeout(timer)
            timer = setTimeout(()=>{
                if(e.target.value.length > 2){
                    subFunc()
                }
            },1500)
         function subFunc(){
            fetch(`/fetch/userList/${e.target.value}`)
                .then(response => {
                    if (response.ok){
                        return response.json()
                    }
                })
                .then(data => {
                    divOut.innerHTML = "";
                    const divBlock = document.createElement('div');
                    divBlock.setAttribute('class', 'user-val')

                    if (data.length === 0){
                        const p = document.createElement("p");
                        p.textContent = `No users with such nickname (`
                        divBlock.appendChild(p);
                        divOut.appendChild(divBlock);
                    }else{
                         data.forEach(async element => {
                            const divBlock = document.createElement('div');
                            divBlock.setAttribute('class', 'user-val')
                            divBlock.style.display = "flex";
                            const p = document.createElement("p");
                            p.style.cursor = "pointer";
                            p.onclick = () => addFriend(element.id);

                            const p2 = document.createElement("p");
                            p2.textContent = `${element.nickname}`

                            const img = document.createElement("img");
                            img.src = "https://localhost:8000/images/envelope.png";
                            img.title = "Click to send friend request"
                            img.style.width = "20px"
                            p.appendChild(img)


                            divBlock.appendChild(p2);
                            divBlock.appendChild(p);

                            divOut.appendChild(divBlock);
                        })
                    }
                })
                .catch(e => {
                    console.error(e)
                })
        }
    })
}

//BUNDLE FOR REQUEST PROCESSING (HELPER)
function blockRequest(user_id){
    fetch("/fetch/user?userID="+user_id+"&requestType=block")
        .then(res => res.json())
        .then(data => {
            popup(data)
        })
}

function rejectRequest(user_id){
    fetch("/fetch/user?userID="+user_id+"&requestType=reject")
        .then(res => res.json())
        .then(data => {
            popup(data)
        })
}

function submitRequest(user_id){
    fetch("/fetch/user?userID="+user_id+"&requestType=submit")
        .then(res => res.json())
        .then(data => {
            popup(data)
        })
}

//VISUAL
function popup(data){
    const popUpFrame = document.createElement("div");
    const popUpDiv = document.createElement("div");
    const p = document.createElement("p");

    if (data.warn || data.error) {
        popUpDiv.style.backgroundColor = `rgba(${255}, ${0}, ${0}, ${0.85})`
    }else{
        popUpDiv.style.backgroundColor = `rgba(${58}, ${207}, ${65}, ${0.85})`
    }

    popUpDiv.setAttribute("class", "div-popup");
    popUpFrame.setAttribute("class", "div-popup-frame");
    p.textContent = data.warn || data.success || data.error;
    popUpDiv.appendChild(p);
    popUpFrame.appendChild(popUpDiv);

    document.body.insertBefore(popUpFrame, document.body.firstChild);

    setTimeout(()=>{
        document.body.removeChild(popUpFrame)
    },2000);
}

function resetColors(){
    contactsAdd.style.color = "#000000";
    contactsSee.style.color = "#000000";
    friendRequest.style.color = "#000000";
}
