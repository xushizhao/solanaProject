use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::next_account_info,
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

// 定义 NFT 结构体
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct NFTACCOUNT {
    pub owner: Pubkey,
    pub metadata: String,
}
entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

    // find space and minimum rent required for account
    let space = instruction_data[0];
    let bump = instruction_data[1];
    let rent_lamports = rent_sysvar_account_info.minimum_balance(space.into());

    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &pda_account_info.key,
            rent_lamports,
            space.into(),
            program_id,
        ),
        &[payer_account_info.clone(), pda_account_info.clone()],
        &[&[b"escrow6", &[bump]]],
    )?;

    let image = "https://www.baidu.com/img/flexible/logo/pc/result.png".to_string();

    let nft_Account = NFTACCOUNT {
        owner: *pda_account_info.key,
        metadata: image,
    };

    // 序列化 NFT 数据
    let mut data = Vec::new();
    nft_Account.serialize(&mut data)?;

    // 将新的 NFT 数据写入集合账户
    pda_account_info.data.borrow_mut().copy_from_slice(&data);

    Ok(())
}
