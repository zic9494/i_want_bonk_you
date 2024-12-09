import { Can_bonk_list, start_bonk, StretchBack, StretchOut } from "./bonk.js";

export function setGamePage(){
       
    const gameUI = document.getElementById('game_ui');
    const stretchUI = document.getElementById('stretch_ui');
    const stretchButton = document.getElementById('stretch-button');
    const backButton = document.getElementById('back-button');
    const backButton1 = document.getElementById('back-button1');
    const bonk_ui = document.getElementById('bonk_ui')
    const bonkButton = document.getElementById('Bonk-button')
    const start_streching = document.getElementById('start-stretch-button')
    const end_streching = document.getElementById('stop-stretch-button')
    const gameOverlay = document.getElementById('wallet-overlay'); 
    const walletBtn = document.getElementById('connect-wallet-button')
    const realWallet = document.getElementById('connect_wallet');
    const toProfile = document.getElementById('user-info-button');
    const profile = document.getElementById('profile');
    const toFriend = document.getElementById('friends-button');
    const friend = document.getElementById('friend');
    const leaderBoard = document.getElementById("leaderboard-container");
    const leaderBoardBtn = document.getElementById("leaderboard-button");
    const BonkPage = document.getElementById("bonk_page")
    const Target = document.getElementById("Target")
    const Bonk = document.getElementById("Bonk")
    const deposit = document.getElementById('deposit-container');
    const depositBtn = document.getElementById('deposit-button');


    leaderBoardBtn.addEventListener('click',()=>{
        leaderBoard.style.display = 'block';
        gameUI.style.display = 'none';
    })
    //跳到FriendList
    toFriend.addEventListener('click',()=>{
        friend.style.display = 'block';
        gameUI.style.display = 'none';
    });
    //跳到UserInfo
    toProfile.addEventListener('click',()=>{
        profile.style.display = 'block';
        gameUI.style.display = 'none';    
    })

    depositBtn.addEventListener('click',()=>{
        deposit.style.display = 'block';
        gameUI.style.display = 'none';
    
    });
        
    //跳到stretch
    stretchButton.addEventListener('click', () => {
        gameUI.style.display = 'none'; 
        stretchUI.style.display = 'block';
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
    
    //伸頭
    start_streching.addEventListener("click", StretchOut)

    //縮回來
    end_streching.addEventListener("click", StretchBack)

    //確認目標，並開始敲頭
    Bonk.addEventListener("click", start_bonk)
}