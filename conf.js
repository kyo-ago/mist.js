$.extend(mist.conf, {
	'index_page' : '/index.html',
	'doc_root_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/',
//	'api_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/'
	'api_url' : 'http://0-9.sakura.ne.jp/js/mixiapp_framework_mist/test'
});
/*
その他の設定情報
$.extend(mist.conf, {
	// src="/の書き換え先 
	'doc_root_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/'
	// オーナーにアプリの所有を要求しない 
	'OWNER_REQUIRE_APP_URL' : undefined,
	// ビュアーにアプリの所有を要求しない 
	'VIEWER_REQUIRE_APP_URL' : undefined,
	// オーナーとビュアーが同じであることを要求しない 
	'REQUIRE_OWNER_EQ_VIEWER_URL' : undefined,
	// 切り出すタグの範囲 
	'mist_page_filter_strip_mist_content_tags' : ['<div id="mist_content">', '<!-- /#mist_content --></div>']
});
*/
