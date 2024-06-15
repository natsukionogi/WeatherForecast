$(function() {
	var h = $(window).height();//ウィンドウの高さを取得
	$('#wrap').css('display','none');//id名が「wrap」セレクタの，display属性をnoneに設定
	$('#loader-bg ,#loader').height(h).css('display','block');
});

//全ての読み込みが完了したら実行
if(flg_load == true){//flg_loadフラグは，天気予報データの取得·表示ができたらTrueが格納
	$(window).load(function () {
		$('#loader-bg').delay(900).fadeOut(800);//フェードアウト
		$('#loader').delay(600).fadeOut(300);
		$('#wrap').css('display', 'block');
	});
}
//7秒たったら強制的にロード画面を非表示
$(function(){setTimeout('stopload()',7000);});
function stopload(){
	$('#wrap').css('display','block');
	$('#loader-bg').delay(900).fadeOut(800);
	$('#loader').delay(600).fadeOut(300);
}