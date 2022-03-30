import { SubstrateProcessor } from '@subsquid/substrate-processor';
import { lookupArchive } from "@subsquid/archive-registry";
import councilVoteHandler from '../handlers/council.vote.extrinsic';
import democracyVoteHandler from '../handlers/democracy.vote.extrinsic';
import democracySecondHandler from '../handlers/democracy.second.extrinsic';
import electionVoteHandler from '../handlers/phragmenElection.vote.extrinsic';
import { SubstrateNetwork } from '../model';

const processor = new SubstrateProcessor('litentry_squid_governance_kusama');

processor.setBatchSize(500);
processor.setDataSource({
  archive: lookupArchive("kusama")[0].url,
  chain: "wss://kusama-rpc.polkadot.io",
});
processor.addExtrinsicHandler(
  'phragmenElection.vote',
  electionVoteHandler(SubstrateNetwork.kusama)
);
processor.addExtrinsicHandler(
  'council.vote',
  councilVoteHandler(SubstrateNetwork.kusama)
);
processor.addExtrinsicHandler(
  'democracy.vote',
  democracyVoteHandler(SubstrateNetwork.kusama)
);
processor.addExtrinsicHandler(
  'democracy.second',
  democracySecondHandler(SubstrateNetwork.kusama)
);

processor.run();
