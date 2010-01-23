mist.event.add_complate(/index.html/, function (match) {
	if ($.trim($('#mist_content').text()) != 'hello world') console.error(match);
	mist.page.get('/1_profile.html');
});
mist.event.add_complate(/1_profile.html/, function (match) {
	if ($('#mist_content').text().match(/\[%/)) console.error(match);
	mist.page.get('/2_friend.html');
});
mist.event.add_complate(/2_friend.html/, function (match) {
	if ($('#mist_content').text().match(/\[%/)) console.error(match);
	mist.page.get('/3_paginate.html');
});
mist.event.add_complate(/3_paginate.html/, function (match) {
	// todo:めんどくさがらない 
	mist.page.get('/4_autofix.html');
});
mist.event.add_complate(/4_autofix.html/, function (match) {
	if ($(document).height() > 200) console.error(match);
	mist.page.get('/5_diary.html');
});
mist.event.add_complate(/6_activity.html/, function (match) {
	// todo:手を抜かない 
});
