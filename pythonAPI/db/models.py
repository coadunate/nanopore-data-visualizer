from db import db

class ReadData(db.Model):
    # Read order in Reference Alignment
    id = db.Column(db.Integer, primary_key=True)
    qname = db.Column(db.String(255), index=True)
    called_events = db.Column(db.Integer)
    mean_qscore = db.Column(db.Float)
    num_events = db.Column(db.Integer)
    skip_prob = db.Column(db.Float)
    stay_prob = db.Column(db.Float)
    step_prob = db.Column(db.Float)
    sequence_length = db.Column(db.Integer)
    strand_score = db.Column(db.Float)


class EventData(db.Model):
    # Regular ID
    id = db.Column(db.Integer, primary_key=True)
    qname = db.Column(db.String(255))
    start_time = db.Column(db.Float, index=True)
    move = db.Column(db.Integer, index=True)
    length = db.Column(db.Float)
    mean_signal = db.Column(db.Float)
    stddev = db.Column(db.Float)
    weights = db.Column(db.Float)
    p_model_state = db.Column(db.Float)
    p_mp_state = db.Column(db.Float)
    model_state = db.Column(db.String(6))
    mp_state = db.Column(db.String(6))
