from seahorse.prelude import *

# 宣告智能合約的程序ID
declare_id('3t3Mr86f1KQDixoWXk5F2iqMLho4dDZdCKaJkoAd8BSv')

# 定義 admin 帳戶結構，包含 admin 的地址
class admin(Account):
    admin_address: Pubkey

# 定義計數器帳戶結構，紀錄序列號
class counter(Account):
    serial_number: u64

# 定義用戶PDA的結構，存儲相關的元數據
class user_pda(Account):
    owner: Pubkey  # 用戶的公鑰
    sol_bump: u8  # SOL 帳戶的 bump 值
    token_pubkey: Pubkey  # 代幣帳戶的公鑰
    token_bump: u8  # 代幣帳戶的 bump 值

# 初始化 admin 帳戶
@instruction
def initialize_admin(signer: Signer, admin: Empty[admin]):
    # 初始化 admin 帳戶，並設定支付者與種子
    admin = admin.init(
        payer = signer,
        seeds = ['admin', signer.key()],
        space = 100  # 設定空間大小
    )

    # 計算 admin 帳戶的 PDA 地址和 bump 值
    pda_pubkey, bump = Pubkey.find_program_address(['admin', signer.key()])

    # 轉賬一定數量的 SOL 到 admin 帳戶
    amount = 2 * 1_000_000
    signer.transfer_lamports(admin, amount)

    # 設置 admin 地址
    admin.admin_address = signer.key()

# 初始化計數器帳戶
@instruction
def initialize_counter(signer: Signer, counter: Empty[counter], admin: admin):
    # 確保只有 admin 可以執行此操作
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    # 初始化計數器帳戶
    counter = counter.init(
        payer = signer,
        seeds = ['counter', signer.key()]
    )

    # 計算計數器的 PDA 地址
    pda_pubkey, bump = Pubkey.find_program_address(['counter', signer.key()])

    # 轉賬一定數量的 SOL 到計數器帳戶
    amount = 2 * 1_000_000
    signer.transfer_lamports(counter, amount)

    # 設置初始的序列號
    counter.serial_number = 0

# 初始化用戶PDA帳戶
@instruction
def initialize_user_pda(signer: Signer, token_account: Empty[TokenAccount], sol_account: Empty[user_pda], mint: TokenMint, counter: counter):
    # 新增用戶的代幣帳戶
    user_bonk = token_account.init(
        payer = signer,
        mint = mint,
        authority = signer,
        seeds = ['user_bonk', signer.key()]
    )

    # 更新計數器的序列號
    counter.serial_number += 1
    pda_bonk, bonk_bump = Pubkey.find_program_address(['user_bonk', signer.key()])

    # 轉賬 SOL 到用戶的代幣帳戶
    amount = 3 * 1_000_000
    signer.transfer_lamports(user_bonk, amount)

    print(f"SPL Token PDA created: {pda_bonk}, bump: {bonk_bump}, sn: {counter.serial_number}")

    # 初始化用戶的 SOL 帳戶
    user_sol = sol_account.init(
        payer = signer,
        seeds = ['user_sol', signer.key()]
    )

    # 更新計數器的序列號
    counter.serial_number += 1
    pda_sol, sol_bump = Pubkey.find_program_address(['user_sol', signer.key()])

    # 轉賬 SOL 到用戶的 SOL 帳戶
    amount = 3 * 1_000_000
    signer.transfer_lamports(user_sol, amount)

    print(f"SPL Token PDA created: {pda_sol}, bump: {sol_bump}, sn: {counter.serial_number}")

    # 設置 user_sol 的相關屬性
    user_sol.owner = signer.key()
    user_sol.sol_bump = sol_bump
    user_sol.token_pubkey = pda_bonk
    user_sol.token_bump = bonk_bump

# 用戶提取 BONK 代幣
@instruction
def withdraw_BONK(signer: Signer, amount: u64, userPDA_account: TokenAccount, user: user_pda, user_account: TokenAccount):
    # 確保簽名者是該用戶的擁有者
    assert(signer.key() == user.owner), "User does not match"

    bump = user.token_bump

    # 轉賬 BONK 代幣
    userPDA_account.transfer(
        authority = signer,
        to = user_account,
        amount = amount,
        signer = ['user_bonk', signer.key(), bump]
    )

# 用戶提取 SOL
@instruction
def withdraw_sol(signer: Signer, amount: u64, user: user_pda):
    # 確保簽名者是該用戶的擁有者
    assert(signer.key() == user.owner), "User does not match"

    bump = user.sol_bump

    # 轉賬 SOL
    user.transfer_lamports(signer, amount)
