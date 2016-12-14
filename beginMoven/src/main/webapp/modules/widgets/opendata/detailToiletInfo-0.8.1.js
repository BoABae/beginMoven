/**
 * 
 * 
 * 
 * @author boa
 */
define
(
[ "text!detailToiletInfo_body",
  "toilet",
  "BaroAppBase",
  "BaroPanelBase",
]
,
function( html, toilet, BaroAppBase, BaroPanelBase)
{
	var	selectCity = BaroPanelBase.extend(
	{
		template: "#detailInfo",
		tagName : "div",
		className : "container-fluid",
		
		initialize: function(options)
		{
			UCMSPlatform.log("initialize publicdetailInfo" );
			//LoginPanel.__super__.initialize.apply(this, arguments);
        }
		,
		events: {
			"click .onDetailInfo": "onDetailInfo",
			"click .go-main": "onMain",
			"click .go-btn-toilet": "onSelectCity"
		}
		,
		onShow: function(){
			var self = this;
			UCMS.hideLoading();
			
			self.onDetailInfo();
        	this._auth = osapi.getModule("AuthMoven");
        	
        	if( UCMS.SPA.isAppOS() == true)
        	{
			}
        	else
        	{
        	}
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
		onDetailInfo: function(){
			var pData = toilet.variable();
			var publicData = pData.toJSON();
			if(publicData.lat == null || publicData.openTime == null){
				$('#map').append("no map Information");
				pData.set({openTime: '9:00~18:00'});
			}else{
				
				var location = new daum.maps.LatLng(publicData.lat, publicData.lng);
				var mapContainer = document.getElementById("map");
				var mapOption = {
						center : location, 
						level : 3
				};
				var map = new daum.maps.Map(mapContainer, mapOption); 
				var control = new daum.maps.ZoomControl();
				map.addControl(control, daum.maps.ControlPosition.TOPRIGHT); 
				var marker = new daum.maps.Marker({
					map: map,
					position: location
				});
			}
			var openTime = pData.get('openTime');
			$(".title").append(publicData.title);
	    	$(".toiletPlace").append(publicData.toiletPlace);
	    	$(".openTime").append(openTime);
		}
		,
		
	});
	
	UCMSPlatform.SPA.AppMain.initResource( html );
	
	return selectCity;
});