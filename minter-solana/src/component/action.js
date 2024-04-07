import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Result from "./result";

import Local from "../lib/local";
import Account from "./account";
import tools from "../lib/tools"
import Chain from "../network/solana";

import Encry from "../lib/encry";

function Action(props) {
    const size = {
        row: [12],
        password: [2, 8, 2]
    };

    let [info, setInfo] = useState("");
    let [password, setPassword] = useState("");
    let [hidden, setHidden] = useState(true);
    let [disable, setDisable] = useState(false);

    const self = {
        changePassword: (ev) => {
            setPassword(ev.target.value);
            setDisable(!ev.target.value ? true : false);
        },

        getAnchorName: (ck) => {
            const name = `iNFT_${tools.char(14)}`;
            Chain.read(`anchor://${name}`, (res) => {
                //console.log(res);
                if (res.location[1] === 0) return ck && ck(name);
                return self.getAnchorName(ck);
            });
        },

        getProtocol: () => {
            return {
                type: "data",        //数据类型的格式
                fmt: "json",
                tpl: "iNFT",
            }
        },

        getRaw: (tpl) => {
            return {
                tpl: tpl.alink,      //使用的mint模版
                stamp: [],           //辅助证明的各个链的数据
            }
        },
        getTemplate: () => {
            const ts = Local.get("template");
            if (!ts) return false;

            try {
                const tpls = JSON.parse(ts);
                //console.log(tpls);
                return tpls[0].alink;
            } catch (error) {
                return false;
            }
        },
        sell: () => {

        },
        checkTransaction: (hash, ck, network) => {
            setTimeout(() => {
                Chain.view(hash, "transaction", (res) => {
                    if (res === null) return self.checkTransaction(hash, ck, network);
                    return ck && ck(res);
                }, network);
            },600);
        },
        clickMint: (ev) => {
            const fa = Local.get("login");
            if (fa === undefined) {
                props.dialog(<Account fresh={props.fresh} dialog={props.dialog} />, "Account Management");
            } else {
                if (!password) {
                    setDisable(true);
                    return false;
                }
                setDisable(true);
                try {
                    const acc = JSON.parse(fa);
                    //console.log(acc);
                    const privateKey = Encry.decode(acc.private, password);
                    //console.log(privateKey);
                    if (!privateKey) {
                        setInfo("Invalid password");
                        setPassword("");
                        return false;
                    }

                    //mint contract
                    const net = "devnet";
                    Chain.recover(privateKey, (pair) => {
                        const tpl = self.getTemplate();
                        if (tpl === false) return false;

                        setInfo("Ready to mint");
                        const NFT_name = `iNFT_${tools.rand(100000, 999999)}`;
                        const program_bs48 = "E4PzkEaDhtToPvtHUh4Lp5KAR8wzcmscFm9ARiv6fD5D";
                        const params = {};
                        Chain.run(program_bs48, params, pair, (txHash) => {
                            if (!txHash) {
                                setDisable(false);
                                return setInfo("Failed to mint");
                            }

                            setInfo("Done, checking...");
                            self.checkTransaction(txHash, (trans) => {
                                //console.log(trans);
                                setInfo("Got transaction,check slot hash ...");
                                const slot=trans.slot;
                                Chain.view(trans.slot, "block", (bk) => {
                                    //console.log(bk);
                                    const block_hash=Chain.bs58ToHex(bk.blockhash);
                                    props.dialog(<Result 
                                        anchor={block_hash} 
                                        transaction={txHash} 
                                        block={slot} 
                                        //target={}
                                    />, "iNFT Result");
                                    setDisable(false);
                                    setTimeout(() => {
                                        setInfo("");
                                    }, 400);
                                }, net);

                            });
                        }, net);
                    });
                } catch (error) {

                }
            }
        },
    }
    useEffect(() => {
        const fa = Local.get("login");
        setHidden(fa !== undefined ? false : true);
        setDisable(fa !== undefined ? true : false)
    }, [props.update]);

    return (
        <div id="footer">
            <Row>
                <Col className="text-center" hidden={hidden} sm={size.row[0]} xs={size.row[0]}>
                    <small>{info}</small>
                </Col>
                <Col className="text-center" hidden={hidden} sm={size.password[0]} xs={size.password[0]}>

                </Col>
                <Col className="text-center" hidden={hidden} sm={size.password[1]} xs={size.password[1]}>
                    <input className="form-control" type="password" placeholder="Password of account"
                        value={password}
                        onChange={(ev) => {
                            self.changePassword(ev);
                        }}
                    />
                </Col>
                <Col className="text-center pt-2" sm={size.row[0]} xs={size.row[0]}>
                    <button className="btn btn-lg btn-primary" disabled={disable} onClick={(ev) => {
                        setInfo("");
                        self.clickMint(ev);
                    }}>Mint Now!</button>
                </Col>
            </Row>
        </div>
    )
}

export default Action;