import hail as hl
import pprint
from export_ht_to_es import *

def populate_gtex():
	ht = hl.import_table('GTEx_Analysis_2016-01-15_v7_RSEMv1.2.22_transcript_tpm_medians_by_tissue_wo_versions.tsv.gz',delimiter='\t',key='transcript_id',force_bgz=True,impute=True)
	ht = ht.rename({'transcript_id': 'transcriptId', 'gene_id': 'geneId'})

	export_ht_to_es(ht, index_name = 'gtex_tissue_tpms_by_transcript',index_type = 'tissue_tpms')

if __name__ == "__main__":
	hl.init()
	populate_gtex()
