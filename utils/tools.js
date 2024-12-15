const crypto = require("crypto");
const config = require("../config/config");
const pmlib = require("./sign-util-lib");

// Fields not participating in signature
const excludeFields = [
    "sign",
    "sign_type",
    "header",
    "refund_info",
    "openType",
    "raw_request",
    "biz_content",
];

function signRequestObject(requestObject) {
    let fields = [];
    let fieldMap = {};
    for (let key in requestObject) {
        if (excludeFields.indexOf(key) >= 0) {
            continue;
        }
        fields.push(key);
        fieldMap[key] = requestObject[key];
    }
    if (requestObject.biz_content) {
        let biz = requestObject.biz_content;
        for (let key in biz) {
            if (excludeFields.indexOf(key) >= 0) {
                continue;
            }
            fields.push(key);
            fieldMap[key] = biz[key];
        }
    }
    fields.sort();
    let signStrList = [];
    for (let i = 0; i < fields.length; i++) {
        let key = fields[i];
        signStrList.push(key + "=" + fieldMap[key]);
    }
    let signOriginStr = signStrList.join("&");
    return signString(signOriginStr, config.privateKey);
}

function createTimeStamp() {
    return Math.round(new Date() / 1000) + "";
}

function createNonceStr() {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let str = "";
    for (let i = 0; i < 32; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

module.exports = {
    signRequestObject,
    createTimeStamp,
    createNonceStr
}; 