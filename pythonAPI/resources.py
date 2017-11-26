from flask_restful import Resource
from flask_restful import abort
from flask_restful import fields
from flask_restful import marshal_with
from flask_restful import reqparse
from flask import jsonify
import pysam as sam
import json
from db.db import session
from db.models import ReadData, EventData

read_fields = {
    'id': fields.Integer,
    'qname': fields.String,
    'called_events': fields.Integer,
    'mean_qscore': fields.Float,
    'num_events': fields.Integer,
    'skip_prob': fields.Float,
    'stay_prob': fields.Float,
    'step_prob': fields.Float,
    'sequence_length': fields.Integer,
    'strand_score': fields.Float,
    'uri': fields.Url('readdata', absolute=True),
}

event_fields = {
    'id': fields.Integer,
    'qname': fields.String,
    'start_time': fields.Float,
    'move': fields.Integer,
    'length': fields.Float,
    'mean_signal': fields.Float,
    'stddev': fields.Float,
    'weights': fields.Float,
    'p_model_state': fields.Float,
    'p_mp_state': fields.Float,
    'model_state': fields.String,
    'mp_state': fields.String,
    'uri': fields.Url('eventdata', absolute=True),
}

parser = reqparse.RequestParser()
parser.add_argument('data', type=str)


class ReadResource(Resource):
    @marshal_with(read_fields)
    def get(self, qname):
        read = session.query(ReadData).filter(ReadData.qname == qname).first()
        read2 = EventResource.get(self, qname)
        # if not read:
        #     #abort(404, message="Read {} doesn't exist".format(id))
        #     put(self, id)
        return read, read2

    # @marshal_with(read_fields)
    # def put(self, id):
    #     # parsed_args = parser.parse_args()
    #     # read = session.query(ReadData).filter(ReadData.id == id).first()
    #     # read.data = parsed_args['data']
    #     session.add(../)
    #     session.commit()
    #     return read, 201


class EventResource(Resource):
    @marshal_with(event_fields)
    def get(self, qname):
        read = session.query(EventData).filter(EventData.qname == qname).all()
        # if not read:
        #     abort(404, message="Read {} doesn't exist".format(id))
        #     put(self, id)
        return read

    # @marshal_with(read_fields)
    # def put(self, id):
    #     # parsed_args = parser.parse_args()
    #     # read = session.query(ReadData).filter(ReadData.id == id).first()
    #     # read.data = parsed_args['data']
    #     session.add(../)
    #     session.commit()
    #     return read, 201


class ReadTableResource(Resource):
    # @marshal_with(read_fields)
    def get(self):
        # reads = session.query(ReadData).all()
        aln = sam.Samfile("/Volumes/Coruscant/nanopore-data-visualization/conference.sam", "rb")
        counter = 0
        query_name = []
        start_pos = []
        end_pos = []
        read_len = []
        ref_span = []
        seq = []
        query = []

        record = {}

        for read in aln:
            counter = counter + 1
            if (read.reference_start == -1):
                continue
            if (read.reference_name == -1):
                continue
            else:
                query_name.append(read.query_name)
                start_pos.append(read.reference_start)
                read_len.append(read.infer_read_length())
                ref_span.append(read.reference_length)
                end_pos.append(read.reference_start + read.reference_length)
                query.append(read.get_aligned_pairs(with_seq=True))

                temp = read.query_alignment_sequence
                tmp_seq = []
                for t in temp:
                    tmp_seq.append(t)
                seq.append(tmp_seq)

        final_record = []

        for n in range(len(start_pos)):
            record = {"number": counter,
                      "qname": query_name[n],
                      "pos": start_pos[n],
                      "end": end_pos[n],
                      "len": read_len[n],
                      "span": ref_span[n],
                      "seq": seq[n],
                      "query": query[n]}
            final_record.append(dict(record))
        return jsonify(final_record)

