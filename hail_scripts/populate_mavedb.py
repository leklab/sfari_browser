import hail as hl
import pprint
from export_ht_to_es import *



def populate_mavedb():
	
	ht = hl.import_table('/home/ubuntu/data/mavedb/adnp_test.tsv',delimiter='\t',impute=True)
	export_ht_to_es(ht, index_name = 'mavedb',index_type = 'variant')

if __name__ == "__main__":
	hl.init()
	populate_mavedb()
