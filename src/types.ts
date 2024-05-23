interface SlackAppMentionEvent {
  client_msg_id: string;
  type: 'app_mention';
  text: string;
  user: string;
  ts: string;
  team: string;
  channel: string;
  event_ts: string;
}

export interface Env {
  SLACK_APP_ID: string;
  SLACK_BOT_TOKEN: string;
  SLACK_SIGNING_SECRET: string;
  SLACK_VERIFICATION_TOKEN: string;
  PIC_SLACK_ID: string;
  PIC_R2: R2Bucket;
  PIC: D1Database;
  IMAGE_URL: string;
  GETIMG_AI_API_KEY: string;
  MODEL: string;
  HEIGHT: string;
  WIDTH: string;
  STEPS: string;
  SEED: string;
  OUTPUT_FORMAT: string;
}

export interface RequestJson {
  challenge?: string;
  api_app_id: string;
  token: string;
  event: SlackAppMentionEvent;
}

export type SlackApi = (
  url: string,
  body: {
    body: any;
    contentType?: string;
    method?: string;
  },
  env: Env
) => Promise<Response>;

