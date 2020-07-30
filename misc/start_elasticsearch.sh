
LOG_FILE=/home/ubuntu/elasticsearch-6.4.0/elasticsearch.log
(ES_JAVA_OPTS="-Xms3900m -Xmx3900m" nohup /home/ubuntu/elasticsearch-6.4.0/bin/elasticsearch -E network.host=0.0.0.0 >& ${LOG_FILE}) &
sleep 15;
curl http://localhost:9200
echo "Elasticsearch started in background. See ${LOG_FILE}"

