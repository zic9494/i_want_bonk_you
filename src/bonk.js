import { Transaction,SystemProgram,PublicKey,Keypair,sendAndConfirmTransaction } from '@solana/web3.js';
import { provider ,connection } from './deposit.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json'; // 您的 IDL 檔案
import BN from 'bn.js';
import { Buffer } from 'buffer';
import bs58 from 'bs58';

const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');
const clockSysvar = new PublicKey('SysvarC1ock11111111111111111111111111111111');

const base58SecretKey = "ng4LZxjMi8wfwii2YGMApVfQDQGw3M2knKu83qqcoukK2bp53AtKe6KZ2K2DSh4Xn9uzV9ZHJywFrMMojRztHvi";

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
        const program = new Program(idl, programId, provider);
        Name_list.push(await GetPeopleData(data[index[i]].User_name))
        const target_pk = fetchUserPublicKey(data[index[i]].User_name);
        const [target_pda,sol_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'),target_pk.toBuffer()],programId);
        const userPdaAccount = await program.account.userPda.fetch(target_pda); //用userPda類別去查
        
        const maxGet = userPdaAccount.stretchBetAmount.toNumber(); // 下注金額
        const need = maxGet * (userPdaAccount.stopLoss / 100); 
        //取回將顯示在畫面上的資料
        Innerhtml +=`
        <div class="user-avatar TargetUser" id="user-avatar-image${i}">
            <img src="${Name_list[i].PhotoBase64}" alt="User Avatar">
            <h5>${data[index[i]].User_name} <input type="button" value="+"><br>Max get：${maxGet}<br>Need：${need}</h5>
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
    const adminKeypair = loadKeypairFromJson();
    //抓取BONK目標PK及name
    const target_user = document.getElementById("Target").value;
    const target_user_pk = new PublicKey(document.getElementById("TargetPK").value);
    const [target_pda,sol_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_solana'),target_user_pk.toBuffer()],programId);
    const userPdaAccount = await program.account.userPda.fetch(target_pda); //用userPda類別去查

    console.log(userPdaAccount);
    console.log(userPdaAccount.stretchBetAmount,userPdaAccount.stopLoss);
    const Admission_fee = userPdaAccount.stretchBetAmount * (userPdaAccount.stopLoss / 100);
    console.log(Admission_fee);
    
    const isSuccess = await StartBonk(program,Admission_fee,userPdaAccount.stretchBetToken);
    if(isSuccess){
        alert("Bonk Successfully");
        document.getElementById("bonk_ui").style.display = "none"
        document.getElementById("bonking_page").style.display = "block"
        const doges = document.getElementsByClassName("doges")
        const position =[[70,100], [236, 300], [20, 400], [195, 7], [135, 600]]
        const reward = shuffleArray([1, 1, 1, 1, 1])
        localStorage.setItem("BonkCounter",1) //次數限制
        
        Array.from(doges).forEach((element, index) => {
            element.style.top = position[index][0] + "px"
            element.style.left = position[index][1] + "px"
           // 添加事件監聽器，確保 onclick 支持 async
            element.addEventListener(
                "click",
                async () => await onclick(element, reward, index, target_pda, program,adminKeypair),
                { once: true }
            );
        });
        EndBonk(program,adminKeypair);
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
    localStorage.setItem("BonkCounter", 1)
}

//狗狗圖片被點擊
async function onclick(element,reward,index,target_pda,program,adminKeypair) {
    const Title = document.getElementById("GameTitle")
    if (localStorage.getItem("BonkCounter")>0){
        element.src = "./images/doge_clicked.png"
        localStorage.setItem("BonkCounter", localStorage.getItem("BonkCounter")-1)
        if(reward[index]==1){
            console.log("1000000000000000000");
            localStorage.setItem("Winner",1);
            //結束對方伸頭狀態
            EndStretch(program,adminKeypair,target_pda);
        }else{
            Title.innerHTML = "You Loss" 
            localStorage.setItem("Winner",0);
        }
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
        if(localStorage.getItem("Winner")==1){
            document.getElementById("GameTitle").innerHTML = "Total earn : $36";
        }else{
            document.getElementById("GameTitle").innerHTML = "You Loss";
        }
        
        
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

async function fetchUserPublicKey(userName) {
    try {
        
        const response = await fetch(`http://localhost:3000/api/user/pulickey/query?user_name=${encodeURIComponent(userName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 檢查響應狀態
        if (response.ok) {
            const result = await response.json(); 
            return result.recordset[0].Pulic_key;
            
        } else {
            console.error('Failed to fetch public key:', response.statusText);
            alert(`Failed to fetch public key. Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Error while fetching public key:', error);
        alert('An error occurred while fetching public key.');
        return null;
    }
}


async function StartBonk(program,AdmissionFee,token) {
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

//結束bonk狀態
async function EndBonk(program,admin) {
    try{
        const wallet = await window.solana.connect()
        const walletPK = wallet.publicKey

        const [sol_pda, sol_pumb] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'), walletPK.toBuffer()], programId
        )
        const [admin_pda,admin_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('admin')],programId);

        const ix = await program.methods
                .bonkEnd()
                .accounts({
                    signer: admin.publicKey,
                    user: sol_pda,
                    clock: clockSysvar,
                    admin: admin_pda,
                })
                .instruction()
        
        const transaction = new Transaction().add(ix)
        transaction.feePayer = admin.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
                
        // 發送並確認交易
        const signature = await sendAndConfirmTransaction(connection, transaction, [admin]);
        console.log('交易已確認，簽名:', signature);

        return true;
    }catch(err){
        console.log("err", err);
        return false
    }
}

//如果敲到結束對方伸頭狀態
async function EndStretch(program,admin,target_pda) {
    try{
        const [admin_pda,admin_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('admin')],programId);

        const ix = await program.methods
            .stretchEnd() // 指令名
            .accounts({
                signer: admin.publicKey, 
                user: target_pda,           
                clock: clockSysvar,      
                admin: admin_pda          
            })
            .instruction() // 發送交易

        const transaction = new Transaction().add(ix);
        transaction.feePayer = admin.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
                
        // 發送並確認交易
        const signature = await sendAndConfirmTransaction(connection, transaction, [admin]);
        console.log('交易已確認，簽名:', signature);

        return true;
    }catch(err){
        console.log("err", err);
        return false
    }
}





function loadKeypairFromJson() {
    try {

        const secretKey = bs58.decode(base58SecretKey);
        // 使用 Keypair.fromSecretKey 導入密鑰對
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log('Keypair 載入成功:', keypair.publicKey.toBase58());
        return keypair;
    } catch (error) {
        console.error('載入 Keypair 時發生錯誤:', error);
        throw error;
    }
}

//付入場費
async function transferToJackpot(program,amount){
    try{
        const wallet = await window.solana.connect()
        const walletPK = wallet.publicKey

        const [sol_pda, sol_pumb] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'), walletPK.toBuffer()], programId
        )

        const [admin_pda,admin_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('admin')],programId);

         ix = await program.methods
                .transferSol(new BN(amount), option)
                .accounts({
                    signer: signerPk,
                    sender: senderPdaAddress,
                    recipient: recipientPdaAddress,
                    admin: adminPdaAddress,
                    jackpot: jackpotPdaAddress,
                })
                .instruction();
        
        const transaction = new Transaction().add(ix)
        transaction.feePayer = admin.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
                
        // 發送並確認交易
        const signature = await sendAndConfirmTransaction(connection, transaction, [admin]);
        console.log('交易已確認，簽名:', signature);

        return true;
    }catch(err){
        console.log("err", err);

        return false
    }
}

