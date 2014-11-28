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


function copyToClipboard(txt) {   
    if(window.clipboardData) {   
            window.clipboardData.clearData();   
            window.clipboardData.setData("Text", txt);   
    } else if(navigator.userAgent.indexOf("Opera") != -1) {   
         window.location = txt;   
    } else if (window.netscape) {   
         try {   
              netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");   
         } catch (e) {   
              alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");   
         }   
         var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);   
         if (!clip)   
              return;   
         var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);   
         if (!trans)   
              return;   
         trans.addDataFlavor('text/unicode');   
         var str = new Object();   
         var len = new Object();   
         var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);   
         var copytext = txt;   
         str.data = copytext;   
         trans.setTransferData("text/unicode",str,copytext.length*2);   
         var clipid = Components.interfaces.nsIClipboard;   
         if (!clip)   
              return false;   
         clip.setData(trans,null,clipid.kGlobalClipboard);   
         alert("复制成功！")   
    }   
}


// 书籍信息关联数组
var bookInfoList = {};

// 作者列表
var authLst = "";
$("div#product-authorinfo a").each(function (index, element) {
authLst += $(element).text ().replace (/ /g, "") + ",";
});
//authLst = authLst.replace (/,$/g, ""); // 作者列表
bookInfoList["authList"] = authLst.replace (/,$/g, ""); // 作者列表

// 书名
bookInfoList["title"] = $("div#name h1").text ().replace (/[\s]*?$/, "");

// 原价
bookInfoList["orgPrice"] = $("div.dd em s").text ().replace (/[^\d]*/, "")

// 打折价
bookInfoList["realPrice"] = $("div.dd strong").text ().replace (/[^\d]*/, "");

// ISBN
bookInfoList["ISBN"] = $("ul.detail-list li.fore4").text ().replace (/^[A-Za-z]*：/, "");

// 出版社
bookInfoList["press"] = $("ul.detail-list li.fore2 a").text ();

// 开本
bookInfoList["folio"] = $("ul.detail-list li.fore6").text ().replace (/^[^\d]*/, "").replace (/[^\d]*?$/, "");

// 页数
bookInfoList["pages"] = $("ul.detail-list li.fore7").text ().replace (/^[^\d]*/, "");

// 出版时间
bookInfoList["dateOfPublication"] = $("ul.detail-list li.fore9").text ().replace (/^[^\d]*/, "");
//alert (bookInfoList["dateOfPublication"]);

var outputLine = "#authList#\t#title#\t#orgPrice#\t#ISBN#";
for (k in bookInfoList) {
	var rStr=new RegExp("\\#" + k + "\\#","ig"); //创建正则RegExp对象
	outputLine = outputLine.replace(rStr, bookInfoList[k])
}

alert(outputLine);