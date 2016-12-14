/**
 * Project : UCMS( Unified Contents Messaging Solution )
 *
 * Copyright (c) 2013, 2014 FREECORE, Inc. All rights reserved.
 * 
 * @author	jbkim
 * 
 * Cooker BASE Class
 */
var global_build_data = null;

var SP_K = null;
var SP_N = null;

var user_id = null;

var short_url = null;

define
(
[ 
	"build_model",
	"BaroProps",
	"BaroAppBase",
	"BaroPanelBase",
	"UniMeClient",
	"Logger",
	"osapi",
	"GPanel"
]
,
function( build_model, BaroProps, BaroAppBase, BaroPanelBase, UniMeClient, Logger, osapi, GPanel )
{
	
	var		CookerBase = BaroPanelBase.extend({
		
		// 쿠커용 앱 파라메터
		_build_data : null,
		
		_isMobileEnv : false,
		
		_autoLoginMAX : 1,
		
		_retry_session_check_count : 0,
		
		/**
		 *  jkim 
		 *  
		 *  초기화
		 *  
		 * */
		initialize: function(options)
		{
			var self = this;
			
			Logger.log("initialize CookerBase" );
			
			CookerBase.__super__.initialize.apply(this, options);
			
        }
		,
		
		/**
		 *  jkim 
		 *  
		 *  종료버튼 기능
		 *  
		 * */
		baseCall_APP_END : function(){
			
			var self = this;
			
			Logger.debug("baseCall_APP_END");
			
			UCMS.confirm("로그아웃 하시겠습니까?", { confirm: "확인", cancel : "취소" } )
            .then(
                    function()
                    {
                        UCMS.showLoading();

                        setTimeout(function()
                        {
                            UCMS.hideLoading();    
                        }, 3000);
                        
                        self.sessionLogout();
                    }
                    ,
                    function()
                    {
                    }
            );
			
        	
		}
		,
		
		/**
		 *  jkim 
		 *  
		 *  세션키 유무체크 현재는 사용되지 않음.
		 *  
		 * */
		baseCall_AUTHORITY : function(){
			
			var sp_k = UCMSPlatform.SPA.AppMain.getAppProps().getProp("SP_K");
			var sp_n = UCMSPlatform.SPA.AppMain.getAppProps().getProp("SP_N");
			
			//sp_n = SP_N;
		  	//sp_k = SP_K;
			
			SP_N = sp_n;
			SP_K = sp_k;
			
			if(sp_n == null || sp_n == "" 
				|| sp_k == null || sp_k == ""){
				
				this.onBaseGoLogin();
				
				return false;
			}
		
			return true;
		}
		
		,
		
		/**
		 * 
		 * 로그인 세션이 invalid 시에 재로그인처리 세션 재생성
		 * 
		 * 
		 */
		initBaangAppSession: function(onDoneInit)
		{
			var self = this;
			
			BaroAppBase.fetchGuestMode()
			.done(function(data, textStatus, jqXHR)
			{
                if( data && data.resultCode == 0 )
                {
                	var sessionParams = 
                	{ 
                		"SP_N": data.extraData.name, 
                		"SP_K": data.extraData.key
                	};

                	UCMS.log("Guest SP_N = " + sessionParams.SP_N);
                	UCMS.log("Guest SP_K = " + sessionParams.SP_K);

                	BaroProps.setSessionParams( sessionParams );
             	}
                
                //
                onDoneInit( true );
			})
			.fail(function( jqXHR, textStatus, errorThrown )
			{
				Logger.error("initSession() - Error Code : "+jqXHR.status+", Message : "+jqXHR.responseText);
				
				onDoneInit( false );
			});
			
		}
		
		

		,
		/**
		 * 세션유저정보조회
		 * 
		 */
		_fetchUserProfile : function(cbResult)
        {
        	
			var self = this;
			
            var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		var		apiUrl	= BaroProps.getHosts().oauth +"/profile";
    		
    		UCMS.showLoading();
    		
    		var session = BaroProps.getSessionParams();
    		
    		caller.setAjaxParams(
			{
				 headers:
                {
                	"sp-name" : session.SP_N,
                	"sp-key" : session.SP_K
                },
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
    		
    		caller.query(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
    			UCMS.hideLoading();
    			
    			var data = rmodel.attributes;
    			
    			if(data && data.resultCode == 0)
                {                 		
                	if( cbResult )
                	{
                		cbResult(true);
                	}
             	}
                else
                {
                	if( cbResult )
                	{
                		cbResult(false, {status : data.resultCode});
                	}
             	}
			
			}
    		,
    		function(err){
    			
    			UCMS.hideLoading();
    			
    			UCMS.log(err);
    			
    			var errState = { status: this.getStatus().code };
    			
    			cbResult(false, errState);
    			
    		}
    		)
    		;
            
            
            
        }
		,
		/**
		 * Titanium
		 * 용 세션 재생성기
		 * 
		 */
		TI_onRelogin : function(){
			
			var self = this;
			
			try{
				
				Logger.debug("onRelogin call start..");
				
				UCMS.showLoading();
				
				Ti.App.fireEvent( "app:cooker:relogin" , BaroProps.getSessionParams() );
				
				Logger.debug("onRelogin call end..");

			}catch(e){
				
				Logger.debug("Ti call fail");
				
				self.onRelogin();

			}	
		}
		
		,
		
		/**
		 * 로그아웃 클리어
		 * 
		 */
		sessionLogout : function(fnCallback)
        {
			this.clearAndGoLogin();
        }
		,
		serverSessionDataClear : function(){
			
			var self = this;
			
			var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		var		apiUrl	= BaroProps.getHosts().api + '/' + BaroAppBase.getBaroAppId() + '/signout';
    		
    		var session = BaroProps.getSessionParams();
    		
    		apiUrl += "?sp-name=" + session.SP_N + "&sp-key=" + session.SP_K;
    		
    		caller.setAjaxParams(
			{
				crossDomain : true,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
    		
    		caller.query(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
    			self.clearAndGoLogin();
			
			}
    		,
    		function(err){
    			
    			self.clearAndGoLogin();
    				
    		}
    		);
    		
		}
		
		,
		clearAndGoLogin : function(){
			
			var self = this;
			
			self.setBuildData(null);
        	
            self.onBaseGoLogin();
		}
		
		,
		getSessionObject : function(){
			
			var session = {};
			
			/*
			var user_id = UCMSPlatform.SPA.AppMain.getAppProps().getProp('user_id');
			var sp_n = UCMSPlatform.SPA.AppMain.getAppProps().getProp('SP_N');
		  	var sp_k = UCMSPlatform.SPA.AppMain.getAppProps().getProp('SP_K');
		  	
		  	var unime_token =  UCMSPlatform.SPA.AppMain.getAppProps().getProp('unime_token');
		  	*/
			
			var user = BaroProps.getUser();
			var session_params = BaroProps.getSessionParams();
		  	
		  	session = {
		  		user_id : user.id,	
		  		SP_N : session_params.SP_N,
		  		SP_K : session_params.SP_K
			};
			
			return session;
		}
		
		,
		
		setUnimeToken : function(unimeToken){
			
			BaroProps.setSessionData({
				
				properties : {
					unimeToken : unimeToken
				}
			});
		}
		
		,
		setSessionObject : function(sp_n, sp_k, user_id){
			
			/*
			UCMSPlatform.SPA.AppMain.getAppProps().setProp('SP_N', sp_n);
		  	UCMSPlatform.SPA.AppMain.getAppProps().setProp('SP_K', sp_k);
		  	UCMSPlatform.SPA.AppMain.getAppProps().setProp('user_id', user_id);
		  	*/
			
		  	BaroProps.setSessionParams({
		  		
		  		SP_N : sp_n,
		  		SP_K : sp_k	
		  		
		  	});
		  	
		  	BaroProps.setUser({
		  		id : user_id
		  	});
		}
		,
		
		setUser : function(user){
			
			BaroProps.setUser(user);
		}
		,
		
		getUser : function(){
			
			return BaroProps.getUser();
		}
		,
		/**
		 * 전역 저장소에 저장된 바로앱 파라메터를 얻는다.
		 * 
		 * @return { BaroappBuildModel }
		 */
		getBuildData : function()
		{
			var buildModel = UCMSPlatform.SPA.AppMain.getAppProps().getProp("build_model");
			if(buildModel instanceof Backbone.Model == false)
			{
				Logger.debug("getBuildData() - Invalid a baroapp parameters!");
				return null;
			}
			
			return buildModel;
		}
		,
		/**
		 * 바로앱 파라메터를 Backbone.Model 으로 구현된 BaroappBuildModel 형태로 전역 저장소에 저장한다.
		 */
		setBuildData : function(buildObject)
		{
			var appParams = null;
			
			if( buildObject != null )
			{
				appParams = new build_model( buildObject );
				
				Logger.info("setBuildData() - New Baroapp Params :");
				Logger.info(appParams.toJSON());
			}
			
			UCMS.SPA.AppMain.getAppProps().setProp("build_model", appParams);
		}
		,
		onBaseGoLogin : function()
		{
			Logger.debug("AppProps cleared");
			
			var auth = osapi.getModule("AuthMoven");
			
			auth.signOut(BaroProps.getAppInfo().id, BaroProps.getSessionParams())
			.always(function()
			{
				Logger.debug("onBaseGoLogin() - new guest session : "+JSON.stringify(BaroProps.getSessionParams()));
				
				if(UCMS.SPA.isAppOS() == true)
				{
					var cs = osapi.getModule("CoreService");
					cs.reset();
				}
				else
				{
					if(UCMS.SPA.isDesktop() == false)
		    		{
						location.href = "http://intro.moven.net/intro.web";
		    		}
					else
					{
						location.href = "http://intro.moven.net/intro.app";
					}
				}
				/*
				BaroProps.setUniMeToken();
				UCMS.getApplication().initUniMeAgent()
				.always(function()
				{
					location.href = "#home";
				});
				*/
			});
		}
		,
		removeScriptTag : function (planText){
			
			if(planText && planText != null){
			
				planText = planText.replace(/<.*?script.*?>.*?<\/.*?script.*?>/igm, '');
			
				return planText;
			}
			else 
				return planText;
		}
		,
		formSend : function(apiUrl, buildParam, viewTarget){
			
			
			var parentEl = $(".content_box");
			
			if(parentEl.find(".previewForm").length == 0){
				
				$('<form class="previewForm"><input type="hidden" name="buildParam" /></form>').appendTo(parentEl);
			}
			
			$(".previewForm").attr("action", apiUrl);
    		$(".previewForm input[name=buildParam]").val(buildParam);
    		
    		if(viewTarget){
    			
    			$(".previewForm").attr("target", viewTarget);
    		}
		
    		$(".previewForm").attr("method", "post");
    		$(".previewForm").submit();
			
		}
		
		,
		popWinOpen : function(apiUrl, buildParam){
			
			var win = window.open("about:blank", "_preview", "");
			
			
			var parentEl = $(".content_box");
			
			if(parentEl.find(".previewForm").length == 0){
				
				$('<form class="previewForm"><input type="hidden" name="buildParam" /></form>').appendTo(parentEl);
			}
			
			$(".previewForm").attr("action", apiUrl);
    		$(".previewForm input[name=buildParam]").val(buildParam);
		
    		$(".previewForm").attr("method", "post");
    		$(".previewForm").attr("target", "_preview");
    		$(".previewForm").submit();
			
		}
		
		,
		
		switchSocialButton : function(rdata){
			
			Logger.debug("switchSocialButton==");
			Logger.debug(rdata);
			
			var btnFb = $(".social.fb"), btnTw = $(".social.tw"), btnKs = $(".social.ks");
			
			$(".alrim_list li").each(function(){
				
				$(this).removeClass("connet");
			});
			
			if( $.isArray(rdata) ){
			
				$.each(rdata, function(i, itm){
					
					if(itm.svcID == "facebook"){
						
						btnFb.parents("li").addClass("connet");
						
					}
					else if(itm.svcID == "twitter"){
						
						btnTw.parents("li").addClass("connet");
						
					}
					else if(itm.svcID == "kakao"){
						
						btnKs.parents("li").addClass("connet");
						
					}
					
				});
			
			}else{
			
				for(key in rdata){
					
					if(key == "facebook"){
						
						btnFb.parents("li").addClass("connet");
						
					}
					else if(key == "twitter"){
						
						btnTw.parents("li").addClass("connet");
						
					}
					else if(key == "kakao"){
						
						btnKs.parents("li").addClass("connet");
						
					}
					
				};
			
			}
			
		}
		
		,
		
        popSnsLogin : function(uri, name, options, closeCallback) {
        	
	        var win = window.open(uri, name, options);
	       
            var interval = window.setInterval(function() {
            	
                try {
                    if (win == null || win.closed) {
                        window.clearInterval(interval);
                        closeCallback(win);
                    }
                } catch (e) {}
            }, 1000);
            
            return win;
        
        }
		
		,
		
		/*
		 * fortawesome fa spin
		 * 
		 * http://fortawesome.github.io/Font-Awesome/examples/
		 * 
		 *  <i class="fa fa-spinner fa-spin"></i>
			<i class="fa fa-circle-o-notch fa-spin"></i>
			<i class="fa fa-refresh fa-spin"></i>
			<i class="fa fa-cog fa-spin"></i>
		 * */
		
        showSpinLoading : function(target, className){
        	
        	if(target.hasClass(className)){
        		target.removeClass(className + " fa-spin");
			}

        	target.addClass(className + " fa-spin");
        	
        }
        ,
        hideSpinLoading : function(target, className){
        	
        	target.removeClass(className +" fa-spin");
			
        	
        }
        
        
	}
	,
	{
		
		/**
		 *  jkim 파일 체크
		 * 
		 * fileobj $("input[type=file]") this
		 * 
		 * allowedTypes = "PNG,GIF,JPG,JPEG";
		 * 
		 * maxFileSize = 
		 * */
		
		validFileCheck : function(filethis, allowedTypes, maxFileSize){
			
			Logger.debug("WEB_fileCheck");
			
			var ret = false;
			
			var self = this;
			
			var isFileTypeAllowed = function(fileName) {
				
	            var fileExtensions = allowedTypes.toLowerCase().split(",");
	            var ext = fileName.split('.').pop().toLowerCase();
	            if (allowedTypes != "*" && $.inArray(ext, fileExtensions) < 0) {
	                return false;
	            }
	            return true;
	        };

           
	        var fileExtensions = allowedTypes.toLowerCase().split(",");
			
            var filenameStr = $(filethis).val();
            
            if (!isFileTypeAllowed(filenameStr)) {
            	
            	Logger.debug('can not support ext');
            	
            	UCMS.alert("지원하지 않는 파일형식입니다.");
            	
                return;
            }
            
            try{
            	
	            var fspec = filethis.files[0];
	            
	            if(fspec && maxFileSize > 0){
	            	
		            Logger.debug("fspec size=" + fspec.size);
		            if(fspec != undefined){
		            	
		            	if( fspec.size > maxFileSize ){
		            		
		            		UCMS.alert("이미지 크기는 " + maxFileSize + "이하 로 제한되어 있습니다.");
		            		
		            		return;
		            	}
		            	
		            }
	            
	            }
            
            }catch(e){
            	
            	Logger.debug('can not support filethis.files[0]');
            }
            
            ret = true;
			
            return ret;
		}
		,
		/**
		 *  jkim 파일 임시저장
		 *  
		 *  미리보기시 사용될 이미지 
		 *  
		 * */
		WEB_imageTempSave : function(type, pself, retCallback, errCallback){
			
			var self = this;	
			
			var session = BaroProps.getSessionParams();
			
			var user_id = BaroProps.getUser().id;

        	var sp_n = session.SP_N;
        	var sp_k = session.SP_K;
        	
			var apiPath = BaroProps.getHosts().api + "/bbang/temp/file/create/" + user_id + "?sp-name=" + sp_n + "&sp-key=" + sp_k;
			
			var formId = null;
			
			if(type == "icon"){
				
				formId = "web_icon_form";
			}else if(type == "cover"){
				
				formId = "web_cover_form";
				
			}else if(type == "gconimage"){
				
				formId = "gcon_img_form";
			}
			else{
				
				formId = "form_image";
			}
			
			var formObj = $("#" + formId);
			
			if(formObj.find("input[type=file]").val() == ""
				|| formObj.find("input[type=file]").val() == undefined) return;
			
			
			formObj.attr("action", apiPath);
			
			formObj.ajaxForm({
		        beforeSubmit: function(a,f,o) {
		            o.dataType = "html";
		        },
		        success: function(data) {
		        	
		        	if(retCallback)
		        		retCallback(data);
		        	
		        },
		        error: function (xhr, ajaxOptions, thrownError) {
		        	
		        	Logger.debug(thrownError);
		        	
		        	if(errCallback)
		        		errCallback();
		        	
		        }
		    });
			
			formObj.submit();
		}
		
		,
		
		loadUrlImageToBase64 : function(pself, imagePath, cbFunction){
			
			var		self = this;
			var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		
    		var session = BaroProps.getSessionParams();
        	
        	var sp_n = session.SP_N;
        	var sp_k = session.SP_K;
    		
        	if(imagePath){
        		
        		imagePath = imagePath.replace(BaroProps.getHosts().resource + "/", "");
        		imagePath = imagePath.replace(BaroProps.getHosts().file + "/", "");
        	}
        	
    		var		apiUrl	= BaroProps.getHosts().api + "/bbang/icon/file" + "?sp-name=" + sp_n + "&sp-key=" + sp_k;
    		
    		caller.setAjaxParams(
			{
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data : {
					
					icon_res_path : imagePath
				}
			});
    		
    		caller.query(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
				//Logger.debug(rmodel.attributes);
				
				if(rmodel.attributes && rmodel.attributes.resultCode == 0){
					
					if(cbFunction)
						cbFunction({ data : rmodel.attributes.extraData });	        
				}
				else
				{
					if(cbFunction)
						cbFunction({ data : null });	 
				}
			
			}); 
    		
		}
		
		,
		
		/**
		 *  jkim 파일을 base64로 변환
		 *  
		 *   캔버스에 URL형식으로 사용하면 같은 호스트가 아닐때 security 에러 발생으로 
		 *   base64로 캔버스에 loading
		 *  
		 * */
		
		WEB_getBase64FromFile : function(self, pimage_path, cbFunction){
			
			var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		
    		var session = BaroProps.getSessionParams();
			
			var user_id = BaroProps.getUser().id;
        	
        	var sp_n = session.SP_N;
        	var sp_k = session.SP_K;
    		
    		var		apiUrl	= BaroProps.getHosts().api + "/bbang/temp/img/base64/" + user_id + "?sp-name=" + sp_n + "&sp-key=" + sp_k;
    		
    		caller.setAjaxParams(
			{
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data : {
					
					image_path : pimage_path
				}
			});
    		
    		caller.query(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
				Logger.debug(rmodel.attributes);
				
				if(rmodel.attributes && rmodel.attributes.extraData){
					
					var base64Data = rmodel.attributes.extraData;
					
					if(cbFunction)
						cbFunction(pimage_path, base64Data);
			       
				}
			
			}); 
			
		}
		
		,
		
		/**
		 *  jkim 파일 임시저장
		 *  param : base64 img data
		 *  return : temp path
		 *  
		 *  미리보기시 사용될 이미지 
		 *  
		 *  
		 * */
		Base64_imageTempSave : function(pself, imgData, retCallback, errCallback){
			
			var session = BaroProps.getSessionParams();
			
			var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model(imgData);
    		
        	var sp_n = session.SP_N;
        	var sp_k = session.SP_K;
        	
    		var		apiUrl	= BaroProps.getHosts().api + "/bbang/temp/img/base64/create/" + BaroProps.getUser().id ;
    		
    		caller.setAjaxParams(
			{
				headers : { "sp-name" : sp_n , "sp-key" : sp_k },
				
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			});
    		
    		caller.create(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
				Logger.debug(rmodel.attributes);
				
				if(rmodel.attributes && rmodel.attributes.extraData){
					
					var resPath = rmodel.attributes.extraData;
					
					if(retCallback)
						retCallback(resPath);
			       
				}
			
			}
    		,
    		function(err){
    			
    			if(errCallback)
    				errCallback();
    		}); 
    		
    		
		}
		
		,
		WEB_popWin : function(apiUrl, option){
			
			var win = window.open( apiUrl, "_blank", option);
			
		}
		
		,
		
		responseWebviewEventHandler : function(responseEventName, cbFunction){
			
			$(window).on(responseEventName, function(evt, cmd){
				
				try{
				
					Ti.API.info("response responseEventName[" + responseEventName + "]");
				
				}catch(e){}
				
				var cmdObj = JSON.parse(cmd);
				
				if(cbFunction){
					
					cbFunction(cmdObj);
					
				}
				
			});
			
		}
		
		
		
		,
		
		addTextFocusScrollEvent : function(elId){
			
			var header_h = 50;
			
			if(elId){
			
				$(elId).focus(function(){
					
					if($(elId).offset())
						CookerBase.initScroll($(elId).offset().top - header_h);
				
				});
			
			}
		}
		
		,
		
		callbackHttpStatus : function(code, res200Cb, res400Cb, res401cb, errCb ){
			
			switch(code) {
				
				case 200 : {
					
					if(res200Cb) res200Cb();
					break;
				};
				case 400 : {
					
					if(res400Cb) res400Cb();
					break;
				};
				case 401 : {
					
					if(res401cb) res401cb();
					break;
				};
				default : {
					
					if(errCb) errCb();
					
				}
			}
			
		}
		
		,
		
		/**
		 * BaroAppBase overloading
		 * 
		 * */
		digestError : function( jqXHR, textStatus, nextFunction ){
			
			Logger.debug("[Web Env CookerBase digestError Handler processing ]");
			
			UCMS.hideLoading();
				
			if( typeof jqXHR != 'object' )
			{
				UCMS.alert("알 수 없는 오류가 발생했습니다.<br><dic class'desc'>"+ JSON.stringify(jqXHR) +"</dic>");
				return;
			}
			
			if( typeof jqXHR.status != 'number' )
			{
				UCMS.alert("알 수 없는 오류가 발생했습니다.<br><dic class'desc'>"+ JSON.stringify(jqXHR) +"</dic>");
				return;
			}
			
			if( textStatus == 'timeout' )
			{
				UCMS.alert("요청 대기시간이 초과되었습니다.<br>네트워크 상태가 불안정합니다.<br>잠시 후 다시 이용해 주세요.<br>감사합니다!");
				return;
			}
			
			if( jqXHR.status == 401 || jqXHR.status == 403 )
			{
				Logger.error("[digestError] Unauthorized access.");
				
				UCMS.alert("이용자의 로그인 시간이 오래되어 다시 로그인후 사용가능합니다.")
				.then(function()
				{
					/*
					 * 바로앱 상세페이지에서 로그아웃되었을때 셋팅된 바로앱 아이디를 초기화.
					 * */
					BaroAppBase.fetchGuestMode()
					.done(function(data, textStatus, jqXHR)
					{
						if( data && data.resultCode == 0 )
		                {
		                	var sessionParams = 
		                	{ 
		                		"SP_N": data.extraData.name, 
		                		"SP_K": data.extraData.key
		                	};

		                	UCMS.log("loginReinit Guest SP_N = " + sessionParams.SP_N);
		                	UCMS.log("loginReinit Guest SP_K = " + sessionParams.SP_K);

		                	BaroProps.setUser({id : "guest"});
		                	BaroProps.setSessionParams( sessionParams );
		                	
		                	location.href = "#!login";
		                	
		             	}
						else{
							location.href = "/";
						}
						
						
					})
					.fail(function( jqXHR, textStatus, errorThrown )
					{
						location.href = "/";
					});
					
					
				});
			}
			else
			{
				Logger.error("[digestError] Error Code : "+jqXHR.status+", Message : "+jqXHR.responseText);
				
				UCMS.alert("서버와 통신 중 오류["+jqXHR.status+"]가 발생하였습니다.<br>잠시 후 다시 시도해주세요.<br>이용에 불편을 드려 죄송합니다!")
				.then(
						function(){
							
							if(typeof nextFunction == "function"){
								
								nextFunction();
							}
				
				});
			}
				
			
		}
		,
		
		setPage_info : function(info){
			
			UCMS.SPA.AppMain.getAppProps().setProp("page_info", info);
		}
		,
		
		getPage_info : function()
		{
			return UCMS.SPA.AppMain.getAppProps().getProp("page_info");
		}
		
		,
		/**
		 *  jkim 
		 * 
		 *  푸시알림
		 * */
		sendPush: function(pdata, recipients)
        {
			
			var d = $.Deferred();
			
			var session = BaroProps.getSessionParams();
			
			var sp_n = session.SP_N;
			var sp_k = session.SP_K;
			
			var p_unime_token = BaroProps.getUniMeToken();
        	
    		var 	user_id = BaroProps.getUser().id;
    		
    		var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		var		apiUrl	= BaroProps.getHosts().unime + "/task/" + BaroProps.getActors().svc_id + "/cooker/"+user_id + "/" + BaroProps.getAppInfo().id ;
    		
    		UCMS.showLoading();
    		
    		var 	_select = {
    				svc : BaroProps.getActors().svc_id,
					app: BaroProps.getActors().con_id,
					bridged: pdata.bridged,
					recipient: recipients
				};
    		
    		if(pdata.baang){
    			
    			_select.baang = pdata.baang;
    		}
    		
    		caller.setAjaxParams(
			{
				crossDomain : true,
				headers: { "sp-name" : sp_n, "sp-key" : sp_k  },
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data: 
					JSON.stringify({
						
						body: pdata.msg ,
						select: _select,
						method: pdata.method,
						
						token : p_unime_token
					})
				
			});
    		
    		caller.create(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			UCMS.hideLoading();
    			
    			var data = rmodel.attributes;
    			
    			if(data.resultCode == 0){
			    	
		    		d.resolve(data);
		    	
		    	}
		    	else{
		    		
		    		d.resolve(false);
		    	}
				
			}
    		);
    		
        	return d.promise();
    		
        }
		
		,
		
        /*
         * 소셜계정 연결 현황 체크
         * 
         * return ResultEx resultCode == 0 1개이상 있음.
         * 그외 연결된 소셜계정없음.
         * */
		fetchConnectedService : function(cbFunction){
			
			var d = $.Deferred();
			
			var		self = this;
			var		caller	 = new UCMSPlatform.API();
    		var		pmodel	 = new Backbone.Model();
    		var		apiUrl	= BaroProps.getHosts().oauth + "/cooker/connected";
    		
    		var session = BaroProps.getSessionParams();
    		
    		UCMS.showLoading();
    		
    		caller.setAjaxParams(
			{
				crossDomain : true,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data : {
					
					"sp-name" : session.SP_N,
					"sp-key" : session.SP_K
				}
				
			});
    		
    		caller.query(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
			{	
    			
    			UCMS.hideLoading();
    			
				Logger.debug(rmodel.attributes);
				
				
				var result = rmodel.attributes;
				
				if(result.resultCode == 0){
					
					UCMS.log(result.extraData);
					
					BaroProps.setConnectedService(result.extraData);
					
					d.resolve();
					
				}
				
				if(cbFunction){
					
					cbFunction();
				}
				
				
			}
    		
    		)
    		;
    		
    		return d.promise();
    		
		}
		
		,
		/**
		 * 재로그인시 사용
		 * 
		 */
		reOauthLogin : function(cbDone)
        {
			
			var d = $.Deferred();
			

			Logger.debug("reOauthLogin..");
			
			UCMS.log(BaroProps.getUser());
			
	    	var uid = BaroProps.getUser().id;
        	var upwd = BaroProps.getUser().md5pwd;
        	
        	Logger.debug("uid.." + uid);
        	Logger.debug("upwd.." + upwd);
           
            var 	session = BaroProps.getSessionParams();
            
            $.support.cors=true;
            
            var res = $.ajax({
                url:  BaroProps.getHosts().oauth + '/cooker/signin?svc_id=moven&con_id=cooker',	
                contentType: 'application/json;charset=utf-8',
                
                headers : {"Content-Type":"application/json; charset=UTF-8", "sp-name" : session.SP_N, "sp-key" : session.SP_K },
    			
    			method : "POST",
    			cache: false,
     				
                // 수신 데이타 형식
                dataType: "json" ,    
                data : JSON.stringify(
            			{
            				id : uid,
                         	pwd : upwd
                       })
            });   
           
            res.done(function(data, textStatus, jqXHR)
		    {
            	
            	UCMS.hideLoading();	
            	
  				UCMS.log(data);
  			
	   			if(data.resultCode == 0){
               	
	               	var sp_n = null;
	           		var sp_k = null;
	               	
	               	if(data.extraData != null){
	               	
	               		sp_n = data.extraData.name;
	               		sp_k = data.extraData.key;
	               	}
	               	
	               	BaroProps.setSessionParams({
	       		  		
	       		  		SP_N : sp_n,
	       		  		SP_K : sp_k	
	       		  		
	       		  	});
	               	
	               	if( typeof cbDone == "function" )
						{
							cbDone( true );
						}
	               	
	               	d.resolve();
               	
            	}else{
            		
            		if( typeof cbDone == "function" )
					{
						cbDone( false );
					}
            		
            		d.reject();
            	}
	   			
		   });
            
           res.fail(function(err)
		   {
            	UCMS.hideLoading();	
            	d.reject();
		   }); 

            return d.promise();
			 
           
        }
		
		,
		/**
		 * 웹용 세션 재생성기
		 * 
		 */
		onRelogin : function(onDoneInit){
			
			var self = this;
			
			var baro_id = BaroProps.getAppInfo().id;
			BaroProps.getAppInfo().id = BaroProps.getActors().con_id;
			
			BaroAppBase.fetchGuestMode()
			.done(function(data, textStatus, jqXHR)
			{
				BaroProps.getAppInfo().id = baro_id;
				
                if( data && data.resultCode == 0 )
                {
                	var sessionParams = 
                	{ 
                		"SP_N": data.extraData.name, 
                		"SP_K": data.extraData.key
                	};

                	UCMS.log("Guest SP_N = " + sessionParams.SP_N);
                	UCMS.log("Guest SP_K = " + sessionParams.SP_K);

                	BaroProps.setSessionParams( sessionParams );
                	
                	CookerBase.reOauthLogin(onDoneInit);
             	}
                
			})
			.fail(function( jqXHR, textStatus, errorThrown )
			{
				Logger.error("initSession() - Error Code : "+jqXHR.status+", Message : "+jqXHR.responseText);
				
				onDoneInit( false );
			});
			
		}
		
		,
	    
		initScroll : function(offset){
			
			var targ = 'body';
			var offs = offset || 0;
			
			$('body').animate( { scrollTop: offs,  },  500,  function(){
			    $(targ).clearQueue();
			} );
	    	
	    }
		
		,
		
		getPlatformType : function(){
			
			var type = 1;
			
			if( UCMSPlatform.SPA.isIPhone()==true )
				type = 2;
			else
			if( UCMSPlatform.SPA.isAndroid() == true )
				type = 3;
			else
			if( UCMSPlatform.SPA.isIPad() == true )
				type = 4;
			
			return type;
		}

		,
        switchBaroAppUnimeToken : function(doDone){
        	
        	var agent = BaroProps.getSessionData().properties.agent || {};
        	
        	var platform_token = agent.agent_id;
        	
        	UCMS.showLoading();
        	
        	CookerBase.reOauthLogin()
        	.then(
        	
        			function(){
        				
        				var _unime = new UniMeClient();
        	        	
        	        	_unime.createToken(CookerBase.getPlatformType(), platform_token)
        	        	.done(
								
							function(result){
								
								UCMS.hideLoading();
								
								UCMS.log("_createUnimeToken result...");
								UCMS.log(result);
								
								if(doDone){
									
									doDone(result);
								}
								
							}
						)
						.fail(
							function(err){
								
								UCMS.hideLoading();
								
								UCMS.alert("세션 초기화 중에 오류가 발생하였습니다.<br>이용에 불편을 드려 죄송합니다!")
								.then(function()
								{
									location.href = "#myapp";
								});
							}	
						);
        	
        			}
        			,
        			function(err){
        				
        				UCMS.hideLoading();
						
						UCMS.alert("세션 초기화 중에 오류가 발생하였습니다.<br>이용에 불편을 드려 죄송합니다!")
						.then(function()
						{
							location.href = "#myapp";
						});
        				
        			}
        	
        	);
			
        }
		
		,
		
		existConnectedSNS : function(){
			
			UCMS.log( "facebook " + BaroProps.isConnected('facebook') );
			
			if(
				BaroProps.isConnected('facebook') 
				|| BaroProps.isConnected('twitter') 
				|| BaroProps.isConnected('kakao') )
				return true;
			else return false;
		}
		
		,
		checkAndUpdateSession : function(errRes, doNext){
			
			if(errRes && errRes.status == 401){
			
				CookerBase.onRelogin(function(result){
					
					UCMS.hideLoading();
					
					if(result == true){
						
						if(typeof doNext == "function"){
							
							doNext();
						}
					}
					else{
						
						CookerBase.digestError( {status: cstatus} );
						
					}
					
				});
			
			}else{
				
				CookerBase.digestError( errRes );
			}
			
		}
		,
		initRefreshPage : function(){
			
			//return; /*테스트 코드*/
			if( UCMS.SPA.isAppOS() == true )
			{
				return;
			}
			
			var refreshAfterLogin = function(e){
				
				$("body").css("overflow","auto");
				
				var reloadUrl = $(location).attr('href');
				
				if(reloadUrl.indexOf("#") > 0){
					
					reloadUrl = reloadUrl.substr(0, reloadUrl.indexOf("#"));
				}
				
				reloadUrl += "#!login";
				
				Logger.log("reloadUrl : " + reloadUrl );
				
				window.location.hash = ''; // for older browsers, leaves a # behind
			    history.pushState('', document.title, reloadUrl); // nice and clean
			    e.preventDefault(); // no page reload
				
			};
			
			$(window).on('beforeunload', function(){
				
			      return '페이지가 다시 시작되면 작업중인 내용이 지워집니다.\n페이지를 이동하시려면 화면의 < 버튼을 사용하세요.';
			});
			$(window).unload( function(e){
				
				$(window).unbind('beforeunload');
				$(window).unbind('unload');
				
				refreshAfterLogin(e);
				
				location.reload();
			});
		
		}
		
		,
		
		/**
		 * 바로앱으로 전환할 경우 unime 토큰을 생성할때 사용
		 * 바로앱을 지정하지 않는 unime토큰 생성 api호출
		 * 
		 * @return { Promise }
		 */
		createToken : function()
		{
		  	var actors = BaroProps.getActors();
		  	var user = BaroProps.getUser();
		  	var sessionParams = BaroProps.getSessionParams();
		  	var platformToken = BaroProps.getAgentId();
		  	
			var apiPath = BaroProps.getHosts().unime + "/token/"+actors.svc_id+"/"+actors.con_id+"/"+ user.id ;
			
			var platformId = ( platformToken == null ? 1 : UCMSPlatform.SPA.isAndroid() ? 3 : 2 );
			
			if(typeof platformToken !== "string")
			{
				// 토큰이 없는 경우는 무조건 UniMe 모드로 동작됨.
				platformId = 1;
			}
			
			platformId = 0;

			return $.ajax(
			{
				type: "POST",
				url: apiPath,
				headers: 
				{
					"sp-name":sessionParams.SP_N, 
					"sp-key":sessionParams.SP_K 
				},
                contentType: 'application/json; charset=utf-8',				
				processData: false,
				crossDomain: true,
				dataType: "json",
				data: JSON.stringify(
				{
					platform: platformId,
					token: platformToken || null
				}),
			    error: function( XHR, textStatus, errorThrown )
			    {
			    	Logger.error("error status: "+textStatus);
			    },
			    success: function(data, textStatus, jqXHR)
			    {
			    	Logger.log("unimetoken : "+data);
			    }
			});
		}
		
		,
		
		/**
		 *  앱 PreSet 
			CookerBase.setAppCreateModel(CookerBase._exportBaroParam(skel));
		 * 
		 * */
		_exportBaroParam: function(skeleton)
		{
			
			Logger.debug("_exportBaroParam ============== " );
			
			var path_id = skeleton["path_id"];
			var theme_path = skeleton["theme_path"];
			var layout_id = skeleton["layout_id"];
			
			var cookerBuildParam = {
			
				"svc_id": "moven",	
			    "app_intro": "소개",
			    "app_name": "",
			    "app_tag": "태그",
			    "app_version": "0.1",
			    "slogan": "슬로건",
			    "template_id": "show_mainicon",
			    "theme_id": theme_path,
			    "cover_res_path": null,
			    "icon_res_path": null,
			    "title": null,
			    "app_desc": "",
			    "show_coverimg": 1,
			    "show_mainicon": 1,
			    "show_footer": 1,
			    "app_category": 103,
			    "app_category_text": "회사소개",
			    
			    menus : []
			    	 
			}; 
			
			var contents = skeleton["contents"].contents;
			var showmenus = contents.showmenus;
			var contentsords = contents.order;
			
			Logger.debug(" skeleton['contents'] :: " );
			
			$.each(skeleton["contents"], function(i, itm){
				
				Logger.debug(itm);
				
				if(itm.module == "cover"){
					
					if(itm.items && itm.items.length > 0){
						
						cookerBuildParam.cover_res_path = itm.items[0].bg_path;
						cookerBuildParam.slogan = itm.items[0].caption;
					}
					
				}
				else if(itm.module == "header"){
					
					if(itm.items && itm.items.length > 0){
						
						cookerBuildParam.icon_res_path = itm.items[0].icon_path;
					}
					
				}
				
			});
			
			Logger.debug(" contents.contents.showmenus :: " );
			
			var menuCnt = 0;
				
			$.each(contentsords, function(i, itm){
				
				Logger.debug(itm);
				
				if(itm != "menu_first" && itm.indexOf("popup_") == -1){
					
					Logger.debug(showmenus[menuCnt][itm]);
					
					cookerBuildParam.menus.push(showmenus[menuCnt][itm]);
					
					menuCnt++;
				}
				
				
			});
				
			Logger.debug("_exportBaroParam ==============end " );
			
			return cookerBuildParam;
			
		}
		,

		getAppCreateModel : function(){
			
			var buildModel = UCMSPlatform.SPA.AppMain.getAppProps().getProp("build_model");
			
			if(buildModel == null || buildModel == undefined || buildModel.attributes == null){
				
				return null;
			}
			
			return buildModel;
		}
		,
		/**
		 * @param buildObject	{object} JSON 형식의 쿠커용 파라메터
		 */
		setAppCreateModel : function(buildObject)
		{
			var buildModel = new build_model( buildObject );
			UCMS.SPA.AppMain.getAppProps().setProp("build_model", buildModel);
		}
		,
		/**
		 * 바로앱 메뉴업데이트 및 파라메터 재생성
		 * 
		 * **/
		onRecreateBaroParameter : function(cbDone){
			
			var d = new $.Deferred();
			
			var parameterModel = CookerBase.getAppCreateModel();
			
	    	var user = BaroProps.getUser();
	    	var app_info = BaroProps.getAppInfo();
	    	var session = BaroProps.getSessionParams();
	    	
	    	Logger.debug("onRecreateBaroParameter");
	    	Logger.debug(app_info);
			
    		var update =  new (Backbone.Model.extend(
			{
				url: BaroProps.getHosts().api + "/bbang/menu/" + app_info.no,
				defaults: parameterModel
				
			}));
    		
    		update.save( null, { 
				"type":"PUT",
				contentType: 'application/json; charset=utf-8',
			    dataType: "json",
				headers:
			    {
			    	"sp-name" : session.SP_N,
			    	"sp-key" : session.SP_K
			    } 
				
			} ).then(function(result)
			{
			
				Logger.debug(result);
				
				if(result.resultCode == 0){
					
					d.resolve();
					
				}
				else{
					
					d.reject();
				}
				
			}
			)
			.
			fail(function(){
				
				d.reject();
					
			})
			.always(function(){
				
				UCMS.hideLoading();
			});
    		
    		return d.promise();
			
		}
		,
		fetchCSNotice : function(region){
			
			var content_id = "55473a75e4b0bdcc7b69ef26";
			
			var 	options = 
			{
				header : {
				   "title": "공지사항",
			       "caption": null
				},
				list:
				{
					"className": "gcon_box",
					"title": "공지사항",
					"write": "admin",
					"caption": "",
					"view": null,
					"type": "bbs_simple",
					"container_id": content_id
				},
				footer:{
					"type": "more"
				},
				writer : {
					"permission": "appowner",
					// CT_RESERVATION
					"content_type": 0x1,
					// 사용자정의 폼 식별자. content_type 이 0 인 경우 사용된다.
					"custom_form": "",
					"data": null
					}
			};
			
			region.show( new GPanel.GContainerPanel(options) );
		}
		,
		/**
		 * 바로앱 파라메터 정보만 업데이트. 리소스 유지.
		 * 
		 * **/
		onUpdateOnlyBaParam : function(build_param){
			
			var d = new $.Deferred();
			
	    	var app_info = BaroProps.getAppInfo();
	    	var session = BaroProps.getSessionParams();
	    	
	    	Logger.debug("onUpdateOnlyBaParam");
	    	Logger.debug(app_info);
	    	
	    	UCMS.showLoading();
			
    		var update =  new (Backbone.Model.extend(
			{
				url: BaroProps.getHosts().api + "/bbang/build/" + app_info.no,
				defaults: build_param
				
			}));
    		
    		update.save( null, { 
				"type":"PUT",
				contentType: 'application/json; charset=utf-8',
			    dataType: "json",
				headers:
			    {
			    	"sp-name" : session.SP_N,
			    	"sp-key" : session.SP_K
			    } 
				
			} ).then(function(result)
			{
			
				Logger.debug(result);
				
				if(result.resultCode == 0){
					
					d.resolve();
					
				}
				else{
					
					d.reject();
				}
				
			}
			)
			.always(function(){
				
				UCMS.hideLoading();
			});
    		
    		return d.promise();
			
		}
		,
		callMobileLogin : function(){
			
			if(UCMS.SPA.isAppOS() == true)
			{
				UCMS.showLoading();
				
				var apiAuth = osapi.getModule("AuthMoven");
    			var promise = apiAuth.signIn(BaroProps.getActors().con_id);
    			
    			promise.then
    			(
					function(result)
					{
						
						Logger.debug("cookerbase onLogin result :: " + JSON.stringify(result));

						if( result == null 
							|| result.resultCode < 0 )
						{
							var cs = osapi.getModule("CoreService");
							cs.reset();
							return;
						}
						
						if( result.extraData.user.id == null 
							|| result.extraData.user.id == "guest" )
						{
							return;
						}

						var userData = result.extraData;
						
						BaroProps.setUser(userData.user);
						BaroProps.setSessionParams(userData.session_params);

						Logger.debug("BaroProps user data set Complete !!");
						
						//BaroProps.save();
						location.href = "#myapp";
						
						return result;
					}
					,
					function(reason)
					{
        				UCMS.log("Sign-In MobileOven URL : "+url_signin);
					}
					
				)
				.then(function(result)
				{
					UCMS.log("onLoginMoven() - result() : " + JSON.stringify(result));

					// 로그인 결과 반환
					return result;
				})
				.done(function()
				{
					UCMS.hideLoading();

					UCMS.log("onLoginMoven() - Done! reloading a current page!!");
					
				});
    			
    			
		
			}else{
				
				location.href = "#!login";
			}
			
		},
		showSocialShare: function(params){
			
			var self = this;
			
			var promise = osapi.getModule("Social").share( params );
			
			promise.then
			(
				function(result)
				{
					Logger.debug("showSocialShare result :: " + result.resultCode);
				}
				,
				function(err)
				{
					Logger.error("showSocialShare err : "+ JSON.stringify(err));
				}
				
			)
			.fail(function()
			{
				Logger.error("showSocialShare fail ");
				
			});
			
		}
		,
		getMemberDetail : function(cbResult){
			
			var user_id = BaroProps.getUser().id;
    		var	apiPath	= BaroProps.getHosts().api + "/member/" + user_id;
    		
    		var session = BaroProps.getSessionParams();
    		
    		return $.ajax(
    				{
    					type: "GET",
    					url: apiPath,
    					headers: 
    					{
    						"sp-name":session.SP_N, 
    						"sp-key":session.SP_K 
    					},
    	                contentType: 'application/json; charset=utf-8',				
    					cache: false,
    					crossDomain: true,
    					dataType: "json",
    				    error: function( XHR, textStatus, errorThrown )
    				    {
    				    	Logger.error("error status: "+textStatus);
    				    	cbResult(false, null);
    				    },
    				    success: function(data, textStatus, jqXHR)
    				    {
    				    	if(data.resultCode == 0)
    				    	{
    				    		cbResult(true, data.extraData);
    				    	}
    				    	else
    				    	{
    				    		cbResult(false, null);
    				    	}
    				    }
    				});
    		
		}
	}
	
	);
	
	return CookerBase;
});