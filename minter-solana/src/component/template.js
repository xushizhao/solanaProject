import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";


import Detail from "./detail";

import Local from "../lib/local";
import Data from "../lib/data";
import Render from "../lib/render";
import Copy from "../lib/clipboard";
import tools from "../lib/tools";

import Chain from "../network/solana";

import { FaExchangeAlt, FaTrashAlt, FaCopy,FaFolderOpen } from "react-icons/fa";

function Template(props) {
    const size = {
        row: [12],
        add: [10, 2],
        detail: [9, 3],
        alink: [9,3],
    };

    let [list, setList] = useState([]);
    let [alink, setAlink] = useState("");

    const zero = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const self = {
        changeAlink: (ev) => {
            setAlink(ev.target.value.trim());
        },
        clickAdd: (ev) => {
            console.log(`Add a template`);
            const tpls = Local.get("template");
            const nlist = !tpls ? [] : JSON.parse(tpls);
            nlist.unshift({
                alink: alink,
                name: "",
                tags: []
            });
            Local.set("template", JSON.stringify(nlist));
            //setList(nlist);
            self.showTemplate();
        },
        clickTry:(index)=>{
            if(index===0) return true;
            const tpls = JSON.parse(Local.get("template"));
            const nlist=[tpls[index]];
            for(let i=0;i<tpls.length;i++){
                if(i!==index) nlist.push(tpls[i]);
            }
            Local.set("template",JSON.stringify(nlist))
            self.showTemplate();
            props.fresh(true);
        },
        clickOpen:(index)=>{
            const tpls = JSON.parse(Local.get("template"));
            const tpl=tpls[index];
            props.dialog(<Detail alink={tpl.alink} skip={true} back={true} dialog={props.dialog} fresh={props.fresh}/>,"Tempalate Details");
        },
        clickRemove:(index)=>{
            const tpls = JSON.parse(Local.get("template"));
            const nlist=[];
            for(let i=0;i<tpls.length;i++){
                if(i!==index) nlist.push(tpls[i]);
            }
            Local.set("template",JSON.stringify(nlist))
            self.showTemplate();
            props.fresh(true);
        },
        cacheData: (alinks, ck, dels) => {
            if (dels === undefined) dels = [];
            if (alinks.length === 0) return ck && ck(dels);
            const single = alinks.pop();
            console.log(single);
            if (!Data.exsistHash("cache", single)){
                const res=window.mock_template(single);
                    if(res===false){
                        const left = alinks.length;
                        dels.push(left);
                        return self.cacheData(alinks, ck, dels);
                    }
                    if(res.image!==undefined){
                        //res.image=tools.hexToString(res.image.substr(2));
                        Data.setHash("cache", single, res);
                        return self.cacheData(alinks, ck, dels);
                    }
            } else {
                return self.cacheData(alinks, ck, dels);
            }
        },
        getThumbs: (arr, dom_id, ck, todo) => {

            if (todo === undefined) todo = [];
            if (arr.length === 0) return ck && ck(todo);

            //1.get cache data
            const me = arr.shift();
            const dt = Data.getHash("cache", me.alink.toLocaleLowerCase());
            //console.log(dt);
            const basic = {
                cell: dt.cell,
                grid: dt.grid,
                target: dt.size
            }

            //2.prepair canvas
            const con = document.getElementById("tpl_handle");
            const cvs = document.createElement('canvas');
            cvs.id = dom_id;
            cvs.width = 400;
            cvs.height = 400;
            con.appendChild(cvs);

            const pen = Render.create(dom_id, true);
            Render.reset(pen);
            Render.preview(pen, dt.image, zero, dt.parts, basic);

            //3.get the image
            return setTimeout(() => {
                me.bs64 = pen.canvas.toDataURL("image/jpeg");
                //me.block = row.block;
                todo.push(me);
                con.innerHTML = "";

                return self.getThumbs(arr, dom_id, ck, todo);
            }, 200);
        },
        clickClean: (ev) => {
            Local.remove("template");
            props.fresh();
        },
        cacheImages:(list,ck)=>{        //cache images from NFT.storage

        },
        showTemplate: () => {
            const tpls = Local.get("template");
            const nlist = !tpls ? [] : JSON.parse(tpls);

            const arr = [];
            for (let i = 0; i < nlist.length; i++) {
                arr.push(nlist[i].alink);
            }

            self.cacheData(arr, (dels) => {
                const last = []
                for (let i = 0; i < nlist.length; i++) {
                    nlist[i].data = Data.getHash("cache", nlist[i].alink);
                    if (!dels.includes(i)) last.push(nlist[i]);
                }

                self.getThumbs(last, dom_id, (glist) => {
                    setList(glist);
                });
            });
        }
    }

    const dom_id = "pre_image";
    useEffect(() => {
        self.showTemplate();
    }, [props.update]);

    return (
        <Row>
            <Col className="pb-2" sm={size.add[0]} xs={size.add[0]}>
                <input className="form-control" type="text" placeholder="The template storage account" value={alink} onChange={(ev) => {
                    self.changeAlink(ev);
                }} />
            </Col>
            <Col className="text-end pb-2" sm={size.add[1]} xs={size.add[1]}>
                <button className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickAdd(ev);
                }}>Add</button>
            </Col>
            {/* <Col sm={size.row[0]} xs={size.row[0]}>
                <Upload fresh={props.fresh} update={props.update}/>
            </Col> */}
            
            <Col hidden={true} id="tpl_handle" sm={size.row[0]} xs={size.row[0]}>
                {/* <canvas hidden={true} width={400} height={400} id={dom_id}></canvas> */}
            </Col>
            <div className="limited">
                {list.map((row, index) => (
                    <Col className="pt-2" key={index} sm={size.row[0]} xs={size.row[0]}>
                        <Row>
                            <Col className="" sm={size.row[0]} xs={size.row[0]}><hr /></Col>
                            <Col sm={size.alink[0]} xs={size.alink[0]}>
                                Hash: <strong>{tools.shorten(row.alink,12)}</strong> <br />
                                {row.data.parts.length} parts.
                            </Col>
                            <Col className="text-end pt-2" sm={size.alink[1]} xs={size.alink[1]}>
                                <FaCopy size={28} className="text-primary" onClick={(ev)=>{
                                    Copy(row.alink);
                                }}/>
                            </Col>
                            <Col sm={size.detail[0]} xs={size.detail[0]} onClick={(ev)=>{
                                self.clickOpen(index);
                            }}>
                                <img className="template" src={row.bs64} alt="" />
                            </Col>
                            <Col sm={size.detail[1]} xs={size.detail[1]}>
                                <Row className="pt-2">
                                    <Col className="pt-4" sm={size.row[0]} xs={size.row[0]}></Col>
                                    <Col className="text-end pt-4" sm={size.row[0]} xs={size.row[0]}>
                                        <FaExchangeAlt size={28} className="text-primary" onClick={(ev)=>{
                                            self.clickTry(index);
                                        }}/>
                                    </Col>
                                    <Col className="pt-4" sm={size.row[0]} xs={size.row[0]}></Col>
                                    <Col className="text-end pt-4" sm={size.row[0]} xs={size.row[0]}>
                                        <FaFolderOpen size={28} className="text-primary" onClick={(ev)=>{
                                            self.clickOpen(index);
                                        }}/>
                                    </Col>
                                    <Col className="pt-4" sm={size.row[0]} xs={size.row[0]}></Col>
                                    <Col className="pt-4 text-end" sm={size.row[0]} xs={size.row[0]}>
                                        <FaTrashAlt size={28} className="text-danger" onClick={(ev)=>{
                                            self.clickRemove(index);
                                        }}/>
                                    </Col>
                                </Row>
                            </Col>
                            
                        </Row>
                    </Col>
                ))}
            </div>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="text-end" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickClean(ev);
                }}>Clean</button>
            </Col>
        </Row>
    )
}

export default Template;