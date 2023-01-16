function Jhql(data) {
    if (!(this instanceof Jhql)) {
        return new Jhql();
    }

    this.gitName = null;
    this.token = null;
    this.dataName = "JhqlData";
    this.type = ".json";
    getUserUrl = () => {
        return getContentsUrl();
    };
    getContentsUrl = () => {
        return `https://gitee.com/api/v5/user/repos`;
    };
    getCRUDUrl = (fileName) => {
        return `https://gitee.com/api/v5/repos/${this.gitName}/${this.dataName}/contents/${fileName}`;
    };
    getUrl = () => {
        return ``;
    };
    (build = () => {
        if (data === null || data === undefined) {
            return;
        }
        for (i in data) {
            if (i === "gitName") {
                this.gitName = data[i];
            }
            if (i === "token") {
                this.token = data[i];
            }
            if (i === "type") {
                this.type = data[i];
            }
        }
    }),
        (check = async (tabName) => {
            if (this.gitName === null || this.token === null) {
                throw new Error("配置未初始化");
            }
            if (tabName !== null && tabName !== undefined) {
                let _data = null;
                await axios
                    .get(getCRUDUrl(tabName) + ".json")
                    .then(({data}) => {
                        _data = JSON.parse(Base64.decode(data.content));
                    })
                    .catch((e) => {
                        let code = parseInt(
                            e
                                .toString()
                                .substring(
                                    parseInt(e.toString().indexOf("code")) + 5,
                                    parseInt(e.toString().indexOf("code")) + 8
                                )
                        );
                        if (code === 404) {
                            throw new Error("该表不存在");
                        }
                    });
                return _data;
            }
        });

    this.show = async () => {
        check();
        let names = new Array();
        await axios
            .get(getContentsUrl(),{
                params: {
                    "access_token" : this.token
                }
            })
            .then(({ data }) => {
                data.map((obj) => {
                    names.push(obj.name);
                });
            })
            .catch((e) => {
                console.log(e);
            });
        return names;
    };

    this.create = async (tabName, content, type, message) => {
        check();
        this._type = this.type;
        this._message = `${getNowFormatDate()}`;
        this._content = "[]";
        this._res = null;
        if (tabName === undefined || tabName === null) {
            throw new Error("tabName 是必选参数");
        }
        if (type !== undefined && type !== null) {
            this._type = "." + type;
        }
        if (message !== undefined && message !== null) {
            this._message = message;
        }
        if (content !== undefined && content !== null) {
            if (this._type === ".json") {
                isJSON(content);
            }
            this._content = content;
        }
        await axios({
            method: "post",
            url: getCRUDUrl(tabName) + this._type,
            data: {
                access_token : this.token,
                message: this._message,
                content: Base64.encode(this._content)
            }
        })
            .then((res) => {
                this._res = res;
            })
            .catch((e) => {
                let code = parseInt(
                    e
                        .toString()
                        .substring(
                            parseInt(e.toString().indexOf("code")) + 5,
                            parseInt(e.toString().indexOf("code")) + 8
                        )
                );
                if (code === 400) {
                    throw new Error("该表或以存在");
                }
                throw new Error("create error");
            });
        return this._res;
    };

    this.delete = async (tabName, where) => {
        check();
        if (tabName === undefined || tabName === null) {
            throw new Error("tabName 是必选参数");
        }
        if (where === undefined || where === null) {
            throw new Error("where 是必选参数");
        }
        let _res = null;
        this.datas = null;

        await axios
            .get(getCRUDUrl(tabName) + this.type)
            .then(({ data }) => {
                let content = JSON.parse(Base64.decode(data.content));
                let length = content.length;
                let indexs = 0;
                for (let i = 0; i < length; i++) {
                    let currentIndex = (content || []).findIndex(where);
                    if (currentIndex != -1) {
                        indexs++;
                        content.splice(currentIndex, 1);
                    }
                }
                let datas = { content: content, sha: data.sha, delLength: indexs };
                content = null;
                this.datas = datas;
            })
            .catch((e) => {
                console.error(e);
                throw new Error("delete error");
            });
        if (this.datas !== null) {
            await axios({
                method: "put",
                url: getCRUDUrl(tabName) + this.type,
                data: {
                    access_token: this.token,
                    message: `${getNowFormatDate()}`,
                    content: Base64.encode(JSON.stringify(this.datas.content)),
                    sha: this.datas.sha
                }
            })
                .then((res) => {
                    _res = res;
                    _res["delLength"] = this.datas.delLength;
                })
                .catch((e) => {
                    console.error(e);
                    throw new Error("delete error");
                });
        } else {
            throw new Error("delete error");
        }
        return _res;
    };

    this.remote = async (tabName) => {
        check();
        if (tabName === undefined || tabName === null) {
            throw new Error("tabName 是必选参数");
        }
        let datas = null;
        let _res = null;
        await axios
            .get(getCRUDUrl(tabName) + this.type)
            .then(({ data }) => {
                datas = { sha: data.sha };
            })
            .catch((e) => {
                console.error(e);
                throw new Error("remote error");
            });
        if (datas !== null) {
            await axios({
                method: "delete",
                url: getCRUDUrl(tabName) + this.type,
                data: {
                    access_token: this.token,
                    message: `${getNowFormatDate()}`,
                    sha: datas.sha
                }
            })
                .then((res) => {
                    _res = res;
                })
                .catch((e) => {
                    throw new Error("remote error");
                });
        } else {
            throw new Error("remote error");
        }
        return _res;
    };

    this.select = async (tabName, where, attr) => {
        if (tabName === undefined || tabName === null) {
            throw new Error("tabName 是必选参数");
        }
        let data = [];
        await check(tabName)
            .then((res) => {
                if (where === undefined || where === null) {
                    if (attr === undefined || attr === null) {
                        data = res;
                    } else {
                        for (i in res) {
                            let obj = {};
                            for (j in attr) {
                                for (k in res[i]) {
                                    if (k === attr[j]) {
                                        obj[attr[j]] = res[i][k];
                                    }
                                }
                            }
                            data.push(obj);
                        }
                    }
                } else {
                    let _data = Object.assign([], res);
                    let length = _data.length;
                    let indexs = [];
                    for (let i = 0; i < length; i++) {
                        let currentIndex = (_data || []).findIndex(where);
                        if (currentIndex != -1) {
                            if (indexs.length === 0) {
                                indexs.push(currentIndex);
                            } else {
                                indexs.push(currentIndex + indexs.length);
                            }
                            _data.splice(currentIndex, 1);
                        }
                    }
                    _data = null;
                    if (indexs.length > 0) {
                        for (i in indexs) {
                            data.push(res[indexs[i]]);
                        }
                    }
                    if (attr !== undefined && attr !== null) {
                        let res = Object.assign([], data);
                        data = [];
                        for (i in res) {
                            let obj = {};
                            for (j in attr) {
                                for (k in res[i]) {
                                    if (k === attr[j]) {
                                        obj[attr[j]] = res[i][k];
                                    }
                                }
                            }
                            data.push(obj);
                        }
                        res = null;
                    }
                }
            })
            .catch((e) => {
                console.error(e);
                throw new Error("select error");
            });
        return data;
    };

    this.insert = async (tabName, data) => {
        check();

        this._data = null;
        this._res = null;
        this.datas = null;

        if (this.type === ".json") {
            isJSON(data);
            this._data = JSON.parse(data);
        }
        await axios
            .get(getCRUDUrl(tabName) + this.type)
            .then(({ data }) => {
                let content = JSON.parse(Base64.decode(data.content));
                let datas = {};
                if(content.length !== 0) {
                    for(i in this._data) {
                        if(Object.getOwnPropertyNames(content[0]).length !== Object.getOwnPropertyNames(this._data[i]).length) {
                            throw new Error("属性不匹配");
                        }
                        let num = 0;
                        for(k in content[0]) {
                            for(j in this._data[i]) {
                                if(k === j) {
                                    num++;
                                    continue;
                                }
                            }
                        }
                        if(num !== Object.getOwnPropertyNames(this._data[i]).length) {
                            throw new Error("属性不匹配");
                        }
                    }
                }
                for (i in this._data) {
                    content.push(this._data[i]);
                }
                datas = { content: content, sha: data.sha };
                this.datas = datas;
            })
            .catch((e) => {
                console.log(e);
                throw new Error("insert error");
            });
        if (this.datas !== null) {
            await axios({
                method: "put",
                url: getCRUDUrl(tabName) + this.type,
                data: {
                    access_token: this.token,
                    message: `${getNowFormatDate()}`,
                    content: Base64.encode(JSON.stringify(this.datas.content)),
                    sha: this.datas.sha,
                }
            })
                .then((res) => {
                    this._res = res;
                })
                .catch((e) => {
                    throw new Error("insert error");
                });
        } else {
            throw new Error("insert error");
        }
        return this._res;
    };

    this.update = async (tabName, set, where) => {
        if (tabName === undefined || tabName === null) {
            throw new Error("tabName 是必选参数");
        }
        if (set === undefined || set === null) {
            throw new Error("set 是必选参数");
        }
        if (where === undefined || where === null) {
            throw new Error("where 是必选参数");
        }
        isJSON(set);
        check();

        this._res = null;
        this.datas = null;

        await axios
            .get(getCRUDUrl(tabName) + this.type)
            .then(({ data }) => {
                let content = JSON.parse(Base64.decode(data.content));
                let _data = Object.assign([], content);
                let length = _data.length;
                let indexs = [];
                for (let i = 0; i < length; i++) {
                    let currentIndex = (_data || []).findIndex(where);
                    if (currentIndex != -1) {
                        if (indexs.length === 0) {
                            indexs.push(currentIndex);
                        } else {
                            indexs.push(currentIndex + indexs.length);
                        }
                        _data.splice(currentIndex, 1);
                    }
                }
                _data = null;
                if (indexs.length > 0) {
                    for (i in indexs) {
                        for (j in set) {
                            for (k in content[indexs[i]]) {
                                if (j === k) {
                                    content[indexs[i]][k] = set[j];
                                }
                            }
                        }
                    }
                } else {
                    this._res = null;
                }
                let datas = { content: content, sha: data.sha };
                content = null;
                this.datas = datas;
            })
            .catch((e) => {
                console.log(e);
                throw new Error("update error");
            });
        if (this.datas !== null) {
            await axios({
                method: "put",
                url: getCRUDUrl(tabName) + this.type,
                data: {
                    access_token: this.token,
                    message: `${getNowFormatDate()}`,
                    content: Base64.encode(JSON.stringify(this.datas.content)),
                    sha: this.datas.sha
                }
            })
                .then((res) => {
                    this._res = res;
                })
                .catch((e) => {
                    throw new Error("update error");
                });
        } else {
            throw new Error("update error");
        }
        return this._res;
    };

    this.init = async () => {
        check();
        this._data = null;
        await axios({
            method: "post",
            url: getUserUrl(),
            data: {
                name: this.dataName,
                access_token : this.token,
                description : '一款json数据存储框架 Jhql',
                auto_init : true
            }
        })
            .then((data) => {
                this._data = data;
            })
            .catch((e) => {
                console.log(e);
            });
        return this._data;
    };
    build();
    getNowFormatDate = () => {
        let date = new Date();
        let seperator1 = "-";
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        let currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    };
    isJSON = (str) => {
        if (typeof str == "string") {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == "object" && obj) {
                    return true;
                } else {
                    throw new Error("非 json 数据");
                    return false;
                }
            } catch (e) {
                throw new Error("非 json 数据");
                return false;
            }
        }
    };
}