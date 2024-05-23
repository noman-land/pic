import { d1, postSlackMessage, r2 } from './api';
import {
  Env,
  RequestJson
} from './types';

const base64ToBinary = (base64Image: string) => {
  const binaryString = atob(base64Image);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  return new Blob([byteArray], { type: "application/octet-stream" });
}

const generateMidjourneyImage = async (prompt: string, env: Env) => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${env.GETIMG_AI_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      model: env.MODEL,
      width: env.WIDTH,
      height: env.WIDTH,
      steps: env.STEPS,
      seed: env.SEED,
      output_format: env.OUTPUT_FORMAT
    }),
  };

  return fetch('https://api.getimg.ai/v1/stable-diffusion/text-to-image', options)
    .then((response) => response.json() as any as { image: string; })
    .then(async (result) => {
      if (!result.image) {
        throw new Error(JSON.stringify(result, null, 2))
      }
      return result.image
    })
}

const imageUrl = (id: string, env: Env) => `https://${env.IMAGE_URL}/${id}`

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 404 });
    }

    const {
      challenge,
      api_app_id,
      token,
      event: { channel, text },
    } = await request.json<RequestJson>()

    if (challenge) {
      const { challenge } = await request.json<{ challenge: string }>();
      return new Response(challenge, {status: 200});
    }

    if (
      api_app_id !== env.SLACK_APP_ID ||
      token !== env.SLACK_VERIFICATION_TOKEN
    ) {
      return new Response(null, { status: 401 });
    }

    try {
      const prompt = text.slice(15);

      const promise = generateMidjourneyImage(prompt, env)
        .then(async base64Image => {
          const image =  base64ToBinary(base64Image);
          const id = crypto.randomUUID();
          await Promise.all([
            r2.put({ id, image }, env),
            d1.put({ id, prompt }, env),
          ])
          const url = imageUrl(id, env);
          const message = `"${prompt}"\n\n${url}`;
          return postSlackMessage(message, channel, env);
        })
        .catch(console.error)

      context.waitUntil(promise);

      return new Response(null, { status: 201 });
    } catch (e: any) {
      console.error('ERROR', e.message)
      return new Response((e as Error).stack, { status: 500 });
    }
  },
};
