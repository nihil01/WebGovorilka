
const profileActions = document.querySelector(".profile-actions");
for (let child of profileActions.children){
    child.onclick = () => applyDropdownToChildren(child);
}

//FINISH HERE!
function applyDropdownToChildren(child){
    if (child.querySelector(".dropdown-list")){
        child.removeChild(child.querySelector(".dropdown-list"));
    }else{
        console.log(child.attributes.getNamedItem)
        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown-list");
        child.appendChild(dropdown);
    }
}