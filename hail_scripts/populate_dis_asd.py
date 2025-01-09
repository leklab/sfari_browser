import hail as hl
import pprint
from export_ht_to_es import *



def populate_dis_asd():
	
	ht = hl.import_table('/home/ubuntu/data/dis_asd_variant_id.tsv',delimiter='\t',impute=True)
	export_ht_to_es(ht, index_name = 'dis_asd',index_type = 'variant')

if __name__ == "__main__":
	hl.init()
	populate_dis_asd()
