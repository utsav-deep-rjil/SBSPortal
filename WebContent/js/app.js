var app = angular.module('sbsPortal', []);


app.controller('sbsCtrl', function($scope,$http) {
	$scope.offset = 0;
	$scope.maxPages = 10;
	$scope.loading = false;
	$scope.pageSize = 10;
	$scope.dataFilter = 'project_id';
	
	if($scope.sortDirection==undefined){
		$scope.sortDirection="ASC";
	}
	$scope.getResult = function(){
		$scope.loading = true;
		$http.get("http://localhost:8080/SBSPortalAPIs/sbs",{
			params:{
				queryType:$scope.activeTab,
				search:$scope.search,
				sortBy:$scope.sortKey,
				sortDirection:$scope.sortDirection,
				offset:$scope.offset,
				limit:$scope.pageSize,
				filter:$scope.dataFilter,
				optional:$scope.optional
			}
		})
		.then(function(response){
			$scope.result = response.data;
			$scope.error=undefined;
			$scope.loading = false;
			$scope.totalPages = Math.ceil($scope.result.totalResults/$scope.pageSize);
			$scope.getPages();
			$scope.filterKeys = $scope.result.keys;
			if($scope.activeTab == 'accountSummary'){
				$scope.filterKeys = []
				for(var key of $scope.result.keys){
					if(key != 'accountType'){
						$scope.filterKeys.push(key);
					}
				}
			}
			
			return $scope.result;
		})
		.catch(function(error){
			$scope.loading = false;
			alert('An unexpected error occured. Please reload the page...');
			$scope.error=error;
		});
		
	}
	$scope.sort = function(keyname){
		if(keyname==='accountType'){
			return;
		}
		if(keyname === $scope.sortKey){
	        $scope.reverse = !$scope.reverse; // if true make it false and
												// vice
			// versa
		}
		else{
			$scope.reverse = false;
		}
        $scope.sortKey = keyname;   // set the sortKey to the param passed
        $scope.sortDirection = $scope.reverse?"DESC":"ASC";
		$scope.getResult();
    }
	$scope.setActive = function(active){
		$scope.activeTab = active;
		$scope.sortKey = undefined;
		$scope.sortDirection = "ASC";
		$scope.offset = 0;
		$scope.currPage = 1;
		$scope.getResult();
	}

	$scope.setOptional = function(data,key){
		if($scope.activeTab !== 'accountSummary'){
			return false;
		}
		switch(key){
		case "totalVolumes":
			$scope.optional = ["project_id = "+data.project_id];
			$scope.setActive('volume');
			return true;
		case "encryptedVolumes":
			$scope.optional=[
				"project_id = "+data.project_id,
				"encrypted = true"
			];
			$scope.setActive('volume');
			return true;
		case "bootableVolumes":
			$scope.optional=[
				"project_id = "+data.project_id,
				"bootable = true"
			];
			$scope.setActive('volume');
			return true;
		case "storageVolumes":
			$scope.optional=[
				"project_id = "+data.project_id,
				"bootable = false"
			];
			$scope.setActive('volume');
			return true;
		case "plaintextVolumes":
			$scope.optional=[
			    "project_id = "+data.project_id,
				"encrypted = false"
			];
			$scope.setActive('volume');
			return true;
		case "stdVolumes":
			$scope.optional=[
 			    "project_id = "+data.project_id,
 				"volume_type_id = 1 or v.volume_type_id is NULL"
 			];
			$scope.setActive('volume');
			return true;
		case "ssdVolumes":
			$scope.optional=[
 			    "project_id = "+data.project_id,
 				"volume_type_id = 2"
 			];
			$scope.setActive('volume');
			return true;
		case "totalSnapshots":
			$scope.optional=[
 			    "project_id = "+data.project_id
 			];
			$scope.setActive('snapshot');
		default:
			return false;
		}
	}
	$scope.isClickable = function(key){
		if($scope.activeTab !== 'accountSummary'){
			return false;
		}
		switch(key){
		case "totalVolumes":
		case "encryptedVolumes":
		case "bootableVolumes":
		case "plaintextVolumes":
		case "totalSnapshots":
		case "stdVolumes":
		case "ssdVolumes":
		case "storageVolumes":
			return true;
		default:
			return false;
		}
	}
	
	$scope.getPages = function(){
		var start = Math.max(1 , $scope.currPage - Math.floor($scope.maxPages/2));
		var end =  Math.min(start + $scope.maxPages - 1,$scope.totalPages);
		$scope.pages=[]
		for(var i=start;i<=end;i++)
			$scope.pages.push(i);
		
		
	}
	
	$scope.clearFilters = function(){
		$scope.optional=null;
		$scope.search = "";
		$scope.filter = "";
		$scope.pageSize = 10;
		$scope.getResult();
	}
	
	
	$scope.newPage = function(page){
		$scope.currPage=page;
		$scope.offset=($scope.currPage-1)*$scope.pageSize;
		$scope.getResult();
	}
	
});


app.filter('prettyJSON', function () {
    function prettyPrintJson(json) {
      return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
    }
    return prettyPrintJson;
});
