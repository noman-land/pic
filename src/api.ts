import { Env, SlackApi } from './types';

const slackApi: SlackApi = async (
  url,
  { body, contentType = 'application/json; charset=utf-8', method = 'GET' },
  env
) => {
  return fetch(`https://slack.com/api/${url}`, {
    method,
    body,
    headers: {
      authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'content-type': contentType,
    },
  });
}
export const r2 = {
  async put({ id, image }: { id: string, image: Blob }, env: Env) {
    return env.PIC_R2.put(`pic/${id}`, image)
  }
};

interface D1PutParams {
  id: string;
  prompt: string;
}

export const d1 = {
  async put({ prompt, id }: D1PutParams, env: Env) {
    return env.PIC
      .prepare("INSERT INTO images VALUES (?, ?, ?)")
      .bind(id, Date.now(), prompt)
      .all();
  }
};

const slackPost = async (url: string, body: Object, env: Env) =>
  slackApi(
    url,
    {
      body: JSON.stringify(body),
      method: 'POST',
    },
    env
  );

export const postSlackMessage = async (
  message: string,
  channel: string,
  env: Env
) =>
  slackPost(
    'chat.postMessage',
    {
      text: message,
      channel,
      link_names: true,
      unfurl_links: true,
      unfurl_media: true,
    },
    env
  );
