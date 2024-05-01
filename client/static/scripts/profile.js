const profileActions = document.querySelector(".profile-actions");

for (let child of profileActions.children){
    child.children[0].onclick = () => applyDropdownToChildren(child);
}

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

function applyDropdownToChildren(child){
    if (child.querySelector(".dropdown-list")){
        child.removeChild(child.querySelector(".dropdown-list"));
    }else{
        const type = child.attributes.id.nodeValue;
        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown-list");

        if (type === "passChange"){
            const input1 = document.createElement("input");
            const input2 = document.createElement("input");
            const input3 = document.createElement("input");
            const submit = document.createElement("input");
            const label = document.createElement("label");
            const div = document.createElement("div");
            let clicked = false;
            input1.placeholder = "Old password .."; input2.placeholder = "New password ..";
            input1.type = "password"; input2.type = "password";input3.type = "checkbox";
            input3.id = "checkbox";
            input3.onclick = () => {
                if (!clicked){
                    input1.type = "text"
                    input2.type = "text"
                }else{
                    input1.type = "password"
                    input2.type = "password"
                }
                clicked =!clicked;
            }
            label.textContent = "show pass";
            label.htmlFor = "checkbox";
            submit.type = "submit";

            submit.onclick = () => {
                fetch("/api/v1/request/change-password", {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({pass1: input1.value, pass2: input2.value}),
                }).then(resp =>{
                    if (resp.ok){
                        return resp.json();
                    }
                }).then(async data => {
                    await popup(data);
                    if (data.success){
                        location.reload()
                    }

                }).catch(err => {
                    console.error(err);
                })
            }
            div.append(label, input3)
            dropdown.append(input1, input2, div, submit)
        }else if(type === "bioChange"){
            const textarea = document.createElement("textarea");
            const input = document.createElement("input");
            textarea.maxLength = 300;
            textarea.placeholder = "Max length 300 symbols";
            input.type = "submit";

            input.onclick = () => {
                fetch("/api/v1/request/change-bio", {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({data: textarea.value})
                }).then(resp =>{
                    if (resp.ok){
                        return resp.json();
                    }
                }).then(data => {
                    popup(data);
                }).catch(err => {
                    console.error(err);
                })
            }
            dropdown.append(textarea, input);
        }else if(type === "avatarChange"){
            const form = document.createElement("form");
            form.action = "/api/v1/request/change-avatar";
            form.method = "post";
            form.enctype = "multipart/form-data";

            const input = document.createElement("input");
            const button = document.createElement("input");
            input.type = "file";
            input.name = "avatar";
            button.type = "submit";
            form.append(input, button);
            dropdown.appendChild(form);

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                await fetch(
                    form.action, {
                        method: form.method,
                        body: formData
                    })
                    .then(resp => resp.json())
                    .then(data => {
                        popup(data);
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
        }else {
            const input = document.createElement("input");
            input.type = "submit"

            input.onclick = () => {
                fetch("/fetch/request/logout").then(resp =>{
                    if (resp.ok){
                        return resp.json();
                    }
                }).then(data => {
                    if (data.success){
                        location.reload();
                    }
                }).catch(err => {
                    console.error(err);
                })
            }
            dropdown.appendChild(input);
        }
        child.appendChild(dropdown);
    }
}
