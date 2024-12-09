

// 數據初始化
let friendsData = [];

let invitesData = [];

// 分頁數據
const itemsPerPage = 5; // 每頁顯示數量
let currentPage = 1; // 當前頁
let currentTab = "friends"; // 當前顯示的 Tab

// DOM 元素
const tbody = document.getElementById("friends-invites-tbody");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const currentPageSpan = document.getElementById("current-page");
const backToGameBtn = document.getElementById("friend-back-to-game");
const friendsTab = document.getElementById("tab-friends");
const invitesTab = document.getElementById("tab-invites");
const headerBonk = document.getElementById("table-header-bonk");
const headerStatus = document.getElementById("table-header-status");
const gameUI = document.getElementById("game_ui");
const friend = document.getElementById("friend");




export async function setFriend(){
    
    //await getFriendData();
    // Tab 切換功能
    friendsTab.addEventListener("click", () => {
        currentTab = "friends";
        currentPage = 1;
        friendsTab.classList.add("active");
        invitesTab.classList.remove("active");
        loadData(currentPage, currentTab);
    });

    invitesTab.addEventListener("click", () => {
        currentTab = "invites";
        currentPage = 1;
        friendsTab.classList.remove("active");
        invitesTab.classList.add("active");
        loadData(currentPage, currentTab);
    });

    // 上一頁
    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadData(currentPage, currentTab);
        }
    });

    // 下一頁
    nextPageBtn.addEventListener("click", () => {
        if (currentPage < Math.ceil((currentTab === "friends" ? friendsData : invitesData).length / itemsPerPage)) {
            currentPage++;
            loadData(currentPage, currentTab);
        }
    });

    // 返回按鈕
    backToGameBtn.addEventListener("click", () => {
        gameUI.style.display = 'block';
        friend.style.display = 'none';
    });

    //剛開始初始化
    loadData(currentPage, currentTab);


}
async function getFriendData(){
    const user_name = localStorage.getItem('user_name');
    const user_friends = new Set();
    //拉好友清單
    const friend_resp = await fetch(
        `http://localhost:3000/api/friends/query?user_name=${user_name}`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
    );
    friend_resp.forEach(record =>{
        if(record.From_user==user_name){
            user_friends.add(record.To_user);
        }else if(record.To_user==user_name){
            user_friends.add(record.From_user);
        }
    }); 
    //伸頭狀態
    const stretch_resp  = await fetch(
        `http://localhost:3000/api/GetStretch`,{
            method:'GET',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
    )
    const stretchingUsers = await stretch_resp.json();
    const stretchingSet = new Set(stretchingUsers.map(user => user.User_name)); //UserName提出來

    const friend_details_list = Array.from(user_friends).map(async friend => {
        const info_resp = await fetch(
            `http://localhost:3000/api/users/info?user_name=${user_name}`,{
                method:'GET',
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
        )
        const user_info = await info_resp.json();
        const attackResp = await fetch(
            `http://localhost:3000/api/attacks/query?attack_user=${user_name}&target_user=${friend}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        let attack_count = attackResp.json();

    })

    
    

}
// 加載數據並渲染
function loadData(page, tab) {
    const data = tab === "friends" ? friendsData : invitesData;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const visibleItems = data.slice(start, end);

    // 清空表格
    tbody.innerHTML = "";

    // 根據 Tab 顯示不同數據
    if (tab === "friends") {
        headerBonk.style.display = "table-cell";
        headerStatus.style.display = "table-cell";

        visibleItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${item.avatar}" alt="Avatar" class="friend-avatar"></td>
                <td>${item.nickname}</td>
                <td>${item.bonkCount}</td>
                <td><span class="status ${item.status === "Stretching" ? "status-green" : "status-red"}">${item.status}</span></td>
                <td><button class="bonk-btn">BONK!</button></td>
            `;
            tbody.appendChild(row);
        });
    } else if (tab === "invites") {
        headerBonk.style.display = "none";
        headerStatus.style.display = "none";

        visibleItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${item.avatar}" alt="Avatar" class="friend-avatar"></td>
                <td>${item.nickname}</td>
                <td>
                    <button class="accept-btn">Accept</button>
                    <button class="decline-btn">Decline</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updatePagination(page, data.length);
}

// 更新分頁按鈕狀態
function updatePagination(page, totalItems) {
    currentPageSpan.textContent = page;
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === Math.ceil(totalItems / itemsPerPage);
}

//async function queryFriendList(params) {
    
//}