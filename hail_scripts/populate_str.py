import hail as hl
import pprint
from export_ht_to_es import *

def populate_mavedb():
	ht = hl.import_table('Mitra_etal_SFARI_SSC_denovo_TRs_Nov2020_gene_final.tsv',delimiter='\t',impute=True)
	export_ht_to_es(ht, index_name = 'denovo_str',index_type = 'variant')

if __name__ == "__main__":
	hl.init()
	populate_mavedb()
