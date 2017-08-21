#!/bin/bash

#openssl genrsa -out key.pem
#openssl req -new -key key.pem -out csr.pem
#openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem

openssl genrsa -out client-key.pem 2048
openssl req -new -key client-key.pem -out client.csr
openssl x509 -req -in client.csr -signkey client-key.pem -out client-cert.pem

rm csr.pem
