function processRequest(data){
    fetch("http://localhost/MICROSERVICE_EMAIL/script.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(data => {
        console.log(data);
    }).catch(e =>{
        console.error(e);
    })
}

module.exports = processRequest;