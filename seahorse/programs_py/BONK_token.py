from seahorse.prelude import *

declare_id('CrAydyeqPc5bozC2H3MgqwZXQ3ytEyDBujWLv2yWcfVw')

class Admin(Account):
    bump: u8
    admin_address: Pubkey
    Token_Account_Address: Pubkey
    Token_Account_Bump: u8
    mint_Account_Address: Pubkey
    mint_Account_Bump: u8

@instruction
def init_admin(owner: Signer, admin: Empty[Admin]):
    
    admin = admin.init(
        payer = owner,
        seeds = ['admin', owner],
        space = 150
    )

    pda_pubkey, bump = Pubkey.find_program_address(['admin', owner])

    amount = 2 * 1_000_000
    owner.transfer_lamports(admin, amount)

    admin.bump = bump
    admin.admin_address = owner.key()

@instruction
def token_mint(signer: Signer, BONK_mint: Empty[TokenMint], admin: Admin):
    
    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"

    bonk = BONK_mint.init(
            payer = signer,
            seeds = ['bonk_mint', signer],
            decimals = 5,
            authority = signer
            )

    pda_pubkey, bump = Pubkey.find_program_address(['bonk_mint', signer])

    amount = 2 * 1_000_000
    signer.transfer_lamports(bonk, amount)

    admin.mint_Account_Address = pda_pubkey
    admin.mint_Account_Bump = bump

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

    admin.Token_Account_Address = pda_pubkey
    admin.Token_Account_Bump = bump

@instruction
def mint_tokens(signer: Signer, mint: TokenMint, recipient: TokenAccount, admin: Admin, amount: u64):

    assert(signer.key() == admin.admin_address), "Only Admin authorized to call this function"
  
    mint.mint(
        authority = signer,
        to = recipient,
        amount = amount
    )

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