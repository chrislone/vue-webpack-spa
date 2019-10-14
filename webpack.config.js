const path = require('path')
// vue-loader 文档要求要装的插件
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// 生成 html 文件的插件
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 清理输出目录的插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 分离 css 文件的插件
// 在 webpack 中，css 会打包在 JavaScript 中
// 所以需要插件将打包进 JavaScript 的 css 分离出来
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 用于配合 mini-css-extract-plugin 将分离之后的 css 进行压缩
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'main.js'),
  output: {
    filename: 'js/[name].[chunkhash:12].js',
    path: path.resolve(__dirname, 'dist')
    // 如果在 filename，chunkFilename 中增加了路径，则在打包出来的 index.html
    // 中会自动加上该路径去引入 scripts，不需要使用 publicPath
    // publicPath: "/js/"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[contenthash:12].[ext]',
              outputPath: 'assets'
            }
          }
        ]
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: [
          !isProduction ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      // 调用 原生的 vue 脚手架的 build 命令是，会调用 vue-cli-service，
      // vue-cli-service 模块中使用的是 ejs 语法（疑似），在这里把模块中的模板拷贝出来
      // 用 handlebars 的语法替换 ejs 的语法，实现模板的功能，替换变量
      {
        test: /\.hbs$/,
        use: ['handlebars-loader']
      },
      // from https://vue-loader.vuejs.org/zh/guide/pre-processors.html#babel
      // exclude:/node_modules/
      // 在应用于 .js 文件的 JS 转译规则 (例如 babel-loader) 中是蛮常见的。
      // 鉴于 v15 中的推导变化，如果你导入一个 node_modules 内的 Vue 单文件组件，
      // 它的 <script> 部分在转译时将会被排除在外。
      // 为了确保 JS 的转译应用到 node_modules 的 Vue 单文件组件，
      // 你需要通过使用一个排除函数将它们加入白名单：
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file)
      }
    ]
  },
  plugins: [
    // vue-loader 文档中提醒必须引入这个插件
    // https://vue-loader.vuejs.org/zh/guide/#%E6%89%8B%E5%8A%A8%E8%AE%BE%E7%BD%AE
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      favicon: path.resolve('src', 'template/favicon.ico'),
      // 此处如果需要压缩 html 代码，则需要手动传入一个 Object 而不是 Boolean
      // ref https://github.com/jantimon/html-webpack-plugin#minification
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      // 调用 原生的 vue 脚手架的 build 命令是，会调用 vue-cli-service，
      // vue-cli-service 模块中使用的是 ejs 语法（疑似），在这里把模块中的模板拷贝出来
      // 用 handlebars 的语法替换 ejs 的语法，实现模板的功能，替换变量
      template: path.resolve('src', 'template/index.hbs'),
      showErrors: false
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      publicPath: '/css/',
      filename: 'css/[name].[hash:12].css',
      chunkFilename: 'css/[id].[hash:12].css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    // 如果在此使用了 OptimizeCSSAssetsPlugin，webpack 将不会压缩 javascript 和 html
    // 如果需要使用 OptimizeCSSAssetsPlugin 的同时又压缩 JavaScript，则需要在本数组
    // 增加 TerserPlugin 实例
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()]
  },
  stats: {
    // 添加构建日期和构建时间信息
    builtAt: true,
    // 添加资源信息
    assets: true,
    // `webpack --colors` 等同于
    colors: true,
    // 不添加构建模块信息
    modules: false,
    // 添加时间信息
    timings: true,
    // 添加警告
    warnings: true,
    // 不添加 children 信息
    children: false,
    // 不显示通过对应的 bundle 显示入口起点
    entrypoints: false
  }
}
