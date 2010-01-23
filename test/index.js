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
	if ($('#mist_content').text().match(/\[%/)) console.error(match);
	mist.page.get('/3_paginate.html');
});
