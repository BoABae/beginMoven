/**
 * 
 * 
 * 
 * @author boa
 */
define
(
[ "text!youtube_body",
  "AuthYoutube",//youtube auth
  "youtubeToken",
  "BaroAppBase",
  "BaroPanelBase",
  "requestApi",
  "uploadApi",
]
,
function( html, auth, youtubeToken, BaroAppBase, BaroPanelBase, requestApi, uploadApi)
{	
	var yModel =  new youtubeToken();
	var	youtubeMainPanel = BaroPanelBase.extend(
	{
		template: "#youtube",
		tagName : "div",
		className : "container-fluid",
		
		initialize: function(options)
		{
			UCMSPlatform.log("initialize youtube" );
			//LoginPanel.__super__.initialize.apply(this, arguments);
			
			
        }
		,
		events:
		{
			"click .btn-go-search": "onSearch",
			"click .btn-go-chkLike": "onChkLike",
			"click .btn-go-myVideo": "onMyVideo",
			"click .btn-go-uploadVideo": "onUploadVideo",
			"click #submit": "onSubmit",
			"click .prevBtn": "prevPage",
			"click .nextBtn": "nextPage",
		}
		,
        onShow: function()
        {
        	var self = this;
	    	UCMS.hideLoading();
	    	
        	//this.initScroll();
        	//this._auth = osapi.getModule("AuthMoven");
        	
        	if( UCMS.SPA.isAppOS() == true)
        	{
			}
        	else
        	{
				//$(this.ui.checkbox_box[0]).hide();
        	}
        	$(".uploadVideo").hide();
        	$(".pageLoca").hide();
        	auth.googleApiClientReady();
        	
        }
		,
		defaultView: function(){
			$("#numberUpDown").text(1);
			$(".uploadVideo").hide();
			$(".list-group").show();
			$(".list-group").empty();
			$(".pageLoca").show();
			$(".uploading").hide();
		}
		,
		onSearch: function()
		{
			var self =this; 
			var sKeyword = $("#insertKeyword").val();
			requestApi.searchList(sKeyword);
			self.defaultView();
			yModel.set({pageValue: 'onSearch'});
		}
		,
		onChkLike: function(){
			var self = this;
			requestApi.myLikeVideoList();
			self.defaultView();
			yModel.set({pageValue: 'onChkLike'});
		}
		,
		onMyVideo: function()
		{
			var self = this;
			requestApi.myVideoList();
			self.defaultView();
			yModel.set({pageValue: 'onMyVideo'});
		}
		,
		onUploadVideo: function(){
			$(".list-group").hide();
			$('.pageLoca').hide();
			$(".uploadVideo").show();
		}
		,
		onSubmit: function(){
			var title = $("#title").val();
			var description = $("#description").val();
			var file = $('#file').get(0).files[0];
			if(file == null){
				UCMS.alert("file을 선택해주세요");
			}else if(title === "" || description === ""){
				UCMS.alert("제목 또는 내용을 입력해주세요");
			}else{
				uploadApi.uploadVideo(title, description);
			}
		}
		,
		nextPage: function(){
			$(".list-group").empty();
			var pageToken = requestApi.nextPage();
			var sKeyword = $("#insertKeyword").val();
			value = yModel.get('pageValue');
			if(value === 'onMyVideo'){
				requestApi.myVideoList(pageToken);
			}else if(value === 'onChkLike')
			{
				requestApi.myLikeVideoList(pageToken);
			}else if(value === 'onSearch')
			{
				requestApi.searchList(sKeyword, pageToken);
				
			}
		}
		,
		prevPage: function(){
			$(".list-group").empty();
			var pageToken = requestApi.prevPage();
			var sKeyword = $("#insertKeyword").val();
			value = yModel.get('pageValue');
			if(value === 'onMyVideo'){
				requestApi.myVideoList(pageToken);
			}else if(value === 'onChkLike')
			{
				requestApi.myLikeVideoList(pageToken);
			}else if(value === 'onSearch')
			{
				requestApi.searchList(sKeyword, pageToken);
			}
		}
	});
	
	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return youtubeMainPanel;
});