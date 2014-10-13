// ==UserScript==
// @name        bookInfo
// @namespace   bookinfo.guide.next
// @description 在每个作品具体内容页面显示DMM番号和发行商信息
// @include     http://item.jd.com/*
// @version     1.0
// @grant       none
// @updateURL   https://github.com/Karius/bookInfo/raw/master/bookInfo.user.js
// @downloadURL https://github.com/Karius/bookInfo/raw/master/bookInfo.user.js
// @require     http://code.jquery.com/jquery-1.9.1.min.js
// ==/UserScript==

// 作者名列表
var authLst = "";
$("div#product-authorinfo a").each(function (index, element) {
authLst += $(element).text ().replace (/ /g, "") + ",";
});
authLst = authLst.replace (/,$/g, ""); // 作者列表

// 书名
var bookName = $("div#name h1").text ().replace (/[\s]*?$/, "");

// 原价
var orgPrice = $("div.dd em s").text ().replace (/[^\d]*/, "")

// 打折价
var price = $("div.dd strong").text ().replace (/[^\d]*/, "");

// ISBN
var ISBN = $("ul.detail-list li.fore4").text ().replace (/^[A-Za-z]*：/, "");

// 出版社
var press = $("ul.detail-list li.fore2 a").text ();

// 开本
var folio = $("ul.detail-list li.fore6").text ().replace (/^[^\d]*/, "").replace (/[^\d]*?$/, "");

// 页数
var pages = $("ul.detail-list li.fore7").text ().replace (/^[^\d]*/, "");

// 出版时间
var dateOfPublication = $("ul.detail-list li.fore9").text ().replace (/^[^\d]*/, "");
alert (dateOfPublication);
