from seahorse.prelude import 

declare_id('HPAHsBjcC8NRQcp9x4tFYL6HPBAsnJJqR1RnJp3jYWo5')

class Admin(Account)
    admin_address Pubkey
    Token_Account_Address Pubkey
    Token_Account_Bump u8
    mint_Account_Address Pubkey
    mint_Account_Bump u8

@instruction
def init_admin(owner Signer, admin Empty[Admin])
    
    admin = admin.init(
        payer = owner,
        seeds = ['admin', owner]
    )

    admin.admin_address = owner.key()

@instruction
def token_mint(signer Signer, BONK_mint Empty[TokenMint], admin Admin)
    
    assert(signer.key() == admin.admin_address), Only Admin authorized to call this function

    BONK_mint.init(
        payer = signer,
        seeds = ['bonk_mint', signer],
        decimals = 5,
        authority = signer
    )

    pda_pubkey, bump = Pubkey.find_program_address(['bonk_mint', signer])
    admin.mint_Account_Address = pda_pubkey
    admin.mint_Account_Bump = bump

@instruction
def admin_token_account(signer Signer, admin_account Empty[TokenAccount], mint TokenMint, admin Admin)
   
    admin_account.init(
        payer = signer, 
        seeds = ['admin_token', signer], 
        mint = mint, 
        authority = signer
    )

    pda_pubkey, bump = Pubkey.find_program_address(['admin_token', signer])
    admin.Token_Account_Address = pda_pubkey
    admin.Token_Account_Bump = bump

@instruction
def mint_tokens(signer Signer, mint TokenMint, recipient TokenAccount, admin Admin, amount u64)

    assert(signer.key() == admin.admin_address), Only Admin authorized to call this function
  
    mint.mint(
        authority = signer,
        to = recipient,
        amount = amount
    )