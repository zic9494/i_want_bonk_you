export async function Can_bonk_list(){
    const BonkList = document.getElementById("bonk_page")
    var Innerhtml = `<label style="color: black;">Pick one to Bonk<br><br></label><div id="Can_bonk_list" >`

    const resp = await fetch(
        `http://localhost:3000/api/GetStretch`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
    )
    var data = await resp.json()
    data = data.recordset
    var index=[0, 1, 2]
    if (data.length>3){
        index = generateUniqueRandomNumbers(0, data.length - 1)
    }
    var Name_list = []
    for (var i = 0; i<3;i++){
        Name_list.push(await GetPeopleData(data[index[i]].User_name))
        Innerhtml +=`
        <div class="user-avatar TargetUser" id="user-avatar-image${i}">
            <img src="${Name_list[i].PhotoBase64}" alt="User Avatar">
            <h5>${data[index[i]].User_name}<br>Max get：12<br>Need：12</h5>
            <img id="selected${i}" src="./images/箭頭.png" class="arrow">
        </div>`
    }
    Innerhtml += "</div>"
    BonkList.innerHTML = Innerhtml
    var mousemoveList = []
    var mouseleaveList = []
    for (let i = 0; i < 3; i++) {
        let Id_name = "user-avatar-image" + i;
        let Selected = "selected" + i;
    
        let mousemoveHandler = () => {
            document.getElementById(Selected).style.display = "block";
        };
        let mouseleaveHandler = () => {
            document.getElementById(Selected).style.display = "none";
        };
        console.log(mousemoveHandler);
    
        document.getElementById(Id_name).addEventListener("mousemove", mousemoveHandler);
        document.getElementById(Id_name).addEventListener("mouseleave", mouseleaveHandler);

        mousemoveList.push(mousemoveHandler)
        mouseleaveList.push(mouseleaveHandler)
    }
    for (let i = 0; i < 3; i++){
        var Id_name = "user-avatar-image" + i;
        let clickHonder = document.getElementById(Id_name).addEventListener("click",()=>{
            for (let j=0 ; j<3 ; j++){
                document.getElementById("user-avatar-image" + j).removeEventListener("mousemove", mousemoveList[j])
                document.getElementById("user-avatar-image" + j).removeEventListener("mouseleave", mouseleaveList[j])
            }
            console.log(Name_list);
            if (document.getElementById("Target").value=="-1"){
                document.getElementById("Target").value = index[i]
                let btn = document.getElementById("Bonk")
                btn.disabled = false
            }
        })
    }
}

async function GetPeopleData(user_name){
    const resp = await fetch(
        `http://localhost:3000/api/users/info?user_name=${user_name}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
    )
    var data = await resp.json()
    return data.recordset[0]
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueRandomNumbers(min, max) {
    
    const uniqueNumbers = new Set();
    
    while (uniqueNumbers.size < 3) {
        const randomNumber = getRandomNumber(min, max);
        uniqueNumbers.add(randomNumber);
    }

    return Array.from(uniqueNumbers);
}
