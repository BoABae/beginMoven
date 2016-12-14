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
  "BaroProps",
  "Logger",
  "osapi",
  "validator",
  "encrypt",
]
,
function( html, toilet, BaroAppBase, BaroPanelBase, BaroProps, Logger, osapi)
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
			"click .go-btn-toilet": "toilet",
		}
		,
		toilet: function(){
			location.href = "#!selectCity"
		}
		,
	});
	
	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return publicData;
});