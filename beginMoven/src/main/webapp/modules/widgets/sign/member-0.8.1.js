/**
 * Project : UCMS( Unified Contents Messaging Solution )
 *
 * Copyright (c) 2013, 2014 FREECORE, Inc. All rights reserved.
 * 
 * @author	jbkim
 */
 
define
(
[ "text!member_body",
  "BaroPanelBase",
  "Logger",
  "BaroProps",
  "osapi"
]
,
function( html, BaroPanelBase, Logger, BaangProps, osapi )
{
	
	var	MemberPanel = BaroPanelBase.extend(
	{
		template: "#login_success",
		tagName: "div",
		className : "baroapp_holder  container-fluid",
		ui:
	    {
			sp_name: "#sp_n",
			sp_key: "#sp_k"
	    }
		,
		events:
		{
			"click button.btn_go_mypage": "onNextPage"
		}
		,
		initialize: function(options)
		{
			BaroPanelBase.prototype.initialize.call(this, arguments);
			UCMSPlatform.log("initialize member" );
        }
		,
        onShow: function()
        {
        	var self = this;
        	var user = BaangProps.getUser();
        	var sessionParams = BaangProps.getSessionParams();
        	
        	if( user.id == null || typeof user.id == "undefined" )
        	{
        		location.href = "#!login";
        		return;
        	}
        	
        	//
        	$(this.ui.sp_name[0]).text( sessionParams.SP_N );
        	$(this.ui.sp_key[0]).text( sessionParams.SP_K );
        }
        ,
        onNextPage : function()
        {
	    	var user = BaangProps.getUser();
	    	var sessionParams = BaangProps.getSessionParams();
	    	//
	    	this.fireEndOfSignIn( user, sessionParams );
        }
        ,
        /**
         * 인증 정보를 반환한다.
         * 
         * @param user		{ id: ##, name: ## } 사용자 정보
         * @param session	{ sp_n: ##, sp_k: ## } 세션 파라메터
         */
	    fireEndOfSignIn : function(user, session)
	    {
	    	var self = this;
	    	
	    	try
	    	{
	    		Logger.info("fireEndOfSignIn");
	    		
	    		$(".header_box").show();
	    		
	    		if(UCMS.SPA.isAppOS() == true)
	    		{
		    		osapi.getModule("AuthMoven").endOfsignIn( user, session );
    			}
    			else
    			{
    				Logger.debug(BaangProps.getAppInfo());
    				location.href = "#!endOfSignin";
    			}
	    	}
	    	catch(e)
	    	{
	    		Logger.error("fireEndOfSignIn error " + e);
	    		//Ti.API.info( e )
	    		//Ti.API.info( "fireEndOfSignIn error " + e )
	    		
	    		// For Desktop
	    		location.href = "#!reset";
	    	}
	    }
        ,
	    redirectToOven : function()
	    {
	    	var hosts = BaangProps.getHosts();

	    	if( typeof hosts.oven == "string" )
	    	{
	    		location.href = hosts.oven;
	    	}
	    	else
	    	{
	    		location.href = "http://www.moven.net";	
	    	}
	    }
	});

	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return MemberPanel;
});