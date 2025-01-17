import { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";

export interface MessageAttachment {
  name: string;
  file: Buffer | Blob;
  description?: string;
}

export interface MessagePostData extends RESTPostAPIChannelMessageJSONBody {
  files?: MessageAttachment[];
}

export interface MakeErrorOptions {
  name?: string;
  message: string;
  args?: [string, any][];
}
