import { Can_bonk_list, start_bonk} from "./bonk.js";


export function setGamePage(){
       
    const gameUI = document.getElementById('game_ui');
    const stretchUI = document.getElementById('stretch_ui');
    const stretchButton = document.getElementById('stretch-button');
    const backButton = document.getElementById('back-button');
    const backButton1 = document.getElementById('back-button1');
    const bonk_ui = document.getElementById('bonk_ui')
    const bonkButton = document.getElementById('Bonk-button')

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
    const BackToHome = document.getElementById("back_to_home")
    const PlayAgain = document.getElementById("play_again")
    

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