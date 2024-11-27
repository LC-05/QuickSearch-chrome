var path = require('path');
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');//打包生成html插件
const htmlPlugin = new HtmlWebpackPlugin({
	template:'./src/index.html',
	filename:'index.html'//dist下生成的html文件名
});
module.exports = {
    mode:'development',
    entry: path.join(__dirname,'./src/main.js'),//配置入口文件，webpack会从main.js开始，把所有依赖的js都加载打包,入口文件的绝对路径 , __dirname表示当前文件所在的路径
    output: {
        path: path.join(__dirname, './dist'), // 项目的打包文件路径
        filename: 'bundle.js' // 打包后的文件名
    },
    plugins:[//插件列表
        htmlPlugin,
        new VueLoaderPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        }),
    ],
    module:{
        rules:[//配置加载器
            {test: /\.vue$/,use: ['vue-loader']},
            {test: /\.css$/,use: ['style-loader','css-loader']},
            {test: /\.less$/,use: ['style-loader' , 'css-loader' , 'less-loader']},
            {test: /\.jpg|png|gif|bmp|ttf|eot|svg|woff|woff2$/,use: ['url-loader?limit=237817']},
        ]
    },
    resolve:{
		alias:{//修改包查找规则，解决使用import引入时自动指向vue.runtime.common.js（严格版）的问题
			"vue$":"vue/dist/vue.js"
		}
	},
}