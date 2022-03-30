import { SubstrateProcessor } from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { SubstrateNetwork, Session, Block } from "../model";
import councilVoteHandler from '../handlers/council.vote.extrinsic';
import democracyVoteHandler from '../handlers/democracy.vote.extrinsic';
import democracySecondHandler from '../handlers/democracy.second.extrinsic';
// import electionVoteHandler from '../handlers/phragmenElection.vote.extrinsic';
import balanceTransferEventHandler from '../handlers/events/balances.transfer.event';
import { handleProposedEvent } from '../handlers/events/collective.Proposed.event';
import { handleVotedEvent } from '../handlers/events/collective.Voted.event';
import { handleApprovedEvent } from "../handlers/events/collective.Approved.event";
import { handleDisapprovedEvent } from "../handlers/events/collective.Disapproved.event";
import { handleExecutedEvent } from "../handlers/events/collective.Executed.event";
import { handleMemberExecutedEvent } from "../handlers/events/collective.MemberExecuted.event";
import { handleClosedEvent } from "../handlers/events/collective.Closed.event";
import { handleNewSessionEvent } from "../handlers/events/session.newSession.event";
// import { SystemAccountStorage } from "../types/calamari/storage"
import { SessionCurrentIndexStorage, SessionValidatorsStorage } from "../types/calamari/storage"
import * as ss58 from "@subsquid/ss58";
import { BlockList } from "net";
import { decodeAddress } from "../utils";

const processor = new SubstrateProcessor('manta_calamari_processor');
processor.setTypesBundle("calamari");
processor.setBatchSize(500);
processor.setBlockRange({ from: 999999 }); // skip early calamari history
processor.setDataSource({
  archive: lookupArchive("calamari")[0].url,
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
processor.addEventHandler("technicalCommittee.Proposed", handleProposedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.Voted", handleVotedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.Approved", handleApprovedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.Disapproved", handleDisapprovedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.Executed", handleExecutedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.MemberExecuted", handleMemberExecutedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("technicalCommittee.Closed", handleClosedEvent(SubstrateNetwork.calamari));
processor.addEventHandler("session.newSession", handleNewSessionEvent(SubstrateNetwork.calamari));

processor.addPostHook(async ctx => {
  let network = "calamari"; // TODO: adapt to other networks

  let sessionIndexStorage = new SessionCurrentIndexStorage(ctx);
  if (!sessionIndexStorage.isV1) {
    throw new Error("session.currentIndex > V1 unimplemented");
  }
  let sessionIndex = await sessionIndexStorage.getAsV1();

  // Ensure we have a session to add src/processors/calamariProcessor.ts:68:12the block to
  let current_session = await ctx.store.findOneOrFail<Session>(Session, { where: { network: network, sessionIndex: sessionIndex } })
    .catch(async () => {
      // This should only occur at the genesis block, other session objects are created in the newSession event handler
      console.warn("Session index" + sessionIndex + " did not exist for chain " + network + ". Creating at block " + ctx.block.height);

      let validatorsStorage = new SessionValidatorsStorage(ctx);
      if (!validatorsStorage.isV1) {
        throw new Error("session.validators > V1 unimplemented");
      }
      let validatorAddressByteArray = await validatorsStorage.getAsV1();
      let validatorAddressStringArray: string[] = [];
      for (let address_as_bytevec of validatorAddressByteArray) {
        let hashString = '0x' + Buffer.from(address_as_bytevec).toString('hex');
        validatorAddressStringArray.push(hashString);
      }
      let sess = new Session({
        id: network + sessionIndex,
        type: "aura",
        network: network,
        sessionIndex: sessionIndex,
        startedAt: new Date(ctx.block.timestamp),
        activeValidators: validatorAddressStringArray
      });
      ctx.store.save(sess);
      return sess;
    });

  // Add this block to the currently active session and commit to DB
  let blocknumber = ctx.block.height;
  let author = ctx.block.validatorId;
  let date = ctx.block.timestamp;

  let block = new Block({
    id: network + blocknumber,
    network: network,
    date: new Date(date),
    authorAddressSS58: author,
    partOfSession: current_session!
  });
  ctx.store.save(block);
});

processor.run();
