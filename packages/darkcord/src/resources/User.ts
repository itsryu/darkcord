import { DataWithClient, DisplayUserAvatarOptions } from "@typings/index";
import { userMention } from "@utils/Constants";
import {
  APIDMChannel,
  APIUser,
  CDNRoutes,
  ChannelType,
  DefaultUserAvatarAssets,
  ImageFormat,
  LocaleString,
  RouteBases,
  UserFlags,
  UserPremiumType,
} from "discord-api-types/v10";
import { Base } from "./Base";
import { DMChannel } from "./Channel";

export class User extends Base {
  /**
   * The user's username, not unique across the platform
   */
  username: string;
  /**
   * The user's 4-digit discord-tag
   */
  discriminator: string;
  /**
   * The user's avatar hash
   */
  avatar: string | null;
  /**
   * Whether the user belongs to an OAuth2 application
   */
  bot?: boolean | undefined;
  /**
   * Whether the user is an Official Discord System user (part of the urgent message system)
   */
  system?: boolean | undefined;
  /**
   * Whether the user has two factor enabled on their account
   */
  mfaEnabled?: boolean | undefined;
  /**
   * The user's banner hash
   */
  banner?: string | null | undefined;
  /**
   * The user's banner color encoded as an integer representation of hexadecimal color code
   */
  accentColor?: number | null | undefined;
  /**
   * The user's chosen language option
   */
  locale?: LocaleString;
  /**
   * Whether the email on this account has been verified
   */
  verified?: boolean | undefined;
  /**
   * The user's email
   */
  email?: string | null | undefined;
  /**
   * The flags on a user's account
   */
  flags?: UserFlags | undefined;
  /**
   * The type of Nitro subscription on a user's account
   */
  premiumType?: UserPremiumType | undefined;
  /**
   * The public flags on a user's account
   */
  publicFlags?: UserFlags | undefined;

  constructor(data: DataWithClient<APIUser>) {
    super(data);
    this._client = data.client;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.banner = data.banner;
    this.bot = Boolean(data.bot);
    this.locale = data.locale as LocaleString;
    this.mfaEnabled = Boolean(data.mfa_enabled);
    this.premiumType = data.premium_type;
    this.verified = Boolean(data.verified);
    this.flags = data.flags;
    this.publicFlags = data.public_flags;
    this.system = Boolean(data.system);
  }

  /**
   * The default user's avatar url
   * @returns
   */
  get defaultAvatarURL() {
    return (
      RouteBases.cdn +
      CDNRoutes.defaultUserAvatar(
        (Number(this.discriminator) % 5) as DefaultUserAvatarAssets,
      )
    );
  }

  /**
   * The user's avatar url
   * @param options options for avatar url
   * @returns
   */
  avatarURL(options?: DisplayUserAvatarOptions) {
    if (!this.avatar) {
      return null;
    }

    let url =
      RouteBases.cdn +
      CDNRoutes.userAvatar(
        this.id,
        this.avatar,
        options?.format ?? this.avatar.startsWith("a_")
          ? ImageFormat.GIF
          : ImageFormat.PNG,
      );

    if (options?.size) {
      url += "?size=" + options.size.toString();
    }

    return url;
  }

  /**
   * The user's display avatar url
   * @param options options for display avatar url
   * @returns
   */
  displayAvatarURL(options?: DisplayUserAvatarOptions) {
    return this.avatarURL(options) ?? this.defaultAvatarURL;
  }

  /**
   * The user's username and discriminator
   */
  get tag() {
    return this.username + "#" + this.discriminator;
  }

  /**
   * The dm of user
   */
  get dm(): DMChannel | null {
    let dm = this._client.channels.cache.find((ch) => {
      if (!ch.isDM()) return false;
      const id = ch.userId;
      return ch.type === ChannelType.DM && id === this.id;
    })?.[1] as APIDMChannel | DMChannel | null;

    if (!dm) return null;

    if (!(dm instanceof DMChannel)) {
      dm = new DMChannel({ ...dm, client: this._client });
    }

    return dm;
  }

  /**
   * Create a new DM channel for this user
   */
  async createDM() {
    const dm = await this._client.rest.createDM(this.id);

    return this._client.channels.add(dm) as APIDMChannel | DMChannel;
  }

  /**
   * Delete this user dm if existing one
   */
  async deleteDM() {
    if (!this.dm) return;

    await this._client.rest.deleteChannel(this.dm.id);
    this._client.channels.cache.delete(this.dm.id);
  }

  toString() {
    return userMention(this.id);
  }

  toJSON() {
    return Base.toJSON(this as User, [
      "accentColor",
      "avatar",
      "avatarURL",
      "banner",
      "bot",
      "createdAt",
      "defaultAvatarURL",
      "discriminator",
      "dm",
      "email",
      "username",
      "tag",
      "system",
      "rawData",
      "publicFlags",
      "premiumType",
      "mfaEnabled",
      "locale",
      "id",
      "flags",
    ]);
  }
}
