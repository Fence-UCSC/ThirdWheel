// This is the js for the default/wheel.html view.

var theWheel;

var app = function() {

    var self = {};
    var earliest_time = '1970-01-01 00:00:00';
    var refresh_ms = 5000;

    Vue.config.silent = false; // show all warnings

    self.get_wheel = function () {
        var newer_than = (self.vue.wheel ? self.vue.wheel.edited_time.toString() : earliest_time);
        console.log('get_wheel(' + wheel_id + " ," + newer_than + ')');
        $.post(get_wheel_url,
            {
                wheel: wheel_id,
                newer_than: newer_than
            }, function (data) {
                if(! data.message) {
                    console.log('  Wheel data updated');
                    self.vue.wheel = data;
                }
                self.get_suggestions();
                setTimeout(function() { self.vue.get_wheel() }, refresh_ms);
            }
        );
    };

    self.get_suggestions = function() {
        console.log('get_suggestions(' + wheel_id + ', ' + self.vue.suggestions_updated + ')');
        $.post(get_suggestions_url,
            {
                wheel: wheel_id,
                newer_than: self.vue.suggestions_updated
            }, function (data) {
                var suggestions_time = Date.parse(self.vue.suggestions_updated);
                data.forEach(function(updated) {
                    var idx = self.vue.suggestions.findIndex(
                        function(elem){ return elem.id == updated.id }
                        );
                    if(idx != -1) {
                        console.log("  Updated suggestion " + self.vue.suggestions[idx].id)
                        self.vue.suggestions[idx].name = updated.name;
                        self.vue.suggestions[idx].description = updated.description;
                        self.vue.suggestions[idx].update_time = updated.description;
                        self.vue.suggestions[idx].point_value = updated.point_value;
                    } else {
                        console.log("  Added suggestion " + updated.id);
                        self.vue.suggestions.push(updated);
                    }
                    var updated_time = Date.parse(updated.update_time);
                    if(updated_time > suggestions_time) {
                        console.log("  Set suggestion " + updated.id + " time " + updated.update_time + " to latest.");
                        suggestions_time = updated_time + 1;
                        self.vue.suggestions_updated = updated.update_time;
                    }
                });
                self.vue.suggestions.sort(function(a, b) {
                    if(a.point_value == b.point_value) {
                        if(a.name < b.name) {
                            return -1;
                        } else if(a.name == b.name) {
                            return 0;
                        } else return 1;
                    } else if(a.point_value < b.point_value) {
                        return 1;
                    } else return -1;
                });
                buildWheelfromList(true);
                predeterminedSpin();
            }
        );
    };

    self.add_suggestion = function() {
        console.log('add_suggestion(' + wheel_id + ', '
                + self.vue.adder_name + ', ' + self.vue.adder_description + ')');
        if(self.vue.adder_name.length) {
            $.post(add_suggestion_url,
                {
                    wheel: wheel_id,
                    name: self.vue.adder_name,
                    description: self.vue.adder_description
                }, function () {
                    self.adder_button();
                }
            );
        } else {
            console.log('  No title given');
            $("#adder-name-warn").show();
        }
    };

    self.adder_button = function() {
        console.log('adder_button()');
        $(".add-toggle").toggle();
        self.vue.adder_name = '';
        self.vue.adder_description = '';
    };

    self.goto_profile_url = function(creator_id){
        var url = '../profile/';
        url += creator_id;
        window.location.href = url;
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            wheel: null,
            suggestions: [],
            suggestions_updated: earliest_time,
            adder_name: null,
            adder_description: null
        },
        methods: {
            get_wheel: self.get_wheel,
            get_suggestions: self.get_suggestions,
            add_suggestion: self.add_suggestion,
            adder_button: self.adder_button,
            goto_profile_url: self.goto_profile_url,
        }
    });












    var SuggestionsList = new Array();
        var TotalPoints = 0;
        //var theWheel;
        var chosen_angle;
        //get from api
        var chosen_one_sugg_id;

        chosen_one_sugg_id = 1;
        //TESTPopulateSuggestionsList();
        //buildWheelfromList(true);
        //predeterminedSpin();

    function TESTPopulateSuggestionsList()
    {
        SuggestionsList.push([1, "bob1", "1tunak tunak1", "cool dance moves", null, 5]);
        SuggestionsList.push([2, "bob2", "2tunak tunak2", "cool dance moves2", null, 5]);
        SuggestionsList.push([3, "bob3", "3tunak tunak3", "cool dance moves3", null, 3]);
        SuggestionsList.push([4, "bob4", "4tunak tunak4", "cool dance moves4", null, 2]);
        SuggestionsList.push([5, "bob5", "5tunak tunak5", "cool dance moves5", null, 0]);
        SuggestionsList.push([6, "bob6", "6tunak tunak6", "cool dance moves6", null, -10]);
        TotalPoints = 15;
    }

    function addtoSuggestionsList(Id, creator, name, description, timestamps, pointvalue)
    {
        var Suggestion = [Id, creator, name, description, timestamps, pointvalue];
        SuggestionsList.push(Suggestion);
        buildWheelfromList(false);
    }

    function adjustPointValueforSegment(Id, pointsadded) {
        SuggestionsList.forEach(function(e) {
            if (e[0] == Id) {
                e[5] += pointsadded;
                buildWheelfromList(false);
            }
        });
    }


        function buildWheelfromList(isViewPhase) {
         theWheel = new Winwheel({
             'canvasId'    : 'mycanvas',
             'lineWidth'   : 1,
             'animation'   :
                     {
                         'type'     : 'spinToStop',
                         'duration' : 1,
                         'spins'    : 2,
                         'callbackFinished' : 'afterSpin()'
                     }
        });
        TotalPoints = 0;
        iter = 0;
        self.vue.suggestions.forEach(function(e) {
            if (e.point_value > 0) {
                TotalPoints += e.point_value;
            }
        });
        self.vue.suggestions.forEach(function(e) {
            console.log('CHANDLER: ');
                console.log(e.point_value);
            if (e.point_value > 0) {
                segSize = 360 * (e.point_value / TotalPoints);
                addSegmenttoWheel(e.name, segSize);
                tmpEndSeg = iter + segSize;
                if (isViewPhase == true && chosen_one_sugg_id == e.id) {
                    chosen_angle = Math.random() * ((tmpEndSeg-1) - (iter+1)) + (iter+1);
                    console.log("e[0]:");
                    console.log(e.point_value);
                    console.log("iter");
                    console.log(iter);
                }
                iter = tmpEndSeg;
            }
        });
        //This addsegment is to ensure no gray space, creates 0 sized slice
        theWheel.addSegment();
        theWheel.draw();
    }

    function addSegmenttoWheel(text, size)
    {
        var newSegment = theWheel.addSegment();
        newSegment.text = text;
        newSegment.fillStyle = "#f8f8f8";
        newSegment.size = size;
    }

    function predeterminedSpin() {
        theWheel.animation.stopAngle = chosen_angle;
        console.log("chosen_angle:");
        console.log(chosen_angle);
        theWheel.startAnimation();
    }

    function afterSpin() {
        var winner = theWheel.getIndicatedSegmentNumber();
        for (var x = 1; x < theWheel.segments.length; x ++)
        {
            theWheel.segments[x].fillStyle = 'gray';
            console.log(theWheel.segments[x].text);
        }
        theWheel.segments[winner].fillStyle = '#f8f8f8';
        console.log("winner seg number:");
        console.log(winner);
        theWheel.draw();
    }


    self.vue.get_wheel();
    $('#vue-div').show();

    return self;
};


    function afterSpin() {
        var winner = theWheel.getIndicatedSegmentNumber();
        for (var x = 1; x < theWheel.segments.length; x ++)
        {
            theWheel.segments[x].fillStyle = 'gray';
            console.log(theWheel.segments[x].text);
        }
        theWheel.segments[winner].fillStyle = '#f8f8f8';
        console.log("winner seg number:");
        console.log(winner);
        theWheel.draw();
    }


var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});