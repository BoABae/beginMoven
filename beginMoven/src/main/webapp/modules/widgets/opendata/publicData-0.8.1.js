/**
 * 
 * 
 * 
 * @author boa
 */
define
(
[ "text!publicdata_body",
  "toilet",
  "BaroAppBase",
  "BaroPanelBase",
]
,
function( html, toilet, BaroAppBase, BaroPanelBase)
{
	var	publicData = BaroPanelBase.extend(
	{
		template: "#publicdata",
		tagName : "div",
		className : "container-fluid",
		
		initialize: function(options)
		{
			UCMSPlatform.log("initialize pulicdata" );
			//LoginPanel.__super__.initialize.apply(this, arguments);
			
        }
		,
		events:{
			"click .go-main": "onMain",
			"click .go-btn-toilet": "onSelectCity"
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
	});
	
	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return publicData;
});