<template>
    <div class="container" >
            <div class="row">
                <div class="col-sm-12">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <button id="engineButton" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{defaultEngine}}</button>
                            <div class="dropdown-menu" >
                                <a class="dropdown-item" @click="changeEngine(item,index)" v-for="(item,index) in engineList" :key="index" href="#">{{`${index+1}. ${item}`}}</a>
                            </div>
                        </div>
                    <input id="searchInput" @keydown="searchKeyup" @change="inputting" v-model="searchContent" autocomplete="off" type="text" class="form-control" aria-label="Text input with dropdown button">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="list-box col-sm-12">
                    <ul>
                        <li v-for="(item,index) in mapData" :key="index" @click="clickItem(index)" class="list" :class="{checked:index == selectIndex}">{{item.res}}<span class="cityname">{{item.city}}</span></li>
                        <li v-for="(item,index) in data" :key="index" @click="clickItem(index)" class="list" :class="{checked:index == selectIndex}">{{item}}</li>
                    </ul>
                </div>
            </div>
    </div>
</template>
<script>
    import api from './src/js/api'
    export default{
        data(){
            return {
                checked:false,//搜索建议是否被选中
                selectIndex:-1,//中间变量
                searchContent:'',//搜索框内的内容
                engineList:['Google','百度','MDN','GitHub','StackOverflow','淘宝','百度地图','bilibili','YouTube','知乎','思否','微信','京东'],//引擎列表
                data:[],//搜索建议列表
                defaultEngine:'',//默认搜索引擎
                showDropdown:false,//下拉菜单是否显示
                engineId:0,//搜索引擎下标
                engineName:'',//搜索引擎名称，默认谷歌
                cityName:[],//地图搜素结果后面不同样式的行政市区名
                mapData:[],//百度地图搜索建议
            }
        },
        created(){
            this.defaultEngine = this.engineList[0]//默认搜素引擎
            this.engineName = this.engineList[this.engineId]//初始化引擎名
        },
        mounted(){
            searchInput.tabIndex = -1
            searchInput.focus();//默认获取焦点
            var that = this
            document.onkeydown = function(e) {//全局监听键盘事件
                if(e.keyCode == 27){//esc
                    if(that.showDropdown==true){
                        that.switchDropdown('hide')
                        that.inputGetfocus()
                    }
                }
                if(e.keyCode==38){//up键
                   e.preventDefault() 
                }
                if(e.code == 'Tab'){//Tab键控制下拉菜单
                    that.data = []
                    that.mapData = []
                    e.preventDefault()
                    if(that.showDropdown == false){
                        that.switchDropdown('show')
                    }else{
                        that.switchDropdown('hide')
                        that.inputGetfocus()
                    }
                }
                if(that.showDropdown == true&&e.keyCode>48&&e.keyCode<58){//按数字键选择引擎
                    var numKey = e.keyCode - 48//数字键keycode从49开始
                    if(numKey<=that.engineList.length){
                        that.defaultEngine = that.engineList[numKey-1]
                        that.engineId = numKey-1
                        that.engineName = that.engineList[numKey-1]
                        that.switchDropdown('hide')
                        setTimeout(() => {
                            that.inputGetfocus()
                        }, 200);
                    }
                }
            }
        },
        methods:{
            switchDropdown(show){//下拉菜单开关
                $(engineButton).dropdown(show)
                this.showDropdown = !this.showDropdown 
            },
            inputGetfocus(){//输入框获取焦点
                searchInput.tabIndex = -1;
                searchInput.focus()
            },
            changeEngine(name,id){//鼠标选择引擎
                this.engineId = id
                this.engineName = name
                this.defaultEngine = name
                this.showDropdown = false
                setTimeout(() => {//防止选择完引擎后直接搜索
                    this.inputGetfocus()
                }, 200);
            },
            clickItem(index){
                this.searchContent = this.data[index]
                this.submit(this.data[index])
            },
            searchKeyup(e){//输入框按键监听
                if(e.keyCode === 13){//输入完直接按回车搜索
                    this.submit()
                }
                if(this.mapData.length>0){
                    var mapData = []
                    for (const key in this.mapData) {
                        mapData.push(this.mapData[key].res)
                    }
                    this.selectSuggest(e,mapData)
                }else if(this.data.length>0){
                    this.selectSuggest(e,this.data)
                }
            },
            selectSuggest(e,data){//上下键选择
                this.inputGetfocus()
                if(this.searchContent == ''){
                    return false
                }else{
                    if (e.keyCode === 38) {//up 选择搜索建议
                        if(this.selectIndex == -1 || this.selectIndex < 1){
                            this.selectIndex = data.length
                        }
                        this.selectIndex--
                        this.searchContent = data[this.selectIndex]
                    }
                    if(e.keyCode === 40){//down 选择搜索建议
                        this.selectIndex++
                        if(this.selectIndex==data.length){
                            this.selectIndex = 0
                        }
                        this.searchContent = data[this.selectIndex]
                    }
                }
            },
            submit(e){
                switch (this.engineName) {
                    case 'Google':
                    window.open(`https://www.google.com/search?q=${e?e:this.searchContent}&oq=${e?e:this.searchContent}&aqs=chrome..69i57j35i39j0l6.3735j0j8&sourceid=chrome&ie=UTF-8`)
                    break;
                    case '百度':
                    window.open(`https://www.baidu.com/s?wd=${e?e:this.searchContent}`)
                    break;
                    case '淘宝':
                    window.open(`https://s.taobao.com/search?q=${e?e:this.searchContent}`)
                    break;
                    case 'bilibili':
                    window.open(`https://search.bilibili.com/all?keyword=${e?e:this.searchContent}`)
                    break;
                    case 'YouTube':
                    window.open(`https://www.youtube.com/results?search_query=${e?e:this.searchContent}`)
                    break;
                    case 'StackOverflow':
                    window.open(`https://stackoverflow.com/search?q=${e?e:this.searchContent}`)
                    break;
                    case 'GitHub':
                    window.open(`https://github.com/search?q=${e?e:this.searchContent}`)
                    break;
                    case '思否':
                    window.open(`https://segmentfault.com/search?q=${e?e:this.searchContent}`)
                    break;
                    case 'MDN':
                    window.open(`https://developer.mozilla.org/zh-CN/search?q=${e?e:this.searchContent}`)
                    break;
                    case '微信':
                    window.open(`https://weixin.sogou.com/weixin?type=2&query=${e?e:this.searchContent}&ie=utf8&s_from=input&_sug_=n&_sug_type_=`)
                    break;
                    case '知乎':
                    window.open(`https://www.zhihu.com/search?type=content&q=${e?e:this.searchContent}`)    
                    break;
                    case '京东':
                    window.open(`https://search.jd.com/Search?keyword=${e?e:this.searchContent}`)    
                    break;
                    case '百度地图':
                    window.open(`https://map.baidu.com/search/${e?e:this.searchContent}/?querytype=s&wd=${e?e:this.searchContent}`)    
                    break;
                    default:
                    break;
                }
                this.data = []
            },
            inputting(){//打字输入时把selectIndex回归初始值
                if(this.searchContent!=''){
                    this.selectIndex = -1
                }else{
                    this.data = []
                    this.mapData = [] 
                }
            },
            getSearchsuggest(){//获取搜索建议
                var that = this 
                api.getSearchsuggest(this.searchContent,this.engineName).then(res=>{
                    this.data = []
                    this.mapData = []
                    if(this.engineName=='淘宝'||this.engineName=='京东'){//淘宝&京东
                        for (let item of res.data.result) {
                            this.data.push(item[0])
                        }
                    }else if(this.engineName=='bilibili'){//B站
                        for (let item in res.data) {
                            this.data.push(res.data[item].value)
                        }
                    }else if(this.engineName=='百度地图'){//百度地图
                        for (let item in res.data.s) {
                            let str1 = res.data.s[item]
                            let str2 = str1.split('$')
                            this.mapData.push({res:str2[3],city:str2[0]+str2[1]})
                        }
                    }else{//百度&其他
                        for (let item in res.data.g) {
                            this.data.push(res.data.g[item].q)
                        }
                    }
                }).catch(res => {
                    console.log(res)
                })
            },
        },
        watch:{
            searchContent:function(){
                if(this.selectIndex == -1){//避免上下键选择搜素建议时重新获取建议内容
                    let timer
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(this.getSearchsuggest, 200);//防抖
                }
            },
            engineId:function (newdata,olddata) {//输入框有内容情况下切换引擎后重新根据引擎获取联想内容
                this.data = []
                this.mapData = []
                if(this.selectIndex == -1){//避免上下键选择搜素建议时重新获取建议内容
                    let timer
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(this.getSearchsuggest, 200);//防抖
                }
            }
        }
    }
</script>
<style lang="less" scoped>
    .container{
        width: 500px;
        padding: 5px;
        input:focus{
            border: none !important;
            border: #ced4da 1px solid !important;
            box-shadow: none !important;
        }
        .dropdown-toggle:focus{
            box-shadow: none !important;
        }
        .btn-outline-secondary{
            border-color:#ced4da;
        }
        .checked{
            background-color: #ebebeb;
            transition: all 0.2s; 
        }
        .list-box{
            ul{
                list-style: none;
                padding: 0;
                margin: 0;
                border: 1px solid #e8e8e8;
                border-radius: 4px;
            }
            .list{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            font-size: 16px;
            padding:4px 8px;
            margin: 0;
            list-style: none;
            text-align: left;
            }
            .list:hover{
                background-color: #ebebeb;
                transition: all 0.2s;
            }
            .cityname{
                color:gray;
                font-size: 12px;
                margin-left: 10px;
            }
        }
    }
</style>