// ==UserScript==
// @name         booksLibrary
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        *://www.amazon.cn/*
// @match        *://item.jd.com/*
// @grant        none
// @updateURL   https://github.com/Karius/bookInfo/raw/master/bookInfo.user.js
// @downloadURL https://github.com/Karius/bookInfo/raw/master/bookInfo.user.js
// @require      http://code.jquery.com/jquery-1.12.4.min.js
// ==/UserScript==

var booksInfoList = {
		"书名":"",
		"原书名":"",
		"作者":"",
		"译者":"",
		"出版社":"",
		"版本":"",
		"出版日期":"",
		"开本":"",
		"页数":"",
		"ISBN":"",
		"条形码":"",
		"ASIN":"",
		"原价":"",
		"购买价":"",
		"购买日期":"",
		"购买时间":"",
		"购买处":"",
        "书号":"",
        "是否电子书":"",
        "电子书类型":"",
        "电子书文件大小":"",
        "电子书书号":"",
        "电子书品牌":"",
        "电子书对应的纸书价格":"",
        "是否盗版":""
}

// var booksInfoList = buildBookInfoList ();

/*
 * test if the current url belongs to specified site.
 * you can specify multiple keywords, eg: is_site("sina", "jd", "taobao")
 */
var is_site = function() {
	var parts = window.location.hostname.split(".");
	for (var i=0; i<arguments.length; i++) {
    if (parts.indexOf(arguments[i]) >= 0) {
		  return true;
	  }
  }
	return false;
};


var formatBookInfoLine = function (infoList, lineContent) {
   for (var key in infoList) {
       var keyName = "{" + key + "}";
       lineContent = lineContent.replace (keyName, infoList[key]);
   }
    return lineContent;
};


// amazon support
var insertInfoBoxAtAmazon = function (html) {
    var obj = $(html);
	$("#booksTitle").after(obj);
}

var collBookInfoAtAmazon = function (fmt) {
    booksInfoList.购买处 = "亚马逊中国";
    if ($("#productTitle").length > 0) {
        booksInfoList.书名 = $("#productTitle").text ();
        booksInfoList.原价 = $("#buyBoxInner .a-color-secondary").next ().text ().replace ("￥", "");
    } else { // Kindle
        booksInfoList.书名 = $("#ebooksProductTitle").text ();
        booksInfoList.原价 = $(".digital-list-price .a-color-base").text ().replace (/\n/g, "").replace (/\s/g, "").replace ("￥", "");
        booksInfoList.是否电子书 = "√";
        booksInfoList.电子书类型 = "Kindle";
        booksInfoList.电子书对应的纸书价格 = $("tr.print-list-price td.a-text-strike").text ().replace (/\n/g, "").replace (/\s/g, "").replace ("￥", "");
    }

    var tmpAuthor = "";
    $("#bylineInfo > span.author > a.a-link-normal,#bylineInfo > span.author span.a-color-secondary").each (function (i,item) {
               // alert (i,$(this).text ());
               if ( (i+1) % 2 ) {
                   tmpAuthor = $(this).text ();
               } else {
                   if ($(this).text ().indexOf ("作者") > 0) {
                       booksInfoList.作者 += tmpAuthor + ",";
                   } else {
                       booksInfoList.译者 += tmpAuthor + ",";
                   }
               }
    });

    booksInfoList.作者 = booksInfoList["作者"].replace (/,\s*$/, "");
    booksInfoList.译者 = booksInfoList["译者"].replace (/,\s*$/, "");

    var baseInfoContent = $("#detail_bullets_id").text();
    //alert(baseInfoContent);
    var getBaseItemInfo = function (infoContent, itemName) {
        var re = new RegExp ("^\s*" + itemName + "[:：]\\s*(.*?)\n", "im");
        var r = infoContent.match(re);

        if (r != null && r.length >=2)
            return r[1];
        return "";
    };

    var iv = getBaseItemInfo (baseInfoContent, "出版社");

    if (iv.length > 0) {
        var s = iv.match("^(.*?);(.*?)\\((\\d+)[^\\d]+(\\d+)[^\\d]+(\\d+)[^\\d]+");
        if (s.length >= 6) {
            booksInfoList.出版社 = s[1];
            booksInfoList.版本 = s[2];
            booksInfoList.出版日期 = s[3] + "-" + s[4] + "-" + s[5];
        }
    }

    booksInfoList["原书名"] = getBaseItemInfo (baseInfoContent, "外文书名");
    booksInfoList["开本"] = getBaseItemInfo (baseInfoContent, "开本");
    booksInfoList["ISBN"] = getBaseItemInfo (baseInfoContent, "ISBN");
    booksInfoList["条形码"] = getBaseItemInfo (baseInfoContent, "条形码");
    booksInfoList["ASIN"] = getBaseItemInfo (baseInfoContent, "ASIN");
    if (booksInfoList["是否电子书"].length > 0)
        booksInfoList["电子书书号"] = booksInfoList["ASIN"];


    iv = getBaseItemInfo (baseInfoContent, "平装");
    if (iv.length < 0) {
        iv = getBaseItemInfo (baseInfoContent, "精装");
        if (iv.length < 0) {
           iv = getBaseItemInfo (baseInfoContent, "纸书页数");
        }
    }
    if (iv.length > 0)
        booksInfoList["页数"] = iv.replace ("页", "");

    booksInfoList["电子书文件大小"] = getBaseItemInfo (baseInfoContent, "文件大小");
    booksInfoList["电子书品牌"] = getBaseItemInfo (baseInfoContent, "品牌");

    //if (booksInfoList["是否电子书"].length <= 0)
        booksInfoList["书号"] = booksInfoList["条形码"] + "/" + booksInfoList["ISBN"] + "/" + booksInfoList["ASIN"]
    var bookLine = formatBookInfoLine (booksInfoList, fmt);
    return bookLine;
}


// jd support
var insertInfoBoxAtJd = function (html) {
    var obj = $(html);
	$(".sku-name").after(obj);
}

var collBookInfoAtJd = function (fmt) {
    booksInfoList.购买处 = "京东";
    booksInfoList.书名 = $(".sku-name").text ().replace (/^[\n\s]*/igm, "");
    booksInfoList.原价 = $("del#page_maprice").text ().replace ("￥", "");

    var tmpAuthor = "";
    booksInfoList["作者"] = $("#p-author").text ();
    booksInfoList.作者 = booksInfoList["作者"].replace (/[\n]*/igm, "").replace (/\s*$/igm, "");
    booksInfoList.译者 = booksInfoList["译者"].replace (/,\s*$/, "");

    var baseInfoContent = $("#parameter2").text();
    //alert(baseInfoContent);
    var getBaseItemInfo = function (infoContent, itemName) {
        var re = new RegExp ("^\s*" + itemName + "[:：]\\n*\\s*(.*?)\n", "im");
        var r = infoContent.match(re);

        if (r != null && r.length >=2)
            return r[1];
        return "";
    };

    booksInfoList.出版社 = $("#parameter2 > li > a").text ();
    //alert (booksInfoList.出版社);
    booksInfoList.版本 = getBaseItemInfo (baseInfoContent, "版次");
    booksInfoList.出版日期 = getBaseItemInfo (baseInfoContent, "出版时间");
    booksInfoList["开本"] = getBaseItemInfo (baseInfoContent, "开本").replace ("开", "");
    booksInfoList["ISBN"] = getBaseItemInfo (baseInfoContent, "ISBN");
    booksInfoList["书号"] = booksInfoList["ISBN"];

    booksInfoList["原书名"] = getBaseItemInfo (baseInfoContent, "外文名称");


//    booksInfoList["条形码"] = getBaseItemInfo (baseInfoContent, "条形码");
//    booksInfoList["ASIN"] = getBaseItemInfo (baseInfoContent, "ASIN");
//    if (booksInfoList["是否电子书"].length > 0)
//        booksInfoList["电子书书号"] = booksInfoList["ASIN"];

//    booksInfoList["页数"] = iv.replace ("页", "");

//    booksInfoList["电子书文件大小"] = getBaseItemInfo (baseInfoContent, "文件大小");
//    booksInfoList["电子书品牌"] = getBaseItemInfo (baseInfoContent, "品牌");

    //if (booksInfoList["是否电子书"].length <= 0)
//        booksInfoList["书号"] = booksInfoList["条形码"] + "/" + booksInfoList["ISBN"] + "/" + booksInfoList["ASIN"]
    var bookLine = formatBookInfoLine (booksInfoList, fmt);
    return bookLine;
}

//$(document).ready(function() {
$(window).on("load", function () {
    if (is_site("jd", "360buy")) {
        insertInfoBoxAtJd ("<textarea id=\"bookInfoArea\" rows=\"6\" cols=\"70\"></textarea>");
        $("#bookInfoArea").text (collBookInfoAtJd ("{书名}\t{原书名}\t{版本}\t\t\t{作者}\t{译者}\t{是否电子书}\t{电子书类型}\t{电子书文件大小}\t{电子书书号}\t{电子书品牌}\t{电子书对应的纸书价格}\t{书号}\t{开本}\t{出版日期}\t{页数}\t{出版社}\t{原价}\t{购买价}\t{购买日期}\t{购买时间}\t{是否盗版}\t{购买处}"));
	} else if (is_site("amazon", "z")) {
        insertInfoBoxAtAmazon ("<textarea id=\"bookInfoArea\" rows=\"\" cols=\"\"></textarea>");
        $("#bookInfoArea").text (collBookInfoAtAmazon ("{书名}\t{原书名}\t{版本}\t\t\t{作者}\t{译者}\t{是否电子书}\t{电子书类型}\t{电子书文件大小}\t{电子书书号}\t{电子书品牌}\t{电子书对应的纸书价格}\t{书号}\t{开本}\t{出版日期}\t{页数}\t{出版社}\t{原价}\t{购买价}\t{购买日期}\t{购买时间}\t{是否盗版}\t{购买处}"));
	}
});