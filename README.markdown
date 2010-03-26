### コンセプト

JSを書かなくてもそこそこリッチなmixi appが作れるフレームワーク

### 機能

静的なhtmlの出力のみで以下のような機能が実装可能です。

 * OWNER、VIEWER情報の取得
 * マイミク情報の取得
 * 指定mixi IDユーザ情報の取得
 * 画面遷移の制御
 * 表示領域の自動調整
 * 「日記に書く」リンク
 * アクティビティの発行
 * 「友達を誘う」機能
 * cookieのサポート
 * パーマネントリンク対応
 * 複数ユーザ情報をまとめて取得する機能
 * google analytics連携

また、ActionScript用のAPIも提供しています。

### 使い方

1, gadget.xmlのModule ModulePrefsに以下の内容を記述してください。

	<Require feature="opensocial-0.8" />
	<Require feature="dynamic-height" />

2, gadget.xmlのModule Content内に以下の内容を記述してください。  
**！！！アプリ公開時には必ずファイルを自分のサーバに保存してそこから読み込んでください！！！**

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4/jquery.min.js"></script>
	<script type="text/javascript" src="http://svn.coderepos.org/share/lang/javascript/jQuery.opensocial_simple/jquery.opensocial_simple.js"></script>
	<script type="text/javascript" src="http://github.com/kyo-ago/mist.js/raw/master/mist.js"></script>
	<script type="text/javascript">
	$.extend(mist.conf, {
		// 初期表示ページ 
		'index_page' : '/index.html',
		// 相対リンクの基準URL 
		'api_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/'
	});
	</script>

3, [[mixi] アプリを作成する](http://mixi.jp/add_appli.pl)からアプリを登録してください。

これでアプリ開始時にhttp://github.com/kyo-ago/mist.js/raw/master/test/index.htmlを読み込んで表示します。

### テンプレート書式

サーバサイドから返されるhtmlはテンプレートとして解釈され、以下のような置き換えが行われます。  
（置き換えはDOMの展開前に行うため、htmlの文法上正しいかどうかを考慮する必要はありません）

 * 「&lt;div id=&quot;mist\_content&quot;&gt;」「&lt;!-- /#mist\_content --&gt;&lt;/div&gt;」が存在する場合、間のhtml以外は削除されます。  
mixi外でコーディングの確認を行いたい場合に使用してください。  
ただし、上記記述は文字列として解釈されるため、コメントも含めて記述してください。
 * [%app\_id%]はアプリのIDへ置き換えられます。
 * [%(OWNER|VIEWER) field="(\w+)"%]はそれぞれOWNER、VIEWERの情報に置き換えられます。  
使用できるパラメータは「fieldに指定できる値」を参照してください。
 * [%people id="(\d+)" field="(\w+)"%]は指定IDのmixiユーザ情報に置き換えられます。  
使用できるパラメータは「fieldに指定できる値」を参照してください。
 * [%friends filter="(has_app|all)"%]はマイミクIDを「,」で区切ったものに置き換えられます。  
has_appが指定された場合、マイミクのうち同じアプリを使用しているIDのみを取得します。filterにallを指定すると全マイミクのIDを取得します。filter自体を指定しない場合、has_appが指定されたものとして動作します。  
リンク先のパラメータに指定し、サーバサイドでページング、一覧表示を行うことを想定しています。
 * 以下のようなhtmlをアクティビティとして送信します。  
（アクティビティのみテンプレートから削除されないため、「style="display:none"」を設定してください）

<pre><code>&lt;div id="mist_activity" style="display:none"&gt;
    &lt;span class="activity_body"&gt;アクティビティ本文&lt;/span&gt;
    &lt;span class="activity_target"&gt;送信先mixi id,送信先mixi id...&lt;/span&gt;
    &lt;span class="activity_image"&gt;http://アクティビティ画像URL/file.(gif|jpe?g|png),http://アクティビティ画像URL/file.(gif|jpe?g|png)...&lt;/span&gt;
    &lt;span class="activity_params"&gt;アクティビティURLパラメータ&lt;/span&gt;
&lt;/div&gt;
</code></pre>

 * 以下のようなhtmlでcookieの設定を行います。cookieの内容は以後、サーバに対してcookieとして送信されます。

&lt;/html&gt;
&lt;!-- set-cookie:key=value; --&gt;

 * [%permanent\_link%]は現在のページの静的なURLへ置き換えられます。

#### fieldに指定できる値

以下の内容を指定可能ですが、id、nickname、has\_app、profile\_url、thumnail\_url\*以外はユーザの設定により取得できない場合があります。

id、nickname、has\_app、profile\_url、thumnail\_url\*に関しては取得に失敗した場合でもダミーの情報を設定します。

[%(OWNER|VIEWER)%]、[%people%]はfieldが指定されていない場合、nicknameが指定されているものと仮定します。

 * id
 	 * mixi ID
 * nickname
 	 * ニックネーム
 * thumbnail\_url
 	 * サムネイルURL（thumbnail\_url\_mと同じ）
 * thumbnail\_url\_l
 	 * サムネイルURL（180×180）
 * thumbnail\_url\_m
 	 * サムネイルURL（76×76）
 * thumbnail\_url\_s
 	 * サムネイルURL（40×40）
 * profile\_url
 	 * プロフィールURL
 * current\_location\_text
 	 * current\_location text（北海道～沖縄県のいずれか）
 * gender\_key
 	 * gender key（MALE or FEMALE）
 * gender\_text
 	 * gender text（男性 or 女性）
 * age
 	 * 年齢
 * date\_of\_birth\_0day
 	 * 0補完された誕生日付（01～31のいずれか）
 * date\_of\_birth\_0month
 	 * 0補完された誕生月（01～12のいずれか）
 * date\_of\_birth\_day
 	 * 誕生日付（1～31のいずれか）
 * date\_of\_birth\_month
 	 * 誕生月（1～12のいずれか）
 * date\_of\_birth\_text
 	 * 0補完された誕生月日（01月01～12月31日のいずれか。mixiのプロフィールと同じ形式）
 * blood\_type
 	 * 血液型（A～ABのいずれか）

### linkの扱いに関して

リンククリック時にhrefの内容に応じて以下のような順番で処理を行います。  
（「マイミクの招待」機能以外、target widnowはa要素のtarget属性に従います）

1, 「/opensocial/sharefriend/」で始まっていれば「マイミクの招待」機能を呼び出します。  
URLに「/opensocial/sharefriend/#http://example.com/path」の形式でURLが設定されている場合、招待画面終了後、「http://example.com/path?recipientIds=招待したmixi id,招待したmixi id...」の形式でリクエストを行います。設定されているURLが「/」から始まっている場合、先頭にmist.conf.api_urlを追加してアクセスします。  
クリエストからのレスポンスが「&lt;」から始まっている場合、ページ内容の返却として通常の画面遷移と同じ処理を行います。  
クリエストからのレスポンスが「{"redirect" : "/api/path"}」形式の場合、/api/pathへリダイレクトを行います。

2, 「http://mixi.jp/add\_diary.pl」と一致すれば日記を書く画面への遷移を行います。  
テンプレート内に以下の形式で日記の内容を記述してください。

	<div id="mist_diary" style="display:none">
		<input type="text" class="diary_title" value="日記タイトル" />
		<textarea class="diary_body">日記<br />本文</textarea>
	</div>

3, 「http://mixi.jp/」で始まっていればmixi内へのリンクと判断し、ブラウザの処理にゆだねます。

4, 「/」で始まっていればAPIへのアクセスと判断し、mist.conf.api\_urlにhrefの内容を追加して新しいテンプレートを取得します。  
（このときパーマネントリンクモードが設定されている場合のみ画面遷移を行います）

5, 「http://」で始まっていれば外部URLへのアクセスと判断し、mixi.util.requestExternalNavigateToで外部URLへ遷移します。

### 設定項目に関して

mist.confに設定可能な項目は以下の通りです。

 * api\_url  
 	リンクURLの先頭につけられるURL。a[href],form[action]に使用。初期値undefined
 * index\_page  
 	最初に取得するpath（api\_url + index\_pageを最初に取得）。初期値'/index.html'
 * doc\_root\_url  
 	画像URLの先頭につけられるURL。img[src]が/から始まっている場合使用（相対指定の場合使用しない）。初期値undefined（先頭に追加しない）
 * mist\_template\_filter\_strip\_mist\_content\_tags  
 	APIの返却値から切り出す文字列範囲。['開始文字列','終了文字列']の形式で指定。初期値\[&#039;&lt;div id=&quot;mist\_content&quot;&gt;&#039;, &#039;&lt;\!\-\- /#mist\_content --&gt;&lt;\/div&gt;&#039;\]。DOM element、正規表現ではなく、単純な文字列であることに注意
 * auto\_adjust  
 	立て幅の自動調整制御。falseの場合調整を行わない。初期値true（自動調整を行う）
 * absolute\_height  
 	立て幅の絶対指定。Numberで指定。初期値undefined
 * permanent\_link  
 	すべてのリンクを固定URLに書き換える。中クリックが動作するようになる代わり若干遅くなる。trueが設定された場合、リンククリック時に固定URLでの画面遷移を行う。初期値undefined
 * replace\_href  
 	パーマネントリンクモード。trueが設定された場合、リンククリック時に固定URLでの画面遷移を行う。初期値undefined
 * OWNER\_REQUIRE\_APP\_URL  
 	オーナーにアプリの所有を要求する（所有していない場合このURLへ移動）。undefiendが指定された場合画面遷移を行わない。初期値http://mixi.jp/join\_appli.pl?id=app\_id
 * VIEWER\_REQUIRE\_APP\_URL  
 	ビュアーにアプリの所有を要求する（所有していない場合このURLへ移動）。undefiendが指定された場合画面遷移を行わない。初期値http://mixi.jp/join\_appli.pl?id=app\_id
 * REQUIRE\_OWNER\_EQ\_VIEWER\_URL  
 	オーナーとビュアーが同じであることを要求する（同じでない場合このURLへ移動）。undefiendが指定された場合画面遷移を行わない。初期値http://mixi.jp/run\_appli.pl?id=app\_id
 * anonymous\_user  
 	ユーザ情報の取得に失敗した場合の初期値。object。初期値は以下の通り
	 * id  
	 	'0'
	 * nickname  
	 	'guest'
	 * has\_app  
	 	false
	 * profile\_url  
	 	'http://mixi.jp/'
	 * thumnail\_url  
	 	'http://img.mixi.jp/img/basic/common/noimage\_member76.gif'
 * analytics\_key  
 	Google Analyticsのkey（例 : UA-xxxxxxxx-x）このパラメータを使用する場合、gadget.xmlに&lt;Require feature="analytics" /&gt;を設定する。出力形式は以下の通り。  
 	'/(canvas|profile|home)/' + mist.page.serialize_url

mist.jsを読み込んだ後に以下の形式で設定してください。

	$.extend(mist.conf, {
		'index\_page' : '/index.html',
		'doc\_root\_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/',
		'api\_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/',
		// 以下同じ形式で内容を設定 
		'' : ''
	});

### URI parameterに関して

mist.jsを読み込み際に以下の形式でパラメータが指定可能です。

	<script type="text/javascript" src="http://example.com/js/mist.js#key1=value1&key2=value2"></script>

設定できる内容は以下の通りです。

 * no\_init=true  
 	初期URLの自動読み込みを行わない。初期URLのパラメータとしてユーザ情報を使用する場合や、flashのみのコンテンツの場合に使用

### ActionScript用API

以下のAPIはActionScriptから呼び出されることを想定しています。

 * mist.as.call\_get  
 	AUTHORIZATION = SIGNEDでのGET通信を行う。
 	 * 引数
 	 	 * url  
 	 	 	取得先URL
 	 	 * data  
 	 	 	URL parameter
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_call\_get
 	 	 * type  
 	 	 	取得形式の指定。'TEXT'か'JSON'が指定可能。初期値TEXT
 * mist.as.call\_post  
 	AUTHORIZATION = SIGNEDでのPOST通信を行う。
 	 * 引数
 	 	 * url  
 	 	 	取得先URL
 	 	 * data  
 	 	 	URL parameter
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_call\_post
 	 	 * type  
 	 	 	取得形式の指定。'TEXT'か'JSON'が指定可能。初期値TEXT
 * mist.as.load\_person  
 	ユーザ情報を取得する。
 	 * 引数
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_load\_person。引数は以下の通り(Object)  
 	 	 	{ 'OWNER' : アプリオーナーのpeople object, 'VIEWER' : アプリビュアーのpeople object }
 * mist.as.load\_people  
 	ユーザ情報を取得する。
 	 * 引数
 	 	 * id\_list  
 	 	 	取得対象のmixi id。String、Number、Array(String or Number)での指定が可能
  	 	 * param  
  	 	 	object。
	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_load\_people。引数は以下の通り。peopleはid\_listの順番で返ることが保証される  
 	 	 	{ 'people' : [people object, ...] }
 * mist.as.load\_friends  
 	マイミク情報を取得する。
 	 * 引数
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_load\_friends。引数は以下の通り  
 	 	 	{ 'friends' : [people object, ...]/* マイミクが居ない場合[] */ }
 * mist.as.share\_app  
  	「友達を誘う」を実行する。マイミク一覧表示中はflashは重ね合わせ問題の回避のため非表示状態となる。
 	 * 引数
	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_share\_app。引数は以下の通り  
 	 	 	{ 'recipientIds' : [誘ったmixi id, ...]/* 誘ったマイミクが居ない場合[] */ }
 * mist.as.get\_permanent\_link  
  	現在表示している画面の固定リンク用URLを取得する。
 	 * 返り値  
	 	 固定リンクURL。string
 * mist.as.throw\_diary  
  	mixiの「日記を書く」画面へ遷移する。
 	 * 引数
 	 	 * title  
 	 	 	日記タイトル
 	 	 * body  
 	 	 	日記本文（改行可）
 * mist.as.throw\_activity  
  	更新情報を送信する。
 	 * 引数
 	 	 * body  
 	 	 	アクティビティ本文
 	 	 * param  
 	 	 	設定内容。object。設定可能な内容は以下の通り
 	 	 	 * target  
 	 	 	 	アクティビティを送信するマイミクID（複数存在素場合「,」で区切る）
 	 	 	 * media\_item  
 	 	 	 	アクティビティに表示する画像URL（複数存在素場合「,」で区切る。最大3つ。gif,jpg,pngのみ認識）
 * mist.as.navigate\_to  
  	画面遷移を行う。
 	 * 引数
 	 	 * href  
 	 	 	URI。以下のように処理される。
 	 	 	 * http://*mixi.jp、http://*mixi.co.jpから始まる場合、同じwindowで画面遷移する。
 	 	 	 * /#の場合、画面上までwindowをscrollさせる。
 	 	 	 * /から始まる場合、APIにURLを投げて通常のhtmlと同じ画面遷移を行う。
 	 	 	 * http://、https://から始まる場合、mixi.util.requestExternalNavigateToを使った画面遷移を行う。
 	 	 * target  
 	 	 	target option。string。設定可能な内容は以下の通り
 	 	 	 * http://*mixi.jp、http://*mixi.co.jpから始まる場合、window.openの第2引数と解釈する（未指定時'_top'）
 	 	 	 * http://、https://から始まる場合、'PAYMENT'を指定すると外部決済サービスへ形式での遷移を行う（未指定時一般サイトへの遷移）
 * mist.as.get\_owner\_data  
  	OWNERの保存されている情報を取得する（mist.as.post\_viewer\_dataで保存した情報しか取得できない）
 	 * 引数
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_get\_owner\_data。引数は保存されているObject
 * mist.as.get\_viewer\_data  
  	VIEWERの保存されている情報を取得する（mist.as.post\_viewer\_dataで保存した情報しか取得できない）
 	 * 引数
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_get\_viewer\_data。引数は保存されているObject
 * mist.as.post\_viewer\_data  
  	VIEWERに情報を取得する（mist.as.post\_viewer\_dataで保存した情報を上書きする）
 	 * 引数
 	 	 * callback\_name  
 	 	 	callback function name。String。初期値mist\_as\_post\_viewer\_data。引数はなし

以下の内容はActionScript用APIで共通の内容です。

 * people object  
 	以下のプロパティが存在するobjectです。  
	id、nickname、has\_app、profile\_url、thumnail\_url\*以外はユーザの設定により取得できない場合があります。  
	id、nickname、has\_app、profile\_url、thumnail\_url\*に関しては取得に失敗した場合でもダミーの情報を設定します。

	 * id
	 	 * mixi ID
	 * nickname
	 	 * ニックネーム
	 * thumbnail\_url
	 	 * サムネイルURL（thumbnail\_url\_mと同じ）
	 * thumbnail\_url\_l
	 	 * サムネイルURL（180×180）
	 * thumbnail\_url\_m
	 	 * サムネイルURL（76×76）
	 * thumbnail\_url\_s
	 	 * サムネイルURL（40×40）
	 * profile\_url
	 	 * プロフィールURL
	 * current\_location\_text
	 	 * current\_location text（北海道～沖縄県のいずれか）
	 * gender\_key
	 	 * gender key（MALE or FEMALE）
	 * gender\_text
	 	 * gender text（男性 or 女性）
	 * age
	 	 * 年齢
	 * date\_of\_birth\_0day
	 	 * 0補完された誕生日付（01～31のいずれか）
	 * date\_of\_birth\_0month
	 	 * 0補完された誕生月（01～12のいずれか）
	 * date\_of\_birth\_day
	 	 * 誕生日付（1～31のいずれか）
	 * date\_of\_birth\_month
	 	 * 誕生月（1～12のいずれか）
	 * date\_of\_birth\_text
	 	 * 0補完された誕生月日（01月01～12月31日のいずれか。mixiのプロフィールと同じ形式）
	 * has\_app
	 	 * アプリをインストールしているか否か（true or false。boolean）
	 * blood\_type
	 	 * 血液型（A～ABのいずれか）

### SIGNED通信に関して

以下のコードを実行することにより、以後すべての通信がAUTHORIZATION = SIGNEDとなります。

	$os.ajaxSettings.AUTHORIZATION = 'SIGNED';

ただし、ActionScript用APIでの通信は上記設定によらず、必ずSIGNED通信となります。  
（ASの場合、非signedで通信する必要性が低いため）

### TODO
 * Message API
 * Albums API
 * Browser Cache
 * JS API documents
 * a[href="#top"]対応
 * ブラウザの「戻る」対応
 * デバッグモード機能（固定URLの表示。サーバ通信の表示。DOM展開前の表示）
 * 既読リンク、中クリック対応 -> ざっくり実装。既読リンクは要検討
 * テスト支援機能 -> ざっくり実装doc書く
 * conf内容をテンプレートで使えるようにする機能 -> ざっくり実装doc書く
