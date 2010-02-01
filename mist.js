/**
 * mixiapp framework mist
 * Copyright (C) KAYAC Inc. | http://www.kayac.com/
 * Dual licensed under the MIT <http://www.opensource.org/licenses/mit-license.php>
 * and GPL <http://www.opensource.org/licenses/gpl-license.php> licenses.
 * Date: 2010-02-01
 * @author kyo_ago
 * @version 0.0.1
 * @require jQuery 1.3
 * @require jQuery opensocial-simple plugin
 * @see http://github.com/kyo-ago/mist.js
 */

if (!window.mist) window.mist = {};

if (!window.$os) $os = $.opensocial_simple;

/*
	初期化
*/
mist.init = function _t_mist_init () {
	this.social.load_person();

	// live eventの設定 
	$('a').live('click', mist.event.requestShareApp);
	$('a').live('click', mist.event.diary);
	$('a').live('click', mist.event.link);
	$.browser.msie ? $(':submit').live('click', function (env) {
		mist.event.form.call($(this).closest('form').get(0), env);
	}) : $('form').live('submit', mist.event.form);

	$(function () {
		// /の読み込み 
		mist.page.get('/index.html');

		// 追加対象タグの設定 
		if (!$('#mist_content').length) $('body').append('<div id="mist_content">');
	});
};

/*
	ページ遷移関係
*/
$.extend(mist.page = {}, {
	// 現在表示中のpath 
	'path' : '',
	// 現在保持中のcookie 
	'cookie' : {},
	// 現在保持中のparam 
	'param' : {},
	// 常に保持されるparam 
	'base_param' : {},
	// auto adjust flag 
	'auto_adjust' : true,
	// 状態のserialize 
	'serialize_url' : '',
	// 現在のserialize urlを作成 
	'get_serialize' : function () {
		return this.serialize_url;
	},
	// filter table
	// [ { 'name' : '', 'path_regexp' : '', 'exec' : function () {} },... ]
	'filter' : [
		{
			// filter name(optional) 
			'name' : 'strip_mist_content',
			'exec' : function _t_mist_page_filter_strip_mist_content () {
				this.data = get_inner_text(this.data, '<div id="mist_content">', '</div><!-- /#div -->') || this.data;
			}
		},
		{
			// filter name(optional) 
			'name' : 'app_id',
			'exec' : function _t_mist_page_filter_app_id () {
				this.data = this.data.replace(/\[%app_id\s*%\]/g, mist.env.app_id);
			}
		},
		{
			'name' : 'person',
			'exec' : function _t_mist_page_filter_person () {
				this.data = this.data.replace(/\[%(OWNER|VIEWER)\s+field="(\w+)"\s*%\]/g, function (_, name, field) {
					return mist.social.person[name][field] || mist.social.person[name][field.toUpperCase()];
				});
			}
		},
		{
			'name' : 'friends',
			'exec' : function _t_mist_page_filter_friends () {
				var match = this.data.match(/\[%friends(.*?)%\]/);
				if (!match) return;
				var params = match.length !== 1 ? parse_param(match.pop()) : {};
				params.filter = params.filter ? params.filter.toUpperCase() : 'HAS_APP';
				var self = this;
				params.callback = function () {
					self.data = self.data.replace(/\[%friends(.*?)%\]/g, mist.social.friends.join(','));
				};
				mist.social.load_friends(params);
			}
		}
	],
	'get' : function _t_mist_page_get (path) {
		var path_param = path.split('?');
		this.path = path_param.shift();
		var self = this;
		$.each(path_param.join('?').split('&'), function () {
			var k_v = this.split('=');
			self.param[k_v.shift()] = k_v.join('=');
		});
		$os.get(mist.conf.api_url + path, $.extend(this.param, this.base_param), function () {
			self.serialize_url = self.path + '?' + $.param(self.param);
			self.param = {};
			self.load.apply(self, arguments);
		});
	},
	'load' : function _t_mist_page_load (data) {
		this.data = data;
		var self = this;
		this.call_filter();
		$(function () {
			if (!mist.env.is_loading()) $('#mist_content').html(self.data);
			var timer = setInterval(function () {
				if (mist.env.is_loading()) return;
				clearInterval(timer);
				$('#mist_content').html(self.data);
				mist.event.call_complate();
				self.adjust();
			}, 100);
		});
	},
	'adjust' : function _t_mist_page_adjust () {
		if (!this.auto_adjust) return;
		$os.adjustHeight();
		$('img').load(function(){ $os.adjustHeight(); });
	}
});
// 各ページの読み込みfilter eventの追加（filter_stack, add_filter, call_filter） 
add_stack_method(mist.page, 'filter');
mist.page.add_filter([
	{
		'name' : 'strip_mist_content',
		'exec' : function _t_mist_page_filter_strip_mist_content () {
			mist.page.data = get_inner_text(mist.page.data, '<div id="mist_content">', '</div><!-- /#div -->') || mist.page.data;
		}
	},
	{
		'name' : 'app_id',
		'exec' : function _t_mist_page_filter_app_id () {
			mist.page.data = mist.page.data.replace(/\[%app_id\s*%\]/g, mist.env.app_id);
		}
	},
	{
		'name' : 'person',
		'exec' : function _t_mist_page_filter_person () {
			mist.page.data = mist.page.data.replace(/\[%(OWNER|VIEWER)\s+field="(\w+)"\s*%\]/g, function (_, name, field) {
				return mist.social.person[name][field] || mist.social.person[name][field.toUpperCase()];
			});
		}
	},
	{
		'name' : 'people',
		'exec' : function _t_mist_page_filter_people () {
			var match = mist.page.data.match(/\[%people.+?%\]/g);
			if (!match) return;
			var person = $.map(match, function (m) {
				var attr = m.match(/\s(.+?)%\]/);
				return parse_param(attr.pop()).id;
			});
			mist.social.load_people(person, {
				'field' : 'all_field_set'
			}, function _t_mist_page_filter_people_callback () {
				mist.page.data = mist.page.data.replace(/\[%people(.*?)%\]/g, function (_, attr) {
					var param = parse_param(attr);
					return mist.social.get_people(param.id)[param.field.toUpperCase()];
				});
			});
		}
	},
	{
		'name' : 'friends',
		'exec' : function _t_mist_page_filter_friends () {
			var match = mist.page.data.match(/\[%friends(.*?)%\]/);
			if (!match) return;
			var params = match.length !== 1 ? parse_param(match.pop()) : {};
			params.filter = params.filter ? params.filter.toUpperCase() : 'HAS_APP';
			params.callback = function _t_mist_page_filter_friends_callback () {
				mist.page.data = mist.page.data.replace(/\[%friends(.*?)%\]/g, mist.social.friends.join(','));
			};
			mist.social.load_friends(params);
		}
	}
]);

$.extend(mist.env = {}, {
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

$.extend(mist.conf = {}, {
	// オーナーにアプリの所有を要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'OWNER_REQUIRE_APP_URL' : mist.env.join_appli + mist.env.app_id,
	// ビュアーにアプリの所有を要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'VIEWER_REQUIRE_APP_URL' : mist.env.join_appli + mist.env.app_id,
	// オーナーとビュアーが同じであることを要求する 
	// （所有していない場合、このURLへapp_idを追加して移動） 
	'REQUIRE_OWNER_EQ_VIEWER_URL' : mist.env.run_appli + mist.env.app_id
});

$.extend(mist.social = {}, {
	'person' : {
		'OWNER' : {},
		'VIEWER' : {}
	},
	'friends' : [],
	'cache' : {},
	'load_person' : function _t_mist_social_load_person () {
		var self = this;
		mist.env.loading_queue.push('');
		$os.getPerson('all_field_set', function (p) {
			self.person.OWNER = mist.utils.person2obj(p.OWNER.fieldValue);
			self.person.VIEWER = mist.utils.person2obj(p.VIEWER.fieldValue);
			self.cache[self.person.OWNER.ID] = self.person.OWNER;
			self.cache[self.person.VIEWER.ID] = self.person.VIEWER;
			mist.env.loading_queue.pop('');
		});
	},
	'load_people' : function (person, param, callback) {
		mist.env.loading_queue.push('');
		if ($.isFunction(param.callback)) callback = param.callback;
		var self = this;
		person = $.grep(person, function () { return !self.cache[this]; });
		$os.getPersonsSync(person, param, function (persons) {
			var cache = self.cache;
			$.each(persons, function () {
				var obj = mist.utils.person2obj(this);
				cache[obj.ID] = obj;
			});
			callback();
			mist.env.loading_queue.pop('');
		});
	},
	'get_people' : function (id) {
		return this.cache[id];
	},
	'load_friends' : function _t_mist_social_load_friends (param) {
		if (this.friends.length) return callback();
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
		$os.getFriends(param);
	}
});

$.extend(mist.auth = {}, (function _t_mist_auth () {
	var app_id = mist.env.app_id;
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

$.extend(mist.event = {}, {
	'requestShareApp' : function _t_mist_event_requestShareApp (env) {
		if (env.button) return;
		if (!$(this).get_local_path('href').match('/opensocial/sharefriend/')) return;
		env.stopImmediatePropagation();
		env.preventDefault();

		var name = '_t_mist_event_requestShareApp';
		var url = $(this).get_local_path('href');
		$('object, embed').each(function () {
			$(this).data(name, {
				'width' : $(this).width(),
				'height' : $(this).height(),
			});
			$(this).width(1);
			$(this).height(1);
		});
		$os.requestShareApp(function (result) {
			$('object, embed').each(function () {
				var size = $(this).data(name);
				$(this).width(size.width);
				$(this).height(size.height);
			});
			var match = url.match(/#(.+)/);
			if (!match) return;
			url = match.pop();
			var param = url.split(/\?/);
			url = param.shift();
			param = param.join('');
			var params = {};
			$.each(param.split(/&/), function () {
				if (!(this + '')) return;
				var k_v = (this + '').split(/=/);
				if (k_v.length === 1) return;
				params[k_v.shift()] = k_v.join('=');
			});
			params.recipientIds = result.getData()["recipientIds"].join(',');
			$os.get(url, params, function () {});
		});
	},
	'diary' : function _t_mist_event_diary (env) {
		if (env.button) return;
		if ($(this).attr('href') !== 'http://mixi.jp/add_diary.pl') return;
		env.stopImmediatePropagation();

		var diary = $(this).closest('.mist_diary');
		if (!diary.length) diary = $('#mist_diary');
		if (!diary.length) throw new Error(' mist : missing diary template');

		var title = diary.find('.diary_title').val();
		var body = diary.find('.diary_body').val();
		$(this).attr('href', mist.utils.create_diary_url(title, body)).click();
	},
	'link' : function _t_mist_event_link (env) {
		if (env.button) return;

		if (env.isImmediatePropagationStopped()) return;

		var href = $(this).get_local_path('href');

		// mixi内リンクはブラウザに処理させる 
		if (href.match(mosix('^http://mixi\.jp/'))) return;

		env.preventDefault();
		// 相対指定はAPIアクセス 
		if (href.match(mosix('^/'))) return mist.page.get(href);
		// 「#」開始はトップへ画面遷移 
		if (href.match(mosix('^/?#'))) return mist.page.adjust();
		// 外部リンク 
		if (href.match(mosix('^http://'))) return mixi.util.requestExternalNavigateTo(href);

		throw new Error(' mist : 認識できないURL形式です ' + href);
	},
	'form' : function _t_mist_event_form () {
		if (env.isImmediatePropagationStopped()) return;
		env.preventDefault();

		var action = $(this).get_local_path('action');
		var method = ($(this).attr('method') || 'GET').toUpperCase();
		var param = {};
		$.each($(this).serializeArray(), function () {
			param[this.name] = this.value;
		});
		mist.page.path = action;

		$os.ajax({
			'url' : mist.conf.api_url + action,
			'success' : mist.page.load,
			'METHOD' : method,
			'CONTENT_TYPE' : 'TEXT',
			'data' : param
		});
	}
});

// 各ページのDOM構築完了eventの追加（complate_stack, add_complate, call_complate） 
add_stack_method(mist.event, 'complate');
mist.event.add_complate({
	'name' : 'activity',
	'exec' : function _t_mist_event_complate_activity () {
		var act = $('#mist_activity');
		var body = act.find('.activity_body').text();
		if (!body) return;

		var param = {};
		param['target'] = act.find('.activity_target').text() || undefined;
		param['media_item'] = act.find('.activity_image').text() || undefined;
		param['app_params'] = act.find('.activity_params').text() || undefined;
		mist.utils.throw_activity(body, param)
	}
});

$.extend(mist.utils = {}, {
	'create_diary_url' : function _t_mist_utils_create_diary_url (title, body) {
		var EscapeEUCJP = get_EscapeEUCJP();
		return 'http://mixi.jp/add_diary.pl?' + $.param({
			'id' : mist.social.person.VIEWER.ID,
			'diary_title' : EscapeEUCJP(title),
			'diary_body' : EscapeEUCJP(body)
		}).replace(/%25/g, '%');
	},
	// for flash 
	'throw_diary' : function _t_mist_utils_throw_diary (title, body, target) {
		title = this.replace_appid_person(title);
		body = this.replace_appid_person(body);
		var url = this.create_diary_url(title, body);
		window.open(url, target || '_top');
	},
	'throw_activity' : function _t_mist_utils_throw_activity (body, param) {
		body = this.replace_appid_person(body);
		param['target']
			? param['target'] = param['target'].split(/\s*,\s*/)
			: delete param['target']
		;
		param['media_item']
			? param['media_item'] = param['media_item'].split(/\s*,\s*/)
			: delete param['media_item']
		;
		$os.postActivity(body, param);
	},
	'replace_appid_person' : function _t_mist_utils_replace_appid_person (str) {
		str = str.replace(/\[%app_id\s*%\]/g, mist.env.app_id);
		str = str.replace(/\[%(OWNER|VIEWER)\s+field="(\w+)"\s*%\]/g, function (_, name, field) {
			return mist.social.person[name][field] || mist.social.person[name][field.toUpperCase()];
		});
		return str;
	},
	// opensocial person object -> mixi person object(simple) 
	'person2obj' : function _t_mist_utils_person2obj (person) {
		var os = opensocial;
		var all_field = $os.person_field_set.all_field_set;
		var addr_key = os.Address.Field.UNSTRUCTURED_ADDRESS;
		var field = os.Person.Field;
		if (person.getField) person = (function () {
			var result = {};
			$.each(all_field, function () {
				result[this] = person.getField(field[this]);
				if (this != 'ADDRESSES' || !result[this]) return;
				result[this] = result[this][addr_key] || result[this]['unstructured_address'];
			});
			return result;
		})();
		var result = {};
		$.each(all_field, function () {
			var key = this + '';
			if (person[key] === undefined) return;
			result[key] = person[key];
			if (key === 'THUMBNAIL_URL') {
				result[key+'_L'] = result[key].replace(/s(\.\w+)$/, '$1');
				result[key+'_M'] = result[key];
				result[key+'_S'] = result[key].replace(/s(\.\w+)$/, 'm$1');
				return;
			};
			if (key === 'CURRENT_LOCATION') {
				return result[key+'_TEXT'] = result[key].getField(addr_key);
			};
			if (key === 'GENDER') {
				result[this+'_KEY'] = result[this].getKey();
				result[this+'_TEXT'] = result[this].getDisplayValue();
				return;
			};
			if (key === 'DATE_OF_BIRTH') {
				result[this+'_MONTH'] = result[this].getMonth() + 1;
				result[this+'_DAY'] = result[this].getDate();
				if (result[this+'_MONTH'] < 10) result[this+'_0MONTH'] = '0' + result[this+'_MONTH'];
				if (result[this+'_DAY'] < 10) result[this+'_0DAY'] = '0' + result[this+'_DAY'];
				result[this+'_TEXT'] = result[this+'_0MONTH'] + '月' + result[this+'_0DAY'] + '日';
				return;
			};
		});
		return result;
	}
});

// query_stringの分解 
function parse_param (param) {
	var result = {};
	$.each(param.split(/\s+/), function () {
		var k_v = this.split(/=/);
		result[k_v.shift()] = k_v.join().replace(/^\s*["']|["']\s*$/g, '');
	});
	return result;
};

// 正規表現で指定された中間部分の取得 
function get_inner_text (str, start, end) {
	var parts = str.split(start);
	parts.shift();
	parts = parts.join('').split(end);
	parts.pop();
	return parts.join('');
};

// add_*,call_* methodの追加 
function add_stack_method (obj, name) {
	var stack = obj[name + '_stack'] = [];
	obj['add_' + name] = function add_stack_method_add (regexp, exec) {
		if (arguments.length === 1) {
			if (!$.isArray(regexp)) return stack.push(regexp);
			return stack = stack.concat(regexp);
		};
		stack.push({
			'path_regexp' : regexp,
			'exec' : exec
		});
	};
	obj['call_' + name] = function add_stack_method_call () {
		var path = mist.page.path;
		var self = this;
		$.each(stack, function () {
			try {
				if (!this.path_regexp) return this.exec.call(self, match);
				var match = path.match(this.path_regexp);
				if (!match) return;
				this.exec.call(self, match);
			} catch (e) { console.warn(e); };
		});
	};
};

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

//
// Escape Codec Library: ecl.js (Ver.041208)
//
// Copyright (C) http://nurucom-archives.hp.infoseek.co.jp/digital/
//
// modified by kyo_ago(kayac)
//
function get_EscapeEUCJP(){var a=Function('var a="zKV33~jZ4zN=~ji36XazM93y!{~k2y!o~k0ZlW6zN?3Wz3W?{EKzK[33[`y|;-~j^YOTz$!~kNy|L1$353~jV3zKk3~k-4P4zK_2+~jY4y!xYHR~jlz$_~jk4z$e3X5He<0y!wy|X3[:~l|VU[F3VZ056Hy!nz/m1XD61+1XY1E1=1y|bzKiz!H034zKj~mEz#c5ZA3-3X$1~mBz$$3~lyz#,4YN5~mEz#{ZKZ3V%7Y}!J3X-YEX_J(3~mAz =V;kE0/y|F3y!}~m>z/U~mI~j_2+~mA~jp2;~m@~k32;~m>V}2u~mEX#2x~mBy+x2242(~mBy,;2242(~may->2&XkG2;~mIy-_2&NXd2;~mGz,{4<6:.:B*B:XC4>6:.>B*BBXSA+A:X]E&E<~r#z+625z s2+zN=`HXI@YMXIAXZYUM8X4K/:Q!Z&33 3YWX[~mB`{zKt4z (zV/z 3zRw2%Wd39]S11z$PAXH5Xb;ZQWU1ZgWP%3~o@{Dgl#gd}T){Uo{y5_d{e@}C(} WU9|cB{w}bzvV|)[} H|zT}d||0~{]Q|(l{|x{iv{dw}(5}[Z|kuZ }cq{{y|ij}.I{idbof%cu^d}Rj^y|-M{ESYGYfYsZslS`?ZdYO__gLYRZ&fvb4oKfhSf^d<Yeasc1f&a=hnYG{QY{D`Bsa|u,}Dl|_Q{C%xK|Aq}C>|c#ryW=}eY{L+`)][YF_Ub^h4}[X|?r|u_ex}TL@YR]j{SrXgo*|Gv|rK}B#mu{R1}hs|dP{C7|^Qt3|@P{YVV |8&}#D}ef{e/{Rl|>Hni}R1{Z#{D[}CQlQ||E}[s{SG_+i8eplY[=[|ec[$YXn#`hcm}YR|{Ci(_[ql|?8p3]-}^t{wy}4la&pc|3e{Rp{LqiJ],] `kc(]@chYnrM`O^,ZLYhZB]ywyfGY~aex!_Qww{a!|)*lHrM{N+n&YYj~Z b c#e_[hZSon|rOt`}hBXa^i{lh|<0||r{KJ{kni)|x,|0auY{D!^Sce{w;|@S|cA}Xn{C1h${E]Z-XgZ*XPbp]^_qbH^e[`YM|a||+=]!Lc}]vdBc=j-YSZD]YmyYLYKZ9Z>Xcczc2{Yh}9Fc#Z.l{}(D{G{{mRhC|L3b#|xK[Bepj#ut`H[,{E9Yr}1b{[e]{ZFk7[ZYbZ0XL]}Ye[(`d}c!|*y`Dg=b;gR]Hm=hJho}R-[n}9;{N![7k_{UbmN]rf#pTe[x8}!Qcs_rs[m`|>N}^V})7{^r|/E}),}HH{OYe2{Skx)e<_.cj.cjoMhc^d}0uYZd!^J_@g,[[[?{i@][|3S}Yl3|!1|eZ|5IYw|1D}e7|Cv{OHbnx-`wvb[6[4} =g+k:{C:}ed{S]|2M]-}WZ|/q{LF|dYu^}Gs^c{Z=}h>|/i|{W]:|ip{N:|zt|S<{DH[p_tvD{N<[8Axo{X4a.^o^X>Yfa59`#ZBYgY~_t^9`jZHZn`>G[oajZ;X,i)Z.^~YJe ZiZF^{][[#Zt^|]Fjx]&_5dddW]P0C[-]}]d|y {C_jUql] |OpaA[Z{lp|rz}:Mu#]_Yf6{Ep?f5`$[6^D][^u[$[6^.Z8]]ePc2U/=]K^_+^M{q*|9tYuZ,s(dS{i=|bNbB{uG}0jZOa:[-]dYtu3]:]<{DJ_SZIqr_`l=Yt`gkTnXb3d@kiq0a`Z{|!B|}e}Ww{Sp,^Z|0>_Z}36|]A|-t}lt{R6pi|v8hPu#{C>YOZHYmg/Z4nicK[}hF_Bg|YRZ7c|crkzYZY}_iXcZ.|)U|L5{R~qi^Uga@Y[xb}&qdbd6h5|Btw[}c<{Ds53[Y7]?Z<|e0{L[ZK]mXKZ#Z2^tavf0`PE[OSOaP`4gi`qjdYMgys/?[nc,}EEb,eL]g[n{E_b/vcvgb.{kcwi`~v%|0:|iK{Jh_vf5lb}KL|(oi=LrzhhY_^@`zgf[~g)[J_0fk_V{T)}I_{D&_/d9W/|MU[)f$xW}?$xr4<{Lb{y4}&u{XJ|cm{Iu{jQ}CMkD{CX|7A}G~{kt)nB|d5|<-}WJ}@||d@|Iy}Ts|iL|/^|no|0;}L6{Pm]7}$zf:|r2}?C_k{R(}-w|`G{Gy[g]bVje=_0|PT{^Y^yjtT[[[l!Ye_`ZN]@[n_)j3nEgMa]YtYpZy].d-Y_cjb~Y~[nc~sCi3|zg}B0}do{O^{|$`_|D{}U&|0+{J3|8*]iayx{a{xJ_9|,c{Ee]QXlYb]$[%YMc*]w[aafe]aVYi[fZEii[xq2YQZHg]Y~h#|Y:thre^@^|_F^CbTbG_1^qf7{L-`VFx Zr|@EZ;gkZ@slgko`[e}T:{Cu^pddZ_`yav^Ea+[#ZBbSbO`elQfLui}.F|txYcbQ`XehcGe~fc^RlV{D_0ZAej[l&jShxG[ipB_=u:eU}3e8[=j|{D(}dO{Do[BYUZ0/]AYE]ALYhZcYlYP/^-^{Yt_1_-;YT`P4BZG=IOZ&]H[e]YYd[9^F[1YdZxZ?Z{Z<]Ba2[5Yb[0Z4l?]d_;_)a?YGEYiYv`_XmZs4ZjY^Zb]6gqGaX^9Y}dXZr[g|]Y}K aFZp^k^F]M`^{O1Ys]ZCgCv4|E>}8eb7}l`{L5[Z_faQ|c2}Fj}hw^#|Ng|B||w2|Sh{v+[G}aB|MY}A{|8o}X~{E8paZ:]i^Njq]new)`-Z>haounWhN}c#{DfZ|fK]KqGZ=:u|fqoqcv}2ssm}.r{]{nIfV{JW)[K|,Z{Uxc|]l_KdCb%]cfobya3`p}G^|LZiSC]U|(X|kBlVg[kNo({O:g:|-N|qT}9?{MBiL}Sq{`P|3a|u.{Uaq:{_o|^S}jX{Fob0`;|#y_@[V[K|cw[<_ }KU|0F}d3|et{Q7{LuZttsmf^kYZ`Af`}$x}U`|Ww}d]| >}K,r&|XI|*e{C/a-bmr1fId4[;b>tQ_:]hk{b-pMge]gfpo.|(w[jgV{EC1Z,YhaY^q,_G[c_g[J0YX]`[h^hYK^_Yib,` {i6vf@YM^hdOKZZn(jgZ>bzSDc^Z%[[o9[2=/YHZ(_/Gu_`*|8z{DUZxYt^vuvZjhi^lc&gUd4|<UiA`z]$b/Z?l}YI^jaHxe|;F}l${sQ}5g}hA|e4}?o{ih}Uz{C)jPe4]H^J[Eg[|AMZMlc}:,{iz}#*|gc{Iq|/:|zK{l&}#u|myd{{M&v~nV};L|(g|I]ogddb0xsd7^V})$uQ{HzazsgxtsO^l}F>ZB]r|{7{j@cU^{{CbiYoHlng]f+nQ[bkTn/}<-d9q {KXadZYo+n|l[|lc}V2{[a{S4Zam~Za^`{HH{xx_SvF|ak=c^[v^7_rYT`ld@]:_ub%[$[m](Shu}G2{E.ZU_L_R{tz`vj(f?^}hswz}GdZ}{S:h`aD|?W|`dgG|if{a8|J1{N,}-Ao3{H#{mfsP|[ bzn+}_Q{MT{u4kHcj_q`eZj[8o0jy{p7}C|[}l){MuYY{|Ff!Ykn3{rT|m,^R|,R}$~Ykgx{P!]>iXh6[l[/}Jgcg{JYZ.^qYfYIZl[gZ#Xj[Pc7YyZD^+Yt;4;`e8YyZVbQ7YzZxXja.7SYl[s]2^/Ha$[6ZGYrb%XiYdf2]H]kZkZ*ZQ[ZYS^HZXcCc%Z|[(bVZ]]:OJQ_DZCg<[,]%Zaa [g{C00HY[c%[ChyZ,Z_`PbXa+eh`^&jPi0a[ggvhlekL]w{Yp^v}[e{~;k%a&k^|nR_z_Qng}[E}*Wq:{k^{FJZpXRhmh3^p>de^=_7`|ZbaAZtdhZ?n4ZL]u`9ZNc3g%[6b=e.ZVfC[ZZ^^^hD{E(9c(kyZ=bb|Sq{k`|vmr>izlH[u|e`}49}Y%}FT{[z{Rk}Bz{TCc/lMiAqkf(m$hDc;qooi[}^o:c^|Qm}a_{mrZ(pA`,}<2sY| adf_%|}`}Y5U;}/4|D>|$X{jw{C<|F.hK|*A{MRZ8Zsm?imZm_?brYWZrYx`yVZc3a@f?aK^ojEd {bN}/3ZH]/$YZhm^&j 9|(S|b]mF}UI{q&aM]LcrZ5^.|[j`T_V_Gak}9J[ ZCZD|^h{N9{~&[6Zd{}B}2O|cv]K}3s}Uy|l,fihW{EG`j_QOp~Z$F^zexS`dcISfhZBXP|.vn|_HYQ|)9|cr]<`&Z6]m_(ZhPcSg>`Z]5`~1`0Xcb4k1{O!bz|CN_T{LR|a/gFcD|j<{Z._[f)mPc:1`WtIaT1cgYkZOaVZOYFrEe[}T$}Ch}mk{K-^@]fH{Hdi`c*Z&|Kt{if[C{Q;{xYB`dYIX:ZB[}]*[{{p9|4GYRh2ao{DS|V+[zd$`F[ZXKadb*A] Ys]Maif~a/Z2bmclb8{Jro_rz|x9cHojbZ{GzZx_)]:{wAayeDlx}<=`g{H1{l#}9i|)=|lP{Qq}.({La|!Y{i2EZfp=c*}Cc{EDvVB|;g}2t{W4av^Bn=]ri,|y?|3+}T*ckZ*{Ffr5e%|sB{lx^0]eZb]9[SgAjS_D|uHZx]dive[c.YPkcq/}db{EQh&hQ|eg}G!ljil|BO]X{Qr_GkGl~YiYWu=c3eb}29v3|D|}4i||.{Mv})V{SP1{FX}CZW6{cm|vO{pS|e#}A~|1i}81|Mw}es|5[}3w{C`h9aL]o{}p[G`>i%a1Z@`Ln2bD[$_h`}ZOjhdTrH{[j_:k~kv[Sdu]CtL}41{I |[[{]Zp$]XjxjHt_eThoa#h>sSt8|gK|TVi[Y{t=}Bs|b7Zpr%{gt|Yo{CS[/{iteva|cf^hgn}($_c^wmb^Wm+|55jrbF|{9^ q6{C&c+ZKdJkq_xOYqZYSYXYl`8]-cxZAq/b%b*_Vsa[/Ybjac/OaGZ4fza|a)gY{P?| I|Y |,pi1n7}9bm9ad|=d{aV|2@[(}B`d&|Uz}B}{`q|/H|!JkM{FU|CB|.{}Az}#P|lk}K{|2rk7{^8^?`/|k>|Ka{Sq}Gz}io{DxZh[yK_#}9<{TRdgc]`~Z>JYmYJ]|`!ZKZ]gUcx|^E[rZCd`f9oQ[NcD_$ZlZ;Zr}mX|=!|$6ZPZYtIo%fj}CpcN|B,{VDw~gb}@hZg`Q{LcmA[(bo`<|@$|o1|Ss}9Z_}tC|G`{F/|9nd}i=}V-{L8aaeST]daRbujh^xlpq8|}zs4bj[S`J|]?G{P#{rD{]I`OlH{Hm]VYuSYUbRc*6[j`8]pZ[bt_/^Jc*[<Z?YE|Xb|?_Z^Vcas]h{t9|Uwd)_(=0^6Zb{Nc} E[qZAeX[a]P^|_J>e8`W^j_Y}R{{Jp__]Ee#e:iWb9q_wKbujrbR}CY`,{mJ}gz{Q^{t~N|? gSga`V_||:#mi}3t|/I`X{N*|ct|2g{km}gi|{={jC}F;|E}{ZZjYf*frmu}8Tdroi{T[|+~}HG{cJ}DM{Lp{Ctd&}$hi3|FZ| m}Kr|38}^c|m_|Tr{Qv|36}?Up>|;S{DV{k_as}BK{P}}9p|t`jR{sAm4{D=b4pWa[}Xi{EjwEkI}3S|E?u=X0{jf} S|NM|JC{qo^3cm]-|JUx/{Cj{s>{Crt[UXuv|D~|j|d{YXZR}Aq}0r}(_{pJfi_z}0b|-vi)Z mFe,{f4|q`b{}^Z{HM{rbeHZ|^x_o|XM|L%|uFXm}@C_{{Hhp%a7|0p[Xp+^K}9U{bP}: tT}B|}+$|b2|[^|~h{FAby[`{}xgygrt~h1[li`c4vz|,7p~b(|mviN}^pg[{N/|g3|^0c,gE|f%|7N{q[|tc|TKA{LU}I@|AZp(}G-sz{F |qZ{}F|f-}RGn6{Z]_5})B}UJ{FFb2]4ZI@v=k,]t_Dg5Bj]Z-]L]vrpdvdGlk|gF}G]|IW}Y0[G| /bo|Te^,_B}#n^^{QHYI[?hxg{[`]D^IYRYTb&kJ[cri[g_9]Ud~^_]<p@_e_XdNm-^/|5)|h_{J;{kacVopf!q;asqd}n)|.m|bf{QW|U)}b+{tL|w``N|to{t ZO|T]jF}CB|0Q{e5Zw|k |We}5:{HO{tPwf_uajjBfX}-V_C_{{r~gg|Ude;s+}KNXH}! `K}eW{Upwbk%ogaW}9EYN}YY|&v|SL{C3[5s.]Y]I]u{M6{pYZ`^,`ZbCYR[1mNg>rsk0Ym[jrE]RYiZTr*YJ{Ge|%-lf|y(`=[t}E6{k!|3)}Zk} ][G{E~cF{u3U.rJ|a9p#o#ZE|?|{sYc#vv{E=|LC}cu{N8`/`3`9rt[4|He{cq|iSYxY`}V |(Q|t4{C?]k_Vlvk)BZ^r<{CL}#h}R+[<|i=}X|{KAo]|W<`K{NW|Zx}#;|fe{IMr<|K~tJ_x}AyLZ?{GvbLnRgN}X&{H7|x~}Jm{]-| GpNu0}.ok>|c4{PYisrDZ|fwh9|hfo@{H~XSbO]Odv]%`N]b1Y]]|eIZ}_-ZA]aj,>eFn+j[aQ_+]h[J_m_g]%_wf.`%k1e#Z?{CvYu_B^|gk`Xfh^M3`afGZ-Z|[m{L}|k3cp[it ^>YUi~d>{T*}YJ{Q5{Jxa$hg|%4`}|LAgvb }G}{P=|<;Ux{_skR{cV|-*|s-{Mp|XP|$G|_J}c6cM{_=_D|*9^$ec{V;|4S{qO|w_|.7}d0|/D}e}|0G{Dq]Kdp{}dfDi>}B%{Gd|nl}lf{C-{y}|ANZr}#={T~|-(}c&{pI|ft{lsVP}){|@u}!W|bcmB{d?|iW|:dxj{PSkO|Hl]Li:}VYk@|2={fnWt{M3`cZ6|)}|Xj}BYa?vo{e4|L7|B7{L7|1W|lvYO}W8nJ|$Vih|{T{d*_1|:-n2dblk``fT{Ky|-%}m!|Xy|-a{Pz}[l{kFjz|iH}9N{WE{x,|jz}R {P|{D)c=nX|Kq|si}Ge{sh|[X{RF{t`|jsr*fYf,rK|/9}$}}Nf{y!1|<Std}4Wez{W${Fd_/^O[ooqaw_z[L`Nbv[;l7V[ii3_PeM}.h^viqYjZ*j1}+3{bt{DR[;UG}3Og,rS{JO{qw{d<_zbAh<R[1_r`iZTbv^^a}c{iEgQZ<exZFg.^Rb+`Uj{a+{z<[~r!]`[[|rZYR|?F|qppp]L|-d|}K}YZUM|=Y|ktm*}F]{D;g{uI|7kg^}%?Z%ca{N[_<q4xC]i|PqZC]n}.bDrnh0Wq{tr|OMn6tM|!6|T`{O`|>!]ji+]_bTeU}Tq|ds}n|{Gm{z,f)}&s{DPYJ`%{CGd5v4tvb*hUh~bf]z`jajiFqAii]bfy^U{Or|m+{I)cS|.9k:e3`^|xN}@Dnlis`B|Qo{`W|>||kA}Y}{ERYuYx`%[exd`]|OyiHtb}HofUYbFo![5|+]gD{NIZR|Go}.T{rh^4]S|C9_}xO^i`vfQ}C)bK{TL}cQ|79iu}9a];sj{P.o!f[Y]pM``Jda^Wc9ZarteBZClxtM{LW}l9|a.mU}KX}4@{I+f1}37|8u}9c|v${xGlz}jP{Dd1}e:}31}%3X$|22i<v+r@~mf{sN{C67G97855F4YL5}8f{DT|xy{sO{DXB334@55J1)4.G9A#JDYtXTYM4, YQD9;XbXm9SX]IB^4UN=Xn<5(;(F3YW@XkH-X_VM[DYM:5XP!T&Y`6|,^{IS-*D.H>:LXjYQ0I3XhAF:9:(==.F*3F1189K/7163D,:@|e2{LS36D4hq{Lw/84443@4.933:0307::6D7}&l{Mx657;89;,K5678H&93D(H<&<>0B90X^I;}Ag1{P%3A+>><975}[S{PZE453?4|T2{Q+5187;>447:81{C=hL6{Me^:=7ii{R=.=F<81;48?|h8}Uh{SE|,VxL{ST,7?9Y_5Xk3A#:$%YSYdXeKXOD8+TXh7(@>(YdXYHXl9J6X_5IXaL0N?3YK7Xh!1?XgYz9YEXhXaYPXhC3X`-YLY_XfVf[EGXZ5L8BXL9YHX]SYTXjLXdJ: YcXbQXg1PX]Yx4|Jr{Ys4.8YU+XIY`0N,<H%-H;:0@,74/:8546I=9177154870UC]d<C3HXl7ALYzXFXWP<<?E!88E5@03YYXJ?YJ@6YxX-YdXhYG|9o{`iXjY_>YVXe>AYFX[/(I@0841?):-B=14337:8=|14{c&93788|di{cW-0>0<097/A;N{FqYpugAFT%X/Yo3Yn,#=XlCYHYNX[Xk3YN:YRT4?)-YH%A5XlYF3C1=NWyY}>:74-C673<69545v {iT85YED=64=.F4..9878/D4378?48B3:7:7/1VX[f4{D,{l<5E75{dAbRB-8-@+;DBF/$ZfW8S<4YhXA.(5@*11YV8./S95C/0R-A4AXQYI7?68167B95HA1*<M3?1/@;/=54XbYP36}lc{qzSS38:19?,/39193574/66878Yw1X-87E6=;964X`T734:>86>1/=0;(I-1::7ALYGXhF+Xk[@W%TYbX7)KXdYEXi,H-XhYMRXfYK?XgXj.9HX_SX]YL1XmYJ>Y}WwIXiI-3-GXcYyXUYJ$X`Vs[7;XnYEZ;XF! 3;%8;PXX(N3Y[)Xi1YE&/ :;74YQ6X`33C;-(>Xm0(TYF/!YGXg8 9L5P01YPXO-5%C|qd{{/K/E6,=0144:361:955;6443@?B7*7:F89&F35YaX-CYf,XiFYRXE_e{}sF 0*7XRYPYfXa5YXXY8Xf8Y~XmA[9VjYj*#YMXIYOXk,HHX40YxYMXU8OXe;YFXLYuPXP?EB[QV0CXfY{:9XV[FWE0D6X^YVP*$4%OXiYQ(|xp|%c3{}V`1>Y`XH00:8/M6XhQ1:;3414|TE|&o@1*=81G8<3}6<|(f6>>>5-5:8;093B^3U*+*^*UT30XgYU&7*O1953)5@E78--F7YF*B&0:%P68W9Zn5974J9::3}Vk|-,C)=)1AJ4+<3YGXfY[XQXmT1M-XcYTYZXCYZXEYXXMYN,17>XIG*SaS|/eYJXbI?XdNZ+WRYP<F:R PXf;0Xg`$|1GX9YdXjLYxWX!ZIXGYaXNYm6X9YMX?9EXmZ&XZ#XQ>YeXRXfAY[4 ;0X!Zz0XdN$XhYL XIY^XGNXUYS/1YFXhYk.TXn4DXjB{jg|4DEX]:XcZMW=A.+QYL<LKXc[vV$+&PX*Z3XMYIXUQ:ZvW< YSXFZ,XBYeXMM)?Xa XiZ4/EXcP3%}&-|6~:1(-+YT$@XIYRBC<}&,|7aJ6}bp|8)K1|Xg|8C}[T|8Q.89;-964I38361<=/;883651467<7:>?1:.}le|:Z=39;1Y^)?:J=?XfLXbXi=Q0YVYOXaXiLXmJXO5?.SFXiCYW}-;|=u&D-X`N0X^,YzYRXO(QX_YW9`I|>hZ:N&X)DQXP@YH#XmNXi$YWX^=!G6YbYdX>XjY|XlX^XdYkX>YnXUXPYF)FXT[EVTMYmYJXmYSXmNXi#GXmT3X8HOX[ZiXN]IU2>8YdX1YbX<YfWuZ8XSXcZU%0;1XnXkZ_WTG,XZYX5YSX Yp 05G?XcYW(IXg6K/XlYP4XnI @XnO1W4Zp-9C@%QDYX+OYeX9>--YSXkD.YR%Q/Yo YUX].Xi<HYEZ2WdCE6YMXa7F)=,D>-@9/8@5=?7164;35387?N<618=6>7D+C50<6B03J0{Hj|N9$D,9I-,.KB3}m |NzE0::/81YqXjMXl7YG; [.W=Z0X4XQY]:MXiR,XgM?9$9>:?E;YE77VS[Y564760391?14941:0=:8B:;/1DXjFA-564=0B3XlH1+D85:0Q!B#:-6&N/:9<-R3/7Xn<*3J4.H:+334B.=>30H.;3833/76464665755:/83H6633:=;.>5645}&E|Y)?1/YG-,93&N3AE@5 <L1-G/8A0D858/30>8<549=@B8] V0[uVQYlXeD(P#ID&7T&7;Xi0;7T-$YE)E=1:E1GR):--0YI7=E<}n9|aT6783A>D7&4YG7=391W;Zx<5+>F#J39}o/|cc;6=A050EQXg8A1-}D-|d^5548083563695D?-.YOXd37I$@LYLWeYlX<Yd+YR A$;3-4YQ-9XmA0!9/XLY_YT(=5XdDI>YJ5XP1ZAW{9>X_6R(XhYO65&J%DA)C-!B:97#A9;@?F;&;(9=11/=657/H,<8}bz|j^5446>.L+&Y^8Xb6?(CYOXb*YF(8X`FYR(XPYVXmPQ%&DD(XmZXW??YOXZXfCYJ79,O)XnYF7K0!QXmXi4IYFRXS,6<%-:YO(+:-3Q!1E1:W,Zo}Am|n~;3580534*?3Zc4=9334361693:30C<6/717:<1/;>59&:4}6!|rS36=1?75<8}[B|s809983579I.A.>84758=108564741H*9E{L{|u%YQ<%6XfH.YUXe4YL@,>N}Tv|ve*G0X)Z;/)3@A74(4P&A1X:YVH97;,754*A66:1 D739E3553545558E4?-?K17/770843XAYf838A7K%N!YW4.$T19Z`WJ*0XdYJXTYOXNZ 1XaN1A+I&Xi.Xk3Z3GB&5%WhZ1+5#Y[X<4YMXhQYoQXVXbYQ8XSYUX4YXBXWDMG0WxZA[8V+Z8X;D],Va$%YeX?FXfX[XeYf<X:Z[WsYz8X_Y]%XmQ(!7BXIZFX]&YE3F$(1XgYgYE& +[+W!<YMYFXc;+PXCYI9YrWxGXY9DY[!GXiI7::)OC;*$.>N*HA@{C|}&k=:<TB83X`3YL+G4XiK]i}(fYK<=5$.FYE%4*5*H*6XkCYL=*6Xi6!Yi1KXR4YHXbC8Xj,B9ZbWx/XbYON#5B}Ue}+QKXnF1&YV5XmYQ0!*3IXBYb71?1B75XmF;0B976;H/RXU:YZX;BG-NXj;XjI>A#D3B636N;,*%<D:0;YRXY973H5)-4FXOYf0:0;/7759774;7;:/855:543L43<?6=E,.A4:C=L)%4YV!1(YE/4YF+ F3%;S;&JC:%/?YEXJ4GXf/YS-EXEYW,9;E}X$}547EXiK=51-?71C%?57;5>463553Zg90;6447?<>4:9.7538XgN{|!}9K/E&3-:D+YE1)YE/3;37/:05}n<}:UX8Yj4Yt864@JYK..G=.(A Q3%6K>3(P3#AYE$-6H/456*C=.XHY[#S.<780191;057C)=6HXj?955B:K1 E>-B/9,;5.!L?:0>/.@//:;7833YZ56<4:YE=/:7Z_WGC%3I6>XkC*&NA16X=Yz2$X:Y^&J48<99k8}CyB-61<18K946YO4{|N}E)YIB9K0L>4=46<1K0+R;6-=1883:478;4,S+3YJX`GJXh.Yp+Xm6MXcYpX(>7Yo,/:X=Z;Xi0YTYHXjYmXiXj;*;I-8S6N#XgY}.3XfYGO3C/$XjL$*NYX,1 6;YH&<XkK9C#I74.>}Hd`A748X[T450[n75<4439:18A107>|ET}Rf<1;14876/Yb983E<5.YNXd4149>,S=/4E/<306443G/06}0&}UkYSXFYF=44=-5095=88;63844,9E6644{PL}WA8:>)7+>763>>0/B3A545CCnT}Xm|dv}Xq1L/YNXk/H8;;.R63351YY747@15YE4J8;46;.38.>4A369.=-83,;Ye3?:3@YE.4-+N353;/;@(X[YYD>@/05-I*@.:551741Yf5>6A443<3535;.58/86=D4753442$635D1>0359NQ @73:3:>><Xn?;43C14 ?Y|X611YG1&<+,4<*,YLXl<1/AIXjF*N89A4Z576K1XbJ5YF.ZOWN.YGXO/YQ01:4G38Xl1;KI0YFXB=R<7;D/,/4>;$I,YGXm94@O35Yz66695385.>:6A#5}W7n^4336:4157597434433<3|XA}m`>=D>:4A.337370?-6Q96{`E|4A}C`|Qs{Mk|J+~r>|o,wHv>Vw}!c{H!|Gb|*Ca5}J||,U{t+{CN[!M65YXOY_*B,Y[Z9XaX[QYJYLXPYuZ%XcZ8LY[SYPYKZM<LMYG9OYqSQYM~[e{UJXmQYyZM_)>YjN1~[f3{aXFY|Yk:48YdH^NZ0|T){jVFYTZNFY^YTYN~[h{nPYMYn3I]`EYUYsYIZEYJ7Yw)YnXPQYH+Z.ZAZY]^Z1Y`YSZFZyGYHXLYG 8Yd#4~[i|+)YH9D?Y^F~Y7|-eYxZ^WHYdYfZQ~[j|3>~[k|3oYmYqY^XYYO=Z*4[]Z/OYLXhZ1YLZIXgYIHYEYK,<Y`YEXIGZI[3YOYcB4SZ!YHZ*&Y{Xi3~[l|JSY`Zz?Z,~[m|O=Yi>??XnYWXmYS617YVYIHZ(Z4[~L4/=~[n|Yu{P)|];YOHHZ}~[o33|a>~[r|aE]DH~[s|e$Zz~[t|kZFY~XhYXZB[`Y}~[u|{SZ&OYkYQYuZ2Zf8D~[v}% ~[w3},Q[X]+YGYeYPIS~[y}4aZ!YN^!6PZ*~[z}?E~[{3}CnZ=~[}}EdDZz/9A3(3S<,YR8.D=*XgYPYcXN3Z5 4)~[~}JW=$Yu.XX~] }KDX`PXdZ4XfYpTJLY[F5]X~[2Yp}U+DZJ::<446[m@~]#3}]1~]%}^LZwZQ5Z`/OT<Yh^ -~]&}jx[ ~m<z!%2+~ly4VY-~o>}p62yz!%2+Xf2+~ly4VY-zQ`z (=] 2z~o2",C={" ":0,"!":1},c=34,i=2,p,s=[],u=String.fromCharCode,t=u(12539);while(++c<127)C[u(c)]=c^39&&c^92?i++:0;i=0;while(0<=(c=C[a.charAt(i++)]))if(16==c)if((c=C[a.charAt(i++)])<87){if(86==c)c=1879;while(c--)s.push(u(++p))}else s.push(s.join("").substr(8272,360));else if(c<86)s.push(u(p+=c<51?c-16:(c-55)*92+C[a.charAt(i++)]));else if((c=((c-86)*92+C[a.charAt(i++)])*92+C[a.charAt(i++)])<49152)s.push(u(p=c<40960?c:c|57344));else{c&=511;while(c--)s.push(t);p=12539}return s.join("")')();a=a.substring(0,8836);return function b(d){return d.replace(/[^*+.-9A-Z_a-z-]/g,function c(e){var f=e.charCodeAt(0);return(f<128?(f<16?"%0":"%")+f.toString(16):65376<f&&f<65440?"%8E%"+(f-65216).toString(16):(f=a.indexOf(e))<0?"%A1%A6":"%"+((f-(f%=94))/94+161).toString(16)+"%"+(f+161).toString(16)).toUpperCase()})}};
