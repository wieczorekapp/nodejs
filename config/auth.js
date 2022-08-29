module.exports = {
    ensureAuthenticated : function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        
        req.flash('error_msg' , 'Zaloguj się, by uzyskać dostęp do tych zasobów');
        res.redirect('/users/login');
    },

    ensureNotAuthenticated : function(req, res, next) {
        if(!req.isAuthenticated()) {
            return next();
        }
        
        res.redirect('/dashboard');
    }

}