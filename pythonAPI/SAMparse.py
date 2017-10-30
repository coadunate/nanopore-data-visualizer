import pysam as sam
import sys
import json
import os


def get_reference(file):
    # with open('includes/data/reference/'+file, 'r') as myfile:
    with open('/Volumes/SonOfSata/lambda_data/lambda_ref.fasta', 'r') as myfile:
        data = myfile.read().replace('\n', '')
    myfile.close()

    ref = []
    for d in data:
        ref.append(d)

    return ref


def get_alignment(read, reference):
    # os.system("bin/bwa/bwa ")
    bamFP = sam.Samfile("/Volumes/SonOfSata/lambda_data/samtools_stuff/working.sorted.sam", "rb")
    return bamFP

def get_metadata(aln):
    query_name = []
    start_pos = []
    end_pos = []
    read_len = []
    ref_span = []
    seq = []
    cigar = []
    query = []

    record = {}

    for read in aln:

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


            # if (not (read.is_unmapped)):  # if it's mapped
            #     cigarLine = read.cigar
            #
            #     for (cigarType, cigarLength) in cigarLine:
            #         try:
            #             if (cigarType == 0):  # match
            #                 for i in range(cigarLength):
            #                     cigar_align.append('.')
            #             elif (cigarType == 1):  # insertions
            #                 for i in range(cigarLength):
            #                     cigar_align.append('i')
            #             elif (cigarType == 2):  # deletion
            #                 for i in range(cigarLength):
            #                     cigar_align.append('d')
            #             elif (cigarType == 3):  # skip
            #                 for i in range(cigarLength):
            #                     cigar_align.append('s')
            #             elif (cigarType == 4):  # soft clipping
            #                 continue
            #             elif (cigarType == 5):  # hard clipping
            #                 continue
            #             elif (cigarType == 6):  # padding
            #                 for i in range(cigarLength):
            #                     cigar_align.append('p')
            #             else:
            #                 print("Wrong CIGAR number")
            #                 sys.exit(1)
            #         except:
            #             print("Problem")
            # print(cigar_align)

            # may need to change if soft clipping is important
            temp = read.query_alignment_sequence
            tmp_seq = []
            for t in temp:
                tmp_seq.append(t)
            seq.append(tmp_seq)
    # print(seq)

    with open('obj.json', 'w') as outfile:
        for n in range(len(start_pos)):
            record = { "qname" : query_name[n],
                       "pos"   : start_pos[n],
                       "end"   : end_pos[n],
                       "len"   : read_len[n],
                       "span"  : ref_span[n],
                       "seq"   : seq[n],
                       "query" : query[n]}
            json.dump(dict(record), outfile)

    outfile.close()
    return record

def main():

    tmp = []
    # ref = get_reference("reference.txt")
    # aln = get_alignment(tmp, ref)
    aln = sam.Samfile("/Volumes/SonOfSata/lambda_data/samtools_stuff/working.sam", "rb")

    record = get_metadata(aln)
    # with open('ref.json', 'w') as outfile:
    #     reference = { "ref" : ref}
    #     json.dump(dict(reference), outfile)
    # with open('obj.json', 'w') as outfile:
    #     json.dump(record, outfile)
    # outfile.close()

    # for read in aln:
    #
    #
    #     cigar.append(read.cigartuples)
    #
    #     cigar_align = []
    #
    #     if (not (read.is_unmapped)):  # if it's mapped
    #         cigarLine = read.cigar
    #
    #         for (cigarType, cigarLength) in cigarLine:
    #             try:
    #                 if (cigarType == 0):  # match
    #                     for i in range(cigarLength):
    #                         cigar_align.append('.')
    #                 elif (cigarType == 1):  # insertions
    #                     for i in range(cigarLength):
    #                         cigar_align.append('i')
    #                 elif (cigarType == 2):  # deletion
    #                     for i in range(cigarLength):
    #                         cigar_align.append('d')
    #                 elif (cigarType == 3):  # skip
    #                     for i in range(cigarLength):
    #                         cigar_align.append('s')
    #                 elif (cigarType == 4):  # soft clipping
    #                     continue
    #                 elif (cigarType == 5):  # hard clipping
    #                     continue
    #                 elif (cigarType == 6):  # padding
    #                     for i in range(cigarLength):
    #                         cigar_align.append('p')
    #                 else:
    #                     print("Wrong CIGAR number")
    #                     sys.exit(1)
    #             except:
    #                 print("Problem")
    # print(seq)
    aln.close()
    # print(cigar_align)
    # print(cigar)


if __name__ == "__main__":
    main()