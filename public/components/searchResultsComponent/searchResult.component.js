angular.module('app')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('hotelSearchResultsParentComponent', {
                template: "<hotel-search-results-parent-component></hotel-search-results-parent-component>"
            })
            .state('trainSearchResults', {
                template: "<train-search-results-component></train-search-results-component>"
            })
            .state('flightSearchResults', {
                template: "<flight-search-results-component></flight-search-results-component>"
            })
    })
    .component('searchResult', {
        controller: searchResultComponent,
        controllerAs: 'searchResultComponent',
        templateUrl: 'public/components/searchResultsComponent/searchResult.view.html',
        bindings: {
            $router: '<'
        }
    });

function searchResultComponent(mainService, $state, _) {
    var searchResultComponent = this;
    var childServices;
    var service;

    searchResultComponent.travelPlan = mainService.getTravelPlanObjectInitial();
    var sequence = [];
    console.log(searchResultComponent.travelPlan);
    _.map(searchResultComponent.travelPlan, function (travelPlan) {
        _.mapObject(travelPlan.childServices, function (val, key) {
            console.log("value", val);
            if (angular.isArray(val)) {
                console.log("Array");
                _.map(val, function (data) {
                    var childServiceInSequence = {};
                    childServiceInSequence.nodeType = travelPlan.type;
                    childServiceInSequence.childServicesType = key;
                    childServiceInSequence.data = data;
                    sequence.push(childServiceInSequence);
                });
            } else if (angular.isObject(val)) {
                var childServiceInSequence = {};
                childServiceInSequence.nodeType = travelPlan.type;
                childServiceInSequence.childServicesType = key;
                childServiceInSequence.data = val;
                sequence.push(childServiceInSequence);
            }
        });
    });

    searchResultComponent.iterator = function* () {
        for (var i = 0; i < sequence.length; i++) {
            var prev = yield sequence[i];
            if (prev && i === 0) {
                console.log("Negating by 1");
                i = i - 1;
            }
            else if (prev) {
                console.log("Negating by 2");
                i = i - 2;
            }
        }
    }


    // console.log('sequence',sequence);
    // searchResultComponent.currentObjInSequence = searchResultComponent.next();
    var travelPlanIterator = searchResultComponent.iterator();
    searchResultComponent.onNext = function () {
        console.log('Inside onNext');
        searchResultComponent.currentObjInSequence = travelPlanIterator.next();
        console.log(searchResultComponent.currentObjInSequence);
        if(!searchResultComponent.currentObjInSequence.done) {
            switch (searchResultComponent.currentObjInSequence.value.childServicesType) {
            case 'stay':
                $state.go('hotelSearchResultsParentComponent', null, { reload: true });
                break;
            case 'flight':
                $state.go('flightSearchResults', null, { reload: true });
                break;
            case 'localTravel':
                $state.go('flightSearchResults', null, { reload: true });
                break;
        }

        }
        else {
            searchResultComponent.$router.navigate(['ItineraryComponent']);
        }

    };

    searchResultComponent.onPrev = function () {
        searchResultComponent.currentObjInSequence = travelPlanIterator.next(true);
        console.log(searchResultComponent.currentObjInSequence);
        switch (searchResultComponent.currentObjInSequence.value.childServicesType) {
            case 'stay':
                $state.go('hotelSearchResultsParentComponent', null, { reload: true });
                break;
            case 'flight':
                $state.go('flightSearchResults', null, { reload: true });
                break;
            case 'localTravel':
                $state.go('flightSearchResults', null, { reload: true });
                break;
        }
    };


}