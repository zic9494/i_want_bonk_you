import { Can_bonk_list, start_bonk} from "./bonk.js";
import { Transaction,SystemProgram,PublicKey,Keypair,sendAndConfirmTransaction } from '@solana/web3.js';
import { provider ,connection } from './deposit.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json'; // 您的 IDL 檔案
import { Buffer } from 'buffer';
import bs58 from 'bs58';

async function findUSEPDA() {
    const wallet = await window.solana.connect();
    const publicKey = wallet.publicKey;
    const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');
    const program = new Program(idl, programId, provider);
    const [target_pda,sol_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('user_solana'),publicKey.toBuffer()],programId);
    const userPdaAccount = await program.account.userPda.fetch(target_pda);

    console.log(userPdaAccount);

    return userPdaAccount;
}




export function setGamePage(){
       
    const gameUI = document.getElementById('game_ui');
    const stretchUI = document.getElementById('stretch_ui');
    const stretchButton = document.getElementById('stretch-button');
    const backButton = document.getElementById('back-button');
    const backButton1 = document.getElementById('back-button1');
    const bonk_ui = document.getElementById('bonk_ui')
    const bonkButton = document.getElementById('Bonk-button')
    const BonkList = document.getElementById("bonk_page")
    const gameOverlay = document.getElementById('wallet-overlay'); 
    const walletBtn = document.getElementById('connect-wallet-button')
    const realWallet = document.getElementById('connect_wallet');
    const toProfile = document.getElementById('user-info-button');
    const profile = document.getElementById('profile');
    const toFriend = document.getElementById('friends-button');
    const friend = document.getElementById('friend');
    const BonkPage = document.getElementById("bonk_page")
    const Target = document.getElementById("Target")
    const Bonk = document.getElementById("Bonk")
    const deposit = document.getElementById('deposit-container');
    const depositBtn = document.getElementById('deposit-button');
    const BackToHome = document.getElementById("back_to_home")
    const PlayAgain = document.getElementById("play_again")
    const DuringTimetext = document.getElementById('duration-display')

    
    const openSettingsButton = document.getElementById('open-settings-button');
    const end_streching = document.getElementById('stop-stretch-button')

    //從userInfo返回上一頁
    document.getElementById("user-back-button").addEventListener("click", () => {
        // 隱藏 Profile 容器
        const profileContainer = document.getElementById("profile");
        profileContainer.style.display = "none";
    
        // 返回上一頁
        if (previousPage) {
            document.getElementById(previousPage).style.display = "block";
            previousPage = null; // 清空記錄
        }
    });

    //從userInfo返回上一頁
    document.getElementById("user-back-button").addEventListener("click", () => {
        // 隱藏 Profile 容器
        const profileContainer = document.getElementById("profile");
        profileContainer.style.display = "none";
    
        // 返回上一頁
        if (previousPage) {
            document.getElementById(previousPage).style.display = "block";
            previousPage = null; // 清空記錄
        }
    });

    const pda = findUSEPDA()

    //跳到FriendList
    toFriend.addEventListener('click',()=>{
        friend.style.display = 'block';
        gameUI.style.display = 'none';
    });
    //跳到UserInfo
    toProfile.addEventListener('click',()=>{
        profile.dataset.username = localStorage.getItem('user_name')
        profile.style.display = 'block';
        gameUI.style.display = 'none';    
    })

    depositBtn.addEventListener('click',()=>{
        deposit.style.display = 'block';
        gameUI.style.display = 'none';
    
    });

    BonkList.addEventListener("click", (event) => {
        const avatar = event.target.closest(".user-avatar");
        if (avatar) {
            const userName = avatar.getAttribute("data-user-name");
            console.log(userName);
            openProfile(userName);
        }
    });
    

        
    //跳到stretch
    stretchButton.addEventListener('click', () => {
        gameUI.style.display = 'none';
        stretchUI.style.display = 'block'; 

        if (pda.stretchState){
            openSettingsButton.style.display = "none"
            end_streching.style.display = "block"
            document.getElementById("duration-display").innerText = "Stretch Duration: "+ localStorage.getItem("DuringTime") +" seconds"
            let temp = localStorage.getItem("DuringTime")
            let DuringTime = parseInt(temp, 10)
            let IntervalID = window.setInterval(()=>{
                DuringTime += 1
                DuringTimetext.innerText = "Stretch Duration: "+ DuringTime +" seconds"
                localStorage.setItem("DuringTime", DuringTime)
            }, 1000)
            localStorage.setItem("IntervalID", IntervalID)
        }
    });

    //stretch回主頁
    backButton.addEventListener('click', () => {
        stretchUI.style.display = 'none'; 
        gameUI.style.display = 'block'; 
    })

    //跳到bonk
    bonkButton.addEventListener("click", ()=>{
        gameUI.style.display = "none"
        bonk_ui.style.display = "block"
        Can_bonk_list()
    })

    //bonk回主頁
    backButton1.addEventListener('click', () => {
        BonkPage.innerHTML = "laoding"
        Target.value = "-1"
        bonk_ui.style.display = 'none'; 
        gameUI.style.display = 'block'; 
    })

    //透過遮罩按鈕連接錢包
    walletBtn.addEventListener('click',()=>{
        realWallet.click();
        gameOverlay.style.display = 'none';
    })
    
   

    //確認目標，並開始敲頭
    Bonk.addEventListener("click", start_bonk)

    BackToHome.addEventListener("click", ()=>{
        document.getElementById("bonking_page").style.display = "none";
        document.getElementsByClassName("run_area")[0].style.display = "block"
        document.getElementById("finish_page").style.display = "none"       
        gameUI.style.display = 'block'; 
    })

    PlayAgain.addEventListener("click", ()=>{
        document.getElementById("bonking_page").style.display = "none";
        document.getElementsByClassName("run_area")[0].style.display = "block"
        document.getElementById("finish_page").style.display = "none"
        bonkButton.click()
    })
}


async function openProfile(userName) {
    if (!userName) return;


    await fetchUserProfile(userName);
    // 顯示 Profile 容器
    console.log("sS");
    const close = document.getElementById("user-back-button");
    const editBtn = document.getElementById('edit-bio-button');
    const profileContainer = document.getElementById("profile");
    const previousPage = document.getElementById("bonk_ui");
    const sendRequestButton = document.getElementById('add-detail-button');
    close.innerText = 'Close';
    editBtn.style.display = 'none'
    profileContainer.style.display = 'block';
    previousPage.style.display = 'none';
    profileContainer.dataset.username = userName;
    sendRequestButton.style.display = 'none'
    function handleClose() {
        handleCloseEvent(close, profileContainer, previousPage,editBtn,sendRequestButton);
        close.removeEventListener('click', handleClose); // 移除防止干擾到其他
        
    }
    

    close.addEventListener('click', handleClose);
    
}

function handleCloseEvent(close, profileContainer, previousPage,sendRequestButton) {
    previousPage.style.display = 'block';
    profileContainer.style.display = 'none';
    close.innerText = 'Back to Game';
    editBtn.style.display = 'block';
    sendRequestButton.style.display = 'none';
    
}


async function fetchUserProfile(user_name) {
    try {
        const response = await fetch(`
            http://localhost:3000/api/users/info?user_name=${encodeURIComponent(user_name)}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        });
        const userInfo = await response.json();
        const data = userInfo.recordset[0];

        // 更新 Profile 中的內容
        document.getElementById("user-avatar-image").src = data.PhotoBase64 || "https://via.placeholder.com/150";
        document.getElementById("user-nickname").textContent = data.Nick_name || "Unknown";
        document.getElementById("user-bio-display").textContent = data.Bio || "This user has not set a bio.";
    } catch (err) {
        console.error("Error fetching user profile:", err);
    }
}


