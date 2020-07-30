# SFARI Browser

JavaScript tools for exploring genomic data.  
Forked from https://github.com/leklab/pcgc_browser  
which was forked from the original gnomAD browser  
https://github.com/broadinstitute/gnomad-browser

## Requirements

* [Node.js](https://nodejs.org)
* [yarn](https://yarnpkg.com)


## Installation

```
# Elastic search downloaded from
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.4.0.tar.gz

# redis
sudo apt-get install redis

# mongo
sudo apt-get install mongodb

# nginx
sudo apt install nginx

```


## Configuration


## Data sets

* GTEx data set
* Constraint data
* ClinVar data

## Populating data sets

```
#GTEx
python submit.py --run-locally hail_scripts/populate_gtex_table.py \
--spark-home /home/ubuntu/bin/spark-2.4.3-bin-hadoop2.7 \
--cpu-limit 4 --driver-memory 16G --executor-memory 8G

#Constraint
python submit.py --run-locally hail_scripts/populate_gnomad_constraint.py \
--spark-home /home/ubuntu/bin/spark-2.4.3-bin-hadoop2.7 \
--cpu-limit 4 --driver-memory 16G --executor-memory 8G

#Clinvar data
python submit.py --run-locally hail_scripts/populate_clinvar.py \
--spark-home /home/ubuntu/bin/spark-2.4.3-bin-hadoop2.7 \
--cpu-limit 4 --driver-memory 16G --executor-memory 8G
```


## Getting started

Clone repository and download dependencies:

```shell
git clone --recursive https://github.com/macarthur-lab/gnomadjs.git
cd gnomadjs
yarn
```

To start a local instance of the gnomAD browser UI which fetches data
from gnomad.broadinstitute.org:

```shell
cd gnomadjs/projects/gnomad
yarn start
```

Open http://localhost:8008 in a web browser.
