/**
 * Project : UCMS( Unified Contents Messaging Solution )
 *
 * Copyright (c) 2013, 2014 FREECORE, Inc. All rights reserved.
 * 
 * @author	jbkim
 */
 
define
(
[ "text!login_body",
  "BaroAppBase",
  "BaroPanelBase",
  "BaroProps",
  "Logger",
  "osapi",
  "AuthClient",
  "validator",
  "encrypt"
]
,
function( html, BaroAppBase, BaroPanelBase, BaroProps, Logger, osapi, AuthClient )
{
	var	LoginPanel = BaroPanelBase.extend(
	{
		template: "#login",
		tagName : "div",
		className : "baroapp_holder  container-fluid",
		ui:
	    {
	    	login_id: "#login_id",
	    	login_password: "input[id=login_password]",
	    	btn_close: "span.btn_close",
	    	btn_login: "button.btn_login",
	    	save_auth: ".chk_save_login",
	    	checkbox_box : ".checkbox_box"
	    }
		,
		events:
	    {
	    	"click @ui.btn_close": "onEndLogin",
	    	"click @ui.btn_login": "onLogin",
	    	"keyup @ui.login_password": "onKeyUp",
	    	"keypress @ui.login_password": "onKeyUp"
	    }
		,
		initialize: function(options)
		{
			UCMSPlatform.log("initialize login" );
			LoginPanel.__super__.initialize.apply(this, arguments);
        }
		,
        onShow: function()
        {

	    	UCMS.hideLoading();
			
        	
        	//this.initScroll();
        	this._auth = osapi.getModule("AuthMoven");
        	
        	if( UCMS.SPA.isAppOS() == true)
        	{
			}
        	else
        	{
				$(this.ui.checkbox_box[0]).hide();
        	}
        }
		,
		onKeyUp : function(e)
		{
			if( e.keyCode == 13 )
			{
    			this.onLogin();
    		}
		}
        ,
        onLogin : function()
        {
	    	var self = this;
    		var uid = this.ui.login_id.val();
        	var upwd = this.ui.login_password.val();
        	

	    	Logger.debug("uid=" + uid);
        	// TODO 테스트를 위해 임시로 계정 정보를 박아놓았다!!!
        	//uid = "test1";
        	//upwd = "asdf1234";

        	if(isEmpty(uid) == true)
        	{
        		UCMS.alert("아이디를 입력하세요");
        		return false;
        	}
        	
        	if(isEmpty(upwd) == true)
        	{
        		UCMS.alert("비밀번호를 입력해주세요");		
        		return false;
        	}
        	else
        	{
        		upwd = MD5(upwd);
        	}
        	
        	var	hosts			= BaroProps.getHosts();
         	var sessionParams	= BaroProps.getSessionParams();
         	var actors			= BaroProps.getActors();
         	var appInfo			= BaroProps.getAppInfo();
         	
         	//var apiUrl = hosts.oauth + '/'+appInfo.id+'/signin?svc_id='+actors.svc_id+"&con_id="+actors.con_id;
         	var apiUrl = hosts.oauth + '/'+actors.con_id+'/signin?svc_id='+actors.svc_id+"&con_id="+actors.con_id;
         	
         	UCMSPlatform.log("apiUrl=" + apiUrl);
         	
         	this.disableLogin();
         	
 			var		caller	 = new UCMSPlatform.API();
     		var		pmodel	 = new Backbone.Model();
     		
     		caller.setAjaxParams(
 			 {
 				headers: {"sp-name":sessionParams.SP_N, "sp-key":sessionParams.SP_K },
 				contentType: 'application/json; charset=utf-8',
 				dataType: 'json',
 				data : JSON.stringify(
            			{
            				id : uid,
                         	pwd : upwd
                       })
 			 });
     		
     		caller.create(apiUrl, pmodel, function(rmodel, resp, options)	//서버에서 데이터를 가져옴
 			{	
     			var data = rmodel.attributes;
     			
     			if(data.resultCode == 0){
                   	
     				sessionParams["SP_N"] = data.extraData.name;
                	sessionParams["SP_K"] = data.extraData.key;
                	
                	UCMS.debug("user session sp_n = " + sessionParams.SP_N);
                	UCMS.debug("user sessionsp_k = " + sessionParams.SP_K);
                	
                	BaroProps.setSessionParams( sessionParams );

                	BaroAppBase.fetchUserProfile(function(result)
                	{
                		self.enableLogin();
                		
                		if( result )
                		{
                			var user = {};

                        	// TODO 세션 자동연장을 위해서는 비밀번호도 저장 필요
                			user.id = uid;
                			user.md5pwd = upwd;
                			
                			if(UCMS.SPA.isAppOS() == true){
                			
	                        	//로그인 상태유지 플래그
	                			if( $(self.ui.save_auth[0]).prop("checked") )
	                			{
	                				user.chk_save_login = "Y";
	                			}
	                			else
	                			{
	                				user.chk_save_login = "N";
	                			}
                			
                			}
                			else
                				user.chk_save_login = "N";
                			
                        	BaroProps.setUser( user );
                        	
                        	UCMS.log("Login widget User : "+JSON.stringify( user ));
                        	
                        	//
                			location.href = "#!member";
                		}
                		else
                		{
                			// Failed
                			UCMS.alert("세션 정보가 잘못됐습니다. 다시 로그인해 주세요!")
                			.then(function()
                			{
                				self.fireFailedToSign();
                    			self._reloadPage();
                			});
                		}
                	});
	             
            		
            	}else{
            		
            		self.enableLogin();
            		
            		UCMS.alert("로그인이 실패하였습니다.")
        			.then(function()
        			{
        				self.loginReinit();
        				
        			});
            	}
          		
 			}
     		,
     		function(err)
     		{
     			
     			UCMS.hideLoading();
     			
     			self.enableLogin();		    
 				
 				Logger.error("err :: " + err);
 				
 				UCMS.alert("로그인이 실패하였습니다.")
    			.then(function()
    			{
    				self.loginReinit();
    				
    			});
     		}
 			)
 			;
         	
     		
        }
        ,
        
        loginReinit : function(){
        	
        	var self = this;
        	
        	var doInit = function(){
        		
        		self.ui.login_id.val("");
        		self.ui.login_password.val("");
        	};
        	
        	new AuthClient().makeGuestSession()
        	.then(function(guestSession)
			{
                if( guestSession != undefined )
                {
                	UCMS.log("Guest SP_N = " + guestSession.SP_N);
                	UCMS.log("Guest SP_K = " + guestSession.SP_K);
                	BaroProps.setSessionParams( guestSession );
                	BaroProps.setUser({ id: "guest", name: null });
                	
             	}
                else
                {
                	Logger.error("AuthMoven.signOut() - Error!");
                	location.href = "#home";
                	
                }
			});
        	
			
        }
        ,
        /**
         * 로그인 취소시 현재의 세션 정보를 반환한다.
         * 인증 실패시 세션 정보가 파기되고, 페이지를 리로딩된다.
         * 그리고 리로딩 되면서 새로운 Guest 세션으로 변경된다.
         * 확보된 Guest 세션을 빵앱 CS 앱에게 반환한다. 
         */
        onEndLogin : function()
        {
        	var actors = BaroProps.getActors();
        	var appinfo = BaroProps.getAppInfo();
        	
        	if( UCMS.SPA.isAppOS() == true )
        	{
        		var result = 
		    	{
		    		"user": BaroProps.getUser(), 
		    		"session_params": BaroProps.getSessionParams() 
		    	};
		    	
		    	Logger.info("onEndLogin() - Current Session : "+JSON.stringify(result.session_params));
		    	
		    	this._auth.endOfsignIn( result.user, result.session_params )
		    	
        	}
        	else
        	{
        		if(UCMS.SPA.isDesktop() == false)
	    		{
        			location.href = "http://intro.moven.net/intro.web";
	    		}
        		else
        		{
        			if(appinfo.id != '' && appinfo.id != null && appinfo.id != 'cooker')
            			location.href = "#!reset";
            		else
            			location.href = "http://intro.moven.net/intro.app";
        		}
        	}
        }
        ,
        enableLogin : function()
        {
        	$(".header_box").show();
        	
        	this.initScroll();
        	
        	UCMS.hideLoading();
        	
        }
        ,
        disableLogin : function()
        {
        	$(".header_box").hide();
        	
        	UCMS.showLoading();
        }
	    , 
	    fireFailedToSign : function()
	    {
	    	this._auth.signIn( BaroProps.getActors().con_id )
	    }
	    ,
	    _reloadPage : function()
	    {
	    	var self = this;
	    	
	    	//UCMSPlatform.reloadCurPage();
	    	
	    	var onDoneInit = function( bSuccess )
			{
	    		self.enableLogin();
	    		
				Logger.info('initSession() - end! result : '+bSuccess);
				
				var curUrl = window.location.href;
	    		
	    		if(curUrl && curUrl.indexOf("/retry") > 0){
	    			
	    			curUrl = curUrl.substring(0, curUrl.indexOf("/retry"));
	    		
	    			location.href = "#login/retry/" + new Date().getTime();
	    	
	    		}
	    		else{
	    			
	    			location.href = "#login/retry/" + new Date().getTime();
	    		}
	    		
	    		
			};
	    	
			self.disableLogin();
			
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
        
        initScroll : function(offset){
			
			var targ = 'body';
			var offs = offset || 0;
			
			$('body').animate( { scrollTop: offs,  },  500,  function(){
			    $(targ).clearQueue();
			} );
	    	
	    }
	});

	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return LoginPanel;
});