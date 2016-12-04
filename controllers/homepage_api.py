# These are the controllers for your ajax api.

def get_wheels():
    """This controller is used to get the posts.  Follow what we did in lecture 10, to ensure
    that the first time, we get 4 posts max, and each time the "load more" button is pressed,
    we load at most 4 more posts."""
    # Implement me!
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0

    logged_in = auth.user_id is not None
    wheels = []
    has_more = False
    current_user = ''
    if auth.user_id is not None:
        current_user = auth.user.email

    rows = db().select(orderby=~db.wheel.id, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            if r.chosen_one == -1:
                chosen_one_string = 'N/A'
            else:
                chosen_one_string = 'placeholder'
            creator_name = db(db.auth_user.id == r.creator_id).select().first().email
            t = dict(
                id=r.id,
                creator_id=r.creator_id,
                creator_name=creator_name,
                name=r.name,
                description=r.description,
                creation_time=r.creation_time,
                phase=r.phase,
                chosen_one=chosen_one_string,
            )
            wheels.append(t)
        else:
            has_more = True

    return response.json(dict(
        wheels=wheels,
        logged_in=logged_in,
        has_more=has_more,
        current_user=current_user,
    ))


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_wheel():
    """Here you get a new post and add it.  Return what you want."""
    namex = request.vars.name
    if namex == '':
        response.status=400
        return response.json({"error": "name must not be null"})
    t_id = db.wheel.insert(
        creator_id=auth.user_id,
        name=request.vars.name,
        description=request.vars.description,
    )
    t = db.wheel(t_id)
    return response.json(dict(wheel=t))

@auth.requires_signature()
def edit_wheel():
    wheel_id = request.vars.wheel_id if request.vars.wheel_id is not None else 0
    wheel = db(db.wheel.id == wheel_id).select().first()
    wheel.name = request.vars.name
    wheel.update_record()
    return response.json(dict(wheel=wheel))

@auth.requires_signature()
def del_wheel():
    """Used to delete a post."""
    # Implement me!
    db(db.wheel.id == request.vars.wheel_id).delete()
    return "ok"
