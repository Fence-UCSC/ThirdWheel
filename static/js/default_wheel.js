// This is the js for the default/wheel.html view.

var theWheel;
var clicked_segment_id;
var clickedSegment;
var AugustValera = true;

var app = function() {

    var self = {};
    var earliest_time = '1970-01-01 00:00:00';
    var refresh_ms = 500;

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
                    console.log('  Updated wheel data');
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
                        self.vue.suggestions[idx].creator_name = updated.creator_name;
                        self.vue.suggestions[idx].update_time = updated.description;
                        self.vue.suggestions[idx].point_value = updated.point_value;
                        if(user_id) self.vue.suggestions[idx].user_points = updated.user_points;
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
                if (self.vue.wheel.phase == 'create') {
                    buildWheelfromList(false);
                } else {
                    if (AugustValera) {
                        buildWheelfromList(true);
                        chosen_one_sugg_id = self.vue.wheel.chosen_one;
                        predeterminedSpin();
                        AugustValera = false;
                    }
                }
                self.sort_suggestions();
                if(! self.vue.free_points_init) self.free_pointers();
            }
        );
    };

    self.sort_suggestions = function() {
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
    }

    self.free_pointers = function() {
        var points = total_points;
        self.vue.suggestions.forEach(function(elem) {
            points -= Math.abs(elem.user_points);
        });
        self.vue.free_points = points;
    }

    self.add_suggestion = function() {
        console.log('add_suggestion(' + wheel_id + ', '
            + self.vue.adder_name + ', ' + self.vue.adder_description + ')');
        if(self.vue.wheel.phase == "view") {
            console.log('  Error: in view phase');
        } else if (self.vue.adder_name.length == 0) {
            console.log('  Error: no title given');
            $("#adder-name-warn").show();
        } else {
            $.post(add_suggestion_url,
                {
                    wheel: wheel_id,
                    name: self.vue.adder_name,
                    description: self.vue.adder_description
                }, function (data) {
                    self.vue.suggestions.push(data);
                    self.adder_button();
                }
            );
        }
    };

    self.adder_button = function() {
        console.log('adder_button()');
        $(".add-toggle").toggle();
        self.vue.adder_name = '';
        self.vue.adder_description = '';
    };

    self.vote = function(id, points) {
        console.log('vote(' + id + ', ' + points + ')');
        var idx = self.vue.suggestions.findIndex(
            function(elem){ return elem.id == id }
        );
        if(self.vue.wheel.phase == "view") {
            console.log('  Error: in view phase');
        } else if(! id || id <= 0 || ! points) {
            console.log('  Error: no title given');
        } else if(self.vue.free_points < 1
            && ((self.vue.suggestions[idx].user_points * points) > 0)) {
            console.log('  Error: vote would exceed free point allowance');
        } else {
                $.post(vote_url,
                    {
                        suggestion: id,
                        points_to_allocate: points
                    }, function (data) {
                        if(! data.message) {
                            var idx = self.vue.suggestions.findIndex(
                                function (elem) {
                                    return elem.id == id
                                }
                            );
                            self.vue.suggestions[idx].user_points += points;
                            self.vue.suggestions[idx].point_value += points;
                            self.vue.free_points = data.points_left_for_user;
                            self.sort_suggestions();
                        }
                    }
                );
        }
    };









    self.choose_winner = function() {
        console.log('choose winner');
        ttlpts = 0;
        self.vue.suggestions.forEach(function(e) {
            if(e.point_value > 0) {
                ttlpts += e.point_value;
            }
        });
        rnd = Math.floor(Math.random() * (ttlpts));
        self.vue.suggestions.forEach(function loop(e) {
            if(e.point_value > 0) {
                ttlpts += e.point_value;
                if (rnd < ttlpts) {
                    self.vue.wheel.chosen_one = e.id;
                    $.post(choose_winner_url,
                        {
                            wheel: self.vue.wheel.id,
                            chosen_one: self.vue.wheel.chosen_one
                        }, function (data) {
                            console.log("  return");
                            self.vue.wheel = data;
                        }
                    );
                    loop.stop = true;
                }
            }
        });
    };












    self.goto_profile_url = function(creator_id){
        var url = prefix_profile_url;
        url += '/' + creator_id;
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
            adder_description: null,
            free_points: total_points,
            free_points_init: false
        },
        methods: {
            get_wheel: self.get_wheel,
            get_suggestions: self.get_suggestions,
            add_suggestion: self.add_suggestion,
            choose_winner: self.choose_winner,
            adder_button: self.adder_button,
            goto_profile_url: self.goto_profile_url,
            vote: self.vote,
            sort_suggestions: self.sort_suggestions,
            free_pointers: self.free_pointers
        }
    });











        var TotalPoints = 0;
        var chosen_angle;
        //get from api
        var chosen_one_sugg_id;

        //TESTPopulateSuggestionsList();
        //buildWheelfromList(true);
        //predeterminedSpin();

    function adjustPointValueforSegment(Id, pointsadded) {
        SuggestionsList.forEach(function(e) {
            if (e[0] == Id) {
                e[5] += pointsadded;
                buildWheelfromList(false);
            }
        });
    }


        function buildWheelfromList(isViewPhase) {
        TotalPoints = 0;
        iter = 0;
        self.vue.suggestions.forEach(function(e) {
            if (e.point_value > 0) {
                TotalPoints += e.point_value;
            }
        });
        if (TotalPoints <= 0) {
            return;
        }
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

    function reDrawClear() {
        theWheel.segments.forEach(function(e) {
            if (e) {
                e.fillStyle = '#f8f8f8';
            }
        });
    }

    function reDrawSelected() {
        if (clickedSegment)
        {
            reDrawClear();
            clickedSegment.fillStyle = 'gray';
            clicked_segment_id =
            theWheel.draw();
        }
    }

    var canvas = document.getElementById('mycanvas');
    canvas.onclick = function (e)
    {
        clickedSegment = theWheel.getSegmentAt(e.clientX, e.clientY);
        if (clickedSegment)
        {
            reDrawClear();
            clickedSegment.fillStyle = 'gray';
            clicked_segment_id =
            theWheel.draw();
        }
    };

    function chooseWinner() {

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