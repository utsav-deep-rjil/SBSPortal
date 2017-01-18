var app = angular.module('sbsPortal', []);


app.controller('sbsCtrl', function($scope,$http) {
	$scope.offset = 0;
	$scope.maxPages = 10;
	$scope.prevResult = null;
	$scope.prevTab = null;
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
			$scope.prevResult = $scope.result;
			$scope.result = response.data;
			$scope.error=undefined;
			$scope.loading = false;
			$scope.totalPages = Math.ceil($scope.result.totalResults/$scope.pageSize);
			$scope.getPages();
			return $scope.result;
		})
		.catch(function(error){
			$scope.error=error;
		});
		
	}
	$scope.sort = function(keyname){
		if(keyname==='accountType'){
			return;
		}
        $scope.sortKey = keyname;   // set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; // if true make it false and vice
											// versa
        $scope.sortDirection = $scope.reverse?"DESC":"ASC";
		$scope.getResult();
    }
	$scope.setActive = function(active){
		$scope.prevTab = $scope.activeTab;
		$scope.activeTab = active;
		$scope.sortKey = undefined;
		$scope.sortDirection = "ASC";
		$scope.offset = 0;
		$scope.getResult();
	}
	$scope.setFilter = function(filter){
		$scope.cellFilter = filter;
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
		case "plaintextVolumes":
			$scope.optional=[
			    "project_id = "+data.project_id,
				"encrypted = false"
			];
			$scope.setActive('volume');
			return true;
		case "withMultiAttach":
			$scope.optional=[
			    "project_id = "+data.project_id,
				"multiattach = true"
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
		case "withMultiAttach":
		case "totalSnapshots":
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
		$scope.filter = ""
		$scope.getResult();
	}
	
	$scope.back = function(){
		$scope.activeTab = $scope.prevTab;
		$scope.result = $scope.prevResult;
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
