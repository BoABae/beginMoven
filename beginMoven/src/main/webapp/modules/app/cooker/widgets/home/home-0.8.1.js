/**
 * Project : UCMS( Unified Contents Messaging Solution )
 *
 * Copyright (c) 2013, 2014 FREECORE, Inc. All rights reserved.
 * 
 * @author	jbkim
 */
 
define
(
[ 
  "text!home_body",
  "BaroPanelBase",
  "osapi",
  "BaroProps",
  "Logger"
]
,
function( html, BaroPanelBase, osapi, BaroProps, Logger )
{
	
	var main = BaroPanelBase.extend(
	{
		_apiAuth : null,
		_apiCS : null,
		_apiBaro : null,
		
		template: "#home",
		tagName : "div",
		className : "baroapp_holder intro_in",
		regions: 
		{
			content: ".content",
			apphistory_list_box : ".apphistory_list_box",
			csnotice_regions		: ".csnotice_regions"
    	},
	    events:
		{	
	    	"click .btn_login" : "onLogin",
	    	"click .btn_go_build" : "onLogin",
	    	"click .btn_go_vod" : "onVod",
	    	"click .btn_go_vod_close" :"onVodClose",
	    	"click .btn_go_youtube": "onYoutube",
	    	"click .btn_go_publicData": "onPublic",
	    	"click .more_view_box" : "onGofeatures",
	    	"click .btn_go_baroappcs" : "onGoBaroappcs",
	    	"click .btn_go_freecore" : "onGoFreecore",
	    	"click .btn_itunes_baroappcs" : "onItunesBaroappcs",
	    	"click .btn_itunes_mobileoven" : "onItunesMobileoven",
	    	"click .btn_android_baroappcs" : "onAndroidBaroappcs",
	    	"click .btn_android_mobileoven" : "onAndroidMobileoven",
		}
		,
		ui:
	    {
			"apphistory_list_box" : ".apphistory_list_box"
	    }
		,
		initialize: function(options)
		{
			var self =this;
			
			this.model = new Backbone.Model( BaroProps.getHosts() );

        }
		,
        onShow: function()
        {
        	UCMS.scrollTop();
        	/*
        	if( UCMS.SPA.isAppOS() == true )
        	{
    			if(UCMS.SPA.isAndroid() == true)
    			{
    	        	$(".ios_down_btn").hide()
    	        	$(".and_down_btn").show()
    			}
    			else
    			{
    				$(".ios_down_btn").show()
    	        	$(".and_down_btn").hide()
    			}
        	}
        	
        	var self =this;
  		  	$(".intro_box .swiper-wrapper").fadeIn("slow");
        	// alert("window.innerHeight"+window.innerHeight)  
        	// alert("document.body.clientHeight"+document.body.clientHeight ) 모바일 0
        	//	alert("높"+$(window).height()) 모바일 0
        	// 	if(UCMSPlatform.SPA.isAndroid() == true || UCMSPlatform.SPA.isIPhone()==true){
    	    //폰환경
    	    var bodyHeight = window.innerHeight + "px"
        	$(".intro_box .swiper-container").css("height",bodyHeight);
    	    
    	    UCMS.getApplication().openSwitcher();
        	 
        	var mySwiper = new Swiper('.swiper-container',{
    		  //  pagination: '.pagination',
    		    loop:true,
    		  //  grabCursor: true,
    		  //  paginationClickable: true
    		  });
    		  $('.arrow-left').on('click', function(e){
    		    e.preventDefault();
    		    mySwiper.swipePrev();
    		  });
    		  $('.arrow-right').on('click', function(e){
    		    e.preventDefault();
    		    mySwiper.swipeNext();
    		  });
    		  
    		  this.ui.apphistory_list_box.html('');

    		  if(UCMS.SPA.isAppOS()==true && false)
    			  this.apphistory_list_box.show(new apphistory());
    		  
    		  
    		  setTimeout(function(){
    			  
    			  CookerBase.fetchCSNotice(self.csnotice_regions);
    			  
    		  },500);
    		  */
        }
		,
		onClose: function()
		{
			UCMS.getApplication().closeSwitcher();
		}
		,
		onYoutube: function(){
			location.href = "#!youtube";
			Logger.info("youtube>>>>>>>go");
		}
		,
		onPublic: function(){
			location.href = "#!publicdata";
			Logger.info("public>>>>>>>>go");
		}
		/*
		 * jbkim
		 * 
		 * titanium login event call
		 * 
		 * 
		 * */
		,
		
		onVod : function(){
			$(".vod_view_box").removeClass("hide");
		}
		,
		onVodClose : function(){
			$(".vod_view_box").addClass("hide");
		}
		,
		onGofeatures : function(){
			var bodyHeight = window.innerHeight;
			//alert(bodyHeight);
			$("body").scrollTop(bodyHeight);
		}
		,
		onLogin : function(){
			
			var self = this;
			
			
			if(UCMS.SPA.isAppOS() == true)
			{
				UCMS.showLoading();
				
    			var promise = this._apiAuth.signIn(BaroProps.getActors().con_id);
    			
    			promise.then
    			(
					function(result)
					{
						Logger.debug("onLogin result :: " + JSON.stringify(result));

						if( result == null 
							|| result.resultCode < 0 )
						{
							UCMS.alert("이용에 불편을 드려 죄송합니다.<br>운영자에게 문의하세요!<br>Error Code : "+result.resultCode).then(function()
							{
								UCMS.getApplication()._route.navigate("home", true);
							});
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
			
		
		}
		,
		onGoBaroappcs : function()
		{
			if( UCMS.SPA.isAppOS() == true )
			{
				this._runApp("baroappcs");
			}
			else
			{
				CookerBase.WEB_popWin("http://baro.moven.net/baroappcs.app", "");
			}
		}
		,
		onGoFreecore : function()
		{
			if( UCMS.SPA.isAppOS() == true )
			{
				this._runApp("freecore");
			}
			else
			{
				CookerBase.WEB_popWin("http://baro.moven.net/freecore.app", "");
			}
		}
		,
		_runApp: function(appId)
		{
			var self = this;
			var actors = BaroProps.getActors();
			
			UCMS.showLoading();
			this.fetchAppParam(appId)
			.then(function(result)
			{
				Logger.debug(result.extraData);
				
				if( result.resultCode == 0 )
				{
					self._apiBaro.runApp(appId,
					{
						id : result.extraData.path_id, 
						name : result.extraData.app_name, 
						skeleton : result.extraData.ba_param,
						svc_id : actors.svc_id,
						con_id : actors.con_id
					});
				}
				else
				{
					UCMS.alert("등록되지 않은 바로앱입니다.");
				}
			})
			.fail(function()
			{
				UCMS.alert("등록되지 않은 바로앱입니다.");
			})
			.always(function()
			{
				UCMS.hideLoading();	
			});
		}
		,
		onAndroidBaroappcs : function()
		{
			var _url = "https://play.google.com/store/apps/details?id=com.freecore.baangapp";
		
			if( UCMS.SPA.isAppOS() == true )
			{
				this._apiCS.openURL( _url );
			}
			else
			{
				CookerBase.WEB_popWin(_url, "");
			}
		}
		,
		onAndroidMobileoven : function()
		{
			var	_url = "https://play.google.com/store/apps/details?id=com.freecore.mobileoven";
			
			if( UCMS.SPA.isAppOS() == true )
			{
				this._apiCS.openURL( _url );
			}
			else
			{
				CookerBase.WEB_popWin(_url, "");
			}
		}
		,
		onItunesBaroappcs : function()
		{
			var _url = "https://itunes.apple.com/us/app/id1019415172?mt=8";
			
			if( UCMS.SPA.isAppOS() == true )
			{
				this._apiCS.openURL( _url );
			}
			else
			{
				CookerBase.WEB_popWin(_url, "");
			}
		}
		,
		onItunesMobileoven : function(){
			
			var _url = "https://itunes.apple.com/us/app/id1020059505?mt=8";
		
			if( UCMS.SPA.isAppOS() == true )
			{
				this._apiCS.openURL( _url );
			}
			else
			{
				CookerBase.WEB_popWin(_url, "");
			}
		}
		,
		fetchAppParam : function(appId)
		{
			var d = $.Deferred();
			
			var codeListData = new (Backbone.Model.extend(
					{
						defaults:
						{
						},
						
						url: BaroProps.getHosts().api + "/bbang/detail/"+appId
						,
						parse : function(response)
						{
							return response.extraData;
						}
					}));
			
			var session = BaroProps.getSessionParams();	
				
	    	codeListData.fetch({
	    		headers:
			    {
			    	"sp-name" : session.SP_N,
			    	"sp-key" : session.SP_K
			    },
			    data : {
			    	
			    }
	    		
	    	}).then(
		    		function(result){
		    				
				    	Logger.info(result);
				    	d.resolve(result);
				    	
	    		}
		    		,
		    		function()
			    	{
			    		d.reject();
			    	}
	    	);
	    	
	    	return d.promise();
		}
	});

	UCMSPlatform.SPA.AppMain.initResource( html );
	return main;
});