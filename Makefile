process: migrate
	@node -r dotenv/config lib/processors/calamariProcessor.js


serve:
	@npx squid-graphql-server


migrate:
	@npx sqd db:migrate


migration:
	@npx sqd db:create-migration Data


build:
	@npm run build


codegen:
	@npx sqd codegen


typegen: src/chain-metadata/calamari/calamariVersions.json
	@npx squid-substrate-typegen typegen.json


src/chain-metadata/calamari/calamariVersions.json:
	@make explore


explore:
	@npx squid-substrate-metadata-explorer \
		--chain wss://calamari.api.onfinality.io/public-ws/ \
		--archive https://calamari.indexer.gc.subsquid.io/v4/graphql \
		--out src/chain-metadata/calamari/calamariVersions.json


up:
	@docker-compose up -d


down:
	@docker-compose down


.PHONY: process serve start codegen migration migrate up down
