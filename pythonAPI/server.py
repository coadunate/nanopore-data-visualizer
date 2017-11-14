from flask import Flask, jsonify, request
import pysam as sam
import json

app = Flask(__name__)

incomes = [
  { 'description': 'salary', 'amount': 5000 }
]


@app.route('/alndata')
def get_alndata():
    aln = sam.Samfile("/Volumes/Coruscant/nanopore-data-visualization/working.sam", "rb")
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

    for n in range(len(start_pos)):
        record = {"number": counter,
                  "qname": query_name[n],
                  "pos": start_pos[n],
                  "end": end_pos[n],
                  "len": read_len[n],
                  "span": ref_span[n],
                  "seq": seq[n],
                  "query": query[n]}
        json.dumps(dict(record))

    return jsonify(record)



# @app.route('/incomes', methods=['POST'])
# def add_income():
#   incomes.append(request.get_json())
#   return '', 204

if __name__ == '__main__':
    app.run(debug=True)