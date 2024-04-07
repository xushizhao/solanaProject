use borsh::{BorshDeserialize, BorshSerialize};
// use serde_json;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// 定义部件数据结构
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct Part {
    pub value: Vec<u32>,
    pub img: Vec<u32>,
    pub position: Vec<u32>,
    pub center: Vec<f32>,
    pub rotation: Vec<u32>,
    pub rarity: Vec<Vec<u32>>,
}

// 定义系列数据结构
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct Series {
    pub name: String,
    pub desc: String,
}

// 定义用户数据结构
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct InftJson {
    pub size: Vec<u32>,
    pub cell: Vec<u32>,
    pub grid: Vec<u32>,
    pub parts: Vec<Part>,
    pub series: Vec<Series>,
    pub type_: u32,
    pub image: String,
    pub version: String,
}
// 生成并写入账户数据的函数
pub fn get_inftJson(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> Result<InftJson, ProgramError> {
    // 检查账户数量是否正确
    let accounts_iter = &mut accounts.iter();
    let data_account = next_account_info(accounts_iter)?;

    // 创建系列数据
    let series_data = vec![
        Series {
            name: "Red".to_string(),
            desc: "".to_string(),
        },
        Series {
            name: "White".to_string(),
            desc: "".to_string(),
        },
        Series {
            name: "Green".to_string(),
            desc: "".to_string(),
        },
        Series {
            name: "Yellow".to_string(),
            desc: "".to_string(),
        },
        Series {
            name: "Blue".to_string(),
            desc: "".to_string(),
        },
        Series {
            name: "Colorful".to_string(),
            desc: "".to_string(),
        },
    ];

    let parts_data = vec![
        Part {
            value: vec![0, 2, 1, 0],
            img: vec![0, 0, 7, 7],
            position: vec![0, 0],
            center: vec![0.0, 0.0],
            rotation: vec![0],
            rarity: vec![vec![0], vec![0], vec![0], vec![0], vec![0], vec![0]],
        },
        Part {
            value: vec![4, 2, 8, 0],
            img: vec![0, 10, 0, 0],
            position: vec![100, 180],
            center: vec![0.5, 0.0],
            rotation: vec![0],
            rarity: vec![
                vec![6],
                vec![1],
                vec![3],
                vec![5],
                vec![7],
                vec![1, 3, 5, 6, 7],
            ],
        },
        Part {
            value: vec![8, 2, 8, 0],
            img: vec![0, 11, 0, 0],
            position: vec![150, 180],
            center: vec![0.5, 0.0],
            rotation: vec![0],
            rarity: vec![
                vec![7],
                vec![2],
                vec![4],
                vec![3],
                vec![0],
                vec![0, 2, 3, 4, 7],
            ],
        },
        Part {
            value: vec![12, 2, 8, 0],
            img: vec![0, 12, 0, 0],
            position: vec![200, 180],
            center: vec![0.5, 0.0],
            rotation: vec![0],
            rarity: vec![
                vec![1],
                vec![5],
                vec![2],
                vec![6],
                vec![3],
                vec![1, 2, 3, 5, 6],
            ],
        },
        Part {
            value: vec![16, 2, 8, 0],
            img: vec![0, 13, 0, 0],
            position: vec![250, 180],
            center: vec![0.5, 0.0],
            rotation: vec![0],
            rarity: vec![
                vec![4],
                vec![1],
                vec![7],
                vec![3],
                vec![5],
                vec![1, 3, 4, 5, 7],
            ],
        },
        Part {
            value: vec![20, 2, 8, 0],
            img: vec![0, 14, 0, 0],
            position: vec![300, 180],
            center: vec![0.5, 0.0],
            rotation: vec![0],
            rarity: vec![
                vec![5],
                vec![0],
                vec![1],
                vec![7],
                vec![2],
                vec![0, 1, 2, 5, 7],
            ],
        },
    ];

    // 创建并设置用户数据结构
    let inftJson = InftJson {
        size: vec![400, 400],
        cell: vec![50, 50],
        grid: vec![8, 16],
        parts: parts_data,
        series: series_data,
        type_: 2,
        image: "".to_string(),
        version: "2024_flamingo".to_string(),
    };

    //将inftjson序列化为字节数组
    let serialized_data = inftJson
        .try_to_vec()
        .map_err(|_| ProgramError::InvalidArgument)?;

    // 将数据写入账户data下
    data_account
        .data
        .borrow_mut()
        .copy_from_slice(&serialized_data);

    // 返回 inftJson 数据
    Ok(inftJson)
}

// 定义 NFT 结构体
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct NFT {
    pub id: u64,
    pub owner: Pubkey,
    pub metadata: String,
}

// 铸造新的 NFT
pub fn mint_nft(
    program_id: &Pubkey,
    mint_pubkey: &Pubkey, //NFT 集合的公钥，用于标识存储 NFT 的账户
    owner_pubkey: &Pubkey, //新铸造的 NFT 的所有者的公钥  (理论上Mint者就是nft所有者)
    metadata: String,      //包含有关 NFT 的元数据的字符串
) -> ProgramResult {
    // 获取 NFT 集合账户信息
    let mint_account_info = AccountInfo::new(mint_pubkey, false);

    // 创建新的 NFT 实例
    let nft = NFT {
        id: 1, // 这里假设 NFT 的 ID 是 1
        owner: *owner_pubkey,
        metadata,
    };

    // 序列化 NFT 数据
    let mut data = Vec::new();
    nft.serialize(&mut data)?;

    // 将新的 NFT 数据写入集合账户
    mint_account_info.data.borrow_mut().copy_from_slice(&data);

    Ok(())
}



// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {

    // 解析指令数据并根据不同的情况调用不同的方法
    match instruction_data.get(0) {
        Some(&method_id) => {
            match method_id {
                // 如果指令数据为 1，刚返回数据
                1 => {
                    msg!("method 1");
                    get_inftJson(program_id, &accounts[0].key)?;
                }
                // 如果指令数据为 2，则调用 mint_nft 方法
                2 => {
                    // 检查传入的参数是否符合要求
                    if accounts.len() < 3 {
                        return Err(ProgramError::NotEnoughAccountKeys);
                    }
                    let mint_pubkey = &accounts[1].key;
                    let owner_pubkey = &accounts[2].key;
                    let metadata = String::from_utf8(instruction_data[1..].to_vec())
                        .map_err(|_| ProgramError::InvalidInstructionData)?;
                    msg!("method 2", metadata);
                    mint_nft(program_id, mint_pubkey, owner_pubkey, metadata)?;
                }
                // 如果指令数据为其他值，则返回错误
                _ => return Err(ProgramError::InvalidInstructionData),
            }
        }
        None => return Err(ProgramError::InvalidInstructionData),
    }

    Ok(())
}
