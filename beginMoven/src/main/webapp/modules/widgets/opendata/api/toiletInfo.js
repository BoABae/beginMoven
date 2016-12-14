/**
 * 
 * 
 *@author boa 
 * 
 */

define(["toiletDetailInfo"], function(toiletModel){
	var xhr = new XMLHttpRequest();
	var serviceKey = '?ServiceKey=HfwEAMtSxZUmV1Ss%2F1kub%2FJslKdS%2FvAHe7gJbhSm7aCBwdTjJI04gvHFqeH1DdojAaWWzyBXPCQOxXxTk2tK%2Fg%3D%3D';
	var pModel = new toiletModel();
	var toiletList = {
		search: function(queryParams){
			var queryParams = '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /*검색건수*/
			queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
			queryParams += '&' + encodeURIComponent('startPage') + '=' + encodeURIComponent('1');/*페이지 번호*/
			return queryParams;
		}
		,
		jeonjuList: function(){
			var self = this;
			var url = 'http://openapi.jeonju.go.kr/rest/toilet/getToiletList';
			var queryParams = self.search();
			
			xhr.open('GET', url + serviceKey + queryParams);
			
			
			xhr.onreadystatechange = function(){
				if(this.readyState == 4 ){
					var xml = this.responseText;
					xmlDoc = $.parseXML(xml),
					$xml = $(xmlDoc);
					
					var xmlData = $xml.find("list");
					$(xmlData).each(function(){
						dataSid = $(this).find("dataSid").text();
						dataTitle = $(this).find("dataTitle").text();
						toiletArea = $(this).find("toiletArea").text();
						content ="<div class=list-group-item><a>" +"화장실: " + dataTitle + "&nbsp;" + "주소 :" + toiletArea +"</a></div>";
						$(".list-group").append(content);
					});
					
					$(".list-group-item").on("click", function(){
						var index = $(this).index();
						var title = xmlDoc.getElementsByTagName('dataTitle')[index].childNodes[0].nodeValue;
						var openTime = xmlDoc.getElementsByTagName('openTime')[index].childNodes[0].nodeValue;
						var toiletArea = xmlDoc.getElementsByTagName('toiletArea')[index].childNodes[0].nodeValue;
						var lng = xmlDoc.getElementsByTagName('posx')[index].childNodes[0].nodeValue;
						var lat = xmlDoc.getElementsByTagName('posy')[index].childNodes[0].nodeValue;
						
						pModel.set({title: title, openTime: openTime, toiletPlace: toiletArea, lng: lng, lat: lat});
						console.log(lng, lat);
						location.href = "#!detailInfo";
					});
				}
			}
			xhr.send('');
		}
		,
		busanList: function(){
			var self = this;
			var url = 'http://opendata.busan.go.kr/openapi/service/PublicToilet/getToiletInfoList';
			var queryParams = self.search();
			xhr.open('GET', url + serviceKey + queryParams + '&_type=json');
			
			xhr.onreadystatechange = function(){
				if(this.readyState == 4 ){
					var obj = JSON.parse(this.responseText);
					var data = obj.response.body.items;
					
					for(i=0; i<10; i++){
						var title = data.item[i].toiletName;
						var openTime = data.item[i].openTime;
						var address = data.item[i].instName;
						content ="<div class=list-group-item><a>" +"화장실: " + title + "&nbsp;" + "지역구:" + address +"</a></div>";
						$(".list-group").append(content);
					}
					$(".list-group-item").on("click", function(){
						var index = $(this).index();
						
						var seq = data.item[index].seq;
						self.busanDetailList(seq);
					});
				}
			}
			xhr.send('');
			
			
			
		}
		,
		busanDetailList: function(seq){
			
			var url = 'http://opendata.busan.go.kr/openapi/service/PublicToilet/getToiletInfoDetail';
			var queryParams = '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /*검색건수*/
			queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
			queryParams += '&' + encodeURIComponent('seq') + '=' + encodeURIComponent(seq);
			xhr.open('GET', url + serviceKey + queryParams + '&_type=json');
			
			xhr.onreadystatechange = function(){
				if(this.readyState == 4 ){
					var obj = JSON.parse(this.responseText);
					var data = obj.response.body.items;
					var title = data.item.toiletName;
					var openTime = data.item.openTime;
					var address = data.item.addrRoad;
					var lng = data.item.longitude;
					var lat = data.item.latitude;
					//console.log(lng, lat);
					console.log(this.responseText);
						
					pModel.set({title: title, openTime: openTime, toiletPlace: address, lng: lng, lat: lat});
					location.href = "#!detailInfo";
				}
			}
			xhr.send('');
		}
		,
		suwonList: function(){
			var self = this;
			var url = 'http://api.suwon.go.kr/openapi-data/service/Toilet/getToilet';
			var queryParams = self.search();
			xhr.open('GET', url + serviceKey + queryParams + '&_type=json');
			
			xhr.onreadystatechange = function(){
				if(this.readyState == 4 ){
					var obj = JSON.parse(this.responseText);
					console.log(obj);
					var data = obj.response.body.items;
					for(i=0; i<10; i++){
						var title = data.item[i].plcName;
						var openTime = data.item[i].openTime;
						var address = data.item[i].newAddr;
						content ="<div class=list-group-item><a>" +"화장실: " + title + "&nbsp;" + "주소 :" + address +"</a></div>";
						$(".list-group").append(content);
					}

					$(".list-group-item").on("click", function(){
						var index = $(this).index();
						
						var title = data.item[index].plcName;
						var openTime = data.item[index].openTime;
						var address = data.item[index].newAddr;
						var lat = data.item[index].lat;
						var lng = data.item[index].lng;
						
						pModel.set({title: title, openTime: openTime, toiletPlace: address, lng: lng, lat: lat});
						location.href = "#!detailInfo";
					});
					
					
					
					
				}
			}
			xhr.send('');
		}
		,
		variable: function(){
			return pModel;
		}
		
			
	}
	
	return toiletList;
	
});