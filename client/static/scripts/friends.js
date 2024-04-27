const contactsAdd = document.querySelector("#contacts-add");
const contactsSee = document.querySelector("#contacts-see");
const friendRequest = document.querySelector("#friends-request");

const windowMain = document.querySelector(".window-main");

document.addEventListener("click", (e) => {
    resetColors();
    if (contactsAdd.contains(e.target) || contactsSee.contains(e.target) || friendRequest.contains(e.target)){
        if (contactsAdd.contains(e.target)){
            addContact(e);
        }
        e.target.style.color = "orange";
    }
});

function popup(data){
    const popUpFrame = document.createElement("div");
    const popUpDiv = document.createElement("div");
    const p = document.createElement("p");

    //here!
    if (data.warn !== undefined) {
        popUpDiv.style.backgroundColor = "rgba("+255", 0, 0, 0.5);"
    }else{
        popUpDiv.style.backgroundColor = "rgba(255, 0, 0, 0.5);"
    }

    popUpDiv.setAttribute("class", "div-popup");
    popUpFrame.setAttribute("class", "div-popup-frame");
    p.textContent = data.warn || data.success;

    popUpDiv.appendChild(p);
    popUpFrame.appendChild(popUpDiv);

    document.body.insertBefore(popUpFrame, document.body.firstChild);
    setTimeout(()=>{document.body.removeChild(popUpFrame)},2000)
}

function resetColors(){
    contactsAdd.style.color = "#000000";
    contactsSee.style.color = "#000000";
    friendRequest.style.color = "#000000";
}

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

function keyDown(){
    let timer = undefined;
    const inp = document.querySelector("#contacts-input");
    const divOut = document.querySelector('.output-div');

    inp.addEventListener("keydown", (e) => {
        clearTimeout(timer)
            timer = setTimeout(()=>{
                if(e.target.value.length > 2){
                    console.log(e.target.value)
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

function fetchRequests(e){

}


