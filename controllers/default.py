# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    return dict(message=T('Welcome to web2py!'))


def wheel():
    form = None
    args = request.args(0)
    wheelr = None
    total_points = 10

    # Handle argument (page type)
    if args is None:
        redirect(URL(args="new"))
    elif args == "new":
        if auth.user_id is None:
            session.flash = T('You must be logged in to create a wheel')
            redirect(URL('user','login',vars={'_next':URL('default','wheel',args='new')}))
        form = SQLFORM(db.wheel)
        form.add_button(T('Cancel'),URL('default','index'),_class="btn btn-warning")
    else:
        try:
            wheelr = db.wheel(args)
        except ValueError:
            session.flash = T('Invalid wheel id ' + args)
            redirect(URL('default','index'))
        if wheelr is None:
            session.flash = T('Wheel #' + args + ' does not exist')
            redirect(URL('default','index'))
        if int(wheelr.creator_id) == auth.user_id:
            form = SQLFORM(db.wheel, wheelr, deletable=True, showid=False)
            form.add_button(T('Cancel'),URL('default','wheel',args=args),_class="btn btn-warning")

    # Form acceptance
    if form and form.process().accepted:
        wheeld=db.wheel(form.vars.id)
        if args != "new":
            wheeld.update_record(edited_time=datetime.datetime.now())
        else:
            wheeld.update_record(edited_time=wheeld.creation_time)

        session.flash = T("Wheel updated")
        redirect(URL('default','wheel',args=form.vars.id))

    return dict(form=form,args=args,wheel=wheelr,total_points=total_points)
    
def profile():
    if len(request.args) > 0:
        user_id=request.args(0)
        user=db.auth_user(user_id)
        name=user.first_name+' '+user.last_name
        wheels=db(db.wheel.creator_id == user_id).select(orderby=~db.wheel.creation_time)
        suggestions=db(db.suggestion.creator_id == user_id).select(orderby=~db.suggestion.creation_time)
        bio=db.auth_user(user_id).bio
        return dict(name=name, wheels=wheels, suggestions=suggestions, bio=bio)
    else:
        user_list=db().select(db.auth_user.ALL)
        return dict(user_list=user_list)

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


