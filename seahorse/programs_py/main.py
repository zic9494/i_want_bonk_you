from seahorse.prelude import *

declare_id('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F')

# 定義管理員帳戶結構
class Admin(Account):
    bump: u8  # 用於管理員帳戶的程序派生地址 (PDA) bump 值
    admin_address: Pubkey  # 管理員的公鑰
    token_account_address: Pubkey  # 管理員的代幣帳戶公鑰
    token_account_bump: u8  # 代幣帳戶的 PDA bump 值
    mint_account_address: Pubkey  # Mint 帳戶的公鑰（代幣發行地址）
    mint_account_bump: u8  # Mint 帳戶的 PDA bump 值

# 定義計數器帳戶結構，用於紀錄序列號
class Counter(Account):
    serial_number: u64  # 用於追蹤操作的序列號

# 定義用戶 PDA（程序派生地址）的結構，存儲用戶的元數據和狀態
class UserPda(Account):
    owner: Pubkey  # 用戶的公鑰，表示帳戶的所有者
    sol_bump: u8  # 用戶 SOL 帳戶的 PDA bump 值
    token_pubkey: Pubkey  # 用戶代幣帳戶的公鑰
    token_bump: u8  # 用戶代幣帳戶的 PDA bump 值

    # Bonk 和 Stretch 遊戲的狀態和數據
    bonk_state: bool  # 用戶是否參與 Bonk 操作的狀態
    stretch_state: bool  # 用戶是否參與 Stretch 操作的狀態
    bonk_bet_token: str  # 用戶在 Bonk 中下注的代幣名稱
    stretch_bet_token: str  # 用戶在 Stretch 中下注的代幣名稱
    bonk_bet_amount: u64  # 用戶在 Bonk 中下注的金額
    stretch_bet_amount: u64  # 用戶在 Stretch 中下注的金額
    stop_loss: u8  # 用於 Stretch 操作的停損值
    interest_start_time: i64  # 記錄參與遊戲的開始時間（UNIX 時間戳）

# 定義 Jackpot（彩池）帳戶結構
class Jackpot(Account):
    owner: Pubkey  # 彩池的所有者公鑰
    token_adress: Pubkey  # 彩池代幣帳戶的公鑰
    bump_jp: u8  # 彩池帳戶的 PDA bump 值
    bump_token: u8  # 彩池代幣帳戶的 PDA bump 值

#Bonk合約---------------------------------------------------------------------------------------------
# 初始化管理員帳戶
@instruction
def init_admin(owner: Signer, admin: Empty[Admin]):

    admin = admin.init(
        payer = owner,
        seeds = ['admin'],
        space = 150
    )

    pda_pubkey, bump = Pubkey.find_program_address(['admin', owner])

    amount = 2 * 1_000_000
    owner.transfer_lamports(admin, amount)

    admin.bump = bump
    admin.admin_address = owner.key()
    
    
    print(f"Admin initialized successfully! Address: {admin.admin_address}, Bump: {admin.bump}")

# 創建一個新代幣 (TokenMint)
@instruction
def token_mint(signer: Signer, bonk_mint: Empty[TokenMint], admin: Admin):
    
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    bonk = bonk_mint.init(
            payer = signer,
            seeds = ['bonk_mint', signer],
            decimals = 5,
            authority = signer
            )

    pda_pubkey, bump = Pubkey.find_program_address(['bonk_mint', signer])

    amount = 2 * 1_000_000
    signer.transfer_lamports(bonk, amount)

    admin.mint_account_address = pda_pubkey
    admin.mint_account_bump = bump

    print(f"token_mint initialized successfully! Address: {pda_pubkey}, Bump: {bump}")

# 創建管理員的代幣帳戶
@instruction
def admin_token_account(signer: Signer, admin_account: Empty[TokenAccount], mint: TokenMint, admin: Admin):
   
    admin_token_account = admin_account.init(
                            payer = signer, 
                            seeds = ['admin_token'], 
                            mint = mint, 
                            authority = admin
                          )

    pda_pubkey, bump = Pubkey.find_program_address(['admin_token'])
    
    amount = 3 * 1_000_000
    signer.transfer_lamports(admin_token_account, amount)

    admin.token_account_address = pda_pubkey
    admin.token_account_bump = bump

    print(f"admin_token_account initialized successfully! Address: {pda_pubkey}, Bump: {bump}")

# 鑄造代幣
@instruction
def mint_tokens(signer: Signer, mint: TokenMint, recipient: TokenAccount, admin: Admin, amount: u64):

    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"
  
    mint.mint(
        authority = signer,
        to = recipient,
        amount = amount
    )

# 傳輸代幣
@instruction
def transfer_tokens(signer: Signer, admin_token_account: TokenAccount, recipient: TokenAccount, admin: Admin, amount: u64):

    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"
    
    bump = admin.bump

    admin_token_account.transfer(
        authority = admin,
        to = recipient,
        amount = amount,
        signer = ['admin', signer, bump]
    )

    print('transfer successful')

# 新增一個user代幣帳戶
@instruction
def add_new_tokenaccount(signer: Signer, token_account: Empty[TokenAccount], mint: TokenMint):
  
    token_account.init(
        payer = signer,
        mint = mint,
        authority = signer,
        seeds = ['token', signer]
    )

    pda, bump =Pubkey.find_program_address(['token', signer])

    print(f"SPL Token Account created: {signer}, bump: {bump}")

# 燒毀代幣
@instruction
def burn_token(signer: Signer, mint: TokenMint, token_account: TokenAccount, amount: u64, admin: Admin):
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"
    
    bump = admin.bump
    mint.burn(
        authority = admin,
        holder = token_account,
        amount = amount,
        signer = ['admin', signer, bump]
    )

    print('burn successful')


#PDA-----------------------------------------------------------------------------------------------------------

# 初始化計數器帳戶
@instruction
def initialize_counter(signer: Signer, counter: Empty[Counter], admin: Admin):
    # 確保只有 admin 可以執行此操作
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    # 初始化計數器帳戶
    counter = counter.init(
        payer = signer,
        seeds = ['counter', signer]
    )

    # 計算計數器的 PDA 地址
    pda_pubkey, bump = Pubkey.find_program_address(['counter', signer])

    # 轉賬一定數量的 SOL 到計數器帳戶
    amount = 2 * 1_000_000
    signer.transfer_lamports(counter, amount)

    # 設置初始的序列號
    counter.serial_number = 0

    print('counter initialize successful')


# 初始化用戶PDA帳戶
@instruction
def initialize_user_sol_pda(signer: Signer, sol_account: Empty[UserPda], counter: Counter):

    # 初始化用戶的 SOL 帳戶
    user_sol = sol_account.init(
        payer = signer,
        seeds = ['user_solana', signer]
    )

    # 更新計數器的序列號
    counter.serial_number += 1
    pda_sol, sol_bump = Pubkey.find_program_address(['user_solana', signer])

    # 轉賬 SOL 到用戶的 SOL 帳戶
    amount = 5 * 1_000_000
    signer.transfer_lamports(user_sol, amount)

    # 設置 user_sol 的相關屬性
    user_sol.owner = signer.key()
    user_sol.sol_bump = sol_bump
    user_sol.bonk_state = False
    user_sol.stretch_state = False

    print(f"Sol PDA created: {pda_sol}, bump: {sol_bump}, sn: {counter.serial_number}")

# 初始化用戶的代幣 PDA
@instruction
def initialize_user_token_pda(signer: Signer, token_account: Empty[TokenAccount], user_sol: UserPda, mint: TokenMint, counter: Counter):

    # 新增用戶的代幣帳戶
    user_bonk = token_account.init(
        payer = signer,
        mint = mint,
        authority = user_sol, #權限為用戶的 PDA
        seeds = ['User_Bonk', signer]
    )

    pda_bonk, bonk_bump = Pubkey.find_program_address(['User_Bonk', signer])

    # 轉賬 SOL 到用戶的代幣帳戶
    amount = 3 * 1_000_000
    signer.transfer_lamports(user_bonk, amount)

    print(f"SPL Token PDA created: {pda_bonk}, bump: {bonk_bump}, sn: {counter.serial_number}")


    user_sol.token_pubkey = pda_bonk
    user_sol.token_bump = bonk_bump

# 用戶提取 SOL
@instruction
def withdraw_sol(signer: Signer, amount: u64 ,user_pda: UserPda):

    assert(signer.key() == user_pda.owner), "User does not match"

    # 轉賬 SOL
    user_pda.transfer_lamports(signer, amount)

    print('withdraw successful')

# 用戶提取代幣
@instruction
def withdraw_token(signer: Signer, pda_token: TokenAccount, user_account: TokenAccount, user: UserPda, amount: u64):
    
    assert(signer.key() == user.owner), "User does not match"

    bump = user.sol_bump

    pda_token.transfer(
        authority = user,
        to = user_account,
        amount =  amount,
        signer = ['user_solana', signer, bump]
    )

    print('withdraw successful')

#通用轉帳------------------------------------------------------------------------------------------

#如果轉帳來源不是使用者的PDA，UserPda直接填FT7K帳戶的UserPda
@instruction
def transfer_bonk(signer: Signer, sender: TokenAccount, recipient: TokenAccount, user: UserPda, admin: Admin, amount: u64, jackpot: Jackpot):

    if(signer.key() == admin.admin_address):
        if(sender.authority() == jackpot.key()): #這個轉帳是jackpot轉出，簽署者是FT7K，sender是JP的TokenAccount
                                                 
            bump = jackpot.bump_jp

            sender.transfer(
                authority = jackpot,
                to = recipient,
                amount = amount,
                signer = ['jackpot', signer, bump]
            )
        else:  
            bump = user.sol_bump    #這個轉帳是USERPDA轉出，簽署者是FT7K，sender是userpda的TokenAccount
            owner = user.owner      #UserPda要輸入sender的擁有著

            sender.transfer(
                authority = user,
                to = recipient,
                amount = amount,
                signer = ['user_solana', owner, bump]
            )
    
    else:
        sender.transfer(
            authority = user,       #這個轉帳是USER自己的錢包轉出，用於deposit
            to = recipient,         #signer要給該使用者簽
            amount = amount
        )

    print('transfer successful')

@instruction
def transfer_sol(signer: Signer, sender: UserPda, recipient: UserPda, admin: Admin, jackpot: Jackpot, amount: u64, option: bool):
    if(signer.key() == admin.admin_address):
        sender.transfer_lamports(recipient, amount) #這個轉帳是USERPDA互相轉帳
        print('transfer successful')

    elif(signer.key() == recipient.owner):          #這個轉帳是USER自己的錢包轉出，用於deposit，signer要給該使用者簽
        signer.transfer_lamports(recipient, amount)
        print('transfer successful')

    elif(option == True):
        signer.transfer_lamports(jackpot, amount)   #這個轉帳是轉入jackpot
        print('transfer successful')
    
    else:
        jackpot.transfer_lamports(signer, amount)   #這個轉帳是jackpot轉出
        print('transfer successful')

    

#獎金池-----------------------------------------------------------------------------------------
@instruction
def init_sol_jackpot(signer: Signer, jackpot: Empty[Jackpot], admin: Admin):
    
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    jp = jackpot.init(
        payer = signer,
        seeds = ['jackpot', signer]
    )

    pda, bump = Pubkey.find_program_address(['jackpot', signer])

    jp.owner = signer.key()
    jp.bump_jp = bump

    amount = 2 * 1_000_000
    signer.transfer_lamports(jp, amount)

    print('Sol Jackpot initialize successful')

@instruction
def init_bonk_jackpot(signer: Signer, jackpot: Jackpot, admin: Admin, bonk: Empty[TokenAccount], mint: TokenMint):
    
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    jp = bonk.init(
        authority = jackpot,
        mint = mint,
        payer = signer,
        seeds = ['jackpot_Bonk', signer]
    )

    pda, bump = Pubkey.find_program_address(['jackpot_Bonk', signer])

    jackpot.token_adress = pda
    jackpot.bump_token = bump

    amount = 3 * 1_000_000
    signer.transfer_lamports(jp, amount)

    print('Bonk Jackpot initialize successful')

#遊戲處理------------------------------------------------------------------------------------------------------
#開始一個新的 Stretch 操作
@instruction
def stretch_start(signer: Signer, user: UserPda, amount: u64, sl: u8, token: str, clock: Clock):

    # 確認操作由用戶本身執行
    assert(signer.key() == user.owner), "Only user authorized to call this function"
    # 確認用戶當前未處於 Stretch 狀態
    assert(user.stretch_state == False), "Stretch in progress"

    # 更新用戶的 Stretch 狀態
    user.stretch_state = True
    user.stop_loss = sl  # 設置停損值
    user.stretch_bet_amount = amount  # 設置下注金額
    user.stretch_bet_token = token  # 設置下注的代幣名稱
    user.interest_start_time = clock.unix_timestamp()  # 記錄開始時間

    # 輸出相關訊息
    print("Stretch start!")
    print(f"User State: Stretch")
    print(f"Stop Loss: {user.stop_loss}")
    print(f"Bet Amount: {user.stretch_bet_amount}")
    print(f"Bet Token: {user.stretch_bet_token}")
    print(f"timestamp: {user.interest_start_time}")

#結束當前的 Stretch 操作
@instruction
def stretch_end(signer: Signer, user: UserPda, clock: Clock, admin: Admin):

    # 確認操作由管理員執行
    assert(signer.key() == admin.admin_address), "Only admin authorized to call this function"
    # 確認用戶當前處於 Stretch 狀態
    assert(user.stretch_state == True), "Stretch has not started"

    # 重置用戶的 Stretch 狀態
    user.stretch_state = False
    user.stop_loss = 0
    user.stretch_bet_amount = 0
    user.stretch_bet_token = ''
    user.interest_start_time = clock.unix_timestamp()  # 更新結束時間

    # 輸出相關訊息
    print("Stretch end")
    print(f"timestamp: {user.interest_start_time}")

#開始一個新的 Bonk 操作
@instruction
def bonk_start(signer: Signer, user: UserPda, amount: u64, token: str, clock: Clock):

    # 確認操作由用戶本身執行
    assert(signer.key() == user.owner), "Only user authorized to call this function"
    # 確認用戶當前未處於 Bonk 狀態
    assert(user.bonk_state == False), "Bonk has not started"

    # 更新用戶的 Bonk 狀態
    user.bonk_state = True
    user.bonk_bet_amount = amount  # 設置下注金額
    user.bonk_bet_token = token  # 設置下注的代幣名稱
    user.interest_start_time = clock.unix_timestamp()  # 記錄開始時間

    # 輸出相關訊息
    print("Bonk start!")
    print(f"User State: Bonk")
    print(f"Bet Amount: {user.bonk_bet_amount}")
    print(f"Bet Token: {user.bonk_bet_token}")
    print(f"timestamp: {user.interest_start_time}")

#結束當前的 Bonk 操作
@instruction
def bonk_end(signer: Signer, user: UserPda, clock: Clock, admin: Admin):

    # 確認操作由管理員執行
    assert(signer.key() == admin.admin_address), "Only admin authorized to call this function"
    # 確認用戶當前處於 Bonk 狀態
    assert(user.bonk_state == True), "Bonk has not started"

    # 重置用戶的 Bonk 狀態
    user.bonk_state = False
    user.bonk_bet_amount = 0
    user.bonk_bet_token = ''
    user.interest_start_time = clock.unix_timestamp()  # 更新結束時間

    # 輸出相關訊息
    print("Bonk end")
    print(f"timestamp: {user.interest_start_time}")


