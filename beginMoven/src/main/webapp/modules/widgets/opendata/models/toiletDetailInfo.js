/**
 * 
 * 
 * @author boa
 */


define("toiletDetailInfo", function(){
	var toiletDetailInformation = Backbone.Model.extend({
		defaults: {
			title: '',
			openTime: '',
			toiletPlace: '',
			lng: '',
			lat: '',
		}
	});
	
	
	return toiletDetailInformation;
});