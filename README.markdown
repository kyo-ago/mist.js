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

### 使い方

1, gadget.xmlのModule ModulePrefsに以下の内容を記述してください。

	<Require feature="opensocial-0.8" />
	<Require feature="dynamic-height" />

2, gadget.xmlのModule Content内に以下の内容を記述してください。  
（本番環境では各ファイルを自身の管理下にある場所へアップしてください。mist.jsは必ずcharset="UTF-8"で読み込んでください）

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://svn.coderepos.org/share/lang/javascript/jQuery.opensocial_simple/jquery.opensocial_simple.js"></script>
	<script type="text/javascript" src="http://github.com/kyo-ago/mist.js/raw/master/mist.js" charset="UTF-8"></script>
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

 * 「&lt;div id=&quot;mist_content&quot;&gt;」「&lt;/div&gt;&lt;!-- /#div --&gt;」が存在する場合、間のhtml以外は削除されます。  
mixi外でコーディングの確認を行いたい場合に使用してください。  
ただし、上記記述は文字列として解釈されるため、コメントも含めて記述してください。
 * [%app_id%]はアプリのIDへ置き換えられます。
 * [%(OWNER|VIEWER) field="(\w+)"%]はそれぞれOWNER、VIEWERの情報に置き換えられます。  
使用できるパラメータは「fieldに指定できる値」を参照してください。
 * [%people id="(\d+)" field="(\w+)"%]は指定IDのmixiユーザ情報に置き換えられます。  
使用できるパラメータは「fieldに指定できる値」を参照してください。
 * [%friends filter="(\w+)"%]はマイミクIDを「,」で区切ったものに置き換えられます。  
標準ではマイミクのうち、同じアプリを使用しているIDのみを取得します。filterにallを指定すると全マイミクのIDを取得します。  
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

#### fieldに指定できる値
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
 * current\_location
 	 * current\_location object（テンプレートからは使用しません）
 * current\_location\_text
 	 * current\_location text（都道府県のみ）
 * gender
 	 * gender object（テンプレートからは使用しません）
 * gender\_key
 	 * gender key（MALE or FEMALE）
 * gender\_text
 	 * gender text（男性 or 女性）
 * age
 	 * 年齢
 * date\_of\_birth
 	 * date\_of\_birth object（テンプレートからは使用しません）
 * date\_of\_birth\_0day
 	 * 0補完された誕生日付
 * date\_of\_birth\_0month
 	 * 0補完された誕生月
 * date\_of\_birth\_day
 	 * 誕生日付
 * date\_of\_birth\_month
 	 * 誕生月
 * date\_of\_birth\_text
 	 * 0補完された誕生月日（mixiのプロフィールと同じ形式）
 * has\_app
 	 * アプリをインストールしているか否か（true or false）
 * blood\_type
 	 * 血液型

### linkの扱いに関して

リンククリック時にhrefの内容に応じて以下のような順番で処理を行います。  
（「マイミクの招待」機能以外、target widnowはa要素のtarget属性に従います）

1, 「/opensocial/sharefriend/」で始まっていれば「マイミクの招待」機能を呼び出します。  
URLに「/opensocial/sharefriend/#http://example.com/path」の形式でURLが設定されている場合、招待画面終了後、「http://example.com/path?recipientIds=招待したmixi id,招待したmixi id...」の形式でリクエストを行います。

2, 「http://mixi.jp/add\_diary.pl」と一致すれば日記を書く画面への遷移を行います。  
テンプレート内に以下の形式で日記の内容を記述してください。

	<div id="mist_diary" style="display:none">
		<input type="text" class="diary_title" value="日記タイトル" />
		<textarea class="diary_body">日記
		本文</textarea>
	</div>

3, 「http://mixi.jp/」で始まっていればmixi内へのリンクと判断し、ブラウザの処理にゆだねます。

4, 「/」で始まっていればAPIへのアクセスと判断し、mist.conf.api_urlにhrefの内容を追加して新しいテンプレートを取得します。  
（このとき画面遷移は行いません）

5, 「http://」で始まっていれば外部URLへのアクセスと判断し、mixi.util.requestExternalNavigateToで外部URLへ遷移します。

### TODO
 * Flash用API
 * google analytics連携
 * Message API
 * Albums API
 * Browser Cache
 * JS API documents
 * テスト支援機能
