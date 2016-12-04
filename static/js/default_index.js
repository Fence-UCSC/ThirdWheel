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
        //window.location.href = 'wheel';
        if(self.vue.current_user != '') {
           self.vue.is_adding_wheel = !self.vue.is_adding_wheel;
        }
    };

    self.cancel_add_button = function () {
        // The button to add a post has been pressed.
        if(self.vue.current_user != '') {
            self.vue.is_adding_wheel = !self.vue.is_adding_wheel;
            self.vue.form_name = '';
            self.vue.form_description = '';
        }
    };
    //-----------------------add a wheel-----------------------------



    //-----------------------edit a wheel----------------------------
    function get_edit_urls(wheel_id) {
        var pp = {
            wheel: wheel_id,
        };
        return edit_wheel_url + "?" + $.param(pp);
    }

    self.edit_wheel_button = function (wheel_id, name, description) {
        // The button to edit a post has been pressed.
        self.vue.form_name = name;
        self.vue.current_wheel_id = wheel_id;
        self.vue.form_description = description;
        if(self.vue.current_user != '') {
            self.vue.is_editing_wheel = !self.vue.is_editing_wheel;
        }
    };

    self.cancel_edit_button = function (wheel_id) {
        // The button to edit a post has been pressed.
        self.vue.current_wheel_id = wheel_id;
        if(self.vue.current_user != '') {
            self.vue.is_editing_wheel = !self.vue.is_editing_wheel;
            self.vue.form_name = '';
            self.vue.form_description = '';
        }
    };

    self.edit_wheel = function(wheel_id) {
        $.post(edit_wheel_url,
            {
                wheel: wheel_id,
                name: self.vue.form_name,
                description: self.vue.form_description,
            },
            function (data) {
                $.web2py.enableElement($(".wheel-edit-button"));
                //self.vue.posts.unshift(data.post);
                self.get_wheels();
                self.vue.form_name = '';
                self.vue.form_description = '';
            });
        self.vue.is_editing_wheel = false;
    };
    //-----------------------edit a wheel----------------------------


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
        self.get_wheels();
    };
    //-----------------------delete a wheel--------------------------

    self.goto_wheel_page = function(){

    };


    self.goto_wheel_url = function(wheel_id){
        var url = 'wheel/';
        url += wheel_id;
        window.location.href = url;
    };

    self.goto_profile_url = function(creator_id){
        var url = 'profile/';
        url += creator_id;
        window.location.href = url;
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
            is_editing_wheel: false,
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
            edit_wheel_button: self.edit_wheel_button,
            cancel_edit_button: self.cancel_edit_button,
            edit_wheel: self.edit_wheel,
            delete_wheel: self.delete_wheel,
            goto_wheel_url: self.goto_wheel_url,
            goto_profile_url: self.goto_profile_url,
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
