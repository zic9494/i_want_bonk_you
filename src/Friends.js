// 數據初始化
const friendsData = [
    { avatar: "https://via.placeholder.com/50", nickname: "John Doe", bonkCount: 15, status: "Stretching" },
    { avatar: "https://via.placeholder.com/50", nickname: "Jane Smith", bonkCount: 8, status: "Idle" },
    { avatar: "https://via.placeholder.com/50", nickname: "Alice Green", bonkCount: 12, status: "Idle" },
    { avatar: "https://via.placeholder.com/50", nickname: "Bob Brown", bonkCount: 20, status: "Stretching" },
    { avatar: "https://via.placeholder.com/50", nickname: "Lucy Black", bonkCount: 5, status: "Idle" },
    { avatar: "https://via.placeholder.com/50", nickname: "Tom White", bonkCount: 9, status: "Idle" },
];

const invitesData = [
    { avatar: "https://via.placeholder.com/50", nickname: "Chris Blue" },
    { avatar: "https://via.placeholder.com/50", nickname: "Sophie Red" },
];

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




export function setFriend(){
    
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