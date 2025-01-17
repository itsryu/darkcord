/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Client, InteractionClient } from "@client/Client";
import { ChannelDataManager } from "@manager/ChannelDataManager";
import { DataCache } from "@manager/DataManager";
import { EmojiDataManager } from "@manager/EmojiDataManager";
import { GuildDataManager } from "@manager/GuildDataManager";
import { ClientRoles, RoleDataManager } from "@manager/RoleDataManager";
import { UserDataManager } from "@manager/UserDataManager";
import { ThreadChannel } from "@resources/Channel";
import { Partials } from "@utils/Constants";
import { CamelCase, ClientOptions } from "@typings/index";

import { Cache } from "./Cache";

export class CacheManager {
  channels: ChannelDataManager;
  guilds: GuildDataManager;
  emojis: EmojiDataManager;
  users: UserDataManager;
  roles: ClientRoles;
  threads: DataCache<ThreadChannel>;
  constructor(public client: Client | InteractionClient) {
    this.channels = this._createCache("channels") as ChannelDataManager;
    this.threads = this._createCache("threads") as DataCache<ThreadChannel>;
    this.emojis = this._createCache("emojis") as EmojiDataManager;
    this.guilds = this._createCache("guilds") as GuildDataManager;
    this.users = this._createCache("users") as UserDataManager;
    this.roles = this._createCache("roles") as RoleDataManager;
  }

  _createCache(
    option: "channels" | "roles" | "users" | "guilds" | "emojis" | "threads",
  ) {
    const options = this.client.options.cache as ClientOptions["cache"];

    switch (option) {
      case "guilds": {
        if (this._cacheLimit("guilds")) {
          this.client.emit("warn", "Limiting guild cache can cause problems");
        }

        return new GuildDataManager(this, this._cacheLimit("guilds"));
      }
      case "channels": {
        return new ChannelDataManager(options?.channels ?? Infinity, this);
      }
      case "roles": {
        return new ClientRoles(options?.roles ?? Infinity);
      }
      case "users": {
        return new UserDataManager(options?.users ?? Infinity, this);
      }
      case "emojis": {
        return new EmojiDataManager(options?.emojis ?? Infinity, this);
      }
      default: {
        return new DataCache();
      }
    }
  }

  cleanup(clearGuilds = false) {
    this.channels.cache.clear();
    this.emojis.cache.clear();
    this.users.cache.clear();
    this.roles.cache.clear();
    this.threads.clear();

    if (clearGuilds) {
      this.guilds.cache.clear();
    }
  }

  isPartialCache(cache: `${CamelCase<keyof typeof Partials>}s`) {
    switch (cache) {
      case "emojis": {
        return this._partial(Partials.Emoji);
      }
      case "roles": {
        return this._partial(Partials.Role);
      }
      case "reactions": {
        return this._partial(Partials.Reaction);
      }
      case "stickers": {
        return this._partial(Partials.Sticker);
      }
      case "users": {
        return this._partial(Partials.User);
      }
      default: {
        return false;
      }
    }
  }

  _partial(p: Partials) {
    return Boolean(this.client.options.partials?.includes(p));
  }

  _cacheInstance(o: any): o is Cache<any> {
    return o instanceof Cache;
  }

  _cacheLimit(option: string) {
    const o = this.client.options.cache?.[option] || 0;
    return this._cacheInstance(o)
      ? o.limit === 0
        ? Infinity
        : o.limit
      : typeof o === "number"
      ? o === 0
        ? Infinity
        : o
      : (o as { maxSize: number }).maxSize;
  }
}
