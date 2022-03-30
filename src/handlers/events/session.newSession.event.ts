import * as ss58 from "@subsquid/ss58";
import { Session, SubstrateNetwork } from "../../model";
import { Store, EventHandlerContext } from '@subsquid/substrate-processor';
import { decodeAddress } from "../../utils";
import { SessionNewSessionEvent } from "../../types/calamari/events";
import { SessionValidatorsStorage } from "../../types/calamari/storage";

export function handleNewSessionEvent(network: SubstrateNetwork) {
    return async (ctx: EventHandlerContext) => {
        const someEvent = getNewSessionEvent(ctx);
        const sessionIndex = someEvent.index;
        const date = new Date(ctx.block.timestamp);

        // TODO:  Find the last session, commit endedAt

        // Read session's new validators from storage
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
        // Create and commit the new session
        try {
            let session = new Session({
                id: "calamari:" + sessionIndex,
                type: "aura",
                network: "calamari",
                sessionIndex: sessionIndex,
                startedAt: date,
                activeValidators: validatorAddressStringArray
            })
            await ctx.store.save(session);
        } catch (e) {
            throw e;
        }
    };
}

interface SessionEvent {
    index: number;
}

function getNewSessionEvent(ctx: EventHandlerContext): SessionEvent {
    const event = new SessionNewSessionEvent(ctx);

    if (event.isV1) {
        return { index: event.asV1 };
    }
    else if (event.isV3110) {
        return { index: event.asV3110.sessionIndex };
    }
    else {
        throw new Error('event not implemented');
    }
}