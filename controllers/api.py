import datetime

# Parameters: [wheel_count=<integer>]
# wheel_count is the index of the last wheel retrieved from the total list
# retrieves 10 wheels at a time
def get_wheel_list():
    wheel_count=int(request.vars.get('wheel_count')) if 'wheel_count' in request.vars else 0
    next_count=wheel_count+10
    wheels=db().select(db.wheel.ALL, orderby=~db.wheel.creation_time, limitby=(wheel_count,next_count))
    has_more_wheels=True
    if db(db.wheel).count() <= next_count:
        has_more_wheels=False
    return response.json({"wheels":wheels, "has_more_wheels":has_more_wheels, "next_count":next_count})
    
# Parameters: wheel=wheel.id, newer_than=<datetime>
# wheel is the id of the wheel to check updates for
# newer_than is the last time the client received an update of this wheel
def get_wheel():
    wheel=request.vars.get('wheel')
    newer_than=request.vars.get('newer_than') if 'newer_than' in request.vars else datetime.datetime.fromtimestamp(0)
    if wheel == None or newer_than == None:
        response.status=400
        return response.json({"error": "wheel and newer_than must not be null"})
    wheel_row=db.wheel(wheel)
    if wheel_row.edited_time > datetime.datetime.strptime(newer_than, "%Y-%m-%d %H:%M:%S"):
        return response.json(wheel_row)
    else:
        return response.json({"message":"nothing to update"})
    
# Parameters: wheel=<integer>, [newer_than=<datetime>]
# wheel is the id of the wheel to retrieve suggestions for
# newer_than specifies a time that the suggestions returned should be newer than
def get_suggestions():
    wheel=request.vars.get('wheel')
    newer_than=datetime.datetime.strptime(request.vars.get('newer_than') if 'newer_than' in request.vars else '1970-01-01 00:00:00', "%Y-%m-%d %H:%M:%S")
    if wheel == None:
        response.status=400
        return response.json({"error": "wheel of suggestions is required"})
    wheel_id=int(wheel)
    suggestions=db(db.suggestion.wheel == wheel_id and db.suggestion.update_time > newer_than).select(orderby=~db.suggestion.creation_time)
    return response.json(suggestions)

# Parameters: name=<string>, [description=<string>]
# name is the new name of this wheel
# description is the new description of this wheel
@auth.requires_signature()
def add_wheel():
    name=request.vars.get('name')
    description=request.vars.get('description')
    if name == None:
        response.status=400
        return response.json({"error": "name must not be null"})
    id=db.wheel.insert(name=name, description=description)
    return response.json(db.wheel(id))
 
# Parameters: wheel=wheel.id, [name=<string>, description=<string>]
# wheel is the wheel to be edited
# name, if provided, will give the specified wheel a new name
# description, if provided, will give the specified wheel a new description

@auth.requires_signature()
def edit_wheel():
    wheel=request.vars.get('wheel')
    name=request.vars.get('name')
    description=request.vars.get('description')
    if wheel == None:
        response.status=400
        return response.json({"error": "wheel must not be null"})
    if name == None and description == None:
        response.status=400
        return response.json({"error": "edit_wheel must have a name or description to update to"})
    if name != None:
        db.wheel(wheel).update_record(name=name)
    if description != None:
        db.wheel(wheel).update_record(description=description)
    db.wheel(wheel).update_record(edited_time=datetime.datetime.utcnow())
    return response.json(db.wheel(wheel))
    
# Parameters: wheel=wheel.id
# wheel is the wheel to delete
@auth.requires_signature()
def del_wheel():
    wheel=request.vars.get('wheel')
    if wheel == None:
        response.status=400
        return response.json({"error":"wheel must not be null"})
    db.wheel(wheel).delete()
    
# Parameters: wheel=wheel.id, name=<string>, [description=<string>]
# wheel is the id of the wheel this suggestion belongs to
# name is the new name of this suggestion
# description is the new description of this suggestion
@auth.requires_signature()
def add_suggestion():
    wheel_id=request.vars.get('wheel')
    name=request.vars.get('name')
    description=request.vars.get('description')
    if wheel_id == None or name == None:
        response.status=400
        return response.json({"error":"name and wheel must not be null"})
    if db.wheel(wheel_id).phase != 'create':
        return response.json({"message":"This wheel is past its suggestion creation phase"})
    id=db.suggestion.insert(wheel=wheel_id, name=name, description=description)
    return response.json(db.suggestion(id))
    
# Parameters: suggestion=suggestion.id, [name=<string>, description=<string>]
# wheel is the wheel to be edited
# name, if provided, will give the specified wheel a new name
# description, if provided, will give the specified wheel a new description
@auth.requires_signature()
def edit_suggestion():
    suggestion=request.vars.get('suggestion')
    name=request.vars.get('name')
    description=request.vars.get('description')
    if suggestion == None:
        response.status=400
        return response.json({"error": "suggestion must not be null"})
    if name == None and description == None:
        response.status=400
        return response.json({"error": "edit_suggestion must have a name or description to update to"})
    if name != None:
        db.suggestion(suggestion).update_record(name=name)
    if description != None:
        db.suggestion(suggestion).update_record(description=description)
    db.suggestion(suggestion).update_record(update_time=datetime.datetime.utcnow())
    return response.json(db.suggestion(suggestion))
    
# Parameters: suggestion=suggestion.id
# wheel is the wheel to delete
@auth.requires_signature()
def del_suggestion():
    suggestion=request.vars.get('suggestion')
    if suggestion == None:
        response.status=400
        return response.json({"error":"suggestion must not be null"})
    db.suggestion(suggestion).delete()

# Helper function for vote()
def sum_points_for_user(user_id, suggestion):
    wheel_id=db.suggestion(suggestion).wheel
    votes_from_user = db(db.vote.voter == auth.user_id).select(db.vote.points_allocated, db.vote.suggestion)
    votes_on_this_wheel=[]
    for vote in votes_from_user:
        if db.suggestion(vote.suggestion).wheel == wheel_id:
            votes_on_this_wheel.append(vote)
    sum=0
    for vote in votes_on_this_wheel:
        sum += abs(vote.points_allocated)
    return sum
    
# Parameters: suggestion=suggestion.id, points=<integer>
# suggestion is the suggestion being voted on
# points is the amount of points to be allocated to this suggestion
@auth.requires_signature()
def vote():
    suggestion=request.vars.get('suggestion')
    points_string=request.vars.get('points_to_allocate')
    if suggestion == None or points_string == None:
        response.status=400
        return response.json({"error":"suggestion and points_to_allocate must not be null"})
    points=int(points_string)
    vote_query=db(db.vote.voter == auth.user_id and db.vote.suggestion == suggestion)
    if vote_query.count() == 0:
        # user has not previously voted on this suggestion
        if sum_points_for_user(auth.user_id, suggestion)+abs(points) > 10:
            return response.json({"message":"this vote would exceed the number of allocatable points"})
        db.vote.insert(points_allocated=points, suggestion=suggestion)
    else:
        # user has previously voted on this suggestion
        vote=vote_query.select().first()
        new_points=vote.points_allocated+points
        net_change_in_points_allocated=abs(new_points)-abs(vote.points_allocated)
        if sum_points_for_user(auth.user_id, suggestion)+net_change_in_points_allocated > 10:
            return response.json({"message":"this vote would exceed the number of allocatable points"})
        vote.update_record(points_allocated=new_points)
    suggestion_entity = db.suggestion(suggestion)
    suggestion_entity.update_record(point_value=suggestion_entity.point_value+points, edited_on=datetime.datetime.utcnow())
    return response.json(suggestion_entity)
        
        