// import { setCookie,  getCookie} from "./cookie.js";
import { Generate_Game_Page, smoothScroll } from "./PageControl.js"
import { UserInfo} from "./transaction.js"
import {connectWallet,disconnectWallet} from "./wallet.js"

//現在操作使用者的資料
let UIF = {User : new UserInfo(null)}

window.onload = function(){
    document.getElementById('connect-wallet').addEventListener('click',connectWallet)
    document.getElementById('disconnect-wallet').addEventListener('click',disconnectWallet)
}
document.addEventListener('DOMContentLoaded', () => {
    //導覽列的動畫
    const navbarAnchors = document.querySelectorAll('.navbar a');
    navbarAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e){
            console.log("miko");
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
    document.getElementById("connect_wallet").addEventListener("click", ()=>{
        /*

            連接錢包的判斷式，成功後執行下面程式就會完成後續的動作

        */
        document.getElementById("Private_Key").value = ""
        Generate_Game_Page()
        smoothScroll("#Game_Page", 1000)
    })

    document.getElementById("Quit").addEventListener("click", ()=>{
        UIF.User = new UserInfo(null)
        document.getElementById("Game_UI").style.display = "none"
        document.getElementById("MSG_Connect").style.display = "block"
        smoothScroll("#User_Info", 1000)
    })

})
