# seahorse
# Built with Seahorse v0.2.0

from seahorse.prelude import *

declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

#用於映射使用公鑰和PDA
class registey(Account):
    use_pda: Dict[Pubkey, Pubkey] 

#初始化字典
@instruction
def initialize_registry(signer: Signer, registry: Empty[registey]):
    registry.init(payer = signer)
    print("PDA Registry Initialized.")

#使用者新增PDA
@instruction
def use_register(signer: signer, registey: registey, pda_pubkey: Pubkey):
    registey.use_pda[signer.key()] = pda_pubkey
    print(f"Registered PDA {pda_pubkey} for user {signer.key()}")

#查詢PDA地址
@instruction
def get_user_pda(signer: Signer, registry: registey):
    pda = registry.user_pdas.get(signer.key(), None)
    if pda:
        print(f"PDA for user {signer.key()}: {pda}")
    else:
        print("PDA not found for this user.")

#初始化用戶PDA
@instruction
def initialize_user_pda(signer: Signer, token_account: Empty[TokenAccount], mint: TokenMint):
    seeds = ["user-pda", signer.key()]
    pda_pubkey, bump = Pubkey.find_program_address(seeds, declare_id())
    
    #新增代幣子帳戶
    token_account.init(
        payer = signer,
        mint = mint,
        authority = pda_pubkey,
        seeds = seeds
    )
    print(f"User PDA created with bump: {bump}")
    