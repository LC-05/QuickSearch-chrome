function getSearchSuggest(params, engineUrl) {
  return new Promise((resolve, reject) => {
    let proxy = "";
    let data = [];
    if (engineUrl.includes("taobao.com") || engineUrl.includes("jd.com")) {
      //淘宝&京东
      axios
        .get(
          proxy +
            "https://suggest.taobao.com/sug?area=etao&code=utf-8&q=" +
            params,
          "callback"
        )
        .then((res) => {
          if(res?.data?.result){
            for (let item of res.data.result) {
              data.push(item[0]);
            }
          }
          console.log(data);
          resolve(data);
        })
    } else if (engineUrl.includes("bilibili.com")) {
      //B站
      axios
        .get(
          proxy +
            "https://s.search.bilibili.com/main/suggest?func=suggest&suggest_type=accurate&sub_type=tag&term=" +
            params,
          "func"
        )
        .then((res) => {
          if(res?.data?.result?.tag){
            for (let item in res.data.result.tag) {
              data.push(res.data.result.tag[item].value);
            }
          }
          console.log(data);
          resolve(data);
        });
    } else if (engineUrl.includes("map.baidu.com")) {
      //百度地图
      axios
        .get(
          proxy + "https://map.baidu.com/su?cid=131&type=0&wd=" + params,
          "func"
        )
        .then((res) => {
          if(res?.data?.s){
            for (let item in res.data.s) {
              const str1 = res.data.s[item];
              const str2 = str1.split("$$");
              const str3 = str2[1].replace(/\$\d{3}\$/g, "");
              const str4 = str2[0].replace("$", "");
              data.push(`${str3.replace("$", "")}，${str4}`);
            }
          }
          console.log(data);
          resolve(data);
        });
    } else {
      ////百度&其他
      axios
        .get(
          proxy +
            "https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&wd=" +
            params,
          "cb"
        )
        .then((res) => {
          if(res?.data?.g){
            for (let item in res.data.g) {
              data.push(res.data.g[item].q);
            }
          }
          console.log(data);
          resolve(data);
        });
    }
  });
}
export { getSearchSuggest };
