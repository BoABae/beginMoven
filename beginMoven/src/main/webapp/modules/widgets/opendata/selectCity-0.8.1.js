/**
 * 
 * 
 * 
 * @author boa
 */
define
(
[ "text!selectcity_body",
  "toilet",
  "toiletDetailInfo",
  "BaroAppBase",
  "BaroPanelBase",
]
,
function( html, toilet, toiletModel, BaroAppBase, BaroPanelBase)
{
	var	selectCity = BaroPanelBase.extend(
	{
		template: "#selectCity",
		tagName : "div",
		className : "container-fluid",
		
		initialize: function(options)
		{
			UCMSPlatform.log("initialize pulicdata" );
			//LoginPanel.__super__.initialize.apply(this, arguments);
			
        }
		,
		events: {
			"click .search": "onSearch",
			"click .go-main": "onMain",
			"click .go-btn-toilet": "onSelectCity",
		}
		,
		onShow: function(){
			
			$(".moreInfo").hide();
		}
		,
		onMain: function(){
			location.href = "#!publicdata";
		}
		,
		onMain: function(){
			location.href = '#!publicdata';
		}
		,
		onSelectCity: function(){
			location.href = "#!selectCity";
		}	
		,
		onSearch: function(){
			$(".list-group").empty();
			var value = $("#city").val();
			if(value === "jeonju"){
				toilet.jeonjuList();
			}else if(value === "busan"){
				toilet.busanList();
			}else if(value === "suwon"){
				toilet.suwonList();
			}
			
		}
		,
		temp: function(){
			
			var pModel = toilet.variable();
			var title = pModel.get('title');
			console.log(t);
			var publicData = pModel.toJSON();
			
		}
		,
		
		
	});
	
	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return selectCity;
});