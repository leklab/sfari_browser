import hail as hl
import pprint
from export_ht_to_es import *

def populate_dnms():
	ht = hl.import_table('SSC_denovo_wgs_cshl_variant_id_gene_id_conf.tsv',delimiter='\t',impute=True)
	export_ht_to_es(ht, index_name = 'autism_dnms',index_type = 'variant')

	ht = hl.import_table('merged_dnms_cohortFreq12_perFamily_variant_id_042320.tsv',delimiter='\t',impute=True)
	export_ht_to_es(ht, index_name = 'autism_dnms',index_type = 'variant')

if __name__ == "__main__":
	hl.init()
	populate_dnms()
