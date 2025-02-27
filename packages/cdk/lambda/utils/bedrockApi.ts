import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ConverseCommand,
  ConverseCommandInput,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandInput,
  ConverseStreamOutput,
  ServiceQuotaExceededException,
  ThrottlingException,
  AccessDeniedException,
} from '@aws-sdk/client-bedrock-runtime';
import {
  ApiInterface,
  BedrockImageGenerationResponse,
  GenerateImageParams,
  UnrecordedMessage,
} from 'generative-ai-use-cases-jp';
import { BEDROCK_TEXT_GEN_MODELS, BEDROCK_IMAGE_GEN_MODELS } from './models';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { streamingChunk } from './streamingChunk';

// STS에서 임시 자격 증명을 얻는 함수
const assumeRole = async (crossAccountBedrockRoleArn: string) => {
  const stsClient = new STSClient({ region: process.env.MODEL_REGION });
  const command = new AssumeRoleCommand({
    RoleArn: crossAccountBedrockRoleArn,
    RoleSessionName: 'BedrockApiAccess',
  });

  try {
    const response = await stsClient.send(command);
    if (response.Credentials) {
      return {
        accessKeyId: response.Credentials?.AccessKeyId,
        secretAccessKey: response.Credentials?.SecretAccessKey,
        sessionToken: response.Credentials?.SessionToken,
      };
    } else {
      throw new Error('자격 증명을 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error('Error assuming role: ', error);
    throw error;
  }
};

// BedrockRuntimeClient 를 초기화하는 이 함수는 일반적으로 환경 변수로 지정된 리전으로 BedrockRuntimeClient 를 초기화합니다.
// 특별한 경우로 다른 AWS 계정에 있는 Bedrock 리소스를 사용하고 싶을 수 있습니다.
// 이 경우 CROSS_ACCOUNT_BEDROCK_ROLE_ARN 환경 변수가 설정되어 있는지 확인합니다 (cdk.json에서 crossAccountBedrockRoleArn이 설정된 경우 환경 변수로 설정됨).
// 설정되어 있는 경우, 지정된 롤을 AssumeRole 조작에 의해 맡아 취득한 일시적인 자격 증명을 이용해 BedrockRuntimeClient 를 초기화합니다.
// 이렇게 하면 다른 AWS 계정의 Bedrock 리소스에 액세스할 수 있습니다.
const initBedrockClient = async () => {
  // CROSS_ACCOUNT_BEDROCK_ROLE_ARN이 설정되어 있는지 확인
  if (process.env.CROSS_ACCOUNT_BEDROCK_ROLE_ARN) {
    // STS에서 임시 자격 증명을 가져와 클라이언트 초기화
    const tempCredentials = await assumeRole(
      process.env.CROSS_ACCOUNT_BEDROCK_ROLE_ARN
    );

    if (
      !tempCredentials.accessKeyId ||
      !tempCredentials.secretAccessKey ||
      !tempCredentials.sessionToken
    ) {
      throw new Error('STSからの認証情報が不完全です。');
    }

    return new BedrockRuntimeClient({
      region: process.env.MODEL_REGION,
      credentials: {
        accessKeyId: tempCredentials.accessKeyId,
        secretAccessKey: tempCredentials.secretAccessKey,
        sessionToken: tempCredentials.sessionToken,
      },
    });
  } else {
    // STS를 사용하지 않을 경우 클라이언트 초기화
    return new BedrockRuntimeClient({
      region: process.env.MODEL_REGION,
    });
  }
};

const createConverseCommandInput = (
  model: string,
  messages: UnrecordedMessage[],
  id: string
): ConverseCommandInput => {
  const modelConfig = BEDROCK_TEXT_GEN_MODELS[model];
  return modelConfig.createConverseCommandInput(
    messages,
    id,
    model,
    modelConfig.defaultParams,
    modelConfig.usecaseParams
  );
};

const createConverseStreamCommandInput = (
  model: string,
  messages: UnrecordedMessage[],
  id: string
): ConverseStreamCommandInput => {
  const modelConfig = BEDROCK_TEXT_GEN_MODELS[model];
  return modelConfig.createConverseStreamCommandInput(
    messages,
    id,
    model,
    modelConfig.defaultParams,
    modelConfig.usecaseParams
  );
};

const extractConverseOutputText = (
  model: string,
  output: ConverseCommandOutput
): string => {
  const modelConfig = BEDROCK_TEXT_GEN_MODELS[model];
  return modelConfig.extractConverseOutputText(output);
};

const extractConverseStreamOutputText = (
  model: string,
  output: ConverseStreamOutput
): string => {
  const modelConfig = BEDROCK_TEXT_GEN_MODELS[model];
  return modelConfig.extractConverseStreamOutputText(output);
};

const createBodyImage = (
  model: string,
  params: GenerateImageParams
): string => {
  const modelConfig = BEDROCK_IMAGE_GEN_MODELS[model];
  return modelConfig.createBodyImage(params);
};

const extractOutputImage = (
  model: string,
  response: BedrockImageGenerationResponse
): string => {
  const modelConfig = BEDROCK_IMAGE_GEN_MODELS[model];
  return modelConfig.extractOutputImage(response);
};

const bedrockApi: Omit<ApiInterface, 'invokeFlow'> = {
  invoke: async (model, messages, id) => {
    const client = await initBedrockClient();

    const converseCommandInput = createConverseCommandInput(
      model.modelId,
      messages,
      id
    );
    const command = new ConverseCommand(converseCommandInput);
    const output = await client.send(command);

    return extractConverseOutputText(model.modelId, output);
  },
  invokeStream: async function* (model, messages, id) {
    const client = await initBedrockClient();

    try {
      const converseStreamCommandInput = createConverseStreamCommandInput(
        model.modelId,
        messages,
        id
      );

      const command = new ConverseStreamCommand(converseStreamCommandInput);

      const responseStream = await client.send(command);

      if (!responseStream.stream) {
        return;
      }

      for await (const response of responseStream.stream) {
        if (!response) {
          break;
        }

        const outputText = extractConverseStreamOutputText(
          model.modelId,
          response
        );

        if (outputText) {
          yield streamingChunk({ text: outputText });
        }

        if (response.messageStop) {
          yield streamingChunk({
            text: '',
            stopReason: response.messageStop.stopReason,
          });
          break;
        }
      }
    } catch (e) {
      if (
        e instanceof ThrottlingException ||
        e instanceof ServiceQuotaExceededException
      ) {
        yield streamingChunk({
          text: '지금 접속이 집중되어 있으니 시간을 두고 시도해 보시기 바랍니다.',
        });
      } else if (e instanceof AccessDeniedException) {
        const modelAccessURL = `https://${process.env.MODEL_REGION}.console.aws.amazon.com/bedrock/home?region=${process.env.MODEL_REGION}#/modelaccess`;
        yield streamingChunk({
          text: `선택한 모델이 활성화되지 않은 것 같습니다. [Bedrock 콘솔의 Model Access 화면](${modelAccessURL})에서 사용하고자 하는 모델을 활성화해 주세요.`,
        });
      } else {
        console.error(e);
        yield streamingChunk({
          text: '오류가 발생했습니다. 시간을 두고 다시 시도해 보세요.',
        });
      }
    }
  },
  generateImage: async (model, params) => {
    const client = await initBedrockClient();

    // Stable Diffusion 및 Titan Image Generator를 사용한 이미지 생성은 Converse API를 지원하지 않으므로 InvokeModelCommand를 사용합니다.
    const command = new InvokeModelCommand({
      modelId: model.modelId,
      body: createBodyImage(model.modelId, params),
      contentType: 'application/json',
    });
    const res = await client.send(command);
    const body = JSON.parse(Buffer.from(res.body).toString('utf-8'));

    return extractOutputImage(model.modelId, body);
  },
};

export default bedrockApi;
