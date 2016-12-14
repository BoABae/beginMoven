/**
 * 
 *
 * @author boa
 */


define(["AuthYoutube"], 
		
function(auth){
	var OAUTH2_CLIENT_ID = '63003107558-717p3qbkj070ae3rclvamni7boa3bmd2.apps.googleusercontent.com';
	var OAUTH2_SCOPES = ['https://www.googleapis.com/auth/youtube'];
	var GOOGLE_PLUS_SCRIPT_URL = 'https://apis.google.com/js/client:plusone.js';
	var CHANNELS_SERVICE_URL = 'https://www.googleapis.com/youtube/v3/channels';
	var VIDEOS_UPLOAD_SERVICE_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet';
	var VIDEOS_SERVICE_URL = 'https://www.googleapis.com/youtube/v3/videos';
	var INITIAL_STATUS_POLLING_INTERVAL_MS = 15 * 1000;
	var uploadVideo ={
			uploadVideo: function(title, description){
				var self = this;
					gapi.auth.authorize({
					    client_id: OAUTH2_CLIENT_ID,
					    scope: OAUTH2_SCOPES,
					    immediate: true,
					  }, function(authResult){
						  var file = $('#file').get(0).files[0];
						  if(file){
							  $(".container .uploading").append("<div class=progress><div class=progress-bar></div></div>");
								var metadata = {
										snippet: {
											title: title,
											description: description,
											categoryId: 22
										}
								};
								accessToken = authResult['access_token'];
								$.ajax({
									url: VIDEOS_UPLOAD_SERVICE_URL,
									method: 'POST',
									contentType: 'application/json',
									headers: {
										Authorization: 'Bearer ' + accessToken,
										'x-upload-content-length': file.size,
										'x-upload-content-type': file.type
									},
									data: JSON.stringify(metadata)
								}).done(function(data, textStatus, jqXHR) {
									self.resumableUpload({
										url: jqXHR.getResponseHeader('Location'),
										file: file,
										start: 0
									});
								});
							}
					  });
			}
			,
			resumableUpload: function(options){
				var self = this;
				
				var ajax = $.ajax({
				      url: options.url,
				      method: 'PUT',
				      contentType: options.file.type,
				      headers: {
				        'Content-Range': 'bytes ' + options.start + '-' + (options.file.size - 1) + '/' + options.file.size
				      },
				      xhr: function() {
				        var xhr = $.ajaxSettings.xhr();
				        if (xhr.upload) {
				        	xhr.upload.addEventListener('progress', function(e){
				        		if(e.lengthComputable){
				        			var bytesTransferred = e.loaded;
					                var totalBytes = e.total;
					                var percentage = Math.round(100 * bytesTransferred / totalBytes);
					                $(".progress-bar").attr({
					                	'style': 'width :' + percentage + '%',
					                });
				        		}
				        		
				        	},
				        	false
				        	);
				        }
				        return xhr;
				      },
				      processData: false,
				      data: options.file
				    });

				    ajax.done(function(response) {
				    	$(".status").html("업로딩중 잠시만 기다려 주세요!");
				    	$('.progress-bar').addClass("progress-bar-striped active");
				    	videoId = response.id;
				    	self.checkVideoStatus(videoId, INITIAL_STATUS_POLLING_INTERVAL_MS);
				    });
			}
			,
			checkVideoStatus: function(videoId, waitFornextPoll){
				var self = this;
				$.ajax({
					url: VIDEOS_SERVICE_URL,
				      method: 'GET',
				      headers: {
				        Authorization: 'Bearer ' + accessToken
				      },
				      data: {
				        part: 'status,processingDetails,player',
				        id: videoId
				      }
				}).done(function(response){
					var uploadStatus = response.items[0].status.uploadStatus;
					var embed = response.items[0].player.embedHtml;
					console.log(uploadStatus);
					if(uploadStatus == 'uploaded'){
						setTimeout(function(){
							self.checkVideoStatus(videoId, waitFornextPoll * 2);
						}, waitFornextPoll);
					}else{
						if(uploadStatus == 'processed'){
							console.log("finally completed!");
							$(".status").html("업로딩 완료! 내 동영상목록에서 확인하세요");
							$(".progress-bar").removeClass("progress-bar-striped active");
				
							
						}
					}
				});
			}
			,
			getAccessToken: function(){
				auth.accessToken();
			}
		
		
	};
	
	return uploadVideo;
});
