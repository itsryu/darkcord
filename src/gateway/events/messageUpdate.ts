import { TextBasedChannel } from "@resources/Channel";
import { Message } from "@resources/Message";
import {
  APIMessage,
  GatewayMessageUpdateDispatchData,
} from "discord-api-types/v10";
import { Event } from "./Event";
import { structuredClone } from "@utils/index";
import { Resolvable } from "@utils/Resolvable";
import { Events } from "@utils/Constants";

export class MessageUpdate extends Event {
  async run(data: GatewayMessageUpdateDispatchData) {
    const channel = this.client.cache.channels.get(
      data.channel_id
    ) as TextBasedChannel;

    const old = structuredClone(channel.messages.get(data.id));

    const updated = new Message(
      {
        ...(data as APIMessage),
        client: this.client,
      },
      data.guild_id && this.getGuild(data.guild_id)
    );

    this.client.emit(
      Events.MessageUpdate,
      old,
      Resolvable.resolveMessage(updated, this.client)
    );
  }
}
