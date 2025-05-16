package main

import (
	"cmp"
	"flag"
	"log"
	"os"
	"strconv"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type serverConfig struct {
	CCID    string
	Address string
}

var (
	ccid         = flag.String("ccid", cmp.Or(os.Getenv("CHAINCODE_ID"), ""), "Chaincode ID")
	address      = flag.String("address", cmp.Or(os.Getenv("CHAINCODE_SERVER_ADDRESS"), "0.0.0.0:7052"), "CC server address")
	tlsDisabled  = flag.String("tls-disabled", cmp.Or(os.Getenv("CHAINCODE_TLS_DISABLED"), "true"), "TLS disabled")
	tlsKey       = flag.String("tls-key", cmp.Or(os.Getenv("CHAINCODE_TLS_KEY"), "/fabric/chaincode/tls/server.key"), "TLS key")
	tlsCert      = flag.String("tls-cert", cmp.Or(os.Getenv("CHAINCODE_TLS_CERT"), "/fabric/chaincode/tls/server.crt"), "TLScrt")
	clientCACert = flag.String("tls-client-cacert", cmp.Or(os.Getenv("CHAINCODE_TLS_CLIENT_CACERT"), ""), "Client CA cert")
)

func main() {
	flag.Parse()

	if *ccid == "" {
		log.Fatalln("--ccid flag or CHAINCODE_ID env var must be set")
	}

	config := serverConfig{
		CCID:    *ccid,
		Address: *address,
	}

	chaincode, err := contractapi.NewChaincode(&ReviewContract{})
	if err != nil {
		log.Panicf("Error creating %s chaincode: %s", os.Getenv("CHAINCODE_NAME"), err)
	}

	server := &shim.ChaincodeServer{
		CCID:     config.CCID,
		Address:  config.Address,
		CC:       chaincode,
		TLSProps: getTLSProperties(*tlsDisabled, *tlsKey, *tlsCert, *clientCACert),
	}

	log.Printf("Server configured with chaindcode ID %s.\nListening on %s", config.CCID, config.Address)

	go func() {
		if err := server.Start(); err != nil {
			log.Panicf("Error starting %s chaincode: %s", os.Getenv("CHAINCODE_NAME"), err)
		}
	}()

	// Wait for the server to start successfully
	select {}
}

func getTLSProperties(tlsDisabledStr, key, cert, clientCACert string) shim.TLSProperties {
	// Convert tlsDisabledStr to boolean
	tlsDisabled := getBoolOrDefault(tlsDisabledStr, false)
	var keyBytes, certBytes, clientCACertBytes []byte
	var err error

	if !tlsDisabled {
		log.Println("TLS is enabled. Reading TLS key and certificate files.")
		keyBytes, err = os.ReadFile(key)
		if err != nil {
			log.Panicf("Error while reading %s. %s", key, err)
		}
		certBytes, err = os.ReadFile(cert)
		if err != nil {
			log.Panicf("Error while reading %s. %s", cert, err)
		}
	}

	if clientCACert != "" {
		log.Println("Client CA certificate is provided. Reading file.")
		clientCACertBytes, err = os.ReadFile(clientCACert)
		if err != nil {
			log.Panicf("Error while reading %s. %s", clientCACert, err)
		}
	}

	return shim.TLSProperties{
		Disabled:      tlsDisabled,
		Key:           keyBytes,
		Cert:          certBytes,
		ClientCACerts: clientCACertBytes,
	}
}

// Returns default value if the string cannot be parsed
func getBoolOrDefault(value string, defaultVal bool) bool {
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		log.Printf("Error parsing boolean value: %s. Using default: %v", value, defaultVal)
		return defaultVal
	}
	return parsed
}
