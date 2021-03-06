mist.event.add_complate(/index.html/, function (match) {
	if ($.trim($('#mist_content').text()) != 'hello world') console.error(match);
	mist.page.get('/1_profile.html');
});
mist.event.add_complate(/1_profile.html/, function (match) {
	var text = $('#mist_content').text();
	if (text.match(/undefined/)) console.error(match);
	text = text.replace(/\[%OWNER\s+field="_+"%\s*\]/, '');
	if (text.match(/\[%/)) console.error(match);
	mist.page.get('/2_friend.html');
});
mist.event.add_complate(/2_friend.html/, function (match) {
	if ($('#mist_content').text().match(/\[%/)) console.error(match);
	mist.page.get('/3_paginate.html');
});
mist.event.add_complate(/3_paginate.html/, function (match) {
	$('a:first').click();
	setTimeout(function () {
		// 画面遷移してなかったらエラー 
		if (mist.page.path.match(/3_paginate.html/)) console.error(match);
	}, 1000);
});
mist.event.add_complate(/4_autofix.html/, function (match) {
	if ($(document).height() > 200) console.error(match);
	mist.page.get('/5_diary.html');
});
mist.event.add_complate(/5_diary.html/, function (match) {
	$('a').click();
	if ($('a:contains("相対指定")').attr('href') !== 'http://mixi.jp/add_diary.pl?id=10264215&diary_title=%A5%BF%A5%A4%A5%C8%A5%EB%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%A1%CA%C1%EA%C2%D0%BB%D8%C4%EA%A1%CB&diary_body=%CB%DC%CA%B8%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%0A%A1%CA%C1%EA%C2%D0%BB%D8%C4%EA%A1%CB') console.error(match, '相対指定');
	if ($('a:contains("絶対指定")').attr('href') !== 'http://mixi.jp/add_diary.pl?id=10264215&diary_title=%A5%BF%A5%A4%A5%C8%A5%EB%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%A1%CA%C0%E4%C2%D0%BB%D8%C4%EA%A1%CB&diary_body=%CB%DC%CA%B8%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%0A%A1%CA%C0%E4%C2%D0%BB%D8%C4%EA%A1%CB') console.error(match, '絶対指定');
	mist.page.get('/6_activity.html');
});
mist.event.add_complate(/6_activity.html/, function (match) {
	// see http://mixi.jp/list_appli_activity.pl 
	mist.page.get('/7_people.html');
});
mist.event.add_complate(/7_people.html/, function (match) {
	var text = $('#mist_content').text();
	if (text.match(/undefined/)) console.error(match);
	text = text.replace(/\[%people\s+id="\d+"\s+field="_+"\s*%\]/, '');
	if (text.match(/\[%/)) console.error(match);
	mist.page.get('/8_requestShareApp.html');
});
mist.event.add_complate(/8_requestShareApp.html/, function (match) {
	var call_error = function () { console.error(match); };
	var req = opensocial.requestShareApp;
	opensocial.requestShareApp = function () {
		var callback = arguments[2];
		call_error = function () {};
		mist.page.get('/9_docrooturl.html');
	};
	$('a').click();
	setTimeout(call_error, 100);
});
mist.event.add_complate(/9_docrooturl.html/, function (match) {
	var src = $('img').attr('src');
	if (src.indexOf(mist.conf.doc_root_url) === -1) console.error(match);
	mist.page.get('/10_cookie.html');
});
mist.event.add_complate(/10_cookie.html/, function (match) {
	if (mist.page.cookie.key !== 'value') console.error(match);
	mist.conf.permanent_link = true;
	mist.page.get('/11_permanent_link.html');
});
mist.event.add_complate(/11_permanent_link.html/, function (match) {
	if ($('a:first').attr('href') !== 'http://mixi.jp/run_appli.pl?id=15936&owner_id=10264215&appParams=%2522%252F11_permanent_link.html%2522') console.error(match);
	if ($('a:last').attr('href') !== 'http://mixi.jp/run_appli.pl?id=15936&owner_id=10264215&appParams=%2522%252Findex.html%2522') console.error(match);
	mist.page.get('/12_var.html');
});
mist.event.add_complate(/12_var.html/, function (match) {
	$('a').each(function () {
		var href = $(this).attr('href');
		var text = $(this).text();
		if (href == text) return;
		console.error(href, text);
	});
	mist.page.get('/13_schedule.html');
});
mist.event.add_complate(/13_schedule.html/, function (match) {
	$('a').click();
	if ($('a:contains("相対指定")').attr('href') !== 'http://mixi.jp/add_schedule_entry.pl?title=%A5%BF%A5%A4%A5%C8%A5%EB%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%A1%CA%C1%EA%C2%D0%BB%D8%C4%EA%A1%CB&body=undefined&details=%CB%DC%CA%B8%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%0A%A1%CA%C1%EA%C2%D0%BB%D8%C4%EA%A1%CB&year=2010&month=10&day=1&hour=1&minute=15&recruit=0&level=4') console.error(match, '相対指定');
	if ($('a:contains("絶対指定")').attr('href') !== 'http://mixi.jp/add_schedule_entry.pl?title=%A5%BF%A5%A4%A5%C8%A5%EB%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%A1%CA%C0%E4%C2%D0%BB%D8%C4%EA%A1%CB&body=undefined&details=%CB%DC%CA%B8%A5%C6%A5%F3%A5%D7%A5%EC%A1%BC%A5%C8%0A%A1%CA%C0%E4%C2%D0%BB%D8%C4%EA%A1%CB&year=2010&month=10&day=1&hour=1&minute=15&recruit=0&level=4') console.error(match, '絶対指定');
});
