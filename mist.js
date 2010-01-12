/**
 * mixiapp framework mist
 * Copyright (C) KAYAC Inc. | http://www.kayac.com/
 * Dual licensed under the MIT <http://www.opensource.org/licenses/mit-license.php>
 * and GPL <http://www.opensource.org/licenses/gpl-license.php> licenses.
 * Date: 2010-01-07
 * @author kyo_ago
 * @version 0.0.1
 * @require jQuery 1.4*(not 1.3*)
 * @require jQuery opensocial-simple plugin
 * @see 
 */

if (!window.mist) window.mist = {};

/*
	初期化
*/
mist.init = function _t_mist_init () {
	// live eventの設定 
	$('a').live('click', this.event.link);
	$.browser.msie ? $(':submit').live('click', function (env) {
		this.event.form.call($(this).closest('form').get(0), env);
	}) : $('form').live('submit', this.event.form);

	this.social.load_person();

	$(function () {
		// /の読み込み 
		this.page.get('/');

		// 追加対象タグの設定 
		if (!$('#mist_content').length) $('body').append('<div id="mist_content">');
	});
};

/*
	ページ遷移関係
*/
$.extend(mist.page, {
	// 現在表示中のpath 
	'path' : '',
	// 現在保持中のcookie 
	'cookie' : '',
	// 現在保持中のparam 
	'param' : '',
	// 常に保持されるparam 
	'base_param' : '',
	// auto adjust flag 
	'auto_adjust' : true,
	// filter table
	// [ { 'name' : '', 'path_regexp' : '', 'exec' : function () {} },... ]
	'filter' : [
		{
			// filter name(optional) 
			'name' : 'app_id',
			// execute path(regexp) 
			'path_regexp' : /(?:)/,
			'exec' : function _t_mist_page_filter_app_id () {
				this.data = this.data.replace(mosix('[%app_id\s*%]'), mist.env.app_id);
			}
		},
		{
			'name' : 'person',
			'path_regexp' : /(?:)/,
			'exec' : function _t_mist_page_filter_person () {
				this.data = this.data.replace(mosix('[%(OWNER|VIEWER)\s+field="(\w+)"\s*%]'), function (name, field) {
					return mist.social.person[name][field];
				});
			}
		},
		{
			'name' : 'friends',
			'path_regexp' : /(?:)/,
			'exec' : function _t_mist_page_filter_friends () {
				this.data.match(mosix('[%friends(.+?)%]'), function (param) {
					var params = mist.utils.parse_param(param);
					if (!params.filter) params.filter = 'HAS_APP';
					params.callback = function () {
						this.data = this.data.replace(mosix('[%friends(.+?)%]'), mist.social.friends.join(','));
					};
					return mist.social.load_friends(params);
				});
			}
		}
	],
	// フィルタの追加 
	'add_filter' : function _t_mist_page_add_filter (regexp, exec) {
		// regexp == filter object 
		if (!$.ifFunction(exec)) return this.filter.push(regexp);
		this.filter.push({
			'path_regexp' : regexp,
			'exec' : exec
		});
	},
	'get' : function _t_mist_page_get (path) {
		this.path = path;
		$os.get(mist.conf.api_url + path, $.extend(this.param, this.base_param), this.load);
	},
	'load' : function _t_mist_page_load (data) {
		this.data = data;
		var path = this.path;
		var filter = this.filter;
		var self = this;
		$.each(filter, function () {
			var match = path.match(this.path_regexp);
			if (!match) return;
			this.exec.call(self, match);
		});
		var self = this;
		$(function () {
			if (!mist.env.is_loading()) $('#mist_content').html(self.data);
			setInterval(function () {
				if (mist.env.is_loading()) return;
				$('#mist_content').html(self.data);
			}, 100);
		});
	},
	'adjust' : function _t_mist_page_adjust () {
		if (!this.auto_adjust) return;
		$os.adjustHeight();
		$('img').load(function(){ $os.adjustHeight(); });
	}
});

$.extend(mist.env, {
	'app_id' : gadgets.util.getUrlParameters()['app_id'],
	// アプリ情報表示画面 
	'view_appli' : 'http://mixi.jp/view_appli.pl?id=',
	// アプリインストール画面 
	'join_appli' : 'http://mixi.jp/join_appli.pl?id=',
	// アプリキャンバス画面 
	'run_appli' : 'http://mixi.jp/run_appli.pl?id=',
	// 読み込み中確認（trueの場合、出力を遅延する） 
	'is_loading' : function () {
		return this.loading_queue.length;
	},
	'loading_queue' : []
});

$.extend(mist.conf, {
	// オーナーにアプリの所有を要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'OWNER_REQUIRE_APP_URL' : mist.env.join_appli + app_id,
	// ビュアーにアプリの所有を要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'VIEWER_REQUIRE_APP_URL' : mist.env.join_appli + app_id,
	// オーナーとビュアーが同じであることを要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'REQUIRE_OWNER_EQ_VIEWER_URL' : mist.env.run_appli + app_id,
	// オーナーとビュアーが同じであることを要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'REQUIRE_OWNER_EQ_VIEWER_URL' : mist.env.run_appli + app_id,
});

$.extend(mist.social, {
	'person' : {
		'OWNER' : {},
		'VIEWER' : {}
	},
	'friends' : [],
	'cache' : {},
	'load_person' function _t_mist_social_load_person () {
		var self = this;
		mist.env.loading_queue.push('');
		$os.getPerson('all_field_set', function (p) {
			self.person.OWNER = p.OWNER.fieldValue;
			self.person.VIEWER = p.VIEWER.fieldValue;
			self.cache[self.person.OWNER.ID] = self.person.OWNER;
			self.cache[self.person.VIEWER.ID] = self.person.VIEWER;
			mist.env.loading_queue.pop('');
		});
	},
	'load_friends' : function _t_mist_social_load_friends (param) {
		mist.env.loading_queue.push('');
		var callback = function () {};
		if ($.isFunction(param.callback)) callback = param.callback;
		var self = this;
		param.callback = function _t_mist_social_load_friends_callback (fr) {
			var friends = self.friends;
			fr.each(function (p) {
				friends.push(p.getId());
			});
			callback();
			mist.env.loading_queue.pop('');
		};
		if (this.friends.length) {
			callback();
			mist.env.loading_queue.pop('');
		};
		$os.getFriends(param);
	}
});

$.extend(mist.auth, (function _t_mist_auth () {
	var app_id = this.env.app_id;
	return {
		'check' : function _t_mist_auth_check () {
			$.each(['OWNER_REQUIRE_APP', 'VIEWER_REQUIRE_APP', 'REQUIRE_OWNER_EQ_VIEWER'], function () {
				var url = this['check_' + this]();
				if (!url) return;
				window.open(url, '_top');
			});
		},
		'check_OWNER_REQUIRE_APP' : REQUIRE_APP('OWNER'),
		'check_VIEWER_REQUIRE_APP' : REQUIRE_APP('VIEWER'),
		'check_REQUIRE_OWNER_EQ_VIEWER' : function () {
			if (!mist.conf.REQUIRE_OWNER_EQ_VIEWER) return;
			var person = mist.social.person;
			if (person.OWNER.fieldValue.ID === person.VIEWER.fieldValue.ID) return;
			return mist.conf.REQUIRE_OWNER_EQ_VIEWER;
		}
	};

	function REQUIRE_APP (user) {
		return function __t_check_req () {
			if (!mist.conf[user+'_REQUIRE_APP']) return;
			var HAS_APP = mist.social.person[user].fieldValue.HAS_APP;
			if (HAS_APP === 'true') return;
			return mist.conf[user+'_REQUIRE_APP'];
		};
	};
})());

$.extend(mist.event, {
	'link' : function _t_mist_event_link (env) {
		if (env.button) return;
		env.preventDefault();
		var href = $(this).get_local_path('href');
		// 相対指定はAPIアクセス 
		if (href.match(mosix('^/'))) return mist.page.get(href);
		// mixi内リンク 
		if (href.match(mosix('^http://mixi\.jp/'))) return window.open(href, $(this).attr('target') || '_top');
		// 「#」開始はトップへ画面遷移 
		if (href.match(mosix('^/?#'))) return mist.page.adjust();
		// 外部リンク 
		if (href.match(mosix('^http://'))) return mixi.util.requestExternalNavigateTo(href);

		throw(' mist : 認識できないURL形式です ');
	},
	'form' : function _t_mist_event_form () {
		var action = $(this).get_local_path('action');
		var method = ($(this).attr('method') || 'GET').toUpperCase();
		var param = {};
		$.each($(this).serializeArray(), function () {
			param[this.name] = this.value;
		});
		mist.page.path = action;

		$os.ajax({
			'url' : mist.conf.api_url + action,
			'success' : mist.page.load;,
			'METHOD' : method,
			'CONTENT_TYPE' : 'TEXT',
			'data' : param
		});
	}
});


$.extend(mist.utils, {
	'parse_param' : function _t_mist_utils_parse_param (param) {
		var result = {};
		$.each(param.split(/\s+/), function () {
			var k_v = this.split(/=/);
			result[k_v.shift()] = k_v.join().replace(/^["']|["']$/, '');
		});
		return result;
	}
});

/*
	正規表現組み立て
*/
var create_regexp = function (arg, option) {
	arg = Array.prototype.slice.call(arg)
	var result = '';
	for ( var i = 0, l = arg.length; i < l; ++i ) {
		result += (toString.call(arg[i]) === '[object RegExp]')
			? (arg[i] + '').replace(/^\/|\/\w*$/g, '')
			: arg[i]
		;
	};
	return new RegExp(result, option);
};
var mosix = function () {
	return create_regexp(arguments);
};
var mosixg = function () {
	return create_regexp(arguments, 'g');
};

$.fn.extend({
	'get_local_path' : function (attr) {
		return $(this).attr(attr).replace('http://'+location.hostname+'/', '/');
	}
});

mist.init();
