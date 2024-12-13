

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
    //抓資料
    friendsData = await getFriendData();
    invitesData = await getInviteData();
    console.log(friendsData);
    console.log(invitesData);
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

    const avatars = tbody.querySelectorAll('.friend-avatar');
    avatars.forEach(avatar => {
        avatar.addEventListener('click', () => {
            const userID = avatar.dataset.userid; // 獲取數據
            openUserInfo(userID); // 調用跳轉函數
        });
    });




}
async function getInviteData() {
    const user_name = localStorage.getItem('user_name');
    try{
        //抓好友邀請
        const friend_resp = await fetch(
            `http://localhost:3000/api/friends/queryRequest?user_name=${user_name}`,{
                method:'GET',
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
        );
        const request_resp_json = await friend_resp.json();
        const requset_user = request_resp_json.map(item => item.From_user); //提取from_user

        //map自定義
        const requset_detail_list = requset_user.map(async request => {
            const info_resp = await fetch(
                `http://localhost:3000/api/users/info?user_name=${request}`,{
                    method:'GET',
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            )
            const user_info_json = await info_resp.json();

            const user_info = user_info_json.recordset[0];

            return {
                user_name: request,
                nickname: user_info.Nick_name,
                avatar: user_info.PhotoBase64 || "https://via.placeholder.com/50"
            }
        });

        const requset_list = (await Promise.all(requset_detail_list));
        return requset_list;

    }catch(err){
        console.error(err);
    }
}
async function getFriendData(){
    const user_name = localStorage.getItem('user_name');
    const user_friends = new Set();

    try{
        //拉好友清單
        const friend_resp = await fetch(
            `http://localhost:3000/api/friends/query?user_name=${user_name}`,{
                method:'GET',
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
        );
        const friend_records = await friend_resp.json();

        friend_records.forEach(record =>{
            if(record.From_user.trim()==user_name.trim()){
                user_friends.add(record.To_user);
                
            }else if(record.To_user.trim()==user_name.trim()){
                user_friends.add(record.From_user);
            }
        }); 

        //拉伸頭狀態
        const stretch_resp  = await fetch(
            `http://localhost:3000/api/GetStretch`,{
                method:'GET',
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
        )
        const stretchingUsers = await stretch_resp.json();

        const stretchingSet = new Set(stretchingUsers.recordset.map(user => user.User_name)); //UserName提出來
       
        //用map做自定義處理
        const friend_details_list = Array.from(user_friends).map(async friend => {
            const info_resp = await fetch(
                `http://localhost:3000/api/users/info?user_name=${friend}`,{
                    method:'GET',
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            )
            const user_info_json = await info_resp.json();
            
            console.log(friend);
            const user_info = user_info_json.recordset[0];
            
            const attackResp = await fetch(
                `http://localhost:3000/api/attacks/query?attack_user=${user_name}&target_user=${friend}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            let attack_count = await attackResp.json();
            
            return {
                user_name:friend,
                nickname: user_info.Nick_name,
                avatar: user_info.PhotoBase64 || "https://via.placeholder.com/50",
                status: stretchingSet.has(friend) ? "Stretching" : user_info.status || "Idle",
                bonkCount: attack_count.attackCount
            }; 

        });
        const friendList = (await Promise.all(friend_details_list));
        return friendList;
    }catch(err){
        console.error(err);

    }
    

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
                <td><button class="bonk-btn" style=display:${item.status === "Stretching" ? "block" : "none"}>Bonk</button></td>
            `;

            const avatar = row.querySelector(".friend-avatar");

            avatar.addEventListener("click", () => {
                openUserInfo(item.user_name);
            });
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
            //動態創建按鈕
            const acceptBtn = row.querySelector(".accept-btn");
            const declineBtn = row.querySelector(".decline-btn");
            const avatar = row.querySelector(".friend-avatar");

            console.log(avatar);

            acceptBtn.addEventListener("click", () => handleAcceptInvite(item.user_name));
            declineBtn.addEventListener("click", () => handleDeclineInvite(item.user_name));

            //跳轉到userInfo
            avatar.addEventListener("click", () => {
                openUserInfo(item.user_name);
            });

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

async function openUserInfo(userName) {
    if (!userName) return;
    
    await fetchUserProfile(userName);
    // 顯示 Profile 容器
    console.log("sS");
    const close = document.getElementById("user-back-button");
    const editBtn = document.getElementById('edit-bio-button');
    const profileContainer = document.getElementById("profile");

    close.innerText = 'Close';
    editBtn.style.display = 'none'
    profileContainer.style.display = 'block';
    friend.style.display = 'none';
    profileContainer.dataset.username = userName;
    
    function handleClose() {
        handleCloseEvent(close, profileContainer,editBtn);
        close.removeEventListener('click', handleClose); // 移除防止干擾到其他
    }


    close.addEventListener('click', handleClose);
    
}

function handleCloseEvent(close, profileContainer,editBtn) {
    friend.style.display = 'block';
    profileContainer.style.display = 'none';
    close.innerText = 'Back to Game';
    editBtn.style.display = 'block';
}


async function handleAcceptInvite(from_user) {
    const to_user = localStorage.getItem('user_name');
    try{  
        // 接受好友邀請
        const response = await fetch('http://localhost:3000/api/friends/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_user: from_user,
                to_user: to_user
            })
        });
        invitesData = invitesData.filter(item => item.nickname !== from_user);
        if(response.ok){
            alert("Comfirm request successfully");
        }else{
            alert("Comfirm request error");
        }
        //刷新
        loadData(currentPage, currentTab);
        location.reload(); 
    }catch(err){
        console.error(err);
    }
}

async function handleDeclineInvite(from_user) {
    const to_user = localStorage.getItem('user_name');
    try {
        // 拒絕好友邀請
        const response = await fetch('http://localhost:3000/api/friends/decline', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_user: from_user,
                to_user: to_user
            })
        });

        // 更新邀請列表
        invitesData = invitesData.filter(item => item.nickname !== from_user);

        if (response.ok) {
            alert("Declined friend request successfully");
        } else {
            alert("Error declining friend request");
        }

        // 刷新
        loadData(currentPage, currentTab);
    } catch (err) {
        console.error(err);
    }
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


//async function queryFriendList(params) {
    
//}