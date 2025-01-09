import argparse
import pprint
import hail as hl

from export_ht_to_es import *

#gsutil -m cp -r gs://gnomad-public/papers/2019-flagship-lof/v1.0/gnomad.v2.1.1.lof_metrics.by_transcript.ht .
#gsutil cp gs://gnomad-public/papers/2019-flagship-lof/v1.0/standard/constraint_final_standard.txt.bgz .

def populate_constraint():
    ds = hl.import_table('/home/ubuntu/data/constraint_final_cleaned.txt.bgz',delimiter='\t',key='transcript',impute=True)
    ds = ds.select_globals()

    # Convert interval to struct for Elasticsearch export
    ds = ds.transmute(gene_name=ds.gene, transcript_id=ds.transcript)

    export_ht_to_es(ds, index_name = 'gnomad_constraint_2_1_1',index_type = 'constraint')

if __name__ == "__main__":
    hl.init()
    populate_constraint()
