"use strict";
module.exports = {
    get_index: function (request, response) {
        response.render('home', { user: request.user });
    }
};