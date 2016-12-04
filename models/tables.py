import datetime

db.define_table('wheel',
                Field('creator_id', default=auth.user_id),
                Field('name', required=True),
                Field('description', 'text'),
                Field('creation_time', 'datetime', default=datetime.datetime.utcnow()),
                Field('edited_time', 'datetime', default=datetime.datetime.utcnow()),
                Field('phase', default='create'),
                Field('chosen_one', 'integer', default=-1)
                )
                
db.define_table('suggestion',
                Field('wheel', 'reference wheel', required=True),
                Field('creator_id', default=auth.user_id),
                Field('name', required=True),
                Field('description', 'text'),
                Field('creation_time', 'datetime', default=datetime.datetime.utcnow()),
                Field('update_time', 'datetime', default=datetime.datetime.utcnow()),
                Field('point_value', 'integer', default=0)
                )

db.define_table('vote',
                Field('voter', default=auth.user_id),
                Field('points_allocated', 'integer', required=True),
                Field('suggestion', 'reference suggestion', required=True)
                )
                
db.define_table('profile',
                Field('profile_user', default=auth.user_id),
                Field('biography', 'text')
                )
                
db.wheel.creator_id.writable = db.wheel.creator_id.readable = False
db.wheel.creation_time.writable = db.wheel.creation_time.readable = False
db.wheel.phase.writable = db.wheel.phase.readable = False
db.wheel.chosen_one.writable = db.wheel.chosen_one.readable = False

db.suggestion.creator_id.writable = db.suggestion.creator_id.readable = False
db.suggestion.creation_time.writable = db.suggestion.creation_time.readable = False
