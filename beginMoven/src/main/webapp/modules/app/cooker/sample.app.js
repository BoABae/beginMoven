/**
 * Project : UCMS( Unified Contents Messaging Solution )
 *
 * Copyright (c) 2013, 2014 FREECORE, Inc. All rights reserved.
 * 
 * @author	dbongman
 */

define(
[
	"BaroAppBase", "BaroProps", "Logger", "osapi"
]
, function(BaroAppBase, BaroProps, Logger, osapi)
{
	
	var baroappTrackingId = "UA-46722680-5";
	var barowebTrackingId = "UA-46722680-1";
	var baroappVer = "1.1.3";
	
	var COOKER_CON_ID = "cooker";
	
	var TestSessionChecker = function()
	{
		$.ajax(
		{
            type: 'GET',
            url:  "http://localhost:8084/sessionChecker",
            cache: false,
            crossDomain: true
        });

		setTimeout(TestSessionChecker, 60000);
	};
	
	var reloadApp = function()
	{
		if(UCMS.SPA.isAppOS() == true)
		{
			var cs = osapi.getModule("CoreService");
			cs.reset();
		}
		else
		{
			//UCMS.reloadPage("#!reset");
			window.location.reload();
		}
	};
			
	var BaangApp = BaroAppBase.extend(
	{
		_param : null,
		
		onAjaxError: function(jqXHR, textStatus)
		{
			Logger.debug("onAjaxError() - textStatus : "+textStatus);
			
			$("body").css("overflow","auto");
			
			var self = this;
			
			UCMS.hideLoading();
			if( jqXHR.status == 401 || jqXHR.status == 403 )
			{
				Logger.error("[digestError] Unauthorized access. status : "+jqXHR.status);
				
				var msg;
				var user = BaroProps.getUser();
				
				if( typeof user.md5pwd == "string" )
				{
					msg = "세션이 만료되었습니다.<br>자동 연장합니다.";
					
					UCMS.showPrompt(msg);
					this.initSession().then(function()
					{
						self.initUniMeAgent()
						.then(
							function()
							{
								return self._initBadge();
							}
							,
							function(err)
							{
								Logger.error("onAjaxError() - Failed to initialize the unime agent by error : "+JSON.stringify(err));
								BaroAppBase.restartApp();
							}
						)
						.then(function()
						{
							UCMS.reloadPage("#!reset");
						})
						.always(function()
						{
							UCMS.hidePrompt();
						});
					}
					,
					function()
					{
						UCMS.hidePrompt();
						UCMS.alert("세션을 복구하지 못했습니다.<br>잠시 후 다시 이용해 주세요.<br>감사합니다.")
						.then(
								function()
								{
									BaroProps.setUser();
									BaroProps.setSessionParams();
									reloadApp();
								}
						);
					});
				}
				else
				{
					msg = "일정시간이 지나 안전을 위해 로그아웃 되었습니다.<br>다시 사용하시려면 로그인 해주세요.";
					
					UCMS.alert(msg).then
					(
						function()
						{
							BaroProps.setUser();
							BaroProps.setSessionParams();
							reloadApp();
						}
					);
				}
			}
			else
			{
				Logger.error("[digestError] Error Code : "+jqXHR.status+", Message : "+jqXHR.responseText);
				UCMS.alert("서버와 통신 중 오류["+textStatus+","+jqXHR.status+"]가 발생하였습니다.<br>잠시 후 다시 시도해주세요.<br>이용에 불편을 드려 죄송합니다!")
				.then(
						function()
						{
							reloadApp();
						});
			}
			
			return true;
		}
		
		,
		
		onInitializeBefore: function(options)
		{
			UCMS.log("onInitializeBefore()");
			
			this._appInfo = options.baangapp || {};
			this._param = options;
			
			/**
			 * PC 브라우저 백 버튼 으로 페이지 이동시 잠긴상태의 스크롤을 해제한다.
			 * 
			 * */
			if( UCMS.SPA.isAppOS() == false )
			{
				window.onhashchange = function() {
					$("body").css("overflow", "auto");
				};
			};
			
			// XXX 401 발생시 처리 테스트 코드
			//setTimeout(TestSessionChecker, 10000);
			
			//
			this.initApplication
			(
				options, 
				{
					
			    	home_body				: "modules/app/cooker/widgets/home/home-0.8.1.html",
			    	home 					: "modules/app/cooker/widgets/home/home-0.8.1",
			    	
			    	login_body				: "modules/widgets/sign/login-0.8.1.html",
					login					: "modules/widgets/sign/login-0.8.1",
					
					member_body				: "modules/widgets/sign/member-0.8.1.html",
					member					: "modules/widgets/sign/member-0.8.1",
					
					youtube_body 			: "modules/widgets/youtube/youtube-0.8.1.html",
					youtube					: "modules/widgets/youtube/youtube-0.8.1",
					
					publicdata_body			: "modules/widgets/opendata/publicData-0.8.1.html",
					publicdata				: "modules/widgets/opendata/publicData-0.8.1",
					
					selectcity_body			: "modules/widgets/opendata/selectCity-0.8.1.html",
					selectcity				: "modules/widgets/opendata/selectCity-0.8.1",
					
					detailToiletInfo_body	: "modules/widgets/opendata/detailToiletInfo-0.8.1.html",
					detailToiletInfo		: "modules/widgets/opendata/detailToiletInfo-0.8.1",
					
					searchResult_body 		: "modules/widgets/youtube/searchResult-0.8.1.html",
					searchResult			: "modules/widgets/youtube/searchResult-0.8.1",
					
					
					//modules을 어디에다가 정의해야하는지 몰라서 우선 여기에다
					//youtube modules
					AuthYoutube				: "modules/widgets/youtube/api/AuthYoutube",
					youtubeToken 			: "modules/widgets/youtube/models/youtubePagetokenModel",
					requestApi				: "modules/widgets/youtube/api/requestApi",
					uploadApi				: "modules/widgets/youtube/api/uploadApi",
					
					//toilet modules
					toilet					: "modules/widgets/opendata/api/toiletInfo",
					toiletDetailInfo		: "modules/widgets/opendata/model/toiletDetailInfo",
					
					
					
				}
				,
				UCMS.getRootPath()
			);
		},
		
		_initRoute: function( options )
		{
			var		self = this;
			
			this._route = new (Backbone.Marionette.AppRouter.extend(
			{
				routes:
				{
					"": "doHome",
					"home": "doHome",
					"!login" : "doLogin",
					"!join" : "doJoin",
					"up_join": "upJoin",
					"!member":"doMemberConfirm",
					"!youtube": "doYoutube",
					"!publicdata": "doPublic",
					"!selectCity": "doSelectcity",
					"!detailInfo": "doDetailInfo",
					"!likedVideolist": "doChkLiked",
					"!searchResult": "doSearch",
						
				},
				
				onRoute: function( name, path, route )
				{
					UCMSPlatform.log("Routing : "+name+", path: "+path+", route: "+route);
				
					var panelTag = Backbone.history.getFragment();
					
					if( panelTag )
					{
						Logger.debug("Tracking Tag : "+panelTag);
						
						Logger.debug("self._tracker : "+self._tracker);
						
						if(self._tracker != null)
							self._tracker.trackingView( panelTag );
					}
				},
				
				doHome: function()
				{
					UCMSPlatform.log("apps doHome()");
					self._setPanel("doHome");
				}
				
				,
				doLogin: function()
				{
					UCMSPlatform.log("apps doLogin()");
					self._setPanel("doLogin");
				}
				,
				doMemberConfirm : function()
				{
					UCMSPlatform.log("apps doMemberConfirm()");
					self._setPanel("doMemberConfirm");
				}
				,
				doYoutube: function()
				{
					UCMSPlatform.log("apps doYoutube()");
					self._setPanel("doYoutube");
				}
				,
				doPublic: function()
				{
					UCMSPlatform.log("apps doPublic()");
					self._setPanel("doPublic");
				}
				,
				doSelectcity: function(){
					UCMSPlatform.log("apps doSelectcity()");
					self._setPanel("doSelectcity");
				}
				,
				doDetailInfo: function(){
					UCMSPlatform.log("apps doSelectcity()");
					self._setPanel("doDetailInfo");
				},
				doSearch: function(){
					self._setPanel("doSearch");
					
				}
			}
			));
		},
		
		_initUI: function( options )
		{
			Logger.info("_initUI options " + JSON.stringify(options));
			
			Logger.info(" UCMS.SPA.isDesktop() " +  UCMS.SPA.isDesktop());
			Logger.info("UCMS.SPA.isAppOS() " + UCMS.SPA.isAppOS());

			if( UCMS.SPA.isDesktop() == false && UCMS.SPA.isAppOS() == false )
			{
				//
				// 모바일에서 브라우저로 진입한 경우,
				// 앱으로 전환할 수 있는 영역을 확보한다.
				//
				
				$("body").append("<div class=switcher_region/><div class=body_region/>");
				this.addRegions(
				{
					switcher: ".switcher_region",
					body: ".body_region"
				});
			}
			else
			{
				this.addRegions(
				{
					body: options.bodyTag
				});
			}
			// 웹뷰 높이 적용
			UCMS.adjustViewHeight($("body"));
			
			// 웹 팝업 이벤트 가로채기
			BaroAppBase.hookingHyperLink( options.bodyTag, "web:open" );
						
			if( UCMS.SPA.isAppOS() == true && UCMS.SPA.isAndroid() == false )
			{
				UCMS.initFixedHandler("input");
			}

			Logger.info("_initUI options end " );
			
		},
		
		_setPanel: function( moduleName, p_type, container_id, title, item_id )
		{
			/*
			var thePanel = UCMSPlatform.SPA.AppMain.createInstance( moduleName );
			
			if( thePanel )
			{
				this._showFrame( thePanel );
				return;
			}
			*/
			
			UCMSPlatform.log("Loading a Panel!");
			
			var self = this;
			
			if(p_type != undefined)
				self._param.type = p_type;
			
			if( moduleName === "doHome" )
			{
				self._moduleLoading("home");
			}
			else if( moduleName === "doHome" )
			{
				self._moduleLoading("home");
			}

			else if( moduleName === "doLogin" )
			{
				self._moduleLoading("login");
			}
			else if( moduleName === "doMemberConfirm" )
			{
				self._moduleLoading("member");
			}
			else if( moduleName === "doYoutube" )
			{
				self._moduleLoading("youtube");
			}
			else if( moduleName === "doPublic")
			{
				self._moduleLoading("publicdata");
			}
			else if( moduleName === "doSelectcity")
			{
				self._moduleLoading("selectcity");
			}
			else if( moduleName === "doDetailInfo")
			{
				self._moduleLoading("detailToiletInfo");
			}
			else if( moduleName === "doSearch")
			{
				self._moduleLoading("searchResult");
			}
		},

		_showFrame: function(framePanel)
		{
			this.body.show( framePanel );
		},
		
		_moduleLoading : function(moduleName, action, id, title, item_id){
			
			var self = this;
			
			require([ moduleName ], function(klass)
			{
				var		selfPanel = new klass({parentView : self, mode: action, container_id : id, title : title, item_id : item_id});
				
				self._showFrame( selfPanel );
			});
		}
		,
		onStart: function()
		{
			Logger.debug("Cooker.onStart() - begin");
			
			Backbone.history.start({ silent: true });
			this._route.navigate( "home", true );
			
			Logger.debug("Cooker.onStart() - end");
			
		}
		,
		goStartPage : function()
		{
			/**TODO
			 * 리플레쉬시 현재페이지 유지 테스트코드.
			 * 
			 * */
			//if( this._param.startPage == undefined || location.href.indexOf("#home") > 0 )
			if( location.href.indexOf("#home") > 0 )
			{
				Backbone.history.start();
			}
			else
			{
				var user = BaroProps.getUser();
				var startPage = "#home";
				
			}
		}
		,
		setBrowserComatible : function(){
			
			UCMS.log("setBrowserCompablity===");
			
			if(navigator.userAgent.indexOf("MSIE 9.0;") > 0){
				
				$("head").append('<style type="text/css"> #iconCanvasPreview { width: 100% !important; height: 450px }</style>');
			}
		  
		}
		,
		openSwitcher : function()
		{
			var self = this;
			
			if(this.switcher != undefined)
			{
				//
				// 모바일에서 브라우저로 전근하는 경우 switcher region 이 추가된다.
				// 이런 경우 switcher 모듈을 활성화한다.
				//
				require([ "SwitcherPanel" ], function(SwitcherPanel)
				{
					self.switcher.show( new SwitcherPanel() );
					
					// 시작파일에 담겨있는 초기 로딩 제거
					// 앱이 생성되면서 대체하지 못하기 때문에 수동으로 제거 
					$("body > .loading_box").remove();
				});
			}
		}
		,
		closeSwitcher : function()
		{
			if( this.switcher != undefined )
			{
				this.switcher.close();
			}
		}
		,
		_initBadge: function()
		{
			if( this._unimeClient == null )
			{
				Logger.info("_initBadge() - unime client is null.");
				return;
			}
			Logger.info("_initBadge() - Current User : "+this._unimeClient.get("user").id);
			// TODO 사용자가 바뀐경우 화면 전환시 항상 UniMe Token 이 다시 설정된다. 그러므로 _unimeClient 에는 언제나 최신 사용자 정보가 설정된 상태이다. 별도의 정보 갱신 절차 없이 API 를 호출한다.
			return this._unimeClient.getUnreadCount();
		}
		
	});		
			
	return BaangApp;
});