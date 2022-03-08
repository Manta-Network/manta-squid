import { SubstrateProcessor } from "@subsquid/substrate-processor";
import { SubstrateNetwork } from "../model";
import councilVoteHandler from '../handlers/council.vote.extrinsic';
import democracyVoteHandler from '../handlers/democracy.vote.extrinsic';
import democracySecondHandler from '../handlers/democracy.second.extrinsic';
// import electionVoteHandler from '../handlers/phragmenElection.vote.extrinsic';
import balanceTransferEventHandler from '../handlers/balances.transfer.event';

const processor = new SubstrateProcessor('manta_calamari_processor');

// processor.setTypesBundle('khala');
processor.setBatchSize(500);
processor.setIsolationLevel('REPEATABLE READ');
processor.setDataSource({
  archive: "https://calamari.indexer.gc.subsquid.io/v4/graphql",
  chain: "wss://calamari.api.onfinality.io/public-ws/",
});
// processor.addExtrinsicHandler(
//   'phragmenElection.vote',
//   electionVoteHandler(SubstrateNetwork.phala)
// );
processor.addExtrinsicHandler(
  'council.vote',
  councilVoteHandler(SubstrateNetwork.calamari)
);
processor.addExtrinsicHandler(
  'democracy.vote',
  democracyVoteHandler(SubstrateNetwork.calamari)
);
processor.addExtrinsicHandler(
  'democracy.second',
  democracySecondHandler(SubstrateNetwork.calamari)
);

processor.addEventHandler("balances.Transfer", balanceTransferEventHandler(SubstrateNetwork.calamari));

processor.run();