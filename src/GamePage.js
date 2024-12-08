export function setGamePage(){
       
    const gameUI = document.getElementById('game_ui');
    const stretchUI = document.getElementById('stretch_ui');
    const stretchButton = document.getElementById('stretch-button');
    const backButton = document.getElementById('back-button');
    const bonk_ui = document.getElementById('bonk_ui')
    const bonkButton = document.getElementById('Bonk-button')
    const start_streching = document.getElementById('start-stretch-button')
    const end_streching = document.getElementById('stop-stretch-button')
    const gameOverlay = document.getElementById('wallet-overlay'); 
    const walletBtn = document.getElementById('connect-wallet-button')
    const realWallet = document.getElementById('connect_wallet');

    //跳到stretch
    stretchButton.addEventListener('click', () => {
        gameUI.style.display = 'none'; 
        stretchUI.style.display = 'block';
        //stretch_start()
    });

    //stretch回主頁
    backButton.addEventListener('click', () => {
        stretchUI.style.display = 'none'; 
        gameUI.style.display = 'block'; 
    })

    bonkButton.addEventListener("click", ()=>{
        gameUI.style.display = "none"
        bonk_ui.style.display = "block"
        Can_bonk_list()
    })
    
    //伸頭
    start_streching.addEventListener("click", async () =>{
        
        const resp = await fetch(
            `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=true`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
            }
        )
        if (resp){
            start_streching.style.display = "none"
            end_streching.style.display = "block"
        }
    })

    //縮回來
    end_streching.addEventListener("click", async()=>{
        const resp = await fetch(
            `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
            }
        )
        if (resp){
            start_streching.style.display = "block"
            end_streching.style.display = "none"
        }
    })

}

async function Can_bonk_list(){
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
    console.log(data);

}