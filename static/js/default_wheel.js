// This is the js for the default/wheel.html view.

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
                    console.log('  Wheel data updated')
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
                var recentmost = 0;
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
                    if(updated.update_time > self.vue.suggestions_updated)
                        self.vue.suggestions_updated = updated.update_time;
                });
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
            adder_button: self.adder_button
        }
    });

    self.vue.get_wheel();
    $('#vue-div').show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});