/**
 * 
 * 
 *@author boa 
 */
define(function(){
		var pageToken = Backbone.Model.extend({
			defaults:{
				nextToken: '',
				prevToken: '',
				maxPage: '',
				pageValue:'',
			}
		});
		
		return pageToken;
});