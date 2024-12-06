// import { setCookie,  getCookie} from "./cookie.js";
import { Generate_Game_Page, smoothScroll } from "./PageControl.js"
import {connectWallet,disconnectWallet} from "./wallet.js"
//import {addUser} from "../sql/fetch_test.js"
import {setLoginAandSignUp} from "./LoginSignUp.js"

window.onload = function(){
    //document.getElementById('test-fetch').addEventListener('click',addUser)
    //document.getElementById('connect-wallet').addEventListener('click',connectWallet)
    //document.getElementById('disconnect-wallet').addEventListener('click',disconnectWallet)
}


document.addEventListener('DOMContentLoaded', () => {
    setLoginAandSignUp();
    //導覽列的動畫
    const navbarAnchors = document.querySelectorAll('.navbar a');
    navbarAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e){
            e.preventDefault()
            var targetID = this.getAttribute('href')
            smoothScroll(targetID, 1000) // 呼叫捲動函式(ID, time(ms))
        })
    })

    //主頁的點擊引導至輸入錢包地址
    const Guide_To_Info = document.getElementsByClassName("Guide_To_User_Info");
    Array.prototype.forEach.call(Guide_To_Info, function(anchor) {
            anchor.addEventListener("click", function() {
            smoothScroll("#User_Info", 1000);
        });
    });

    //送出錢包資料後
    document.getElementById("connect_wallet").addEventListener("click", async ()=>{
        let connected = await connectWallet()
        if(connected){
            Generate_Game_Page()
            smoothScroll("#Game_Page", 1000)
        }else{
            if(!('phantom' in window)){
                window.open('https://phantom.app/', '_blank')
            }
        }
    })

    document.getElementById("Quit").addEventListener("click", ()=>{
        disconnectWallet()
        document.getElementById("Game_UI").style.display = "none"
        document.getElementById("MSG_Connect").style.display = "block"
        smoothScroll("#User_Info", 1000)
    })


})
