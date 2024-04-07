import Chain from "../network/solana";

const self = {
    test_contract: () => {
        //1.call the target contract
        const appkey = "k6cgN7HWWcZwAXAuguSZu6SWTiVxPM6hsXNzjQtuFPF";
        //const napp="7N1CUpr3xe7K6bikS47FaiXXxxzSuboXZ9fiArdpTtU6";
        //const napp="2RKUqkzNWdi5o8i2ynWDxk3V4wDoLFVMbzbm4gTjtfHA";
        const napp = "Di3VKXKbLiFFDhXNJW7Ki1NLrNy7b78TAbvfceDsHDNw"
        Chain.run(napp, { hello: "my word" }, (res) => {
            console.log(res);
        }, "devnet");
    },

    test_transaction_details: () => {
        //2.get the transaction details
        const txHash = "38d2tMmwSJgQKQhEQevXW4xmFLjw5h85itK8tHUnYdtJn9K7tvPMJKA8MsLfazCLaWfauWY5vq9qCuvSg9ztid21";
        Chain.view(txHash, "transaction", (res) => {
            console.log(res);
        }, "devnet");
    },

    test_account_details: () => {

        const hash = "EZTgEHD3DiftqDL3FcHGcZNKwmwD7inj5YN9epBJVghv";
        Chain.view(hash, "account", (res) => {
            console.log(res.data.toString());
        }, "devnet");

        // const hash="GnCofcUAbaMsWfqE4i5X2QELZ1oseMqb5XyUraoQQScW";
        // Chain.view(hash,"account",(res) => {
        //   console.log(hash);
        //   console.log(res);
        //   console.log(res.data.toString())
        // }, "devnet");
    },
    test_call_program: () => {
        const program_id = "83EAcYs5J9PoGUvkxyiB4axaMPRCUa6paBmov2A2L4Pm";
        const data_id = "Fw23tEb632ytFPA8XPYhKRYi2584tphexcMpsLw4hc6y";
        const owner_id = "EmEY2LbCJT5Povwo96bP88A1e6mAaADKhZ4P1xY7zHWJ";
        Chain.test(program_id, data_id, owner_id, (res) => {
            console.log(res);
        }, "devnet");

    },
    test_storage: () => {
        Chain.storage({ hello: "world peace" }, (obj) => {

        });

        Chain.data.save({ hello: "world peace" }, (hash) => {
            console.log(hash);
        }, "devnet");
    },
    test_transaction:()=>{
        const hash = "41MitaazWq25vRKRG3be21p9dDtBf8th6JhJp9ScJZ97tucWKKTRyEtyH4ro6NA4tPHUQdK9TiE7Phc3KgH6pNS6";
        Chain.view(hash, "transaction", (res) => {
            console.log(res);
        }, "devnet");
    }
}

export default self;