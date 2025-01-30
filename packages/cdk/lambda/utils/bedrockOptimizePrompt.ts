import {
  BedrockAgentRuntimeClient,
  ServiceQuotaExceededException,
  ThrottlingException,
  ValidationException,
  OptimizePromptCommandInput,
  OptimizePromptCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';
import { OptimizePromptRequest } from 'generative-ai-use-cases-jp';

const client = new BedrockAgentRuntimeClient({
  region: process.env.MODEL_REGION,
});

const bedrockOptimizePrompt = {
  execute: async function* (props: OptimizePromptRequest) {
    const input: OptimizePromptCommandInput = {
      input: {
        textPrompt: {
          text: props.prompt,
        },
      },
      targetModelId: props.targetModelId,
    };

    const command = new OptimizePromptCommand(input);

    try {
      const response = await client.send(command);

      if (response.optimizedPrompt) {
        for await (const event of response.optimizedPrompt) {
          if (!event) {
            break;
          }

          if (event.optimizedPromptEvent?.optimizedPrompt?.textPrompt?.text) {
            const chunk =
              event.optimizedPromptEvent?.optimizedPrompt?.textPrompt?.text;
            yield chunk;
          }

          if (event.analyzePromptEvent?.message) {
            // 現状何もしない
          }
        }
      }
    } catch (e) {
      if (
        e instanceof ThrottlingException ||
        e instanceof ServiceQuotaExceededException
      ) {
        // 以下全て OptimizePrompt のレスポンスに合わせて JSON.stringify する
        yield JSON.stringify(
          '지금 접속이 집중되어 있으니 시간을 두고 시도해 보시기 바랍니다.'
        );
      } else if (e instanceof ValidationException) {
        yield JSON.stringify(`이용 한도에 도달했거나 잘못된 요청입니다. \n ${e}`);
      } else {
        console.error(e);
        yield JSON.stringify(
          '오류가 발생했습니다. 시간을 두고 다시 시도해 보세요.'
        );
      }
    }
  },
};

export default bedrockOptimizePrompt;
