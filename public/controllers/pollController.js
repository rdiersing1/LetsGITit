angular.module("KnowItAll").controller('PollCtrl', ['$scope', '$http', '$cookies', '$routeParams', '$route', '$location', function ($scope, $http, $cookies, $routeParams, $route, $location, $uibModalInstance) {
	function twoDigits(d) {
		if (0 <= d && d < 10) return "0" + d.toString();
		if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
		return d.toString();
	}

	Date.prototype.toMysqlFormat = function () {
		return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" +
			twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" +
			twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
	};

	// var questionCommentID = $routeParams.questionCommentID;
	// var userID = $routeParams.userID;
	// var userIDAnnonymous = $routeParams.userIDAnnonymous;

	var loggedInuserID = $cookies.get("userID");
	$scope.loggedInuserID = loggedInuserID;
	var questionID = $routeParams.questionID;
	var getPoll = true; //check if poll is selected
	var username;
	var userID;
	var title;
	var imageURL;
	var description;

	$scope.isAdmin = $cookies.get("isAdmin");
	
	//when true, get info from database
	//getting information from search page (Home)
	//(search result controller)
	
	if(typeof(title) === 'undefined'){
		getPoll = true;
	}
	else{
		false;
	}

	$scope.showPost = false;

	//Set Question ID as URL, and read it when pulling poll / rating information 
	if (getPoll) {
		$http.get('/getQuestion?questionID=' + questionID).then(function (response) {
			
			var isPoll = response.data[0].isPoll;
			
			if(isPoll == "0"){
				$scope.isPoll = "RATING"
			}else{
				$scope.isPoll = "POLL"
			}

			$scope.title = response.data[0].title;
			title = response.data[0].title;
			$scope.editTitle = title;
			$scope.userID = response.data[0].userID;
			userID = response.data[0].userID;

			$scope.description = null;
			if (response.data[0].description != 'undefined') {
				$scope.description = response.data[0].description;
				description = response.data[0].description;
				$scope.editDescription = description;

			}
			$scope.isAnonymous = response.data[0].isAnonymous;
			$scope.username = null;
			
			//check if it image exists, and if it does, show
			var image = document.querySelector("#image_in_poll");
			imageURL = response.data[0].image;
			$scope.editImage = imageURL;
			//var pollImage = response.data[0].image;
			console.log("IMAGE URL: " + imageURL);
			
			// if(imageURL==null){
			// 	console.log("IMAGE DOES NOT EXIST: hiding image");
			// 	image.src = "";
			// 	image.style.display = "none";
			// }else{
			// 	console.log("IMAGE EXISTS: Showing image");
			// 	image.src = imageURL;
			// 	image.style.display = "inline";
			// }

			image.onerror = function() {
				this.onerror = function(){
					return;
				}
				image.src = "";
				image.style.display = "none";
			};
			image.onload = function(){
				this.onload = function(){
					return;
				}
				image.style.display = "inline";
				image.src = imageURL;
			}
			image.src = imageURL;







			var profileImage = document.querySelector("#profileImage");

			if ($scope.isAnonymous == 1) {
				$scope.username = "Anonymous";
				profileImage.src = "img/anonymous_profile.png";
				//assign sample profile pic
			} else {

				$scope.username = response.data[0].username;
				username = response.data[0].username;
				$http.get("/getProfilePic?userID=" + response.data[0].userID)
				.then(function (response) {
					if(response.data[0].imageURL == "" || response.data[0].imageURL == null){
						profileImage.src = "img/blankprofile.png";
					}
					else{
						profileImage.src = response.data[0].imageURL;
					}
					
					console.log("got profile picture");
				},function (response) {
					console.log("Error");
				});
				//profile
			}


			$scope.endDateDisplay = null;
			var end_date = response.data[0].endDate;
			if (end_date == null) {
                $scope.endDateDisplay = "Open Forever"; 
            } else {
                var date = new Date();
                var finalCloseDate = new Date(end_date);
                if (date < finalCloseDate) { 
                    var month = finalCloseDate.getUTCMonth() + 1; 
                    var day = finalCloseDate.getUTCDate();
                    var year = finalCloseDate.getUTCFullYear();
                    newdate = month + "/" + day + "/" + year;
                    $scope.endDateDisplay = "Open until " + newdate ; 
                    //current.endDateDisplay = "Open until " + convertDay(finalCloseDate) ; 
                } else { 
                    $scope.endDateDisplay = "Closed"; 
                }
            }

			$scope.endDate = null;
			if (response.data[0].endDate == null) {
				$scope.endDate = "(Open Forever)";
			} else {


				console.log("NOW: " + new Date());
				console.log("CLOSING: " + new Date(response.data[0].endDate));

				//get current time
				var date = new Date();
				//convert close time to match convert time format
				var finalCloseDate = new Date(response.data[0].endDate);
				//newEndDate.setHours(newEndDate.getHours() - newEndDate.getTimezoneOffset() / 60);
				//console.log("NEW END DATE (A): " + newEndDate);
				//var closeDate = (response.data[0].endDate).replace(".000Z", "");
				//var finalCloseDate = closeDate.replace("T", " ");

				console.log("now date: " + date);
				console.log("close date: " + finalCloseDate);
				//compare and check
				if (date < finalCloseDate) {
					console.log("ITS NOT CLOSED YET");
					$scope.endDate = response.data[0].endDate;

				} else {
					console.log("IT' CLOSED");
					$scope.endDate = "(CLOSED)";
					// This will disable all the children of the div
					var nodes = document.querySelector(".comments-cont").getElementsByTagName('*');
					for (var i = 0; i < nodes.length; i++) {
						nodes[i].disabled = true;
					}
					var nodes = document.querySelector(".rank-cont").getElementsByTagName('*');
					for (var i = 0; i < nodes.length; i++) {
						nodes[i].disabled = true;
					}
					var nodes = document.querySelector(".vote-cont").getElementsByTagName('*');
					for (var i = 0; i < nodes.length; i++) {
						nodes[i].disabled = true;
					}
				}
			}

			if (response.data.length == 0) {
				console.log("response = 0");
			}
		}, function (res) {
			console.log("Error");
		});

		$http.get('/getLike?questionID=' + questionID).then(function (response) {
			$scope.totalLikeCount = response.data[0].num;

		}, function (response) {
			console.log("Error");
		});
		$http.get('/getDislike?questionID=' + questionID).then(function (response) {

			$scope.totalDislikeCount = response.data[0].num;

		}, function (response) {
			console.log("Error");
		});
		
		$http.get('/commentList?questionID=' + questionID).then(function (response) {
			$scope.totalComment = response.data.length;	
			$scope.commentList = response.data;			
		}, function (response) {

		});
		$http.get('/pollList?questionID=' + questionID).then(function (response) {
			$scope.pollList = response.data;
		}, function (response) {

		});

		$http.get('/getPollResults?questionID=' + questionID).then(function (response) {
			$scope.pollResults = response.data;
		}, function (response) {
			console.log("FAILED getting poll results");
		});

		$http.get('/tagList?questionID=' + questionID).then(function (response) {
			$scope.totalTags = response.data.length;	
			$scope.tagList = response.data;
		}, function (response) {

		});

		$http.get('/getTag?questionID=' + questionID).then(function (response) {
			if((response.data).length !== 0){
				var tag = response.data[0].tagStr;
				$http.get('/getRecommendedQuestion?tagQuery=' + tag + "&questionID=" + questionID).then(function (response) {
					var questionList = response.data;
					$scope.questionList = response.data;

					if(questionList == null || questionList.length == 0){
						$scope.errorMessageRecommendedQuestion = "There is no recommended Poll or Rating"
					}
				},
					function (res) {
						console.log("Question list NOT received");
					});
				}else{
					$scope.errorMessageRecommendedQuestion = "There is no recommended Poll or Rating"
				}
		},
			function (res) {
				console.log("Question list NOT received");
			});


	}//If

	$scope.closeQuestion = function() {
		if (!$cookies.get("isAdmin")) {
			return;
		}

		console.log("closing quesiton");

		$http.get('/closeQuestion?questionID=' + questionID)
		.then(function (response) {
			$route.reload();	
		});
	}

	$scope.editComment = function (comment) {

		var currentComment = angular.copy(comment).description;
		var newComment = comment.newComment;
		var newImage = comment.newImage;

		$http.get("/editComment?questionCommentID=" + comment.questionCommentID 
				+ "&newComment=" + newComment + "&newImage=" + newImage)
				.then(function (response) {
					$route.reload();
					console.log("inser into edit comment table");
				}, function (response) {
					console.log("Error");
			});
	}

	$scope.deleteComment = function (comment) {
		var currentComment = angular.copy(comment).description;
		var questionCommentID = angular.copy(comment).questionCommentID;

		$http.get('/deleteComment?&questionCommentID=' + comment.questionCommentID)
			.then(function (response) {
				$route.reload();
				console.log("comment succesfully deleted");
			}, function (response) {
				console.log("Error");
			});

	}


	//User likes the comment 
	$scope.commentLike = function (comment) {
		var questionCommentID = angular.copy(comment).questionCommentID;
		var userID = $cookies.get("userID");
		if (userID !== -1 && typeof (userID) !== 'undefined') {

			//Check if user already voted
			$http.get("/checkUserVotedComment?questionCommentID=" + questionCommentID + "&userID=" + userID
			)
				.then(function (response) {
					if (typeof response.data[0] == 'undefined') {
						//&& typeof response[0].userID !== 'undefined' 
						//if user clicked Like 
						$http.get("/UpdateCommentLike?questionCommentID=" + questionCommentID + "&questionID=" + questionID + "&userID=" + userID)
							.then(function (response) {
								console.log("insert into questionlike table");
							}, function (response) {
								console.log("Error");
							});

						$route.reload();
					} else {

						var pollLike = response.data[0].pollLike;
						if (pollLike == 0) { //if previous poll was DisLike, update to Like
							//dislike value -= 1  like value += 1
							$http.get("/UpdateCommentVote?questionCommentID=" + questionCommentID + "&questionID=" + questionID
								+ "&userID=" + userID + "&pollLike=" + pollLike)
								.then(function (response) {
									console.log("insert into questionlike table");
								}, function (response) {
									console.log("Error");
								});

							$route.reload();
						}
						else { //undo poll 

							$http.get("/UndoCommentVote?questionCommentID=" + questionCommentID
								+ "&questionID=" + questionID + "&userID=" + userID
								+ "&pollLike=" + pollLike)
								.then(function (response) {
									console.log("insert into questionlike table");
								}, function (response) {
									console.log("Error");
								});

							$route.reload();
						}
					}
				}, function (response) {
					console.log("Error");
				});
		} else {
			$scope.errorMessageCommentLike = "Please log In to vote comment";
		}

	}
	//User Disliked the comment
	$scope.commentDislike = function (comment) {
		var questionCommentID = angular.copy(comment).questionCommentID;
		var userID = $cookies.get("userID");
		if (userID !== -1 && typeof (userID) !== 'undefined') {
			//Check if user already voted
			$http.get("/checkUserVotedComment?questionCommentID=" + questionCommentID + "&userID=" + userID
			)
				.then(function (response) {
					if (typeof response.data[0] == 'undefined') {
						//&& typeof response[0].userID !== 'undefined' 

						//If user clicked Dislike
						$http.get("/UpdateCommentDisLike?questionCommentID=" + questionCommentID + "&questionID=" + questionID + "&userID=" + userID)
							.then(function (response) {
								console.log("insert into questionlike table");
							}, function (response) {
								console.log("Error");
							});
						$route.reload();
					} else {

						var pollLike = response.data[0].pollLike;
						//if previous poll was Like, update to dislike 
						if (pollLike == 1) {

							$http.get("/UpdateCommentVote?questionCommentID=" + questionCommentID
								+ "&questionID=" + questionID + "&userID=" + userID
								+ "&pollLike=" + pollLike)
								.then(function (response) {
									console.log("insert into questionlike table");
								}, function (response) {
									console.log("Error");
								});

							$route.reload();
						}
						else { //else undo poll 

							$http.get("/UndoCommentVote?questionCommentID=" + questionCommentID
								+ "&questionID=" + questionID + "&userID=" + userID
								+ "&pollLike=" + pollLike)
								.then(function (response) {
									console.log("insert into questionlike table");
								}, function (response) {
									console.log("Error");
								});

							$route.reload();

						}
					}
				}, function (response) {
					console.log("Error");
				});
		} else {
			$scope.errorMessageCommentLike = "Please log In to vote comment";
		}
	}

	$scope.deleteQuestion = function() {
		if (!$cookies.get("isAdmin")) {
			return;
		}

		console.log("deleting question: " + questionID);
		$http.get('deleteQuestion?questionID=' + questionID);
		$location.path('/');
		$scope.apply();
	}

	$scope.flagComment = function (comment, commentList, index) {
		var questionCommentID = angular.copy(comment).questionCommentID;
		console.log('flagging comment ' + questionCommentID + ', flag=1');
		commentList[index].isFlagged = 1;
		$http.get('/toggleCommentFlag?questionCommentID=' + questionCommentID + '&flag=1');
	}

	$scope.goToLink = function (question) {
		if (question.isPoll) {
			$location.path('/poll/' + question.questionID);
		}
		else {
			$location.path('/rating/' + question.questionID);
		}
	};

	$scope.goToProfilePageFromComment = function (comment) {
		if(comment.userID == loggedInuserID){
			$location.path('/profile/');
		}
		else{
			if (!$scope.userIsLoggedIn())
				$("#notLoggedInPollModal").modal();
			else
				$location.path('/userProfile/' + comment.userIDAnnonymous);
		}
	};

	$scope.goToProfilePage = function () {
		if(userID == loggedInuserID){
			$location.path('/profile/');
		}else{
			$location.path('/userProfile/' + username);
		}
	};

	$scope.userIsLoggedIn = function(){
    	if($cookies.get('userID') != -1 && $cookies.get('userID') != undefined){
    		return true;
    	}
    	return false;
    }

	$scope.toggleFlag = function (flag) {
		console.log('flagging question: ' + questionID);
		$http.get('/toggleFlag?questionID=' + questionID + '&flag=' + flag);
		$scope.flag.message = "You have flagged this post";
	}

	$scope.loadQFlag = function () {

        var questionID = $routeParams.questionID;
        $scope.flag = {flagInfo : "", isFlagged : false};

        console.log("is Admin: " + ($cookies.get('isAdmin') == true));

        if ($cookies.get('isAdmin') == true) {
        	console.log("Entering the admin only if condition");
        	$http.get('/getQuestion?questionID=' + questionID)
        		.then( function(response) {
        			if (response.data.length == 1 && response.data[0].isFlagged) {
        				$scope.flag = {flagInfo : "This Content Is FLAGGED", isFlagged : true};
        			}
        		}
        	);
        }
    }

	$scope.createComment = function(){

		var userID = $cookies.get("userID");

		if(userID !== -1 && typeof(userID) !== 'undefined'){
			var validComment = validate($scope.commentInput); 

			if(!validComment){
				$scope.errorMessageComment = "Please leave a comment";
			}
			else{ 

				//getting UserName
				$http.get("/getUserName?userID=" + userID)
					.then(function (response) {

						var username = response.data[0].username;
						var isAnnonymous = $scope.isAnonymousInput;
						var userIDAnnonymous = "";
						var comment =  $scope.commentInput;

						if(isAnnonymous){ userIDAnnonymous = "Anonymous";}
						else{ userIDAnnonymous = username; }
						
						if(isAnnonymous){isAnnonymous = 1;}
						else{isAnnonymous = 0;}

						var picURL = document.querySelector("#pictureURL").value;

						if(picURL == ""){
							picURL = null;
						}

				
						//console.log(questionID, userID, username, isAnnonymous,userIDAnnonymous, comment);
						if(picURL==null || picURL == ""){
							
							$http.get("/insertComment?questionID=" + questionID + "&userID=" + userID
							+ "&description=" + comment + "&isAnnonymous=" + isAnnonymous 
							+ "&userIDAnnonymous=" + userIDAnnonymous + "&commentLikeCount=0" + 
							"&commentDislikeCount=0")
							.then(function (response) {
								console.log("inser into comment table");
							},function (response) {
								console.log("Error");
							});

							$route.reload();

						}else{
							
							if(checkURL(picURL)){

								$http.get("/insertComment?questionID=" + questionID + "&userID=" + userID
								+ "&description=" + comment + "&isAnnonymous=" + isAnnonymous 
								+ "&userIDAnnonymous=" + userIDAnnonymous +"&image=" + picURL+ "&commentLikeCount=0" + 
								"&commentDislikeCount=0")
								.then(function (response) {
									console.log("inser into comment table");
								},function (response) {
									console.log("Error");
								});

								$route.reload();
					
							}else{ //if not, hide
								$scope.errorMessageCommentPic = "Cannot create comment. Please use correct image url"
							}

						}

		 				
				
				},function (response) {
			    	console.log("Error");
				});

			}
		}
		else{
			$scope.errorMessageComment = "Please log In to comment";
		}
	}

	$scope.selectRate = function(){

		var userID = $cookies.get("userID");
		if(userID !== -1 && typeof(userID) !== 'undefined'){

			var validRating = validate($scope.rateInput); 
			if(!validRating){
				$scope.errorMessageRate = "Please choose the rating value";
			}
			else{
				var ratingValue = $scope.rateInput;
				//find Rating and put the value into RatingQuestionOption
				//check if user already rated
				$http.get("/checkUserRated?questionID=" + questionID + "&userID=" + userID
					)
					.then(function (response) {
					
						if(typeof response.data[0] == 'undefined'){

							$http.get("/insertRatingValue?questionID=" + questionID + "&userID=" + userID
								+ "&rating=" + ratingValue)
								.then(function (response) {
									console.log("inser into rating table");
							},function (response) {
							    	console.log("Error");
							});

							$route.reload();

						}else {
							

							$http.get("/UpdateRating?questionID=" + questionID + "&userID=" + userID
								+ "&rating=" + ratingValue)
								.then(function (response) {
									console.log("inser into rating table");
							},function (response) {
							    	console.log("Error");
							});

							$scope.errorMessageRate = "Already rated. Updating your rating" ;

							$route.reload();


						}
					},function (response) {
				    	console.log("Error");
				});
			}
		}
		else{
			$scope.errorMessageRate = "Please log In to rate";
		}
	}



	$scope.selectPollOption = function(index, pollList){
		var userID = $cookies.get("userID");
		console.log("userID is " + userID); 

		if(userID !== -1 && typeof(userID) !== 'undefined' && userID !== "-1"){
			// Check if user already voted
			$http.get("/checkUserRated?questionID=" + questionID + "&userID=" + userID)
			 	.then(function (response) {
			 	// str = JSON.stringify(pollList);
				// console.log(str); 
			 	// console.log("index is: " + index); 
				// console.log("option title is: " + pollList[index].title);
				// console.log("optionID is: " + pollList[index].pollOptionID);
				var optionID = pollList[index].pollOptionID; 

		 		if(typeof response.data[0] == 'undefined'){
		 			//console.log("hasnt voted yet");
		 			// Insert into database
		 			$http.get("/insertRatingValue?questionID=" + questionID + "&userID=" + userID + "&rating=" + optionID)
						.then(function (response) {
							//console.log("Inserted into RatingQuestionOption Table");
						}, function (response) {
						    console.log("FAILED Inserted into RatingQuestionOption Table");
		 			});

					// update PollOption table: for polloptionID and questionID, increment vote
					$http.get("/addPollVote?questionID=" + questionID + "&pollOptionID=" + optionID)
						.then(function (response) {
							//console.log("Updated PollOption Table");
						}, function (response) {
						    console.log("FAILED Updated PollOption Table");
		 			});


			 		$route.reload();

		 		} else {
		 			// Update vote input
					//console.log("already voted");
					$http.get("/findPrevVote?questionID=" + questionID + "&userID=" + userID)
					 	.then(function (response) { 
					 		var prevVoteOptionID = response.data[0].rating; 
							//console.log("prevVoteOptionID: " + prevVoteOptionID);
							//console.log("Selected from PollOption Table");
							return $http.get("/removePollVote?questionID=" + questionID + "&pollOptionID=" + prevVoteOptionID);
					 	}, function (response) {
					 	    console.log("Selection failed");
		 				})

					 	.then(function (response) {
							//console.log("Updated PollOption Table: removed vote");
							return $http.get("/UpdateRating?questionID=" + questionID + "&userID=" + userID + "&rating=" + optionID); 
						}, function (response) {
						    console.log("FAILED Updated PollOption Table: removed vote");
		 				})

					 	.then(function (response) {
		 					//console.log("Update: Inserted into RatingQuestionOption Table");
		 					return $http.get("/addPollVote?questionID=" + questionID + "&pollOptionID=" + optionID); 
		 				},function (response) {
		 			    	console.log("FAILED Update: Inserted into RatingQuestionOption Table");
		 				})

					 	.then(function (response) {
							//console.log("Updated PollOption Table: added vote");
							$route.reload();
							//$scope.errorMessagePoll = "Already voted. Updating your vote" ; // doesnt show up for some reason
							
						}, function (response) {
						    console.log("FAILED Updated PollOption Table: added vote");
		 			});
				}
				
			}, function (response) { console.log("Error"); });

		} else { $scope.errorMessagePoll = "Please log in to vote"; }
	}

	$scope.selectLikeOrDislike = function(){

		var userID = $cookies.get("userID");
		if(userID !== -1 && typeof(userID) !== 'undefined'){

			var validLike = validate($scope.likeInput); 

			if(!validLike){
				$scope.errorMessageLike = "Please choose the like/dislike value";
			}
			else{
				var likeorDisLike = $scope.likeInput;
				//like ans true and dislike as false
				//var userID = 1; //needs to be the current logged in User 

				//Check if user already voted
				$http.get("/checkUserVoted?questionID=" + questionID + "&userID=" + userID
					)
					.then(function (response) {
						if(typeof response.data[0] == 'undefined'){
							//&& typeof response[0].userID !== 'undefined' 

							$http.get("/insertQuestionLike?questionID=" + questionID + "&userID=" + userID
								+ "&pollLike=" + likeorDisLike)
								.then(function (response) {
									console.log("insert into questionlike table");
							},function (response) {
							    	console.log("Error");
							});

								$route.reload();
						}else {			

							$http.get("/UpdateVote?questionID=" + questionID + "&userID=" + userID
								+ "&pollLike=" + likeorDisLike)
								.then(function (response) {
									console.log("insert into questionlike table");
							},function (response) {
							    	console.log("Error");
							});
								$route.reload();
								$scope.errorMessageLike = "Already voted. Updating your like/dislike";

						}
					},function (response) {
				    	console.log("Error");
				});
			}
		}else{
			$scope.errorMessageLike = "Please log In to like/dislike";
		}
	}

	$scope.isClosed = null; 

	$http.get('/checkQuestionDate?questionID=' + questionID)
		.then(function (response) {
			if (response.data[0].endDate == null) {
				return false; 
			} else {
				var date = new Date();
				var finalCloseDate = new Date(response.data[0].endDate);
				if (date < finalCloseDate) { return false; 
				} else { return true; }
			}
		}, function (res) {
			console.log("Error in isQuestionClosed");
		}).then(function(response){
			$scope.isClosed = response; 
		}
	);

	$scope.hideInputFields = function(){
		
		var closed = $scope.isClosed; 
		var loggedIn; 
    	if($cookies.get('userID') != -1 && $cookies.get('userID') != undefined){
    		loggedIn = true; 
    	} else {
    		loggedIn = false; 
    	}
    	// console.log("loggedIn variable "+ loggedIn);
    	// console.log("closed variable "+ closed);
    	var show = loggedIn && !closed; 
    	return show; 
    }


	function validate(input){
		if(input == null || input == ""){
			//alert("error"); 
			return false; 
		}
		return true; // success
	}

	$scope.createCommentPic = function() {	

		var imageURL = document.querySelector("#pictureURL").value;
		var image = document.querySelector("#comment-pic");
		//check if it's a image url
		if(checkURL(imageURL)){		
			image.onerror = function() {
				this.onerror = function(){
					return;
				}
				image.src = "";
				image.style.display = "none";
				$scope.errorMessageCommentPic = "Cannot load image. Please retry";
			}
			$scope.errorMessageCommentPic = ""
			image.src = imageURL;

		}else{ //if not, hide
			$scope.errorMessageCommentPic = "Please use correct image url";
			image.src = "";
			image.style.display = "none";
		}
	}

	$scope.editChange = function(pollList, tagList){

		var data = {
			id: 0,
			questionID: questionID,
			editTitle:  $scope.editTitle,
			editDescription: $scope.editDescription,
			pollList: pollList,
			tagList: tagList,
			newImage: $scope.editImage
		};

		$http.post('/editPoll', data)
		.then(
			function(response){
				$route.reload();
			},
			function(error){
				console.log(error)
			});				
	}

	$scope.deletePicture = function(comment) {	
	
		$http.get("/deleteCommentImage?questionCommentID=" + comment.questionCommentID)
			.then(function (response) {
				var response = response.data;
				$scope.deleteProfilePicture = "Picture deleted!";
			}, function (response) {
				console.log("Error");
		});
		$route.reload();
		
	}

	$scope.searchClickedTag = function(tag){

		$cookies.put("tagQuery", tag.tagStr);
		$cookies.put("fromClickTagFromOtherPage", true);
		
		$location.path('/' );
    }

	function checkURL(url) {
		return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
	}	
}]);