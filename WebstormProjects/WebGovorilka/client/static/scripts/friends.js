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

function resetColors(){
    contactsAdd.style.color = "#000000";
    contactsSee.style.color = "#000000";
    friendRequest.style.color = "#000000";
}

function fetchContacts(e){

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
            fetch(`/fetch/contactList/${e.target.value}`)
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
                        data.forEach(element => {
                            const divBlock = document.createElement('div');
                            divBlock.setAttribute('class', 'user-val')
                            divBlock.style.display = "flex";
                            const a = document.createElement("a");
                            a.href = `https://localhost:8000/user?addFriend=${element.id}`

                            const p = document.createElement("p");
                            p.textContent = `${element.nickname}`

                            const img = document.createElement("img");
                            img.src = "https://localhost:8000/images/envelope.png";
                            img.title = "Click to send friend request"
                            img.style.width = "20px"
                            a.appendChild(img)


                            divBlock.appendChild(p);
                            divBlock.appendChild(a);

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


