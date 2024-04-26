

function normal(id){
    return atob(id).toString().split("").reverse().join("")
}

const data = {
    "result":
        [
            {"id":17,"nickname":"OrxanGayNot"},
            {"id":18,"nickname":"OrxanGayNot"},
            {"id":19,"nickname":"OrxanGayNot"},
            {"id":20,"nickname":"OrxanGayNot"},
            {"id":21,"nickname":"OrxanGayNot"},
            {"id":13,"nickname":"OrxanGay"},
            {"id":14,"nickname":"OrxanGay"},
            {"id":15,"nickname":"OrxanGay"},
            {"id":16,"nickname":"OrxanGay"},
            {"id":8,"nickname":"OrxanGay"},
            {"id":9,"nickname":"OrxanGay"},
            {"id":10,"nickname":"OrxanGay"},
            {"id":11,"nickname":"OrxanGay"},
            {"id":12,"nickname":"OrxanGay"},
            {"id":123,"nickname":"Orxan"}
        ]
}

data.result.map(el => {
    const info = { id: reverse(el.id), nickname: el.nickname }
    console.log(info)
})

