// This is the js for the default/wheel.html view.

var app = function() {

    var self = {};
    var earliest_time = '1970-01-01 00:00:00';

    Vue.config.silent = false; // show all warnings

    self.get_wheel = function () {
        console.log('get_wheel()');
        $.post(get_wheel_url,
            {
                wheel: wheel_id,
                newer_than: (self.vue.wheel ? self.vue.wheel.edited_on : earliest_time)
            }, function (data) {
                if(! data.message) {
                    console.log('wheel data updated')
                    self.vue.wheel = data;
                }
                self.get_suggestions();
            }
        );
    };

    self.get_suggestions = function() {
        console.log('get_suggestions()');
        $.post(get_suggestions_url,
            {
                wheel: wheel_id,
                newer_than: earliest_time
            }, function (data) {
                for(var updated in data) {
                    var suggestion = self.vue.suggestions.find(
                        function(elem){ return elem.id == updated.id }
                        );
                    if(suggestion) {
                        console.log("Updated suggestion " + suggestion.id)
                        suggestion.name = updated.name;
                        suggestion.description = updated.description;
                        suggestion.update_time = updated.description;
                        suggestion.point_value = updated.point_value;
                    } else {
                        console.log("Added suggestion " + suggestion.id);
                        self.vue.suggestions.append(updated);
                    }
                }
            });
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            wheel: null,
            suggestions: [],
            suggestions_updated: earliest_time,
        },
        methods: {
            get_wheel: self.get_wheel,
            get_suggestions: self.get_suggestions
        }

    });

    self.get_wheel();
    $('#vue-div').show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});