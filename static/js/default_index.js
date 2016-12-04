// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    //-----------------------get wheels------------------------------
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_wheels_urls(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return get_wheels_url + "?" + $.param(pp);
    }

    self.get_wheels = function () {
        $.getJSON(get_wheels_urls(0, 4), function (data) {
            self.vue.wheels = data.wheels;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.current_user = data.current_user;
        })
    };

    self.get_more = function () {
        var num_wheels = self.vue.wheels.length;
        $.getJSON(get_wheels_urls(num_wheels, num_wheels + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.wheels, data.wheels);
        });
    };
    //-----------------------get wheels------------------------------


    //-----------------------add a wheel-----------------------------
    self.add_wheel = function () {
        // The submit button to add a track has been added.
        $.post(add_wheel_url,
            {
                name: self.vue.form_name,
                description: self.vue.form_description,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.wheels.unshift(data.wheel);
                self.get_wheels();
                self.vue.form_name = '';
            });
    };

    self.add_wheel_button = function () {
        // The button to add a post has been pressed.
        if(self.vue.current_user != '') {
            self.vue.is_adding_wheel = !self.vue.is_adding_wheel;
        }
    };

    self.cancel_add_button = function () {
        // The button to add a post has been pressed.
        if(self.vue.current_user != '') {
            self.vue.is_adding_wheel = !self.vue.is_adding_wheel;
            self.vue.form_name = '';
        }
    };
    //-----------------------add a wheel-----------------------------


    //-----------------------delete a wheel--------------------------
    self.delete_wheel = function(wheel_id) {
        $.post(del_wheel_url,
            {
                wheel_id: wheel_id
            },
            function () {
                var idx = null;
                for (var i = 0; i < self.vue.wheels.length; i++) {
                    if (self.vue.wheels[i].id === wheel_id) {
                        // If I set this to i, it won't work, as the if below will
                        // return false for items in first position.
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                    self.vue.wheels.splice(idx - 1, 1);
                }
            }
        )
    };
    //-----------------------delete a wheel--------------------------

    self.goto_wheel_page = function(){

    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            wheels: [],
            has_more: false,
            is_adding_wheel: false,
            logged_in: false,
            current_user: null,
            current_wheel_id: null,
            form_creator_id: null,
            form_name: null,
            form_description: null,
            form_created: null,
            phase: null,
            chosen_one: null
        },
        methods: {
            get_more: self.get_more,
            add_wheel_button: self.add_wheel_button,
            cancel_add_button: self.cancel_add_button,
            add_wheel: self.add_wheel,
            delete_wheel: self.delete_wheel,
        }

    });

    self.get_wheels();
    $("#vue-div").show();


    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
