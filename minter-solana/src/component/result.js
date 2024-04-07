import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Mine from "./mine";

import Local from "../lib/local";
import Render from "../lib/render";
import Data from "../lib/data";
import tools from "../lib/tools";
import Chain from "../network/solana";

import Encry from "../lib/encry";

import { FaBackspace } from "react-icons/fa";

function Result(props) {
    const size = {
        row: [12],
        sell: [8, 4],
        back: [8, 4],
    };

    let [width, setWidth] = useState(100);
    let [height, setHeight] = useState(100);
    let [block, setBlock] = useState(0);

    let [block_hash, setBlockHash] = useState("");

    let [selling, setSelling] = useState(false);

    let [password, setPassword] = useState("");
    let [price, setPrice] = useState(0);
    let [info, setInfo] = useState("");

    const dom_id = "pre_result";

    const self = {
        changePrice: (ev) => {
            setPrice(ev.target.value);
        },
        changePassword: (ev) => {
            setPassword(ev.target.value);
        },
        clickUnSell: (ev) => {
            if (!password) return setInfo("Please input the password");
            //if (!name) return setInfo("Internal error: missing anchor name.");
            const fa = Local.get("login");
            if (fa === undefined) return setInfo("Internal error: no account to setup.");
        },
        clickSell: (ev) => {
            console.log(`Ready to selling`);

            if (price === 0) return setInfo("Please set a price to sell");
            if (!password) return setInfo("Please input the password");
            //if (!name) return setInfo("Internal error: missing anchor name.");
            const fa = Local.get("login");
            if (fa === undefined) return setInfo("Internal error: no account to setup.");

            // const acc = JSON.parse(fa);
            // const privateKey = Encry.decode(acc.private, password);
            // if (!privateKey) {
            //     setInfo("Invalid password");
            //     setPassword("");
            //     return false;
            // }
            // Chain.recover(privateKey, (pair) => {
            //     const NFT = props.anchor;
            //     const contact = "0xa69ddda382a348869159f1ed42eb2fd978a5a9b5e741a5f144be4b2ff9ffd069"
            //     const args = {
            //         hash: contact,
            //         method: "::birds_nft::sellBird",
            //         params: [
            //             NFT,    //Mint result name
            //             price,   //price
            //         ],
            //     }
            //     console.log(args);

            //     return Chain.contact(pair, args, (res) => {
            //         if(res.error) return setInfo("Error");
            //         setInfo("Please check on market");
            //         setSelling(true);
            //         props.dialog(<Mine fresh={props.fresh} dialog={props.dialog} />, "My iNFT list");
            //     });
            // });
        },
        clickHome: (ev) => {
            props.dialog(<Mine fresh={props.fresh} dialog={props.dialog} />, "My iNFT list");
        },
        getTemplate: (alink, ck) => {
            if (!Data.exsistHash("cache", alink)) {
                Chain.read(alink, (res) => {
                    const key = `${res.location[0]}_${res.location[1]}`;
                    const raw = JSON.parse(res.data[key].raw);
                    res.data[key].raw = raw;
                    Data.setHash("cache", alink, res.data[key]);
                    return ck && ck(res.data[key]);
                });
            } else {
                const dt = Data.getHash("cache", alink);
                return ck && ck(dt);
            }
        },
        // filterNFT: (hash, arr) => {
        //     for (let i = 0; i < arr.length; i++) {
        //         const row = arr[i];
        //         //console.log(row);
        //         if (row.token_data_id === hash) return row;
        //     }
        // },
    }

    useEffect(() => {
        setBlockHash(props.anchor);
        const fa = Local.get("login");
        if (!fa) return false;
        const login = JSON.parse(fa);
        const addr = login.address;
        //const all=

        //const target = self.filterNFT(props.anchor, all);
        //console.log(props.anchor);
        //if (target === undefined) return false;

        //1.render iNFT
        const tpl = Data.get("template");
        setWidth(tpl.size[0]);
        setHeight(tpl.size[1]);

        setTimeout(() => {
            const pen = Render.create(dom_id, true);
            const basic = {
                cell: tpl.cell,
                grid: tpl.grid,
                target: tpl.size
            }
            Render.clear(dom_id);
            Render.preview(pen, tpl.image, props.anchor, tpl.parts, basic);
        }, 50);

        //2.save the list
        // if (!props.skip) {
        //     const its = Local.get("list");
        //     const nlist = its === undefined ? {} : JSON.parse(its);
        //     if (nlist[addr] === undefined) nlist[addr] = [];

        //     nlist[addr].unshift({
        //         hash: target.token_data_id,                    // random hash
        //         name: target.current_token_data.token_uri,      // template hash
        //     });

        //     Local.set("list", JSON.stringify(nlist));
        // }

    }, [props.update, props.anchor]);

    return (
        <Row>
            <Col className="pt-2" sm={size.back[0]} xs={size.back[0]}>
                {/* Block: {block.toLocaleString()} */}
            </Col>
            <Col className="pb-2 text-end" hidden={!props.back} sm={size.back[1]} xs={size.back[1]}>
                <FaBackspace size={40} color={"#FFAABB"} onClick={(ev) => {
                    self.clickHome(ev);
                }} />
            </Col>
            <Col className="text-center pt-2" sm={size.row[0]} xs={size.row[0]} style={{ minHeight: "300px" }}>
                <canvas width={width} height={height} id={dom_id} style={{ width: "100%" }}></canvas>
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                Hash: {tools.shorten(block_hash, 16)}
            </Col>
            {/* <Col sm={size.row[0]} xs={size.row[0]}>
                Recommand Price: <strong>$AC 100</strong>; Rarity: <strong>0.15%</strong>
            </Col> */}
            <Col sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col className="pb-2" sm={size.row[0]} xs={size.row[0]}>
                        <input className="form-control" type="password" placeholder="Account password ..." onChange={(ev) => {
                            self.changePassword(ev);
                        }} />
                    </Col>

                    <Col hidden={selling} sm={size.sell[0]} xs={size.sell[0]}>
                        <input className="form-control" type="text" placeholder="Price to sell."
                            value={price}
                            onChange={(ev) => {
                                self.changePrice(ev);
                            }} />
                    </Col>
                    <Col hidden={selling} className="text-end" sm={size.sell[1]} xs={size.sell[1]}>
                        <button className="btn btn-md btn-primary" onClick={(ev) => {
                            self.clickSell();
                        }}>Sell</button>
                    </Col>
                    <Col hidden={selling} className="text-end" sm={size.row[0]} xs={size.row[0]}>
                        {info}
                    </Col>

                    <Col hidden={!selling} sm={size.sell[0]} xs={size.sell[0]}>{info}</Col>
                    <Col hidden={!selling} className="text-end" sm={size.sell[1]} xs={size.sell[1]}>
                        <button className="btn btn-md btn-primary" onClick={(ev) => {
                            self.clickUnSell();
                        }}>Revert</button>
                    </Col>

                </Row>
            </Col>

        </Row>
    )
}

export default Result;