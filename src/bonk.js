import { Transaction,SystemProgram,PublicKey } from '@solana/web3.js';
import { provider ,connection } from './deposit.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json'; // 您的 IDL 檔案
import BN from 'bn.js';
import { deserialize , Schema } from "borsh";
import { Buffer } from 'buffer';

const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');
const clockSysvar = new PublicKey('SysvarC1ock11111111111111111111111111111111');

export async function Can_bonk_list(){
    const BonkList = document.getElementById("bonk_page")
    var Innerhtml = `<label style="color: black;">Pick one to Bonk<br><br></label><div id="Can_bonk_list" >`

    const resp = await fetch(
        `http://localhost:3000/api/GetStretch?user_name=${localStorage.getItem('user_name')}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
    )
    var data = await resp.json()
    data = data.recordset
    var index=[0, 1, 2] //被顯示的ID
    if (data.length>3){
        index = generateUniqueRandomNumbers(0, data.length - 1)
    }
    var Name_list = [] //被攻擊者資料
    for (var i = 0; i<3;i++){
        Name_list.push(await GetPeopleData(data[index[i]].User_name))
        //取回將顯示在畫面上的資料
        Innerhtml +=`
        <div class="user-avatar TargetUser" id="user-avatar-image${i}">
            <img src="${Name_list[i].PhotoBase64}" alt="User Avatar">
            <h5>${data[index[i]].User_name} <input type="button" value="+"><br>Max get：12<br>Need：12</h5>
            <img id="selected${i}" src="./images/箭頭.png" class="arrow">
        </div>`
    }
    Innerhtml += "</div>"
    BonkList.innerHTML = Innerhtml
    var mousemoveList = []
    var mouseleaveList = []
    
    //增加監聽器，滑鼠滑過、滑離
    for (let i = 0; i < 3; i++) {
        let Id_name = "user-avatar-image" + i;
        let Selected = "selected" + i;
    
        let mousemoveHandler = () => {
            document.getElementById(Selected).style.display = "block";
        };
        let mouseleaveHandler = () => {
            document.getElementById(Selected).style.display = "none";
        };
    
        document.getElementById(Id_name).addEventListener("mousemove", mousemoveHandler);
        document.getElementById(Id_name).addEventListener("mouseleave", mouseleaveHandler);

        mousemoveList.push(mousemoveHandler)
        mouseleaveList.push(mouseleaveHandler)
    }

    //確定後，取消監聽器
    for (let i = 0; i < 3; i++){
        var Id_name = "user-avatar-image" + i;
        let clickHonder = document.getElementById(Id_name).addEventListener("click",()=>{
            for (let j=0 ; j<3 ; j++){
                document.getElementById("user-avatar-image" + j).removeEventListener("mousemove", mousemoveList[j])
                document.getElementById("user-avatar-image" + j).removeEventListener("mouseleave", mouseleaveList[j])
            }
            console.log(Name_list);
            if (document.getElementById("Target").value=="-1"){
                document.getElementById("Target").value = data[index[i]].User_name
                document.getElementById("TargetPK").value = data[index[i]].Pulic_key
                let btn = document.getElementById("Bonk")
                btn.disabled = false
            }
        })
    }
    
}

export async function start_bonk() {
    const program = new Program(idl, programId, provider);

    //抓取BONK目標PK及name
    const target_user = document.getElementById("Target").value;
    console.log("t",document.getElementById("TargetPK").value);
    const target_user_pk = new PublicKey(document.getElementById("TargetPK").value);
    const [target_pda,sol_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_solana'),target_user_pk.toBuffer()],programId);
    const userPdaAccount = await program.account.userPda.fetch(target_pda); //用userPda類別去查
    console.log(userPdaAccount);
    console.log(userPdaAccount.stretchBetAmount,userPdaAccount.stopLoss);
    const Admission_fee = userPdaAccount.stretchBetAmount * (userPdaAccount.stopLoss / 100);
    console.log(Admission_fee);
    
    // EndBonk(program)
    
    const isSuccess = await AdmissionFee(program,Admission_fee,userPdaAccount.stretchBetToken);
    if(isSuccess){
        alert("Bonk Successfully");
        document.getElementById("bonk_ui").style.display = "none"
        document.getElementById("bonking_page").style.display = "block"
        const doges = document.getElementsByClassName("doges")
        const position =[[70,100], [236, 300], [20, 400], [195, 7], [135, 600]]
        const reward = shuffleArray([0, 0.1, 0.2, 0.3, 0.4])
        localStorage.setItem("BonkCounter", 3) //次數限制
        Array.from(doges).forEach((element, index) => {
            element.style.top = position[index][0] + "px"
            element.style.left = position[index][1] + "px"
            element.addEventListener("click", () => onclick(element), {once:true})
        });
    }else{
        alert("Fail to Bonk. Please try again");
    }
    
}

//獲取他人資料
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

//更新受害者的資料
async function Update_Bonked(bonked) {
    const resp = await fetch(
        `http://localhost:3000/api/update/bonked?attacker=${localStorage.getItem("user_name")}&bonked=${bonked}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        })
    console.log(await resp.json());
    document.getElementById("Target").value = "-1"
    Array.from(document.getElementsByClassName("doges")).forEach((element) => {
        element.src = "./images/doge.png";
        element.click()
    });
    localStorage.setItem("BonkCounter", 3)
}

//狗狗圖片被點擊
async function onclick(element) {
    const Title = document.getElementById("GameTitle")
    if (localStorage.getItem("BonkCounter")>0){

        element.src = "./images/doge_clicked.png"
        localStorage.setItem("BonkCounter", localStorage.getItem("BonkCounter")-1)
        Title.innerHTML = "You got $12" 
        var Times = "You have " + localStorage.getItem("BonkCounter") +" Times"
        if(localStorage.getItem("BonkCounter") != 0)
        window.setTimeout(()=>Title.innerHTML = Times, 500)

    }else localStorage.setItem("BonkCounter", localStorage.getItem("BonkCounter")-1)
    //清除剩餘的事件，但又不想觸發任何程式

    if (localStorage.getItem("BonkCounter") == 0){
        Title.innerText = "Finish"
        
        await Update_Bonked(document.getElementById("Target").value)
        document.getElementById("bonk_page").innerHTML = "laoding"
        document.getElementsByClassName("run_area")[0].style.display = "none"
        document.getElementById("finish_page").style.display = "block"
        document.getElementById("GameTitle").innerHTML = "Total earn : $36"
    const program = new Program(idl, programId, provider);
        await EndBonk(program)
        
    }
}

//產生亂數
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//產生亂數陣列
function generateUniqueRandomNumbers(min, max) {
    
    const uniqueNumbers = new Set();
    
    while (uniqueNumbers.size < 3) {
        const randomNumber = getRandomNumber(min, max);
        uniqueNumbers.add(randomNumber);
    }

    return Array.from(uniqueNumbers);
}

//隨機排列比例陣列
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



async function AdmissionFee(program,AdmissionFee,token) {
    try{
        const wallet = await window.solana.connect();  //可優化
        const walletPK = wallet.publicKey;
        

        const [sol_pda,sol_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'),walletPK.toBuffer()],programId);



        const ix = await program.methods
                .bonkStart(new BN(AdmissionFee), token) //傳u64要記得轉成BN不然會出錯
                .accounts({
                    signer: walletPK, 
                    user: sol_pda,           
                    clock: clockSysvar       
                })
                .instruction();

        const transaction = new Transaction().add(ix);
        transaction.feePayer = walletPK;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

        const signature = await window.solana.signAndSendTransaction(transaction);

        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed with signature:", signature);
        return true;
    }catch(err){
        return false;
    }

}

async function EndBonk(program) {
    try{
        const wallet = await window.solana.connect()
        const walletPK = wallet.publicKey
        const adminPK = new PublicKey("Ft7kkzSfKS4SsaKftWBnRVrEmuuDBYep3kDaSM3YTeVg")

        const [sol_pda, sol_pumb] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'), walletPK.toBuffer()], programId
        )

        const ix = await program.methods
                .bonkEnd()
                .accounts({
                    signer: walletPK,
                    user:sol_pda,
                    clock: clockSysvar,
                    admin: adminPK,
                })
                .instruction()
        
        const transection = new Transaction().add(ix)
        transection.feePayer = walletPK
        transection.recentBlockhash = ((await connection.getLatestBlockhash("confirmed"))).blockhash

        const signature = await window.solana.signAndSendTransaction(transection)
        await connection.confirmTransaction(signature, "confirmed")
        console.log("Transaction confirmed with signature:", signature);
        return true
    }catch(err){
        console.log("err", err);

        return false
    }
}