/**
 * 
 * 
 * @author boa
 */

define(["youtubeToken"], 
function(youtubeToken){
	var yToken = new youtubeToken();
	var firstPage = true;
	var request = {
			/**관심 추천 동영상 목록*/
			activitiesList : function(){
				var request = gapi.client.youtube.activities.list({
					part: 'contentDetails, snippet',
					home: true,
					maxResult: 5,
				});
				request.execute(function(response){
					var str = JSON.stringify(response.result);
					var obj = JSON.parse(str);
					
					for(i = 0; i<obj.items.length ; i++){
						var title = obj.items[i].snippet.title;
						var videoId = obj.items[i].contentDetails.upload.videoId;
						var thumbnails_default = obj.items[i].snippet.thumbnails.default.url;
						video = "<a id=linktoVid1 href='http://www.youtube.com/watch?v="+videoId+"'><source src='http://www.youtube.com/watch?v="+videoId+"'></video><img id=imgTD src=\""+thumbnails_default+"\"/></a>";
						$(".list-group").append("<li class='list-group-item'>" + video + title + "</li>");
					}
				});
			},
			searchList: function(sKeyword, pageToken){
				yToken.set({maxPage: ''	});
				$(".list-group").empty();
				var request = gapi.client.youtube.search.list({
					q: sKeyword,
					part: 'snippet',
					pageToken: pageToken,
				});
				request.execute(function(response){
					var str = JSON.stringify(response.result);
					var obj = JSON.parse(str);
					
					var nextPageToken = response.nextPageToken;
						prevPageToken=response.prevPageToken;
					yToken.set({nextPageToken : nextPageToken, prevPageToken : prevPageToken});
					
					for(i = 0; i< response.items.length; i++){
						var videoId = response.items[i].id.videoId;
						var title = response.items[i].snippet.title;
						var thumbnails_default = response.items[i].snippet.thumbnails.default.url;
			            
			            if(firstPage === true){
			            	video = "<a id=linktoVid1 href='http://www.youtube.com/watch?v="+videoId+"'><source src='http://www.youtube.com/watch?v="+videoId+"'></video><img id=imgTD src=\""+thumbnails_default+"\"/></a>";
							$(".list-group").append("<li class='list-group-item'>" + video + title+ "</li>");
			            }else{
			            	$(".list-group").empty();
			            	video = "<a id=linktoVid1 href='http://www.youtube.com/watch?v="+videoId+"'><source src='http://www.youtube.com/watch?v="+videoId+"'></video><img id=imgTD src=\""+thumbnails_default+"\"/></a>";
							$(".list-group").append("<li class='list-group-item'>" + video + title+ "</li>");
			            }
					}
				});
				
			},
			
			/**좋아요 누른 동영상 목록*/
			myLikeVideoList: function(pageToken){
				var self = this;
				var request = gapi.client.youtube.channels.list({
					part: 'contentDetails',
					mine: true
				});
				request.execute(function(response){
					var str = JSON.stringify(response.result);
					var obj = JSON.parse(str);
					likeId = obj.items[0].contentDetails.relatedPlaylists.likes;
					self.requestVideoPlaylist(likeId, pageToken);
				});
			}
			,
			/**내 동영상 목록*/
			myVideoList: function(pageToken){
				var self = this;
				var request = gapi.client.youtube.channels.list({
					part: 'contentDetails',
					mine: true
				});
				request.execute(function(response){
					var str = JSON.stringify(response.result);
					var obj = JSON.parse(str);
					playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
					self.requestVideoPlaylist(playlistId, pageToken);
				});
			}
			,
			
			/**좋아요, 내 동영상 목록의 결과를 뷰로 표현해 주는 함수*/
			requestVideoPlaylist: function(id, pageToken){
				var requestOptions = {
					    playlistId: id,
					    part: 'contentDetails, snippet',
					    maxResults: 5,
					    pageToken: pageToken,
				};
				var request = gapi.client.youtube.playlistItems.list(requestOptions);
				request.execute(function(response){
					var str = JSON.stringify(response.result);
					var obj = JSON.parse(str);
					var t = obj.pageInfo.totalResults;
					var r = obj.pageInfo.resultsPerPage;
					var modResult = t % r;
					var maxPage = parseInt(t/r);
					if(modResult == 0){
						yToken.set({maxPage: maxPage});
					}else{
						yToken.set({maxPage: maxPage+1});
					}
					var nextPageToken = response.nextPageToken;
						prevPageToken =	response.prevPageToken;
					yToken.set({nextPageToken : nextPageToken, prevPageToken : prevPageToken});
					if(obj.items.length == 0){
						$(".list-group").append("<h4>동영상이 없습니다.</h4>");
					}else{
						for(i=0; i< obj.items.length ; i++){
							var videoId = obj.items[i].contentDetails.videoId;
							var title = obj.items[i].snippet.title;
							var thumbnails_default = obj.items[i].snippet.thumbnails.default.url;
							if(firstPage === true){
								video = "<a id=linktoVid1 href='http://www.youtube.com/watch?v="+videoId+"'><source src='http://www.youtube.com/watch?v="+videoId+"'></video><img id=imgTD src=\""+thumbnails_default+"\"/></a>";
								$(".list-group").append("<li class='list-group-item'>" + video + title+ "</li>");
							}else{
								$(".list-group").empty();
								video = "<a id=linktoVid1 href='http://www.youtube.com/watch?v="+videoId+"'><source src='http://www.youtube.com/watch?v="+videoId+"'></video><img id=imgTD src=\""+thumbnails_default+"\"/></a>";
								$(".list-group").append("<li class='list-group-item'>" + video + title+ "</li>");
							}
						}
					}
				});
			}
			,
			nextPage: function(){
				var pageToken = yToken.toJSON();
				var self = this;
				var nextPage = pageToken.nextPageToken;
				var stat = $('#numberUpDown').text();
		        var num = parseInt(stat);
		        num++;
		        var maxPage = pageToken.maxPage;
		        if(maxPage === ""){
		        	$('#numberUpDown').text(num);
		        }else{
		        	$('#numberUpDown').text(num);
		        	if(num>maxPage){
		        		$('#numberUpDown').text(1);
		        	}
		        }
				return nextPage;
			}
			,
			prevPage: function(){
				var self = this;
				var pageToken = yToken.toJSON();
				var prevPage = pageToken.prevPageToken;
				var stat = $('#numberUpDown').text();
		        var num = parseInt(stat,10);
		        num--;
		        if(num<=0){
		        	num = 1;
		        }
		        $('#numberUpDown').text(num);
				return prevPage;
			},
	}
	return request;
});