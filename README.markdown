### �R���Z�v�g

JS�������Ȃ��Ă������������b�`��mixi app������t���[�����[�N

### �@�\

�ÓI��html�̏o�݂͂̂ňȉ��̂悤�ȋ@�\�������\�ł��B

 * OWNER�AVIEWER���̎擾
 * �}�C�~�N���̎擾
 * �w��mixi ID���[�U���̎擾
 * ��ʑJ�ڂ̐���
 * �\���̈�̎�������
 * �u���L�ɏ����v�����N
 * �A�N�e�B�r�e�B�̔��s
 * �u�F�B��U���v�@�\

### �g����

1, gadget.xml��Module ModulePrefs�Ɉȉ��̓��e���L�q���Ă��������B

	<Require feature="opensocial-0.8" />
	<Require feature="dynamic-height" />

2, gadget.xml��Module Content���Ɉȉ��̓��e���L�q���Ă��������B  
�i�{�Ԋ��ł͊e�t�@�C�������g�̊Ǘ����ɂ���ꏊ�փA�b�v���Ă��������Bmist.js�͕K��charset="UTF-8"�œǂݍ���ł��������j

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://svn.coderepos.org/share/lang/javascript/jQuery.opensocial_simple/jquery.opensocial_simple.js"></script>
	<script type="text/javascript" src="http://github.com/kyo-ago/mist.js/raw/master/mist.js" charset="UTF-8"></script>
	<script type="text/javascript">
	$.extend(mist.conf, {
		// �����\���y�[�W 
		'index_page' : '/index.html',
		// ���΃����N�̊URL 
		'api_url' : 'http://github.com/kyo-ago/mist.js/raw/master/test/'
	});
	</script>

3, [[mixi] �A�v�����쐬����](http://mixi.jp/add_appli.pl)����A�v����o�^���Ă��������B

����ŃA�v���J�n����http://github.com/kyo-ago/mist.js/raw/master/test/index.html��ǂݍ���ŕ\�����܂��B

### �e���v���[�g����

�T�[�o�T�C�h����Ԃ����html�̓e���v���[�g�Ƃ��ĉ��߂���A�ȉ��̂悤�Ȓu���������s���܂��B  
�i�u��������DOM�̓W�J�O�ɍs�����߁Ahtml�̕��@�㐳�������ǂ������l������K�v�͂���܂���j

 * �u&lt;div id=&quot;mist_content&quot;&gt;�v�u&lt;/div&gt;&lt;!-- /#div --&gt;�v�����݂���ꍇ�A�Ԃ�html�ȊO�͍폜����܂��B  
mixi�O�ŃR�[�f�B���O�̊m�F���s�������ꍇ�Ɏg�p���Ă��������B  
�������A��L�L�q�͕�����Ƃ��ĉ��߂���邽�߁A�R�����g���܂߂ċL�q���Ă��������B
 * [%app_id%]�̓A�v����ID�֒u���������܂��B
 * [%(OWNER|VIEWER) field="(\w+)"%]�͂��ꂼ��OWNER�AVIEWER�̏��ɒu���������܂��B  
�g�p�ł���p�����[�^�́ufield�Ɏw��ł���l�v���Q�Ƃ��Ă��������B
 * [%people id="(\d+)" field="(\w+)"%]�͎w��ID��mixi���[�U���ɒu���������܂��B  
�g�p�ł���p�����[�^�́ufield�Ɏw��ł���l�v���Q�Ƃ��Ă��������B
 * [%friends filter="(\w+)"%]�̓}�C�~�NID���u,�v�ŋ�؂������̂ɒu���������܂��B  
�W���ł̓}�C�~�N�̂����A�����A�v�����g�p���Ă���ID�݂̂��擾���܂��Bfilter��all���w�肷��ƑS�}�C�~�N��ID���擾���܂��B  
�����N��̃p�����[�^�Ɏw�肵�A�T�[�o�T�C�h�Ńy�[�W���O�A�ꗗ�\�����s�����Ƃ�z�肵�Ă��܂��B
 * �ȉ��̂悤��html���A�N�e�B�r�e�B�Ƃ��đ��M���܂��B  
�i�A�N�e�B�r�e�B�̂݃e���v���[�g����폜����Ȃ����߁A�ustyle="display:none"�v��ݒ肵�Ă��������j

<pre><code>&lt;div id="mist_activity" style="display:none"&gt;
    &lt;span class="activity_body"&gt;�A�N�e�B�r�e�B�{��&lt;/span&gt;
    &lt;span class="activity_target"&gt;���M��mixi id,���M��mixi id...&lt;/span&gt;
    &lt;span class="activity_image"&gt;http://�A�N�e�B�r�e�B�摜URL/file.(gif|jpe?g|png),http://�A�N�e�B�r�e�B�摜URL/file.(gif|jpe?g|png)...&lt;/span&gt;
    &lt;span class="activity_params"&gt;�A�N�e�B�r�e�BURL�p�����[�^&lt;/span&gt;
&lt;/div&gt;
</code></pre>

#### field�Ɏw��ł���l
 * id
 	 * mixi ID
 * nickname
 	 * �j�b�N�l�[��
 * thumbnail\_url
 	 * �T���l�C��URL�ithumbnail\_url\_m�Ɠ����j
 * thumbnail\_url\_l
 	 * �T���l�C��URL�i180�~180�j
 * thumbnail\_url\_m
 	 * �T���l�C��URL�i76�~76�j
 * thumbnail\_url\_s
 	 * �T���l�C��URL�i40�~40�j
 * profile\_url
 	 * �v���t�B�[��URL
 * current\_location
 	 * current\_location object�i�e���v���[�g����͎g�p���܂���j
 * current\_location\_text
 	 * current\_location text�i�s���{���̂݁j
 * gender
 	 * gender object�i�e���v���[�g����͎g�p���܂���j
 * gender\_key
 	 * gender key�iMALE or FEMALE�j
 * gender\_text
 	 * gender text�i�j�� or �����j
 * age
 	 * �N��
 * date\_of\_birth
 	 * date\_of\_birth object�i�e���v���[�g����͎g�p���܂���j
 * date\_of\_birth\_0day
 	 * 0�⊮���ꂽ�a�����t
 * date\_of\_birth\_0month
 	 * 0�⊮���ꂽ�a����
 * date\_of\_birth\_day
 	 * �a�����t
 * date\_of\_birth\_month
 	 * �a����
 * date\_of\_birth\_text
 	 * 0�⊮���ꂽ�a�������imixi�̃v���t�B�[���Ɠ����`���j
 * has\_app
 	 * �A�v�����C���X�g�[�����Ă��邩�ۂ��itrue or false�j
 * blood\_type
 	 * ���t�^

### link�̈����Ɋւ���

�����N�N���b�N����href�̓��e�ɉ����Ĉȉ��̂悤�ȏ��Ԃŏ������s���܂��B  
�i�u�}�C�~�N�̏��ҁv�@�\�ȊO�Atarget widnow��a�v�f��target�����ɏ]���܂��j

1, �u/opensocial/sharefriend/�v�Ŏn�܂��Ă���΁u�}�C�~�N�̏��ҁv�@�\���Ăяo���܂��B  
URL�Ɂu/opensocial/sharefriend/#http://example.com/path�v�̌`����URL���ݒ肳��Ă���ꍇ�A���҉�ʏI����A�uhttp://example.com/path?recipientIds=���҂���mixi id,���҂���mixi id...�v�̌`���Ń��N�G�X�g���s���܂��B

2, �uhttp://mixi.jp/add\_diary.pl�v�ƈ�v����Γ��L��������ʂւ̑J�ڂ��s���܂��B  
�e���v���[�g���Ɉȉ��̌`���œ��L�̓��e���L�q���Ă��������B

	<div id="mist_diary" style="display:none">
		<input type="text" class="diary_title" value="���L�^�C�g��" />
		<textarea class="diary_body">���L
		�{��</textarea>
	</div>

3, �uhttp://mixi.jp/�v�Ŏn�܂��Ă����mixi���ւ̃����N�Ɣ��f���A�u���E�U�̏����ɂ䂾�˂܂��B

4, �u/�v�Ŏn�܂��Ă����API�ւ̃A�N�Z�X�Ɣ��f���Amist.conf.api_url��href�̓��e��ǉ����ĐV�����e���v���[�g���擾���܂��B  
�i���̂Ƃ���ʑJ�ڂ͍s���܂���j

5, �uhttp://�v�Ŏn�܂��Ă���ΊO��URL�ւ̃A�N�Z�X�Ɣ��f���Amixi.util.requestExternalNavigateTo�ŊO��URL�֑J�ڂ��܂��B

### TODO
 * Flash�pAPI
 * google analytics�A�g
 * Message API
 * Albums API
