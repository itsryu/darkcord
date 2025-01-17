import { Cache } from "@cache/Cache";
import {
  Channel,
  StageChannel,
  TextBasedChannel,
  ThreadChannel,
  VoiceChannel,
} from "@resources/Channel";
import { Emoji, Reaction } from "@resources/Emoji";
import { Guild, ScheduledEvent } from "@resources/Guild";
import { Interaction } from "@resources/Interaction";
import { Invite } from "@resources/Invite";
import { Member, ThreadMember } from "@resources/Member";
import { Message } from "@resources/Message";
import { Role } from "@resources/Role";
import { User } from "@resources/User";
import { VoiceState } from "@resources/VoiceState";
import { Partials } from "@utils/Constants";
import {
  APIAuditLogChange,
  APIAuditLogEntry,
  APIChannel,
  APIEmoji,
  APIGuild,
  APIGuildMember,
  APIReaction,
  APIRole,
  APIStageInstance,
  APIUser,
  GatewayGuildMembersChunkDispatchData,
  GatewayIntentBits,
  GatewayReceivePayload,
  GatewaySendPayload,
  MessageFlags,
  RESTPatchAPIChannelJSONBody,
  RESTPostAPIGuildChannelJSONBody,
  UserAvatarFormat
} from "discord-api-types/v10";

import { Client, InteractionClient } from "@client/Client";

import { Integration } from "@resources/Integration";
import { Sticker } from "@resources/Sticker";
import type { PluginFn } from "@utils/PluginManager";
import { DataCache } from "../manager/DataManager";

export type { MessageAttachment, MessagePostData } from "@darkcord/utils";

export interface DisplayUserAvatarOptions {
  format?: UserAvatarFormat;
  size?: number;
}

export type GuildDataModel<T> = T & { guild: Guild };

export interface BaseClientOptions {
  partials?: Partials[];
}

export interface InteractionClientOptions extends BaseClientOptions {
  webserver: WebServerOptions;
  rest?: {
    token?: string;
  };
  cache?: {
    adapter?: CacheAdapter<any>;
    guilds?: CacheOption;
    channels?: CacheOption;
    roles?: CacheOption;
    messageCacheLimitPerChannel?: number;
  };
}

export type CacheOption = number | BaseCacheOptions<any>;

export interface ClientOptions extends BaseClientOptions {
  gateway: {
    intents: GatewayIntentBits | GatewayIntentBits[];
    encoding?: "json" | "etf";
    compress?: boolean;
    properties?: {
      browser: string;
      device: string;
    };
    totalShards?: number;
    disabledEvents?: (keyof ClientEvents)[];
  };
  cache?: {
    adapter?: CacheAdapter<any>;
    guilds?: CacheOption;
    users?: CacheOption;
    channels?: CacheOption;
    emojis?: CacheOption;
    stickers?: CacheOption;
    threads?: CacheOption;
    members?: CacheOption;
    roles?: CacheOption;
    messageCacheLimitPerChannel?: number;
  };
  plugins?: PluginFn[];
}

export interface WebServerOptions {
  hostname?: string;
  port: number;
}

export type InteractionFlags =
  | MessageFlags.Ephemeral
  | MessageFlags.SuppressEmbeds;

export interface GatewayShardOptions {
  /**
   * The encoding of received gateway packets
   */
  encoding?: "json" | "etf";
  /**
   * Recommended to compress gateway packets
   * */
  compress?: boolean;
  /**
   * The id of this gateway shard
   */
  shardId: string;
}

export interface GatewayShardEvents {
  connect: [];
  reconnecting: [];
  close: [code: number, reason: string];
  resume: [];
  reconnectRequired: [];
  ping: [ping: number];
  hello: [];
  debug: [message: string];
  ready: [];
  preReady: [];
  error: [error: any];
  dispatch: [event: string, data: any];
}

export type GuildMembersChunkData = Omit<
  KeysToCamelCase<GatewayGuildMembersChunkDispatchData>,
  "presences" | "members"
> & { members: (APIGuildMember | Member)[]; guild: Guild };

export interface InteractionClientEvents {
  interactionCreate: [interaction: Interaction];
  connect: [];
  warn: [message: string];
}

export interface AuditLogEntry
  extends Omit<KeysToCamelCase<APIAuditLogEntry>, "changes" | "options"> {
  options?: KeysToCamelCase<APIAuditLogEntry["options"]>;
  changes?: KeysToCamelCase<APIAuditLogChange>[];
}

export interface VoiceServer {
  host: string;
  guild: Guild;
  token: string;
}

export interface ClientEvents {
  // Gateway
  packet: [payload: GatewayReceivePayload | GatewaySendPayload];
  ready: [];
  shardConnect: [id: string];
  reconnecting: [];
  shardClose: [code: number, reason: string, id: string];
  shardResume: [id: string];
  shardReconnectRequired: [id: string];
  shardPing: [ping: number, id: string];
  shardHello: [id: string];
  shardDebug: [message: string, id: string];
  shardReady: [id: string];
  shardPreReady: [id: string];
  shardError: [error: any, id: string];
  shardDispatch: [event: string, data: any];
  connect: [];

  // Message
  messageCreate: [message: Message];
  messageUpdate: [old: Message, updated: Message];
  messageDelete: [message: Message];
  messageDeleteBulk: [messagesDeleted: Map<string, Message>];
  messageReactionAdd: [
    reaction: Reaction | APIReaction,
    user: User | APIUser,
    message: Message,
  ];
  messageReactionRemove: [
    reaction: Reaction | APIReaction,
    user: User | APIUser,
    message: Message,
  ];
  messageReactionRemoveAll: [
    message: Message,
    removed: Cache<Reaction | APIReaction>,
  ];
  messageReactionRemoveEmoji: [
    message: Message,
    removed: Reaction | APIReaction,
  ];
  typingStart: [typing: Typing];

  // Interaction
  interactionCreate: [interaction: Interaction];

  // Guild
  guildMembersChunk: [data: GuildMembersChunkData];
  guildMembersChunked: [guild: Guild, chunkCount: number];
  guildCreate: [guild: Guild];
  guildUpdate: [old: Guild, updated: Guild];
  guildDelete: [deleted: Guild];
  guildAuditLogEntryCreate: [log: AuditLogEntry];
  guildBanAdd: [guild: Guild, userBanned: User | APIUser];
  guildBanRemove: [guild: Guild, userUnbanned: User | APIUser];
  guildEmojisUpdate: [
    old: DataCache<Emoji | APIEmoji>,
    updated: DataCache<Emoji | APIEmoji>,
    guild: Guild,
  ];
  guildEmojiCreate: [emoji: Emoji | APIEmoji];
  guildEmojiDelete: [emoji: Emoji | APIEmoji];
  guildEmojiUpdate: [
    oldEmoji: Emoji | APIEmoji,
    updatedEmoji: Emoji | APIEmoji,
  ];
  guildStickersUpdate: [
    old: DataCache<Sticker>,
    updated: DataCache<Sticker>,
    guild: Guild,
  ];
  guildStickerCreate: [sticker: Sticker];
  guildStickerDelete: [sticker: Sticker];
  guildStickerUpdate: [oldSticker: Sticker, updatedSticker: Sticker];
  guildMemberAdd: [newMember: Member, guild: Guild];
  guildMemberRemove: [user: User | APIUser, guild: Guild];
  guildMemberUpdate: [old: Member, updated: Member];
  guildIntegrationsUpdate: [guild: Guild];
  guildRoleCreate: [role: Role | APIRole, guild: Guild];
  guildRoleUpdate: [old: Role | APIRole, updated: Role | APIRole, guild: Guild];
  guildRoleDelete: [deleted: Role | APIRole, guild: Guild];
  guildScheduledEventCreate: [event: ScheduledEvent];
  guildScheduledEventUpdate: [old: ScheduledEvent, updated: ScheduledEvent];
  guildScheduledEventDelete: [deleted: ScheduledEvent];
  guildScheduledEventUserAdd: [event: ScheduledEvent, user: User | APIUser];
  guildScheduledEventUserRemove: [event: ScheduledEvent, user: User | APIUser];

  // Thread
  threadCreate: [thread: ThreadChannel];
  threadMemberUpdate: [member: ThreadMember];
  threadMembersUpdate: [added: ThreadMember[], removed: string[]];
  threadDelete: [thread: ThreadChannel];
  threadListSync: [threads: Cache<ThreadChannel>, guild: Guild];

  // Stage
  stageInstanceCreate: [instance: APIStageInstance];
  stageInstanceDelete: [instance: APIStageInstance];
  stageInstanceUpdate: [old: APIStageInstance, updated: APIStageInstance];

  // Channel
  channelCreate: [channel: Channel];
  channelDelete: [channel: Channel];
  channelUpdate: [old: Channel, updated: Channel];
  channelPinsAdd: [
    oldLastPinTimestamp: number,
    lastPinTimestamp: number,
    channel: TextBasedChannel,
  ];
  channelPinsRemove: [
    oldLastPinTimestamp: number,
    lastPinTimestamp: number,
    channel: TextBasedChannel,
  ];
  channelPinsUpdate: [channel: TextBasedChannel];

  // User
  userUpdate: [old: User | APIUser, updated: User | APIUser];

  // Voice
  voiceChannelSwitch: [
    member: Member,
    oldChannel: VoiceChannel | StageChannel,
    newChannel: VoiceChannel | StageChannel,
  ];
  voiceChannelJoin: [member: Member, channel: VoiceChannel | StageChannel];
  voiceChannelLeave: [member: Member, channel: VoiceChannel | StageChannel];
  voiceStateUpdate: [member: Member, channel: VoiceState];
  voiceServerUpdate: [server: VoiceServer];

  // Client
  warn: [message: string];
  debug: [message: string];

  // Integration
  integrationCreate: [integration: Integration];

  // Invite
  inviteCreate: [invite: Invite];
  inviteDelete: [invite: Invite];
}

export type ValueOf<I> = I[keyof I];

export interface BaseCacheSweeper<T> {
  lifetime?: number;
  filter?: (value: T) => boolean;
  keepFilter?: (value: T) => boolean;
}

export interface BaseCacheOptions<T = unknown> {
  maxSize: number;
  sweeper?: BaseCacheSweeper<T>;
}

export type Awaitable<T> = T | Promise<T>;

export interface CacheAdapter<T> {
  set(key: string, value: T): CacheAdapter<T>;
  get(key: string): T | undefined;
  delete(key: string): boolean;
  clear(): void;
  entries(): IterableIterator<[string, T]>;
  values(): IterableIterator<T>;
  keys(): IterableIterator<string>;
  has(key: string): boolean;
  size: number;
}

export type AnyClient = InteractionClient | Client;
export type DataWithClient<T = Record<string, any>> = T & { client: AnyClient };

export type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, K>
    ? KeysToCamelCase<T[K]>
    : T[K];
};

export type APIGuildWithShard = APIGuild & { shard_id: string };

export interface Typing {
  channelId: string;
  channel?: TextBasedChannel | APIChannel;
  startedTimestamp: number;
  guild?: Guild;
  member?: Member;
  guildId?: string;
  userId: string;
}

export type MessageTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export type CreateChannelOptions =
  KeysToCamelCase<RESTPostAPIGuildChannelJSONBody> &
    KeysToCamelCase<RESTPatchAPIChannelJSONBody>;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

type json<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: [T[K]] extends [Function]
    ? never
    : [T[K]] extends [bigint]
    ? string
    : [T[K]] extends [number]
    ? number
    : [K] extends [`_${string}`]
    ? never
    : [T[K]] extends [any[]]
    ? T[K]
    : [T[K]] extends [Map<any, infer I1>]
    ? I1[]
    : [T[K]] extends [Cache<infer I2>]
    ? I2[]
    : T[K];
};

export type JSONFY<T> = OmitNever<json<T>>;
