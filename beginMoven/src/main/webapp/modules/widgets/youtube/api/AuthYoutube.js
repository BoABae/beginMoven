/**
 * 
 * 
 * @author boa
 */

define(["requestApi"],function(requestApi){
	var self = this;
	var OAUTH2_CLIENT_ID = '63003107558-717p3qbkj070ae3rclvamni7boa3bmd2.apps.googleusercontent.com';
	var OAUTH2_SCOPES = ['https://www.googleapis.com/auth/youtube'];
	
	var onload = {
			
			googleApiClientReady: function(){
				var self = this;
				 gapi.auth.init(function() {
					    window.setTimeout(function(){
					    	gapi.auth.authorize({
					    		client_id: OAUTH2_CLIENT_ID,
					    		scope: OAUTH2_SCOPES,
					    		immediate: false,
					    	}, function(authResult){
								 if (authResult && !authResult.error) {
									 gapi.client.load('youtube', 'v3', function(){
										 self.onAuth();
									 });
									 $('.pre-auth').hide();
									 $('.post-auth').show();
								 }else{
									 $('#login-link').click(function() {
										 gapi.auth.authorize({
											 client_id: OAUTH2_CLIENT_ID,
											 scope: OAUTH2_SCOPES,
											 immediate: false
										 }, this.googleApiClientReady());
									 });
								 }

					    	});
					    	
					    }, 1);
					  });
			 },
			 onAuth: function(){
				 requestApi.activitiesList();
			 }
			 ,
			
	}
	
	return onload;
});