// ==UserScript==
// @name         搜索引擎切换工具
// @namespace    http://tampermonkey.net/
// @version      0.1.30
// @description  在搜索引擎左侧显示一个快速切换列表，节省「另开搜索引擎」和「输入关键词」的动作和时间，提高搜索效率。在原作者基础上修改了部分内容，原链接：https://greasyfork.org/zh-CN/scripts/440235。
// @author       竹林听雨, rockucn
 
// @match        *://www.baidu.com/s*
// @match        *://www.baidu.com/baidu*
// @match        *://duckduckgo.com/*
// @match        *://search.brave.com/search*
// @match        *://www.google.com/search*
// @match        *://www.google.com.hk/search*
// @match        *://weixin.sogou.com/weixin*
// @match        *://www.bing.com/search*
// @match        *://cn.bing.com/search*
// @match        *://www.zhihu.com/search*
// @match        *://search.cnki.com.cn/Search/Result*
// @match        *://www.sogou.com/web*
// @match        *://linux.do/search*
// @match        *://github.com/search*
 
// @grant        unsafeWindow
// @grant        window.onload
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-body
 
// @license     MIT
// ==/UserScript==
 
// 搜索网址配置
const urlMapping = [
  {
  name: "Bing (CN)",
  searchUrl: "https://cn.bing.com/search?q=",
  keyName: "q",
  testUrl: /https:\/\/cn\.bing\.com\/search.*/,
  },
  {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    keyName: "q",
    testUrl: /^https:\/\/(?:www\.)?google\.[a-z.]+\/search/i,
  },
  {
    name: "GitHub 仓库",
    searchUrl: "https://github.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/github.com\/search.*/,
  },
  {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    keyName: "q",
    testUrl: /https:\/\/duckduckgo.com\/*/,
  },
  {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.bing.com\/search.*/,
  },
  {
    name: "Brave",
    searchUrl: "https://search.brave.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/search.brave.com\/search.*/,
  },
  {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd=",
    keyName: "wd",
    testUrl: /https:\/\/www.baidu.com\/s.*/,
  },
  {
    name: "搜狗",
    searchUrl: "https://www.sogou.com/web?query=",
    keyName: "query",
    testUrl: /https:\/\/www.sogou.com\/web.*/,
  },
  {
    name: "哔哩哔哩",
    searchUrl: "https://search.bilibili.com/all?keyword=",
    keyName: "keyword",
    testUrl: /https:\/\/search.bilibili.com\/all.*/,
  },
  {
    name: "微信文章",
    searchUrl: "https://weixin.sogou.com/weixin?type=2&s_from=input&query=",
    keyName: "query",
    testUrl: /https:\/\/weixin.sogou.com\/weixin.*/,
  },
  {
    name: "知乎",
    searchUrl: "https://www.zhihu.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.zhihu.com\/search.*/,
  },
  {
    name: "博客园",
    searchUrl: "https://zzkx.cnblogs.com/s?w=",
    keyName: "w",
    testUrl: /https:\/\/zzkx.cnblogs.com\/s.*/,
  },
  {
    name: "linux do",
    searchUrl: "https://linux.do/search?q=",
    keyName: "q",
    testUrl: /https:\/\/linux.do\/search.*/,
  },
  {
    name: "知网",
    searchUrl: "https://search.cnki.com.cn/Search/Result?content=",
    keyName: "content",
    testUrl: /https:\/\/search.cnki.com.cn\/Search\/Result.*/,
  },
  {
    name: "Stack Overflow",
    searchUrl: "https://stackoverflow.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/stackoverflow.com\/search.*/,
  },
];
 
// JS获取url参数
function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let pairs = query.split("&");
  for (let pair of pairs) {
    let [key, value] = pair.split("=");
    if (key == variable) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
 
// 从url中获取搜索关键词
function getKeywords() {
  let keywords = "";
  for (let item of urlMapping) {
    if (item.testUrl.test(window.location.href)) {
      keywords = getQueryVariable(item.keyName);
      break;
    }
  }
  console.log(keywords);
  return keywords;
}
 
// 适配火狐浏览器的百度搜索
const isFirefox = () => {
  if (navigator.userAgent.indexOf("Firefox") > 0) {
    console.warn("[ Firefox ] 🚀");
    urlMapping[0].searchUrl = "https://www.baidu.com/baidu?wd=";
    urlMapping[0].testUrl = /https:\/\/www.baidu.com\/baidu.*/;
  } else {
    return;
  }
};
 

 
// 添加节点
function addBox() {
  isFirefox();
  // 主元素
  const div = document.createElement("div");
  div.id = "search-app-box";
  div.style = `
    position: fixed; 
    top: 140px; 
    left: 12px; 
    width: 88px; 
    background-color: hsla(200, 40%, 96%, .8); 
    font-size: 12px; 
    border-radius: 6px; 
    z-index: 99999;`;
  document.body.insertAdjacentElement("afterbegin", div);
 
  // 标题
  let title = document.createElement("span");
  title.innerText = "搜索引擎";
  title.style = `
    display: block;
	color: hsla(211, 60%, 35%, .8);
    text-align: center;
    margin-top: 10px; 
    margin-bottom: 5px;
    font-size: 12px;
    font-weight: bold;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;`;
  div.appendChild(title);
 
  // 搜索列表
  for (let index in urlMapping) {
    let item = urlMapping[index];
 
    // 列表样式
    let style = `
        display: block; 
		color: hsla(211, 60%, 35%, .8) !important;
        padding: 8px; 
        text-decoration: none;`;
    let defaultStyle = style + "color: hsla(211, 60%, 35%, .8) !important;";
    let hoverStyle =
      style + "background-color: hsla(211, 60%, 35%, .1);";
 
    // 设置搜索引擎链接
    let a = document.createElement("a");
    a.innerText = item.name;
    a.style = defaultStyle;
    a.className = "search-engine-a";
    a.href = item.searchUrl + getKeywords();
 
    // 鼠标移入&移出效果，相当于hover
    a.onmouseenter = function () {
      this.style = hoverStyle;
    };
    a.onmouseleave = function () {
      this.style = defaultStyle;
    };
    div.appendChild(a);
  }
}
 
(function () {
  "use strict";
  window.onload = addBox();
})();