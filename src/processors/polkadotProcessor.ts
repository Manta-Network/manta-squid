import { SubstrateProcessor } from '@subsquid/substrate-processor';
import { lookupArchive } from "@subsquid/archive-registry";
import councilVoteHandler from '../handlers/council.vote.extrinsic';
import democracyVoteHandler from '../handlers/democracy.vote.extrinsic';
import democracySecondHandler from '../handlers/democracy.second.extrinsic';
import electionVoteHandler from '../handlers/phragmenElection.vote.extrinsic';
import { SubstrateNetwork } from '../model';

const processor = new SubstrateProcessor('litentry_squid_governance_polkadot');

processor.setTypesBundle('polkadot');
processor.setBatchSize(500);
processor.setDataSource({
  archive: lookupArchive("polkadot")[0].url,
    chain: 'wss://polkadot.api.onfinality.io/public-ws',
});
processor.addExtrinsicHandler(
  'phragmenElection.vote',
  electionVoteHandler(SubstrateNetwork.polkadot)
);
processor.addExtrinsicHandler(
  'council.vote',
  councilVoteHandler(SubstrateNetwork.polkadot)
);
processor.addExtrinsicHandler(
  'democracy.vote',
  democracyVoteHandler(SubstrateNetwork.polkadot)
);
processor.addExtrinsicHandler(
  'democracy.second',
  democracySecondHandler(SubstrateNetwork.polkadot)
);

processor.run();
