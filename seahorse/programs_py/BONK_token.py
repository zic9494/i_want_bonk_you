from seahorse.prelude import *  

declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')  

# 定義 Admin 帳戶的結構
class Admin(Account):  
    admin_address: Pubkey  # 管理者的公鑰
    Token_Account_Address: Pubkey  # Token 帳戶的公鑰
    Token_Account_Bump: u8  # Token 帳戶的 Bump 值
    mint_Account_Address: Pubkey  # Mint 帳戶的公鑰
    mint_Account_Bump: u8  # Mint 帳戶的 Bump 值

# 初始化 Admin 帳戶的指令
@instruction
def init_admin(owner: Signer, admin: Empty[Admin]):
    """
    初始化 Admin 帳戶，並創建一個 PDA 來存儲管理員相關資訊。
    """
    admin = admin.init(
        payer=owner,  # 支付創建費用的簽名者
        seeds=['admin', owner],  # 使用 'admin' 和 owner 的鍵生成種子
        space=104  # 設定空間大小（預留足夠的空間來存儲所有字段）
    )

    pda_pubkey, bump = Pubkey.find_program_address(['admin', owner])  # 找到 PDA 的地址和 Bump 值

    amount = 2 * 1_000_000  # 設定轉移的 SOL 數量
    owner.transfer_lamports(admin, amount)  # 將 SOL 轉移到 PDA

    admin.admin_address = owner.key()  # 設置 Admin 帳戶的管理地址

# 創建 Token Mint 帳戶的指令
@instruction
def token_mint(signer: Signer, BONK_mint: Empty[TokenMint], admin: Admin):
    """
    創建一個新的 Token Mint 帳戶，僅允許 Admin 調用。
    """
    assert(signer.key() == admin.admin_address), "只有 Admin 可以調用此函數"

    bonk = BONK_mint.init(
            payer = signer, # 支付費用的簽名者
            seeds = ['bonk_mint', signer], # 使用 'bonk_mint' 和 signer 生成種子
            decimals = 5, # 設定 Token 的小數位數
            authority = signer # 設定簽名者為權限者
            )

    pda_pubkey, bump = Pubkey.find_program_address(['bonk_mint', signer])

    amount = 2 * 1_000_000
    signer.transfer_lamports(bonk, amount)  # 向 Mint 帳戶轉移 SOL

    admin.mint_Account_Address = pda_pubkey  # 設置 Admin 中的 Mint 帳戶地址
    admin.mint_Account_Bump = bump  # 設置 Bump 值

# 創建 Admin Token 帳戶的指令
@instruction
def admin_token_account(signer: Signer, admin_account: Empty[TokenAccount], mint: TokenMint, admin: Admin):
    """
    創建一個 Token 帳戶來儲存新生成的 Token。
    """
    admin_token_account = admin_account.init(
                            payer = signer, 
                            seeds = ['admin_token', signer], 
                            mint = mint, 
                            authority = signer
                          )

    pda_pubkey, bump = Pubkey.find_program_address(['admin_token', signer])

    amount = 3 * 1_000_000
    signer.transfer_lamports(admin_token_account, amount)  # 向 Token 帳戶轉移 SOL

    admin.Token_Account_Address = pda_pubkey  # 設置 Admin 中的 Token 帳戶地址
    admin.Token_Account_Bump = bump  # 設置 Bump 值

# 為指定帳戶鑄造 Token 的指令
@instruction
def mint_tokens(signer: Signer, mint: TokenMint, recipient: TokenAccount, admin: Admin, amount: u64):
    """
    往接收者的 Token 帳戶中鑄造指定數量的 Token。
    """
    assert(signer.key() == admin.admin_address), "只有 Admin 可以鑄造 Token"

    mint.mint(
        authority=signer,  # 使用 Admin 簽名來授權鑄造
        to=recipient,  # 接收鑄造的 Token 的帳戶
        amount=amount  # 鑄造的數量
    )