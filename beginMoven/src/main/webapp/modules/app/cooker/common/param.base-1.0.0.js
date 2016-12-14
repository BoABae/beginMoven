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
	"Logger",
	"category_const"
]
,
function( build_model, BaroProps, Logger, CategoryConst )
{
	/**
	 */
    /***
     * 여기에 pre setting될 메뉴를 추가후, 아래에 해당 파라메터를 기술함.
     * 메뉴의 item 명은 ***Menu로 지정해야 메뉴로 셋팅됨.
     * */
    /***
     * 일반게시판
     * 필수 파라메터
     * title
     * caption
     * menu_type == 2
     * sub_type : bbs_simple or thumb_album or thumb_goods
     * */
	/***
     * 게시판(사진+설명)게시판
     * 필수 파라메터
     * title
     * caption
     * body
     * menu_type == 11
     * items [
     * 	bg_path : 이미지경로
     * ]
     * */
	/***
     *  찾아오시는길
     * 필수 파라메터
     * title
     * caption
     * addr
     * body
     * menu_type == 20
     * coordinate : { lat : 경도, lng : 위도 }
     * */
    
	var TEST_BA_PARAM = 
	{
	        "baroapp": {
	            "id": "parameter1.0",
	            "name": "숙박/펜션",
	            "desc": "대한민국 도시관광 1번지 전주",
	            "intro": "가장 한국적인 도시 \r품격있는 대한민국 도시관광 1번지 전주 ",
	            "tag": "전주,숙박,전통숙박",
	            "ver": "0.9",
	            "createDate": 0
	        },
	        "theme": {
	            "id": "moven",
	            "ver": "0.5",
	            "path": "/themes/default-0.1.0/default.css"
	        },
	        "coverRegion": {
	            "module": "cover",
	            "options": 
	                {
	                    "link": "#home",
	                    "caption": "나도 만들자",
	                    "items" : [
		                             {
		                            	 "bg_path" : "/home/3/3fyv/1458879868984_cover.jpg"
		                             }
	                             ]
	                }
	            ,
	            "type": "simple"
	        },
	        "headerRegion": {
	            "module": "header",
	            "options": {
	                "title": "",
	                "icon_path": ""
	            }
	        },
	        "menubarRegion": {
	            "module": "menubar-1.0",
	            "options": {
	                "items": []
	            }
	        },
	        "footerRegion": {
	            "module": "footer-1.0",
	            "options": {
	                "items": []
	            }
	        },
	        "contentsRegion": {
	            "module": "BaroBox",
	            "options": {
	                "defaultBox": "homeBox",
	                "items": [
	                    "homeBox",
	                    "introMenu",
	                    "mapMenu",
	                    "photoMenu",
	                    "noticeMenu",
	                    "reviewMenu",
	                    "aboutBox",
	                    "mobileovenBox",
	                    "alramBox",
	                    "settingBox"
	                ]
	            }
	        },
	        "homeBox": {},
	        "introMenu": {
	            "module": "introduce",
	            "options": {
	                "title": "공간안내",
	                "caption": "도시여행 1번지 전주",
	                "view": null,
	                "menu_type": 11,
	                "body": "출처 - 전주시 문화 관광 : http://tour.jeonju.go.kr/",
	                "icon": "fa-leaf",
	                "show": 1,
	                "items" : [
	                             {
	                            	 "bg_path" : "/home/3/3fyv/1458879868984_cover.jpg"
	                             }
                           ]
	            }
	        },
	        "mapMenu": {
	            "module": "map",
	            "options": {
	                "title": "오시는길",
	                "caption": "언제나 새로움과의 만남",
	                "menu_type": 20,
	                "body": "출처 - 전주시 문화 관광 : http://tour.jeonju.go.kr/",
	                "icon": "fa-map-o",
	                "show": 1
	            }
	        },
	        "photoMenu": {
	            "module": "gcon",
	            "options": {
	                "title": "포토갤러리",
	                "write": "admin",
	                "caption": "사진으로 보는 공간",
	                "view": null,
	                "type": "bbs_simple",
	                "menu_type": 2,
	                "sub_type": "thumb_album",
	                "icon": "fa-camera-retro",
	                "show": 1
	            }
	        },
	        "noticeMenu": {
	            "module": "gcon",
	            "options": {
	                "title": "공지사항",
	                "write": "admin",
	                "caption": "공지사항입니다.",
	                "view": null,
	                "type": "bbs_simple",
	                "menu_type": 2,
	                "sub_type": "bbs_simple",
	                "icon": "fa-newspaper-o",
	                "show": 1
	            }
	        },
	        "reviewMenu": {
	            "module": "gcon",
	            "options": {
	                "title": "이용후기",
	                "write": "all",
	                "caption": "이용후기를 남겨주세요.",
	                "view": null,
	                "type": "bbs_simple",
	                "menu_type": 2,
	                "sub_type": "bbs_simple",
	                "icon": "fa-pencil-square-o",
	                "show": 1
	            }
	        },
	        "aboutBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w5"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w5": {
	                "module": "producer",
	                "options": {
	                    "className": "w5_box",
	                    "slogan": "App D.I.Y 모바일오븐",
	                    "category": "고객센터",
	                    "module": "producer",
	                    "title": "바로앱CS",
	                    "logo_path": "/home/l/l4iu/1444478844861_icon.jpg",
	                    "tag": "상품 소개, 고객센터, 모바일오븐",
	                    "caption": "모바일로 연결되는 앱 세상에 살고 있는 우리들은<br>\n나도 앱을 만들어 볼수있을까? 하는 생각을 한 번 쯤은 해봤을 것입니다.<br>\n모바일오븐은 누구든지 모바일 앱 운영자가 될 수 있는 가장 쉬운 방법입니다.",
	                    "create_datetime": "0",
	                    "view_method": "new_page",
	                    "version": "0.1"
	                }
	            }
	        },
	        "mobileovenBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w6"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w6": {
	                "module": "introduce",
	                "options": {
	                    "className": "w6_box",
	                    "slogan": "엄마도 만드는 모바일 <b>'앱'<\/b><br> 스마트폰으로 앱 만들자!!!!!",
	                    "module": "introduce",
	                    "title": "Introduce",
	                    "logo_path": "http://resource.moven.net/themes/moweb/img/logo_g.png",
	                    "caption": "모바일로 연결되는 앱 세상에 <br>살고 있는 우리들은 \u201c나도 앱을 만들어 볼수있을까?\u201d <br>하는 생각을 한 번 쯤은 해봤을 것입니다.<br>모바일오븐은 누구든지 모바일 앱 운영자가 될 수 있는<br> 가장 쉬운 방법입니다.",
	                    "view_method": "new_page"
	                }
	            }
	        },
	        "alramBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w7"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w7": {
	                "module": "alram",
	                "options": {
	                    "className": "w7_box",
	                    "title": "알림",
	                    "write": null,
	                    "caption": "알림목록입니다.",
	                    "type": "bbs_detail",
	                    "container_id": "",
	                    "view_method": "new_page"
	                }
	            }
	        },
	        "settingBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w8"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w8": {
	                "module": "setting",
	                "options": {
	                    "className": "w8_box",
	                    "title": "설정",
	                    "caption": "아래 푸시에 관한 설정을 확인하여 주시기 바랍니다.",
	                    "view_method": "new_page"
	                }
	            }
	        }
	    };
	
	var		ParamBase = {};
	
	var BARO_PARAM_08 = {
			
			"path_id": "baro",
		    "theme_path": null,
		    "layout_id": "show_mainicon",
	    	"contents": {
		        "baro_1": {
		            "title": "test",
		            "module": "header",
		            "icon_path": null
		        },
		        "baro_2": {
		            "module": "cover",
		            "items": [
		                {
		                    "link": "#home",
		                    "bg_path": null,
		                    "caption": "test"
		                }
		            ],
		            "type": "simple"
		        },
		        "baro_3": {
		            "module": "menubar",
		            "items": [
		                {
		                    "box_id": "menu_first",
		                    "caption": "홈",
		                    "icon_font": "fa-home"
		                }
		            ],
		            "box_id": "b1"
		        },
		        "baro_4": {
		            "module": "footer",
		            "items": [
		                {
		                    "link": "btn_go_alrim",
		                    "box_id": "popup_alrim",
		                    "caption": "알림",
		                    "icon_font": "fa-comment"
		                },
		                {
		                    "link": "btn_go_setting",
		                    "box_id": "popup_setting",
		                    "caption": "설정",
		                    "icon_font": "fa-gear"
		                },
		                {
		                    "link": "btn_go_producer",
		                    "box_id": "popup_producer",
		                    "caption": "about",
		                    "icon_font": "fa-question-circle"
		                },
		                {
		                    "link": "btn_go_moveninfo",
		                    "box_id": "popup_moven",
		                    "caption": "모바일오븐",
		                    "icon_font": "fa-info-circle"
		                },
		                {
		                    "link": "btn_go_apphistory",
		                    "box_id": "popup_apphistory",
		                    "caption": "앱히스토리",
		                    "icon_font": "fa-history"
		                }
		            ]
		        },
		        "contents": {
		            "module": "baang_panel",
		            "menu_first": {
		                "module": "icon_menu",
		                "items": [
		                    
		                ]
		            },
		            "popup_alrim": {
		                "module": "alram",
		                "title": "알림",
		                "write": null,
		                "caption": "알림목록입니다.",
		                "type": "bbs_detail",
		                "container_id": "",
		                "view_method": "new_page"
		            },
		            "popup_apphistory": {
		                "module": "apphistory",
		                "title": "앱히스토리",
		                "caption": "",
		                "view_method": "new_page"
		            },
		            "popup_setting": {
		                "module": "setting",
		                "title": "설정",
		                "caption": "아래 푸시에 관한 설정을 확인하여 주시기 바랍니다.",
		                "view_method": "new_page"
		            },
		            "switching": {
		                "default_id": "menu_first",
		                "method": "show-hide"
		            },
		            "id": "b1",
		            "order": [
		                
		            ],
		            "popup_producer": {
		                "slogan": "test",
		                "category": "회사소개",
		                "module": "producer",
		                "title": "test",
		                "logo_path": "",
		                "tag": "회사 소개, ",
		                "caption": "test",
		                "create_datetime": "0",
		                "view_method": "new_page",
		                "version": "0.1"
		            },
		            
		            "showmenus": [
		                
		            ],
		            "popup_moven": {
		                "slogan": "엄마도 만드는 모바일 <b>'앱'</b><br> 스마트폰으로 앱 만들자!!!!!",
		                "module": "introduce",
		                "title": "모바일오븐",
		                "logo_path": "http://resource.moven.net/themes/base/img/banner.png",
		                "caption": "모바일로 연결되는 앱 세상에 <br>살고 있는 우리들은 “나도 앱을 만들어 볼수있을까?” <br>하는 생각을 한 번 쯤은 해봤을 것입니다.<br>모바일오븐은 누구든지 모바일 앱 운영자가 될 수 있는<br> 가장 쉬운 방법입니다.<br><br><button class='btn btn-primary btn-lg btn-block mt5 btn_go_moven' target='_blank'>모바일 오븐 바로가기</button>",
		                "view_method": "new_page"
		            },
		            
		        },
		        "id": "b2",
		        "order": [
		            "baro_1",
		            "baro_2",
		            "baro_3",
		            "baro_4",
		            "contents",
		            "baro_5"
		        ]
		    }
		};
	
	ParamBase.Convertor08 = 
	{
		_exportBaroParam: function(param)
		{
			
			BARO_PARAM_08.theme_path = param.theme_id;
			
			var contents	= BARO_PARAM_08["contents"];
			var header	= contents["baro_1"];
			var cover	= contents["baro_2"].items;
			
			contents["baro_3"].items = [{
                "box_id": "menu_first",
                "caption": "홈",
                "icon_font": "fa-home"
            }];
			var menubar = contents["baro_3"].items;
			
			contents["contents"].order = [];
			var innerContents = contents["contents"];
			
			innerContents.menu_first.items = [];
			var iconmenus = innerContents.menu_first.items;
			
			header.title		= param.app_name;
			header.icon_path	= param.icon_res_path;
			
			cover[0].bg_path	= param.cover_res_path;
			//cover caption
			cover[0].caption 	= param.slogan;
			
			var content_id = 100;
			
			innerContents.order.push("menu_first");
			
			$.each(param.menus, function(i, itm){
				
				var menu_id = "baro_" + content_id;
				
				var menu = {
							"box_id": menu_id,
		                    "onclick": "switching",
		                    "caption": itm.title,
		                    "icon_font": itm.icon
						};
				
				menubar.push(menu);
				iconmenus.push(menu);
				
				innerContents.order.push(menu_id);
				innerContents.showmenus[i] = {};
				innerContents.showmenus[i][menu_id] = itm;
				
				innerContents[menu_id] = {
	                "title": itm.title,
	                "module": "",
	                "write": itm.write,
	                "caption": itm.caption,
	                "view": itm.view,
	                "type": itm.type,
	                "icon_font": itm.icon
	            };
				
				content_id++;
			});
			
			iconmenus = iconmenus.concat([
			{
                "box_id": "go_sms",
                "caption": "문자보내기",
                "icon_font": "fa-comments-o"
            },
            {
                "box_id": "go_call",
                "caption": "전화걸기",
                "icon_font": "fa-phone"
            }]);
			innerContents.order = innerContents.order.concat([
			"popup_alrim",
            "popup_setting",
            "popup_producer",
            "popup_moven",
            "popup_apphistory"]);
			
			
			Logger.debug(BARO_PARAM_08);
			
			return BARO_PARAM_08;
		}	
			
	};
	
	var BARO_PARAM_10_SKEL = 
	{
	        "baroapp": {
	            "id": "parameter1.0",
	            "name": "",
	            "desc": "",
	            "intro": "",
	            "tag": "",
	            "ver": ""
	        },
	        "theme": {
	            "id": "",
	            "ver": "",
	            "path": ""
	        },
	        "coverRegion": {
	            "module": "cover",
	            "options": 
	                {
	                    "link": "#home",
	                    "caption": "",
	                    "items" : [
		                             {
		                            	 "bg_path" : ""
		                             }
	                             ]
	                }
	            ,
	            "type": "simple"
	        },
	        "headerRegion": {
	            "module": "header",
	            "options": {
	                "title": "",
	                "icon_path": ""
	            }
	        },
	        "menubarRegion": {
	            "module": "menubar-1.0",
	            "options": {
	                "items": []
	            }
	        },
	        "contentsRegion": {
	            "module": "BaroBox",
	            "options": {
	                "defaultBox": "homeBox",
	                "items": [
	                    "homeBox",
	                    "introMenu",
	                    "mapMenu",
	                    "photoMenu",
	                    "noticeMenu",
	                    "reviewMenu",
	                    "aboutBox",
	                    "mobileovenBox",
	                    "alramBox",
	                    "settingBox"
	                ]
	            }
	        },
	        "homeBox": {
	        	"module": "BaroBox",
				"order": ["cover", "icon_menu"],
				"className": "contents_box",
				"activation":
				{
					"defaultWidget": null,
					"method": "one-page"
				},
				"cover":
				{
					"module": "cover",
					"options":
					{
						"items": [
						        {
						          "link": "#home",
						          "bg_path": "",
						          "caption": ""
						        }
						      ],
						"type": "simple"				
					}
				},
				"icon_menu":
				{
					"module": "icon_menu",
					"options":
					{
						"items": []
					}
				}
	        },
	        "aboutBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "about"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "about": {
	                "module": "producer",
	                "options": {
	                    "slogan": "",
	                    "category": "",
	                    "module": "producer",
	                    "title": "",
	                    "logo_path": "",
	                    "tag": "",
	                    "caption": "",
	                    "view_method": "new_page"
	                }
	            }
	        },
	        "mobileovenBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w6"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w6": {
	                "module": "introduce-1.0",
	                "options": {
	                    "caption": "엄마도 만드는 모바일 <b>'앱'<\/b><br> 스마트폰으로 앱 만들자!!!!!",
	                    "title": "Introduce",
	                    "body": "모바일로 연결되는 앱 세상에 <br>살고 있는 우리들은 “나도 앱을 만들어 볼수있을까?” <br>하는 생각을 한 번 쯤은 해봤을 것입니다.<br>모바일오븐은 누구든지 모바일 앱 운영자가 될 수 있는<br> 가장 쉬운 방법입니다.<br><br><button class='btn btn-primary btn-lg btn-block mt5 btn_go_moven' target='_blank'>모바일 오븐 바로가기</button>",
	                    "view_method": "new_page",
	                    "items" : [{
	                    	"bg_path" : "http://resource.moven.net/themes/base/img/banner.png"
	                    }]
	                }
	            }
	        },
	        "alramBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w7"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w7": {
	                "module": "alram",
	                "options": {
	                    "className": "w7_box",
	                    "title": "알림",
	                    "write": null,
	                    "caption": "알림목록입니다.",
	                    "type": "bbs_detail",
	                    "container_id": "",
	                    "view_method": "new_page"
	                }
	            }
	        },
	        "settingBox": {
	            "module": "BaroBox",
	            "className": "contents_box",
	            "order": [
	                "w8"
	            ],
	            "activation": {
	                "method": "one-page"
	            },
	            "w8": {
	                "module": "setting",
	                "options": {
	                    "className": "w8_box",
	                    "title": "설정",
	                    "caption": "아래 푸시에 관한 설정을 확인하여 주시기 바랍니다.",
	                    "view_method": "new_page"
	                }
	            }
	        }
	    };
	
	ParamBase.Convertor10 = 
	{
		
		/**
		 *  앱 PreSet 
			CookerBase.setAppCreateModel(CookerBase._exportBaroParam(skel));
		 * 
		 * */
		_importBaroParam: function(skeleton)
		{
			/**
			 * TODO
			 * 
			 * */
			//skeleton = TEST_BA_PARAM;
			
			Logger.debug("_importBaroParam ============== " );
			
			var theme_path = skeleton["theme"].path;
			
			var cookerBuildParam = {
			
				"svc_id": "moven",	
			    "app_intro": "",
			    "app_name": "",
			    "app_tag": "",
			    "app_version": "",
			    "slogan": "",
			    "template_id": "show_mainicon",
			    "theme_id": theme_path,
			    "cover_res_path": null,
			    "icon_res_path": null,
			    "title": null,
			    "app_desc": "",
			    "show_coverimg": 1,
			    "show_mainicon": 1,
			    "show_footer": 1,
			    
			    menus : []
			    	 
			}; 
			
			var baroapp = skeleton["baroapp"];
			var headerRegion = skeleton["headerRegion"];
			var coverRegion = skeleton["coverRegion"];
			var contentsRegion = skeleton["contentsRegion"];
			
			cookerBuildParam.app_intro = baroapp.intro;
			cookerBuildParam.app_tag = baroapp.tag;
			cookerBuildParam.app_version = baroapp.ver;
			cookerBuildParam.icon_res_path = headerRegion.options.icon_path;
			
			if(coverRegion && coverRegion.options && coverRegion.options.items && coverRegion.options.items.length > 0)
			{
				cookerBuildParam.cover_res_path = coverRegion.options.items[0].bg_path;
				cookerBuildParam.slogan = coverRegion.options.caption;
			}
			else
			{
				cookerBuildParam.slogan = baroapp.desc;
			}
			
			
			var homeBox = skeleton["homeBox"];
			
			Logger.debug(" skeleton['homeBox'] :: " );
			
			$.each(contentsRegion.options.items, function(i, itm){
				
				Logger.debug(itm);
				if(skeleton[itm] && itm.indexOf("Menu") > 0 )
				{
					Logger.debug(skeleton[itm]);
					if(skeleton[itm] && skeleton[itm].options){
						skeleton[itm].options.show = 1;
						cookerBuildParam.menus.push(skeleton[itm].options);
					}
				}
				
			});
				
			Logger.debug("_importBaroParam ==============end " );
			
			Logger.debug(cookerBuildParam);
			
			return cookerBuildParam;
			
		}
		,
		_exportBaroParam: function(cookerParam)
		{
			Logger.debug("_exportBaroParam ============== " );
			
			var param10 = BARO_PARAM_10_SKEL;
			
			param10.baroapp.id = cookerParam.path_id;
			param10.baroapp.name = cookerParam.app_name;
			param10.baroapp.desc = cookerParam.app_desc;
			param10.baroapp.intro = cookerParam.app_intro;
			param10.baroapp.tag = cookerParam.app_tag;
			param10.baroapp.ver = cookerParam.app_version;
			
			param10.theme.id = cookerParam.theme_id;
			param10.theme.path = cookerParam.theme_id;
			
			if(!isNaN(cookerParam.show_footer) && Number(cookerParam.show_footer) == 1)
			{
				this._setFooter(param10, cookerParam);
			}
			
			this._setAbout(param10, cookerParam);
			this._setCover(param10, cookerParam);
			this._setHeader(param10, cookerParam);
			this._setMenu(param10, cookerParam);
			this._setHome(param10, cookerParam);
			this._setContents(param10, cookerParam);
			
			Logger.debug("_exportBaroParam ============== end" );
			
			//Logger.debug( JSON.stringify( param10 ) );
			
			return param10;
		}
		,
		_setAbout : function(baroParam, cookerParam)
		{
			var baroAbout = baroParam.aboutBox.about;
			
			baroAbout.options.title = cookerParam.app_name;
			baroAbout.options.category = CategoryConst.displayCat(cookerParam.cat1,cookerParam.cat2);
			baroAbout.options.version = cookerParam.app_ver;
			baroAbout.options.tags = cookerParam.app_tag;
			baroAbout.options.logo_path = cookerParam.icon_res_path;
			baroAbout.options.slogan = cookerParam.slogan;
			baroAbout.options.caption = cookerParam.app_intro;
			baroAbout.options.owner = BaroProps.getUser().id;
			
		}
		,
		_setCover : function(baroParam, cookerParam)
		{
			var baroCover = baroParam.coverRegion;
			baroCover.options.caption = cookerParam.slogan;
			baroCover.options.items[0].bg_path = cookerParam.cover_res_path;
		}
		,
		_setFooter : function(baroParam, cookerParam)
		{
			baroParam["footerRegion"] = {
	            "module": "footer-1.0",
	            "options": {
	                "items": [{
						"caption": "알림",
						"icon_font": "fa-comment",
						"cmd": "#box/alramBox"
					},
					{
						"caption": "설정",
						"icon_font": "fa-gear",
						"cmd": "#box/settingBox"
					},
					{
						"caption": "about",
						"icon_font": "fa-question-circle",
						"cmd": "#box/aboutBox"
					},
					{
						"caption": "모바일오븐",
						"icon_font": "fa-info-circle",
						"cmd": "#box/mobileovenBox"
					}]
	            }
	        };
		}
		,
		_setHeader : function(baroParam, cookerParam)
		{
			var baroCover = baroParam.headerRegion;
			baroCover.options.title = cookerParam.slogan;
			baroCover.options.icon_path = cookerParam.icon_res_path;
		}
		,
		_setMenu : function(baroParam, cookerParam)
		{
			var self = this;
			var baroMenu = baroParam.menubarRegion;
			
			var cookerMenus = [{
				"caption": "홈",
				"icon_font": "fa-home",
				"cmd": "#home"
			}];
			if(cookerParam.menus)
			{
				$.each(cookerParam.menus, function(i, item){
					
					if(item.show == 1)
					{
					
						var menuId = "baro" + (i+1) + "Menu";
						
						cookerMenus.push({
							"caption": (item.title != "" && item.title != null ? item.title : item.caption),
							"icon_font": item.icon,
							"cmd": "#box/" + menuId
						});
						
						baroParam[menuId] = {
							"module": "BaroBox",
							"order": ["baro" + (i+1)],
							"activation":
							{
								"method": "one-page"
							}
						};
						
						var module_name = self._getModule(item.menu_type);
						
						if(module_name == "GPanel")
						{
							var content_type = 0x1;
							
							if(item.sub_type == "thumb_goods")
							{
								content_type = 0x11;
							}
							
							baroParam[menuId]["baro" + (i+1)] = {
								"module" : module_name,
								"options" : {
									header : {
										   "title": item.title,
									       "caption": item.caption,
									       "icon" : item.icon,
								   },
								   list: 
								   {
									   "container_id": item.container_id,
										"body": item.body,
										"type": item.sub_type,
										"items": item.items,
								   },
								   footer:{
									   "type": "more"
								   },
								   writer : {
									   "permission": "all",
									   "content_type": content_type
								   },
								   viewer : {
									   "permission": "all"
								   }
								}
							};
							
						}
						else
						{
							baroParam[menuId]["baro" + (i+1)] = {
								"module" : module_name,
								"options" : {
									"container_id" : item.container_id,
									"title": item.title,
					                "caption": item.caption,
					                "view": item.view,
					                "write" : item.write,
					                "body": item.body,
					                "icon": item.icon,
					                "show": item.show,
					                "items": item.items,
					                "addr" : item.addr,
					                "coordinate" : item.coordinate
								}
							};
						}
						
						if(item.row)
						{
							baroParam[menuId]["baro" + (i+1)]["options"]["row"] = item.row;
						}
						
						/*
						 * exapi public open api
						 * */
						if(item.menu_type == 30)
						{
							var menuoption = baroParam[menuId]["baro" + (i+1)]["options"];
							
							menuoption.listType = item.listType;
							menuoption.contentTypeId = item.contentTypeId;
					    	
					    	if(item.area1)
					    		menuoption.area1 = 	item.area1 ;
					    	if(item.area2)
					    		menuoption.area2 = 	item.area2 ;
					    	if(item.cat1)
					    		menuoption.cat1 = 	item.cat1 ;
					    	if(item.cat2)
					    		menuoption.cat2 = 	item.cat2 ;
					    	if(item.cat3)
					    		menuoption.cat3 = 	item.cat3 ;
					    	if(item.keyword)
					    		menuoption.keyword = 	item.keyword ;
					    	if(item.page)
					    		menuoption.page = 	item.page ;
					    	if(item.lang)
					    		menuoption.lang = 	item.lang ;
					    	else
					    		menuoption.lang = 	item.lang ;
						}
					
					}
				});
				
				baroMenu.options.items = cookerMenus;
			}
		}
		,
		_setHome : function(baroParam, cookerParam)
		{
			if(!isNaN(cookerParam.show_coverimg) && Number(cookerParam.show_coverimg) == 1)
			{
				var baroHomeCover = baroParam.homeBox.cover;
				
				baroHomeCover.options.items[0].caption = cookerParam.slogan;
				baroHomeCover.options.items[0].bg_path = cookerParam.cover_res_path;
			}
			else{
				
				baroParam.homeBox["order"] = ["icon_menu"];
				baroParam.homeBox.cover = null;
			}
			
			var baroHomeIcon = baroParam.homeBox.icon_menu;
			
			if(cookerParam.menus)
			{
				cookerMenus = [];
				
				$.each(cookerParam.menus, function(i, item){
					
					if(item.show == 1)
					{
					
						var menuId = "baro" + (i+1) + "Menu";
						
						cookerMenus.push({
							"box_id": menuId,
				            "onclick": "switching",
				            "caption": (item.title != "" && item.title != null ? item.title : item.caption),
				            "icon_font": item.icon
						});
					
					}
				});
				
				baroHomeIcon.options.items = cookerMenus;
			}
			
		}
		,
		_setContents : function(baroParam, cookerParam)
		{
			var baroContent = baroParam.contentsRegion;
			
			if(cookerParam.menus)
			{
				cookerMenus = ["homeBox"];
				
				$.each(cookerParam.menus, function(i, item){
					
					if(item.show == 1)
					{
						var menuId = "baro" + (i+1) + "Menu";
						
						cookerMenus.push(menuId);
					}
					
					
				});
				
				baroContent.options.items = cookerMenus.concat(["alramBox","settingBox","aboutBox","mobileovenBox"]);
			}
			
		}
		,
		_getModule : function(type)
		{
			switch(Number(type)){
				case 2 : 
					return "GPanel";
					break;
				case 11 : 
					return "introduce-1.0";
					break;
				case 12 : 
					return "features";
					break;
				case 20 : 
					return "map-1.0";
					break;
				case 21 : 
					return "reserve";
					break;
				case 30 : 
					return "exapi_list";
					break;
				defalt : 
					return "gcon";
			}
		}
	};
	
	return ParamBase;
});